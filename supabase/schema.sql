-- =============================================================================
-- BRIS PASTELARIA — Supabase PostgreSQL Schema & Security Setup
-- =============================================================================
-- Run this script once in the Supabase Dashboard -> SQL Editor.
-- Afterwards, set your 6-digit admin PIN securely by running:
--   SELECT private.set_admin_pin('YOUR_6_DIGIT_PIN');
-- (Never commit plaintext PINs or secrets into source control.)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- -----------------------------------------------------------------------------
-- 1. PRIVATE SCHEMA (NOT exposed via PostgREST / Data API)
-- -----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
REVOKE ALL ON SCHEMA private FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS private.admin_credentials (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  pin_hash text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS private.admin_sessions (
  token_hash text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at
  ON private.admin_sessions (expires_at);

CREATE TABLE IF NOT EXISTS private.admin_login_attempts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  attempt_key text NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now(),
  succeeded boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_key_time
  ON private.admin_login_attempts (attempt_key, attempted_at DESC);

-- Helper to configure or rotate the 6-digit PIN from SQL Editor only
CREATE OR REPLACE FUNCTION private.set_admin_pin(p_pin text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_pin IS NULL OR p_pin !~ '^\d{6}$' THEN
    RAISE EXCEPTION 'Admin PIN must consist of exactly 6 numeric digits';
  END IF;

  INSERT INTO private.admin_credentials (id, pin_hash, updated_at)
  VALUES (1, extensions.crypt(p_pin, extensions.gen_salt('bf', 12)), now())
  ON CONFLICT (id)
  DO UPDATE SET
    pin_hash = EXCLUDED.pin_hash,
    updated_at = now();

  -- Invalidate old sessions whenever PIN changes
  DELETE FROM private.admin_sessions;
END;
$$;

REVOKE ALL ON FUNCTION private.set_admin_pin(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.set_admin_pin(text) FROM anon, authenticated;

-- Internal session verifier (static parameterized SQL only)
CREATE OR REPLACE FUNCTION private.is_valid_admin_session(p_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_hash text;
  v_exists boolean;
BEGIN
  IF p_token IS NULL OR length(p_token) < 32 THEN
    RETURN false;
  END IF;

  -- Clean expired sessions opportunistically
  DELETE FROM private.admin_sessions WHERE expires_at < now();

  v_hash := encode(extensions.digest(p_token, 'sha256'), 'hex');

  SELECT EXISTS (
    SELECT 1
    FROM private.admin_sessions
    WHERE token_hash = v_hash
      AND expires_at > now()
  ) INTO v_exists;

  RETURN v_exists;
END;
$$;

REVOKE ALL ON FUNCTION private.is_valid_admin_session(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_valid_admin_session(text) FROM anon, authenticated;

-- -----------------------------------------------------------------------------
-- 2. PUBLIC TABLES (Products, Promotions, Newsletter)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 160),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  original_price numeric(10,2) CHECK (original_price IS NULL OR original_price >= 0),
  description text NOT NULL DEFAULT '',
  category text NOT NULL CHECK (char_length(trim(category)) BETWEEN 1 AND 80),
  images text[] NOT NULL DEFAULT '{}'::text[],
  weight text,
  ingredients text[] NOT NULL DEFAULT '{}'::text[],
  recheios text[] NOT NULL DEFAULT '{}'::text[],
  allergens text[] NOT NULL DEFAULT '{}'::text[],
  shelf text,
  servings text,
  rating numeric(2,1) NOT NULL DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  is_featured boolean NOT NULL DEFAULT false,
  is_best_seller boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON public.products (is_best_seller) WHERE is_best_seller = true;

CREATE TABLE IF NOT EXISTS public.promotions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL CHECK (char_length(trim(title)) BETWEEN 1 AND 180),
  subtitle text NOT NULL DEFAULT '',
  badge text NOT NULL DEFAULT 'PROMOÇÃO',
  thumbnail_url text NOT NULL DEFAULT '',
  blocks jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(blocks) = 'array'),
  is_published boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promotions_published ON public.promotions (is_published, display_order)
  WHERE is_published = true;

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email text NOT NULL UNIQUE CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY & LEAST-PRIVILEGE GRANTS
-- -----------------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Revoke broad write grants from anon/authenticated; mutations go through validated RPCs
REVOKE INSERT, UPDATE, DELETE ON public.products FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.promotions FROM anon, authenticated;
REVOKE SELECT, UPDATE, DELETE ON public.newsletter_subscribers FROM anon, authenticated;

GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.promotions TO anon, authenticated;
GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;

DROP POLICY IF EXISTS products_public_read ON public.products;
CREATE POLICY products_public_read
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS promotions_public_read_published ON public.promotions;
CREATE POLICY promotions_public_read_published
  ON public.promotions
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

DROP POLICY IF EXISTS newsletter_public_insert ON public.newsletter_subscribers;
CREATE POLICY newsletter_public_insert
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

-- -----------------------------------------------------------------------------
-- 4. PARAMETERIZED ADMIN RPCs (100% Static SQL — SQL-Injection Proof)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_login(p_pin text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_pin_hash text;
  v_failed_count integer;
  v_token text;
  v_token_hash text;
BEGIN
  -- Strictly enforce 6 numeric digits only
  IF p_pin IS NULL OR p_pin !~ '^\d{6}$' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'A senha deve conter exatamente 6 números.');
  END IF;

  -- Rate limit: max 5 failed attempts in 15 minutes
  SELECT count(*)
  INTO v_failed_count
  FROM private.admin_login_attempts
  WHERE attempt_key = 'global_admin'
    AND succeeded = false
    AND attempted_at > now() - interval '15 minutes';

  IF v_failed_count >= 5 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Muitas tentativas. Aguarde 15 minutos.');
  END IF;

  SELECT pin_hash INTO v_pin_hash
  FROM private.admin_credentials
  WHERE id = 1;

  IF v_pin_hash IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PIN de administrador não configurado no banco.');
  END IF;

  IF extensions.crypt(p_pin, v_pin_hash) <> v_pin_hash THEN
    INSERT INTO private.admin_login_attempts (attempt_key, succeeded)
    VALUES ('global_admin', false);
    RETURN jsonb_build_object('ok', false, 'error', 'Código inválido.');
  END IF;

  INSERT INTO private.admin_login_attempts (attempt_key, succeeded)
  VALUES ('global_admin', true);

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  v_token_hash := encode(extensions.digest(v_token, 'sha256'), 'hex');

  INSERT INTO private.admin_sessions (token_hash, expires_at)
  VALUES (v_token_hash, now() + interval '12 hours');

  RETURN jsonb_build_object('ok', true, 'token', v_token);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_verify_session(p_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN private.is_valid_admin_session(p_token);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_logout(p_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_hash text;
BEGIN
  IF p_token IS NULL THEN
    RETURN;
  END IF;
  v_hash := encode(extensions.digest(p_token, 'sha256'), 'hex');
  DELETE FROM private.admin_sessions WHERE token_hash = v_hash;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_upsert_product(
  p_token text,
  p_id bigint,
  p_slug text,
  p_name text,
  p_price numeric,
  p_original_price numeric,
  p_description text,
  p_category text,
  p_images text[],
  p_weight text,
  p_ingredients text[],
  p_recheios text[],
  p_allergens text[],
  p_shelf text,
  p_servings text,
  p_rating numeric,
  p_is_featured boolean,
  p_is_best_seller boolean,
  p_display_order integer
)
RETURNS public.products
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_row public.products;
BEGIN
  IF NOT private.is_valid_admin_session(p_token) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  IF p_id IS NULL THEN
    INSERT INTO public.products (
      slug, name, price, original_price, description, category, images,
      weight, ingredients, recheios, allergens, shelf, servings,
      rating, is_featured, is_best_seller, display_order
    )
    VALUES (
      trim(p_slug), trim(p_name), p_price, p_original_price, coalesce(p_description, ''),
      trim(p_category), coalesce(p_images, '{}'::text[]), p_weight,
      coalesce(p_ingredients, '{}'::text[]), coalesce(p_recheios, '{}'::text[]),
      coalesce(p_allergens, '{}'::text[]), p_shelf, p_servings,
      coalesce(p_rating, 5.0), coalesce(p_is_featured, false),
      coalesce(p_is_best_seller, false), coalesce(p_display_order, 0)
    )
    RETURNING * INTO v_row;
  ELSE
    UPDATE public.products
    SET
      slug = trim(p_slug),
      name = trim(p_name),
      price = p_price,
      original_price = p_original_price,
      description = coalesce(p_description, ''),
      category = trim(p_category),
      images = coalesce(p_images, '{}'::text[]),
      weight = p_weight,
      ingredients = coalesce(p_ingredients, '{}'::text[]),
      recheios = coalesce(p_recheios, '{}'::text[]),
      allergens = coalesce(p_allergens, '{}'::text[]),
      shelf = p_shelf,
      servings = p_servings,
      rating = coalesce(p_rating, 5.0),
      is_featured = coalesce(p_is_featured, false),
      is_best_seller = coalesce(p_is_best_seller, false),
      display_order = coalesce(p_display_order, 0),
      updated_at = now()
    WHERE id = p_id
    RETURNING * INTO v_row;
  END IF;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_product(p_token text, p_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT private.is_valid_admin_session(p_token) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.products WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_promotions(p_token text)
RETURNS SETOF public.promotions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT private.is_valid_admin_session(p_token) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT * FROM public.promotions
  ORDER BY display_order ASC, created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_upsert_promotion(
  p_token text,
  p_id bigint,
  p_slug text,
  p_title text,
  p_subtitle text,
  p_badge text,
  p_thumbnail_url text,
  p_blocks jsonb,
  p_is_published boolean,
  p_display_order integer
)
RETURNS public.promotions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_row public.promotions;
BEGIN
  IF NOT private.is_valid_admin_session(p_token) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  IF p_id IS NULL THEN
    INSERT INTO public.promotions (
      slug, title, subtitle, badge, thumbnail_url, blocks, is_published, display_order
    )
    VALUES (
      trim(p_slug), trim(p_title), coalesce(p_subtitle, ''), coalesce(p_badge, 'PROMOÇÃO'),
      coalesce(p_thumbnail_url, ''), coalesce(p_blocks, '[]'::jsonb),
      coalesce(p_is_published, false), coalesce(p_display_order, 0)
    )
    RETURNING * INTO v_row;
  ELSE
    UPDATE public.promotions
    SET
      slug = trim(p_slug),
      title = trim(p_title),
      subtitle = coalesce(p_subtitle, ''),
      badge = coalesce(p_badge, 'PROMOÇÃO'),
      thumbnail_url = coalesce(p_thumbnail_url, ''),
      blocks = coalesce(p_blocks, '[]'::jsonb),
      is_published = coalesce(p_is_published, false),
      display_order = coalesce(p_display_order, 0),
      updated_at = now()
    WHERE id = p_id
    RETURNING * INTO v_row;
  END IF;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_promotion(p_token text, p_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT private.is_valid_admin_session(p_token) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.promotions WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_login(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_verify_session(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_logout(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_product(text, bigint, text, text, numeric, numeric, text, text, text[], text, text[], text[], text[], text, text, numeric, boolean, boolean, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_product(text, bigint) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_promotions(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_promotion(text, bigint, text, text, text, text, text, jsonb, boolean, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_promotion(text, bigint) TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 5. SEED INITIAL BRIS PASTELARIA CATALOG & SAMPLE PROMOTION
-- -----------------------------------------------------------------------------
INSERT INTO public.products (
  slug, name, price, original_price, description, category, images,
  weight, ingredients, recheios, allergens, shelf, servings, rating,
  is_featured, is_best_seller, display_order
)
VALUES
  (
    'pao-doce', 'Pão Doce Artesanal', 10.00, 12.00,
    'Leve como uma pena, macio como uma nuvem! Pesando aproximadamente 700g, nosso pão doce caseiro foi feito pensando no seu pequeno-almoço perfeito.',
    'Pães',
    ARRAY['https://res.cloudinary.com/dtxa1leih/image/upload/v1790333277/bread_fhk0vv.png'],
    '700g',
    ARRAY['Leite', 'Ovos', 'Açúcar', 'Fermento biológico', 'Óleo', 'Farinha de trigo', 'Sal'],
    ARRAY['Coco', 'Goiabada', 'Leite em pó', 'Açúcar', 'Puro'],
    ARRAY['Glúten', 'Lactose', 'Ovos'],
    '2 dias à temperatura ambiente', '1 unidade', 5.0, true, true, 1
  ),
  (
    'brownie', 'Brownie Gourmet', 8.00, 10.00,
    'Sabores variados, a teu gosto. Faz a tua escolha e desfrute do melhor brownie cremoso de chocolate 70% que já provaste.',
    'Doces',
    ARRAY['https://res.cloudinary.com/dtxa1leih/image/upload/v1790333276/brownie_opxfbt.png'],
    '250g',
    ARRAY['Chocolate negro 70%', 'Manteiga', 'Açúcar mascavado', 'Ovos', 'Farinha de trigo', 'Cacau em pó', 'Sal'],
    ARRAY['Tradicional', 'Nutella', 'Doce de Leite', 'Ninho'],
    ARRAY['Glúten', 'Lactose', 'Ovos', 'Soja'],
    '5 dias no frigorífico', '4 fatias', 5.0, true, true, 2
  ),
  (
    'biscoitos', 'Biscoitos Amanteigados', 6.00, 7.50,
    'Biscoitos amanteigados, crocantes por fora e que derretem na boca, perfeitos para acompanhar um chá ou café quentinho.',
    'Biscoitos',
    ARRAY['https://res.cloudinary.com/dtxa1leih/image/upload/v1790333276/biscoito_n873sd.png'],
    '400g',
    ARRAY['Manteiga', 'Açúcar refinado', 'Amido de milho', 'Farinha de trigo', 'Leite condensado'],
    ARRAY['Coco', 'Goiabada', 'Limão', 'Açúcar', 'Puro', 'Baunilha'],
    ARRAY['Glúten', 'Lactose'],
    '30 dias em recipiente hermético', 'Aprox. 24 unidades', 4.9, true, true, 3
  ),
  (
    'pudim', 'Pudim Clássico', 20.00, 24.00,
    'Pudim cremoso com calda de caramelo dourada pra comer acompanhado com quem você ama! Aproveite cada colherada desse clássico.',
    'Doces',
    ARRAY['https://res.cloudinary.com/dtxa1leih/image/upload/v1795391843/file_00000000187481f48f43f8dfbf81dd22_w6sbop.png'],
    '1.1kg',
    ARRAY['Leite condensado', 'Leite', 'Ovos', 'Açúcar', 'Amido de milho'],
    ARRAY['Tradicional com Caramelo'],
    ARRAY['Lactose', 'Ovos'],
    '4 dias no frigorífico', '8 a 10 porções', 5.0, true, true, 4
  ),
  (
    'panetone-trufado', 'Panetone Trufado', 26.00, NULL,
    'Macio, leve e irresistivelmente recheado, tudo em uma única receita artesanal para dividir com quem você ama!',
    'Pães',
    ARRAY['https://res.cloudinary.com/dtxa1leih/image/upload/v1795391842/file_00000000f67882108cde4a0d0a4b5d80_grego2.png'],
    '900g',
    ARRAY['Chocotone', 'Leite condensado', 'Creme de leite', 'Chocolate em pó', 'Leite em pó', 'Manteiga', 'Chocolate fracionado', 'Granulado'],
    ARRAY['Ninho e Brigadeiro'],
    ARRAY['Lactose', 'Glúten', 'Ovos'],
    '5 dias em local fresco', '8 porções', 5.0, false, true, 5
  ),
  (
    'travessa-doce-recheada', 'Travessa Doce Recheada', 18.00, NULL,
    'Camadas generosas de cremes artesanais e frutas ou chocolates selecionados — perfeita para celebrar momentos especiais!',
    'Doces',
    ARRAY['https://res.cloudinary.com/dtxa1leih/image/upload/v1795391843/file_00000000d3508210bba98c7c8ea7f916_ikv4li.png'],
    '1kg',
    ARRAY['Leite condensado', 'Creme de leite', 'Chocolate nobre', 'Frutas frescas'],
    ARRAY['Uva', 'Limão', 'Ninho, Chocolate e Nutella (+2€)'],
    ARRAY['Lactose'],
    '3 dias no frigorífico', '6 a 8 porções', 4.9, false, true, 6
  ),
  (
    'cookie', 'Cookie Artesanal', 3.00, 3.50,
    'Deliciosos cookies recheados ou tradicionais, crocantes nas bordas e macios no centro. Impossível comer um só!',
    'Biscoitos',
    ARRAY['https://res.cloudinary.com/dtxa1leih/image/upload/v1795474339/Untitled-1_fiszjk.png'],
    '100g',
    ARRAY['Farinha de trigo', 'Sal', 'Fermento químico em pó', 'Bicarbonato de sódio', 'Manteiga sem sal', 'Açúcar mascavo', 'Açúcar branco', 'Ovo', 'Essência de baunilha', 'Gotas de chocolate', 'Nutella'],
    ARRAY['Tradicional', 'Nutella'],
    ARRAY['Lactose', 'Glúten', 'Ovos'],
    '5 dias em pote fechado', '1 unidade grande', 5.0, false, false, 7
  )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.promotions (
  slug, title, subtitle, badge, thumbnail_url, blocks, is_published, display_order
)
VALUES (
  'festival-artesanal-bris',
  'Festival Artesanal Bris',
  'Combos especiais, sabores exclusivos e descontos imperdíveis nos nossos clássicos feitos à mão em Torres Vedras.',
  'OFERTA ESPECIAL',
  'https://res.cloudinary.com/dtxa1leih/image/upload/v1795391843/file_00000000d3508210bba98c7c8ea7f916_ikv4li.png',
  '[
    {
      "id": "blk-hero-1",
      "type": "hero",
      "badge": "EDIÇÃO LIMITADA",
      "title": "Festival Artesanal Bris — Sabores Feitos Com Amor",
      "subtitle": "Descubra nossa seleção promocional de pães doces, brownies, cookies e travessas recheadas preparados sob encomenda em Torres Vedras.",
      "imageUrl": "https://res.cloudinary.com/dtxa1leih/image/upload/v1795391843/file_00000000d3508210bba98c7c8ea7f916_ikv4li.png",
      "ctaText": "Ver Produtos da Oferta",
      "ctaLink": "#promo-products"
    },
    {
      "id": "blk-products-1",
      "type": "products",
      "title": "Seleção em Promoção",
      "subtitle": "Escolha seus favoritos e adicione direto ao carrinho.",
      "productSlugs": ["pao-doce", "brownie", "biscoitos", "cookie"]
    },
    {
      "id": "blk-text-1",
      "type": "text",
      "badge": "FEITO SOB ENCOMENDA",
      "title": "Frescor garantido em cada entrega",
      "body": "Todos os itens da campanha são preparados no mesmo dia da entrega, com ingredientes selecionados e aquele carinho caseiro que define a Bris Pastelaria.",
      "imageUrl": "https://res.cloudinary.com/dtxa1leih/image/upload/v1790333277/bread_fhk0vv.png",
      "align": "right"
    },
    {
      "id": "blk-gallery-1",
      "type": "gallery",
      "title": "Direto da Nossa Cozinha",
      "layout": "grid-3",
      "images": [
        "https://res.cloudinary.com/dtxa1leih/image/upload/v1790333276/brownie_opxfbt.png",
        "https://res.cloudinary.com/dtxa1leih/image/upload/v1790333276/biscoito_n873sd.png",
        "https://res.cloudinary.com/dtxa1leih/image/upload/v1795474339/Untitled-1_fiszjk.png"
      ]
    },
    {
      "id": "blk-cta-1",
      "type": "cta",
      "badge": "ENCOMENDE AGORA",
      "title": "Quer montar um kit personalizado para o seu evento?",
      "subtitle": "Fale com a gente pelo WhatsApp e garanta condições especiais para encomendas.",
      "highlight": "Entregas em Torres Vedras",
      "ctaText": "Falar no WhatsApp",
      "ctaLink": "https://wa.me/351961800870"
    }
  ]'::jsonb,
  true,
  1
)
ON CONFLICT (slug) DO NOTHING;
