export interface Product {
  id: number;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  description: string;
  category: string;
  images: string[];
  weight?: string | null;
  ingredients: string[];
  recheios: string[];
  allergens: string[];
  shelf?: string | null;
  servings?: string | null;
  rating: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  displayOrder: number;
}

export type PromoBlockType = 'hero' | 'products' | 'gallery' | 'text' | 'cta';

export interface PromoHeroBlock {
  id: string;
  type: 'hero';
  badge: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
}

export interface PromoProductsBlock {
  id: string;
  type: 'products';
  title: string;
  subtitle: string;
  productSlugs: string[];
}

export interface PromoGalleryBlock {
  id: string;
  type: 'gallery';
  title: string;
  layout: 'grid-2' | 'grid-3' | 'mosaic';
  images: string[];
}

export interface PromoTextBlock {
  id: string;
  type: 'text';
  badge: string;
  title: string;
  body: string;
  imageUrl?: string;
  align: 'left' | 'right';
}

export interface PromoCtaBlock {
  id: string;
  type: 'cta';
  badge: string;
  title: string;
  subtitle: string;
  highlight: string;
  ctaText: string;
  ctaLink: string;
}

export type PromoBlock =
  | PromoHeroBlock
  | PromoProductsBlock
  | PromoGalleryBlock
  | PromoTextBlock
  | PromoCtaBlock;

export interface Promotion {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  thumbnailUrl: string;
  blocks: PromoBlock[];
  isPublished: boolean;
  displayOrder: number;
  updatedAt?: string;
}

export interface CartItem {
  key: string;
  productId: number;
  productSlug: string;
  name: string;
  price: number;
  image: string;
  flavor?: string;
  quantity: number;
}

export interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  description: string;
  image: string;
  floatingTitle: string;
  floatingSubtitle: string;
  ctaLabel: string;
  targetCategory?: string;
}
