import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Cake,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Truck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  HERO_SLIDES,
  WHATSAPP_NUMBER,
  imgProductBiscoitos,
  imgProductBread,
  imgProductBrownie,
  imgProductCookie,
} from '../data';
import { formatPrice } from '../lib/supabase';
import type { Product, Promotion } from '../types';

interface LandingPageProps {
  onNavigate: (path: string, hash?: string) => void;
  onSelectProduct: (product: Product) => void;
  onSelectPromotion: (promo: Promotion) => void;
}

export function LandingPage({
  onNavigate,
  onSelectProduct,
  onSelectPromotion,
}: LandingPageProps) {
  const { products, publishedPromotions, addToCart, subscribeNewsletter } =
    useStore();

  // Hero Carousel State
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);

  // Best Sellers Pagination State
  const [bestSellerPage, setBestSellerPage] = useState(0);

  // Newsletter State
  const [email, setEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [submittingEmail, setSubmittingEmail] = useState(false);

  useEffect(() => {
    if (heroPaused) return;
    const timer = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [heroPaused]);

  const currentSlide = HERO_SLIDES[heroIndex];

  const featuredProducts = useMemo(() => {
    const flagged = products.filter((p) => p.isFeatured);
    return (flagged.length > 0 ? flagged : products).slice(0, 4);
  }, [products]);

  const bestSellerProducts = useMemo(() => {
    const flagged = products.filter((p) => p.isBestSeller);
    return flagged.length > 0 ? flagged : products;
  }, [products]);

  const pageSize = 6;
  const totalBestPages = Math.max(
    1,
    Math.ceil(bestSellerProducts.length / pageSize)
  );
  const safeBestPage = Math.min(bestSellerPage, totalBestPages - 1);
  const visibleBestSellers = bestSellerProducts.slice(
    safeBestPage * pageSize,
    safeBestPage * pageSize + pageSize
  );

  async function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmittingEmail(true);
    const res = await subscribeNewsletter(email);
    setNewsletterMsg({ ok: res.ok, text: res.message });
    if (res.ok) setEmail('');
    setSubmittingEmail(false);
  }

  return (
    <main className="bg-white text-[#0b223d]">
      {/* =====================================================================
          1. HERO SECTION — Synced Image & Text Carousel (NO "Order Online")
      ===================================================================== */}
      <section
        id="hero"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pt-14 lg:pb-24"
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Synced Hero Text + Single Primary CTA + Stats */}
          <div className="lg:col-span-6 space-y-6">
            <div key={currentSlide.id} className="animate-hero-slide space-y-5">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#eef4fc] text-[#0d4380] border border-[#d6e4f7]">
                <Sparkles className="w-3.5 h-3.5" />
                {currentSlide.badge}
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold leading-[1.08] tracking-tight text-[#071f3b]">
                {currentSlide.title}
              </h1>

              <p className="text-sm sm:text-base text-[#526d8a] leading-relaxed max-w-lg">
                {currentSlide.description}
              </p>
            </div>

            {/* Single CTA Button (removed "Order Online" as requested) */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('/products')}
                className="px-7 py-3.5 rounded-xl bg-[#0d4380] hover:bg-[#092d58] text-white text-sm font-semibold shadow-md shadow-[#0d4380]/20 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                {currentSlide.ctaLabel}
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Carousel slide controls */}
              <div className="flex items-center gap-2 ml-1">
                <button
                  type="button"
                  onClick={() =>
                    setHeroIndex(
                      (prev) =>
                        (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
                    )
                  }
                  aria-label="Slide anterior"
                  className="w-10 h-10 rounded-full border border-[#d6e4f7] text-[#0d4380] hover:bg-[#eef4fc] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length)
                  }
                  aria-label="Próximo slide"
                  className="w-10 h-10 rounded-full bg-[#0d4380] text-white hover:bg-[#092d58] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slide Progress Indicators */}
            <div className="flex items-center gap-2 pt-1">
              {HERO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setHeroIndex(idx)}
                  aria-label={`Ir para slide ${idx + 1}: ${slide.title}`}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === heroIndex
                      ? 'w-10 bg-[#0d4380]'
                      : 'w-3 bg-[#cddcf0] hover:bg-[#8fb0db]'
                  }`}
                />
              ))}
            </div>

            {/* 3 Stats Row matching the reference photo */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#ebf1f8] max-w-md">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#071f3b]">
                  100%
                </p>
                <p className="text-xs text-[#647b96] mt-0.5">
                  Receitas Artesanais
                </p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#071f3b]">
                  500+
                </p>
                <p className="text-xs text-[#647b96] mt-0.5">
                  Encomendas Felizes
                </p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#071f3b]">
                  4.9
                </p>
                <p className="text-xs text-[#647b96] mt-0.5">
                  Avaliação Média
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Tall Rounded Hero Image Carousel + Floating Badges */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-[28px] overflow-hidden bg-gradient-to-br from-[#e7effa] via-[#f2f6fc] to-[#d9e7f8] aspect-[4/4.4] sm:aspect-[4/4.2] shadow-xl shadow-[#0d4380]/10">
              {HERO_SLIDES.map((slide, idx) => (
                <img
                  key={slide.id}
                  src={slide.image}
                  alt={slide.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                    idx === heroIndex
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-105 pointer-events-none'
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-[#061e3c]/30 via-transparent to-transparent pointer-events-none" />

              {/* Top-right floating heart icon matching reference */}
              <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/95 backdrop-blur-xs shadow-md flex items-center justify-center text-[#0d4380]">
                <Heart className="w-4 h-4 fill-[#0d4380]" />
              </div>

              {/* Slide counter pill */}
              <div className="absolute top-5 left-5 px-3 py-1 rounded-full bg-[#061e3c]/65 backdrop-blur-xs text-white text-xs font-semibold">
                {String(heroIndex + 1).padStart(2, '0')} /{' '}
                {String(HERO_SLIDES.length).padStart(2, '0')}
              </div>
            </div>

            {/* Bottom-left Floating White Card matching reference */}
            <div
              key={`float-${currentSlide.id}`}
              className="animate-hero-slide absolute -bottom-5 left-4 sm:-left-6 bg-white rounded-2xl shadow-xl shadow-[#0d4380]/12 border border-[#e6edf6] px-4 py-3.5 flex items-center gap-3.5 max-w-xs"
            >
              <div className="w-10 h-10 rounded-full bg-[#e6f2ff] text-[#0d4380] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#071f3b]">
                  {currentSlide.floatingTitle}
                </p>
                <p className="text-[11px] text-[#647b96]">
                  {currentSlide.floatingSubtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. FEATURED COLLECTION SECTION (Soft blue-tinted light surface)
      ===================================================================== */}
      <section id="featured" className="bg-[#f4f7fb] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#071f3b] tracking-tight">
              Featured Collection
            </h2>
            <p className="text-sm text-[#526d8a] mt-3">
              Uma curadoria especial dos nossos pães doces, brownies, biscoitos e
              sobremesas preparados diariamente com receitas artesanais.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <article
                key={product.id}
                className="bg-white rounded-2xl border border-[#e3ebf5] overflow-hidden flex flex-col shadow-xs hover:shadow-lg hover:shadow-[#0d4380]/8 transition-all duration-300 group"
              >
                <button
                  type="button"
                  onClick={() => onSelectProduct(product)}
                  className="relative aspect-[4/3.3] bg-[#eef3fa] overflow-hidden cursor-pointer block w-full"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </button>

                <div className="p-5 flex flex-col flex-1">
                  <button
                    type="button"
                    onClick={() => onSelectProduct(product)}
                    className="text-left cursor-pointer"
                  >
                    <h3 className="text-base font-bold text-[#071f3b] group-hover:text-[#0d4380] transition-colors">
                      {product.name}
                    </h3>
                  </button>
                  <p className="text-xs text-[#647b96] mt-1.5 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Price + Rating Row */}
                  <div className="flex items-center justify-between mt-4 mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-extrabold text-[#071f3b]">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice &&
                        product.originalPrice > product.price && (
                          <span className="text-xs text-[#94a8c0] line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                    </div>
                    <div
                      className="flex items-center gap-0.5 text-amber-400"
                      aria-label={`Avaliação ${product.rating} de 5`}
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    className="mt-auto w-full py-2.5 px-4 rounded-xl bg-[#0d4380] hover:bg-[#092d58] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    Adicionar ao Carrinho
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              type="button"
              onClick={() => onNavigate('/products')}
              className="px-7 py-2.5 rounded-xl border border-[#0d4380]/30 text-[#0d4380] hover:bg-[#0d4380] hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Ver Todos os Produtos
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. PROMOTIONS ("SALE") THUMBNAIL CARD — Between Featured & Best Sellers
      ===================================================================== */}
      <section id="sale" className="bg-white pt-20 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0d4380] mb-2">
                <Tag className="w-3.5 h-3.5" />
                Promoções & Campanhas
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#071f3b] tracking-tight">
                Ofertas Especiais Bris
              </h2>
            </div>
            <p className="text-sm text-[#526d8a] max-w-md">
              Clique na campanha abaixo para explorar produtos selecionados,
              combos e novidades exclusivas.
            </p>
          </div>

          {publishedPromotions.length === 0 ? (
            <div className="rounded-3xl bg-gradient-to-r from-[#0d4380] to-[#1a5fa8] p-8 sm:p-12 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-xs font-semibold mb-3">
                  EM BREVE
                </span>
                <h3 className="text-2xl font-extrabold">
                  Novas Promoções Chegando na Cozinha Bris
                </h3>
                <p className="text-sm text-white/80 mt-2 max-w-lg">
                  Acompanhe o nosso cardápio completo ou inscreva-se na
                  newsletter para receber as próximas ofertas em primeira mão.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/products')}
                className="px-6 py-3 rounded-xl bg-white text-[#0d4380] text-sm font-bold hover:bg-[#eef4fc] transition-colors shrink-0 cursor-pointer"
              >
                Ver Catálogo
              </button>
            </div>
          ) : publishedPromotions.length === 1 ? (
            /* Single Prominent Promotion Thumbnail Card */
            (() => {
              const promo = publishedPromotions[0];
              return (
                <button
                  type="button"
                  onClick={() => onSelectPromotion(promo)}
                  className="w-full text-left group relative rounded-[28px] overflow-hidden bg-gradient-to-r from-[#071f3b] via-[#0d4380] to-[#155296] shadow-xl shadow-[#0d4380]/15 grid grid-cols-1 lg:grid-cols-12 items-stretch cursor-pointer"
                >
                  <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center text-white">
                    <span className="inline-flex items-center gap-1.5 self-start px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-xs text-[11px] font-bold tracking-wider uppercase mb-4">
                      <Sparkles className="w-3.5 h-3.5" />
                      {promo.badge || 'PROMOÇÃO'}
                    </span>
                    <h3 className="text-2xl sm:text-4xl font-extrabold leading-tight">
                      {promo.title}
                    </h3>
                    <p className="text-sm sm:text-base text-white/80 mt-3 max-w-xl leading-relaxed">
                      {promo.subtitle}
                    </p>
                    <div className="mt-7 inline-flex items-center gap-2 self-start px-6 py-3 rounded-xl bg-white text-[#0d4380] text-sm font-bold group-hover:bg-[#eef4fc] transition-colors">
                      Explorar Promoção
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                  <div className="lg:col-span-5 relative min-h-[240px] lg:min-h-[320px] overflow-hidden">
                    <img
                      src={promo.thumbnailUrl || imgProductBread}
                      alt={promo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#0d4380]/70 via-transparent to-transparent" />
                  </div>
                </button>
              );
            })()
          ) : (
            /* Multiple Promotion Thumbnail Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedPromotions.map((promo) => (
                <button
                  key={promo.id}
                  type="button"
                  onClick={() => onSelectPromotion(promo)}
                  className="group text-left rounded-3xl overflow-hidden bg-[#092d58] text-white shadow-lg shadow-[#0d4380]/12 flex flex-col cursor-pointer hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0d4380]">
                    <img
                      src={promo.thumbnailUrl || imgProductBread}
                      alt={promo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/95 text-[#0d4380] text-[11px] font-bold uppercase tracking-wider shadow-sm">
                      {promo.badge || 'PROMOÇÃO'}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-extrabold leading-snug">
                      {promo.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/75 mt-2 line-clamp-2 flex-1">
                      {promo.subtitle}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-white group-hover:underline">
                      Ver página da promoção
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          4. BEST SELLERS SECTION (White background, 3-col grid + arrows)
      ===================================================================== */}
      <section id="best-sellers" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#071f3b] tracking-tight">
                Best Sellers
              </h2>
              <p className="text-sm text-[#526d8a] mt-2">
                Uma seleção dos nossos doces e pães mais pedidos, amados pelo
                sabor rico, textura perfeita e carinho em cada detalhe.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={safeBestPage === 0}
                onClick={() => setBestSellerPage((p) => Math.max(0, p - 1))}
                aria-label="Página anterior de Best Sellers"
                className="w-10 h-10 rounded-full border border-[#d6e4f7] text-[#0d4380] hover:bg-[#eef4fc] disabled:opacity-40 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={safeBestPage >= totalBestPages - 1}
                onClick={() =>
                  setBestSellerPage((p) => Math.min(totalBestPages - 1, p + 1))
                }
                aria-label="Próxima página de Best Sellers"
                className="w-10 h-10 rounded-full bg-[#0d4380] text-white hover:bg-[#092d58] disabled:opacity-40 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {visibleBestSellers.map((product) => (
              <article
                key={product.id}
                className="bg-white rounded-2xl border border-[#e6edf6] p-3.5 flex flex-col hover:shadow-lg hover:shadow-[#0d4380]/8 transition-all duration-300 group"
              >
                <button
                  type="button"
                  onClick={() => onSelectProduct(product)}
                  className="aspect-[4/3.6] rounded-xl overflow-hidden bg-[#f2f6fc] cursor-pointer block w-full"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </button>

                <div className="pt-4 px-1.5 pb-1.5 flex flex-col flex-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#647b96]">
                    {product.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectProduct(product)}
                    className="text-left mt-1 cursor-pointer"
                  >
                    <h3 className="text-lg font-bold text-[#071f3b] group-hover:text-[#0d4380] transition-colors">
                      {product.name}
                    </h3>
                  </button>
                  <p className="text-xs text-[#647b96] mt-1 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between gap-3 mt-5 pt-3 border-t border-[#f0f4fa]">
                    <span className="text-lg font-extrabold text-[#071f3b]">
                      {formatPrice(product.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="px-4 py-2 rounded-xl bg-[#0d4380] hover:bg-[#092d58] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      Adicionar
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. DARK BRIS BLUE STORY SECTION (Replaces black section in reference)
      ===================================================================== */}
      <section id="story" className="bg-[#092d58] text-white py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="inline-block px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold uppercase tracking-widest text-white/85">
                Nossa História · Desde 2026
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold leading-[1.12] tracking-tight">
                Onde o Carinho Encontra o Sabor e Cada Mordida Conta Uma História
              </h2>

              <p className="text-sm sm:text-base text-white/75 leading-relaxed max-w-xl">
                Nascemos em 2026 em Torres Vedras como o sonho de um casal
                apaixonado por aquilo que faz. Cada pão doce, brownie, biscoito e
                sobremesa que sai da nossa cozinha carrega cuidado artesanal,
                ingredientes selecionados e muito amor para fazer parte dos seus
                melhores momentos.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('/products')}
                  className="px-6 py-3 rounded-xl bg-white text-[#092d58] hover:bg-[#e8f1fc] text-sm font-bold transition-colors cursor-pointer"
                >
                  Explorar Cardápio
                </button>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10 text-sm font-semibold transition-colors"
                >
                  Falar no WhatsApp
                </a>
              </div>
            </div>

            {/* 2x2 Rounded Collage Mosaic matching reference photo */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden bg-white/10 aspect-[4/4.3] shadow-lg">
                  <img
                    src={imgProductBread}
                    alt="Pão Doce Artesanal Bris"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden bg-white/10 aspect-[4/3] shadow-lg">
                  <img
                    src={imgProductBiscoitos}
                    alt="Biscoitos Amanteigados Bris"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-6">
                <div className="rounded-2xl overflow-hidden bg-white/10 aspect-[4/3] shadow-lg">
                  <img
                    src={imgProductBrownie}
                    alt="Brownie Gourmet Bris"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden bg-white/10 aspect-[4/4.3] shadow-lg">
                  <img
                    src={imgProductCookie}
                    alt="Cookie Artesanal Bris"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. STAY CONNECTED + 4 FEATURES + NEWSLETTER (Matches bottom of photo)
      ===================================================================== */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#071f3b] tracking-tight">
              Fique Conectado & Saboreie Novidades
            </h2>
            <p className="text-sm text-[#526d8a] mt-3">
              Acompanhe fornadas frescas, promoções exclusivas e lançamentos
              direto da nossa cozinha em Torres Vedras.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              {
                icon: Cake,
                title: 'Encomendas Especiais',
                desc: 'Doces e sobremesas sob medida para festas e momentos únicos.',
              },
              {
                icon: Truck,
                title: 'Entregas em Torres Vedras',
                desc: 'Combinamos a entrega com todo cuidado direto até você.',
              },
              {
                icon: Sparkles,
                title: 'Fresco Todo Dia',
                desc: 'Preparado no dia com ingredientes frescos e selecionados.',
              },
              {
                icon: Award,
                title: 'Qualidade Artesanal',
                desc: 'Receitas autorais feitas à mão com carinho em cada detalhe.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-[#eef4fc] text-[#0d4380] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#071f3b]">{title}</h3>
                <p className="text-xs text-[#647b96] mt-1.5 max-w-[200px] leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>

          {/* Newsletter Card matching reference photo */}
          <div className="bg-[#f4f7fb] border border-[#e3ebf5] rounded-3xl px-6 py-12 sm:p-14 text-center">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#071f3b]">
              Inscreva-se na Nossa Newsletter
            </h3>
            <p className="text-sm text-[#526d8a] mt-2 max-w-md mx-auto">
              Receba novidades sobre novos sabores, ofertas sazonais e promoções
              exclusivas da Bris Pastelaria.
            </p>

            <form
              onSubmit={handleNewsletterSubmit}
              className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu melhor e-mail"
                className="w-full sm:flex-1 px-4 py-3 rounded-xl bg-white border border-[#d6e4f7] text-sm text-[#0b223d] placeholder:text-[#8aa1bc] focus:outline-none focus:border-[#0d4380]"
              />
              <button
                type="submit"
                disabled={submittingEmail}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0d4380] hover:bg-[#092d58] disabled:opacity-60 text-white text-sm font-semibold transition-colors cursor-pointer shrink-0"
              >
                {submittingEmail ? 'Enviando...' : 'Inscrever'}
              </button>
            </form>

            {newsletterMsg && (
              <p
                className={`mt-4 text-xs font-semibold ${
                  newsletterMsg.ok ? 'text-[#0d4380]' : 'text-red-600'
                }`}
              >
                {newsletterMsg.text}
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
