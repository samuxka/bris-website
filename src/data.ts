import type { HeroSlide, Product, Promotion } from './types';

export const imgBrisLogotipoWhite =
  'https://res.cloudinary.com/dtxa1leih/image/upload/v1790335517/d992f_z8rjjg.png';
export const imgBrisLogotipoBlue =
  'https://res.cloudinary.com/dtxa1leih/image/upload/v1790335517/bee22_xyj5lj.png';
export const imgBrisMascot =
  'https://res.cloudinary.com/dtxa1leih/image/upload/v1790335517/e8597_hzai4j.png';

export const WHATSAPP_NUMBER = '351961800870';
export const PHONE_DISPLAY = '961 800 870';
export const INSTAGRAM_URL = 'https://www.instagram.com/bris_pastelaria/';

export const imgProductBread =
  'https://res.cloudinary.com/dtxa1leih/image/upload/v1790333277/bread_fhk0vv.png';
export const imgProductPudim =
  'https://res.cloudinary.com/dtxa1leih/image/upload/v1795391843/file_00000000187481f48f43f8dfbf81dd22_w6sbop.png';
export const imgProductPanetone =
  'https://res.cloudinary.com/dtxa1leih/image/upload/v1795391842/file_00000000f67882108cde4a0d0a4b5d80_grego2.png';
export const imgProductTravessa =
  'https://res.cloudinary.com/dtxa1leih/image/upload/v1795391843/file_00000000d3508210bba98c7c8ea7f916_ikv4li.png';
export const imgProductBrownie =
  'https://res.cloudinary.com/dtxa1leih/image/upload/v1790333276/brownie_opxfbt.png';
export const imgProductBiscoitos =
  'https://res.cloudinary.com/dtxa1leih/image/upload/v1790333276/biscoito_n873sd.png';
export const imgProductCookie =
  'https://res.cloudinary.com/dtxa1leih/image/upload/v1795474339/Untitled-1_fiszjk.png';

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-pao-doce',
    badge: 'Pastelaria Artesanal desde 2026',
    title: 'Redefinindo a Pastelaria Para o Seu Dia a Dia',
    description:
      'A combinação perfeita entre receitas caseiras tradicionais e muito carinho. Pães doces macios como nuvens, feitos sob encomenda em Torres Vedras.',
    image: imgProductBread,
    floatingTitle: 'Fresco Diariamente',
    floatingSubtitle: 'Assado sob encomenda em Torres Vedras',
    ctaLabel: 'Explorar Cardápio',
    targetCategory: 'Pães',
  },
  {
    id: 'slide-brownie',
    badge: 'Chocolate Negro 70% Selecionado',
    title: 'Brownies Cremosos Que Derretem na Boca',
    description:
      'Casquinha crocante por fora e interior intensamente chocolatudo. Escolha seu recheio favorito e transforme qualquer pausa em um momento especial.',
    image: imgProductBrownie,
    floatingTitle: 'Recheios Especiais',
    floatingSubtitle: 'Nutella, Ninho, Doce de Leite e mais',
    ctaLabel: 'Explorar Cardápio',
    targetCategory: 'Doces',
  },
  {
    id: 'slide-travessa',
    badge: 'Perfeito Para Compartilhar',
    title: 'Sobremesas de Travessa Feitas Com Amor',
    description:
      'Camadas generosas de cremes artesanais, frutas frescas e chocolate nobre para celebrar jantares, festas e encontros em família.',
    image: imgProductTravessa,
    floatingTitle: 'Sob Encomenda',
    floatingSubtitle: 'Entregas combinadas em Torres Vedras',
    ctaLabel: 'Explorar Cardápio',
    targetCategory: 'Doces',
  },
  {
    id: 'slide-cookie',
    badge: 'Crocante Por Fora, Macio Por Dentro',
    title: 'Cookies & Biscoitos Que Abraçam o Seu Café',
    description:
      'Feitos com manteiga verdadeira, gotas de chocolate e recheios irresistíveis. A companhia ideal para o seu chá da tarde ou presente especial.',
    image: imgProductCookie,
    floatingTitle: '100% Artesanal',
    floatingSubtitle: 'Receita exclusiva da cozinha Bris',
    ctaLabel: 'Explorar Cardápio',
    targetCategory: 'Biscoitos',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    slug: 'pao-doce',
    name: 'Pão Doce Artesanal',
    price: 10.0,
    originalPrice: 12.0,
    description:
      'Leve como uma pena, macio como uma nuvem! Pesando aproximadamente 700g, nosso pão doce caseiro foi feito pensando principalmente no pequeno-almoço.',
    images: [imgProductBread],
    category: 'Pães',
    weight: '700g',
    ingredients: [
      'Leite',
      'Ovos',
      'Açúcar',
      'Fermento biológico',
      'Óleo',
      'Farinha de trigo',
      'Sal',
    ],
    recheios: ['Coco', 'Goiabada', 'Leite em pó', 'Açúcar', 'Puro'],
    allergens: ['Glúten', 'Lactose', 'Ovos'],
    shelf: '2 dias à temperatura ambiente',
    servings: '1 unidade',
    rating: 5.0,
    isFeatured: true,
    isBestSeller: true,
    displayOrder: 1,
  } as Product,
  {
    id: 2,
    slug: 'brownie',
    name: 'Brownie Gourmet',
    price: 8.0,
    originalPrice: 10.0,
    description:
      'Sabores variados, a teu gosto. Faz a tua escolha e desfrute do melhor brownie de chocolate 70% que já provaste.',
    images: [imgProductBrownie],
    category: 'Doces',
    weight: '250g',
    ingredients: [
      'Chocolate negro 70%',
      'Manteiga',
      'Açúcar mascavado',
      'Ovos',
      'Farinha de trigo',
      'Cacau em pó',
      'Sal',
    ],
    recheios: ['Tradicional', 'Nutella', 'Doce de Leite', 'Leite Ninho'],
    allergens: ['Glúten', 'Lactose', 'Ovos', 'Soja'],
    shelf: '5 dias no frigorífico',
    servings: '4 fatias',
    rating: 5.0,
    isFeatured: true,
    isBestSeller: true,
    displayOrder: 2,
  },
  {
    id: 3,
    slug: 'biscoitos',
    name: 'Biscoitos Amanteigados',
    price: 6.0,
    originalPrice: 7.5,
    description:
      'Biscoitos amanteigados, crocantes mas que derretem na boca, perfeitos para acompanhar um chá ou café.',
    images: [imgProductBiscoitos],
    category: 'Biscoitos',
    weight: '400g',
    ingredients: [
      'Manteiga',
      'Açúcar refinado',
      'Amido de milho',
      'Farinha de trigo',
      'Leite condensado',
    ],
    recheios: ['Coco', 'Goiabada', 'Limão', 'Açúcar', 'Puro', 'Baunilha'],
    allergens: ['Glúten', 'Lactose'],
    shelf: '30 dias em recipiente hermético',
    servings: 'Aprox. 24 unidades',
    rating: 4.9,
    isFeatured: true,
    isBestSeller: true,
    displayOrder: 3,
  },
  {
    id: 4,
    slug: 'pudim',
    name: 'Pudim Clássico',
    price: 20.0,
    originalPrice: 24.0,
    description:
      'Pudim delicioso pra comer acompanhado com quem você ama! Se delicie e aproveite cada colherada desse clássico da culinária.',
    images: [imgProductPudim],
    category: 'Doces',
    weight: '1.1kg',
    ingredients: [
      'Leite condensado',
      'Leite',
      'Ovos',
      'Açúcar',
      'Amido de milho',
    ],
    recheios: ['Tradicional com Caramelo'],
    allergens: ['Lactose', 'Ovos'],
    shelf: '4 dias no frigorífico',
    servings: '8 a 10 porções',
    rating: 5.0,
    isFeatured: true,
    isBestSeller: true,
    displayOrder: 4,
  },
  {
    id: 5,
    slug: 'panetone-trufado',
    name: 'Panetone Trufado',
    price: 26.0,
    originalPrice: null,
    description:
      'Macio, leve e saboroso, tudo isso em uma única receita! Leve o seu para dividir com quem você ama.',
    images: [imgProductPanetone],
    category: 'Pães',
    weight: '900g',
    ingredients: [
      'Chocotone',
      'Leite condensado',
      'Creme de leite',
      'Chocolate em pó',
      'Leite em pó',
      'Manteiga',
      'Chocolate fracionado',
      'Granulado',
    ],
    recheios: ['Ninho e Brigadeiro'],
    allergens: ['Lactose', 'Glúten', 'Ovos'],
    shelf: '5 dias em local fresco',
    servings: '8 porções',
    rating: 5.0,
    isFeatured: false,
    isBestSeller: true,
    displayOrder: 5,
  },
  {
    id: 6,
    slug: 'travessa-doce-recheada',
    name: 'Travessa Doce Recheada',
    price: 18.0,
    originalPrice: null,
    description:
      'Nada melhor do que aproveitar a noite com um doce artesanal em camadas generosas e sabor inesquecível!',
    images: [imgProductTravessa],
    category: 'Doces',
    weight: '1kg',
    ingredients: [
      'Leite condensado',
      'Creme de leite',
      'Chocolate nobre',
      'Frutas selecionadas',
    ],
    recheios: ['Uva', 'Limão', 'Ninho, Chocolate e Nutella (+2€)'],
    allergens: ['Lactose'],
    shelf: '3 dias no frigorífico',
    servings: '6 a 8 porções',
    rating: 4.9,
    isFeatured: false,
    isBestSeller: true,
    displayOrder: 6,
  },
  {
    id: 7,
    slug: 'cookie',
    name: 'Cookie Artesanal',
    price: 3.0,
    originalPrice: 3.5,
    description:
      'Deliciosos cookies recheados ou tradicionais, tanto faz! Os dois são de dar água na boca.',
    images: [imgProductCookie],
    category: 'Biscoitos',
    weight: '100g',
    ingredients: [
      'Farinha de trigo',
      'Sal',
      'Fermento químico em pó',
      'Bicarbonato de sódio',
      'Manteiga sem sal',
      'Açúcar mascavo',
      'Açúcar branco',
      'Ovo',
      'Essência de baunilha',
      'Gotas de chocolate',
      'Nutella',
    ],
    recheios: ['Tradicional', 'Nutella'],
    allergens: ['Lactose', 'Glúten', 'Ovos'],
    shelf: '5 dias em pote fechado',
    servings: '1 unidade grande',
    rating: 5.0,
    isFeatured: false,
    isBestSeller: false,
    displayOrder: 7,
  },
];

export const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: 1,
    slug: 'festival-artesanal-bris',
    title: 'Festival Artesanal Bris',
    subtitle:
      'Sabores exclusivos, combos promocionais e os nossos clássicos preparados sob encomenda em Torres Vedras.',
    badge: 'OFERTA ESPECIAL',
    thumbnailUrl: imgProductTravessa,
    isPublished: true,
    displayOrder: 1,
    blocks: [
      {
        id: 'blk-hero-1',
        type: 'hero',
        badge: 'EDIÇÃO LIMITADA',
        title: 'Festival Artesanal Bris — Sabores Feitos Com Amor',
        subtitle:
          'Descubra a nossa seleção promocional de pães doces, brownies, cookies e travessas recheadas preparados com ingredientes selecionados.',
        imageUrl: imgProductTravessa,
        ctaText: 'Ver Produtos da Oferta',
        ctaLink: '#promo-products',
      },
      {
        id: 'blk-products-1',
        type: 'products',
        title: 'Seleção em Promoção',
        subtitle: 'Escolha seus favoritos e adicione direto ao carrinho.',
        productSlugs: ['pao-doce', 'brownie', 'biscoitos', 'cookie'],
      },
      {
        id: 'blk-text-1',
        type: 'text',
        badge: 'FEITO SOB ENCOMENDA',
        title: 'Frescor garantido em cada entrega',
        body: 'Todos os itens desta campanha são preparados no mesmo dia da entrega, com ingredientes frescos e todo o carinho caseiro que faz parte da história da Bris Pastelaria.',
        imageUrl: imgProductBread,
        align: 'right',
      },
      {
        id: 'blk-gallery-1',
        type: 'gallery',
        title: 'Direto da Nossa Cozinha',
        layout: 'grid-3',
        images: [imgProductBrownie, imgProductBiscoitos, imgProductCookie],
      },
      {
        id: 'blk-cta-1',
        type: 'cta',
        badge: 'ENCOMENDE AGORA',
        title: 'Quer montar um kit personalizado para o seu evento?',
        subtitle:
          'Fale diretamente conosco pelo WhatsApp e garanta condições especiais para festas e reuniões.',
        highlight: 'Entregas em Torres Vedras',
        ctaText: 'Falar no WhatsApp',
        ctaLink: `https://wa.me/${WHATSAPP_NUMBER}`,
      },
    ],
  },
];
