import { useState } from 'react';
import { ArrowRight, ShoppingBag, Sparkles, Star, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../lib/supabase';
import type { Product, PromoBlock } from '../types';

function safeHref(raw: string): string {
  const trimmed = (raw || '').trim();
  if (
    trimmed.startsWith('#') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://')
  ) {
    return trimmed;
  }
  return '#';
}

interface PromoRendererProps {
  blocks: PromoBlock[];
  onSelectProduct?: (product: Product) => void;
  previewMode?: boolean;
}

export function PromoRenderer({
  blocks,
  onSelectProduct,
  previewMode = false,
}: PromoRendererProps) {
  const { products, addToCart } = useStore();
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  if (blocks.length === 0) {
    return (
      <div className="py-20 text-center text-[#647b96]">
        Esta promoção ainda não possui blocos configurados.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {blocks.map((block) => {
        if (block.type === 'hero') {
          const href = safeHref(block.ctaLink);
          const isExternal = href.startsWith('http');
          return (
            <section
              key={block.id}
              className="relative overflow-hidden bg-gradient-to-br from-[#061e3c] via-[#0d4380] to-[#1a5fa8] text-white"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-6 space-y-5">
                  {block.badge && (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      {block.badge}
                    </span>
                  )}
                  <h1 className="text-3xl sm:text-5xl font-extrabold leading-[1.1] tracking-tight">
                    {block.title}
                  </h1>
                  <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-xl">
                    {block.subtitle}
                  </p>
                  {block.ctaText && (
                    <div className="pt-2">
                      <a
                        href={href}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[#0d4380] hover:bg-[#eef4fc] text-sm font-bold transition-colors shadow-lg"
                      >
                        {block.ctaText}
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>

                {block.imageUrl && (
                  <div className="lg:col-span-6">
                    <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/15 aspect-[4/3] bg-white/10">
                      <img
                        src={block.imageUrl}
                        alt={block.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        }

        if (block.type === 'products') {
          const selectedProducts = block.productSlugs
            .map((slug) => products.find((p) => p.slug === slug))
            .filter((p): p is Product => Boolean(p));

          return (
            <section
              key={block.id}
              id="promo-products"
              className="bg-[#f4f7fb] py-16 sm:py-20"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-[#071f3b]">
                    {block.title}
                  </h2>
                  {block.subtitle && (
                    <p className="text-sm text-[#526d8a] mt-2">
                      {block.subtitle}
                    </p>
                  )}
                </div>

                {selectedProducts.length === 0 ? (
                  <div className="text-center py-10 text-sm text-[#647b96] bg-white rounded-2xl border border-dashed border-[#cddcf0]">
                    Nenhum produto selecionado neste bloco ainda.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {selectedProducts.map((product) => (
                      <article
                        key={product.id}
                        className="bg-white rounded-2xl border border-[#e3ebf5] overflow-hidden flex flex-col shadow-xs hover:shadow-lg transition-all group"
                      >
                        <button
                          type="button"
                          onClick={() => onSelectProduct?.(product)}
                          className="aspect-[4/3.3] bg-[#eef3fa] overflow-hidden block w-full cursor-pointer"
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
                            onClick={() => onSelectProduct?.(product)}
                            className="text-left cursor-pointer"
                          >
                            <h3 className="text-base font-bold text-[#071f3b] group-hover:text-[#0d4380]">
                              {product.name}
                            </h3>
                          </button>
                          <p className="text-xs text-[#647b96] mt-1 line-clamp-2">
                            {product.description}
                          </p>
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
                            <div className="flex items-center gap-0.5 text-amber-400">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              <span className="text-xs font-bold text-[#071f3b]">
                                {product.rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                          {!previewMode && (
                            <button
                              type="button"
                              onClick={() => addToCart(product)}
                              className="mt-auto w-full py-2.5 px-4 rounded-xl bg-[#0d4380] hover:bg-[#092d58] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                            >
                              Adicionar ao Carrinho
                              <ShoppingBag className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        }

        if (block.type === 'text') {
          const hasImage = Boolean(block.imageUrl);
          return (
            <section key={block.id} className="bg-white py-16 sm:py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div
                  className={`grid grid-cols-1 ${
                    hasImage ? 'lg:grid-cols-12' : ''
                  } gap-10 items-center`}
                >
                  <div
                    className={`${
                      hasImage ? 'lg:col-span-6' : 'max-w-3xl mx-auto text-center'
                    } space-y-4 ${
                      hasImage && block.align === 'left' ? 'lg:order-2' : ''
                    }`}
                  >
                    {block.badge && (
                      <span className="inline-block px-3 py-1 rounded-full bg-[#eef4fc] text-[#0d4380] text-xs font-bold uppercase tracking-wider">
                        {block.badge}
                      </span>
                    )}
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-[#071f3b] tracking-tight">
                      {block.title}
                    </h2>
                    <p className="text-sm sm:text-base text-[#526d8a] leading-relaxed whitespace-pre-line">
                      {block.body}
                    </p>
                  </div>
                  {hasImage && (
                    <div
                      className={`lg:col-span-6 ${
                        block.align === 'left' ? 'lg:order-1' : ''
                      }`}
                    >
                      <div className="rounded-3xl overflow-hidden bg-[#f2f6fc] border border-[#e3ebf5] aspect-[4/3] shadow-lg">
                        <img
                          src={block.imageUrl}
                          alt={block.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        }

        if (block.type === 'gallery') {
          const gridClass =
            block.layout === 'grid-2'
              ? 'grid-cols-1 sm:grid-cols-2'
              : block.layout === 'mosaic'
              ? 'grid-cols-2 lg:grid-cols-4'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

          return (
            <section key={block.id} className="bg-[#f8fafd] py-16 sm:py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {block.title && (
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#071f3b] text-center mb-10">
                    {block.title}
                  </h2>
                )}
                {block.images.length === 0 ? (
                  <div className="text-center py-10 text-sm text-[#647b96] bg-white rounded-2xl border border-dashed border-[#cddcf0]">
                    Nenhuma foto enviada nesta galeria ainda.
                  </div>
                ) : (
                  <div className={`grid ${gridClass} gap-5`}>
                    {block.images.map((url, idx) => (
                      <button
                        key={`${url}-${idx}`}
                        type="button"
                        onClick={() => setLightboxImage(url)}
                        className={`rounded-2xl overflow-hidden bg-white border border-[#e3ebf5] aspect-[4/3] group cursor-pointer shadow-xs ${
                          block.layout === 'mosaic' && idx === 0
                            ? 'col-span-2 row-span-2 aspect-auto min-h-[260px]'
                            : ''
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Foto promocional ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        }

        if (block.type === 'cta') {
          const href = safeHref(block.ctaLink);
          const isExternal = href.startsWith('http');
          return (
            <section key={block.id} className="bg-white py-16">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="rounded-3xl bg-gradient-to-r from-[#071f3b] via-[#0d4380] to-[#1a5fa8] p-8 sm:p-14 text-center text-white shadow-xl">
                  {block.badge && (
                    <span className="inline-block px-3.5 py-1 rounded-full bg-white/15 text-xs font-bold uppercase tracking-wider mb-4">
                      {block.badge}
                    </span>
                  )}
                  <h2 className="text-2xl sm:text-4xl font-extrabold max-w-2xl mx-auto leading-tight">
                    {block.title}
                  </h2>
                  {block.subtitle && (
                    <p className="text-sm sm:text-base text-white/80 mt-3 max-w-xl mx-auto">
                      {block.subtitle}
                    </p>
                  )}
                  {block.highlight && (
                    <p className="mt-4 inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold">
                      {block.highlight}
                    </p>
                  )}
                  {block.ctaText && (
                    <div className="mt-7">
                      <a
                        href={href}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[#0d4380] hover:bg-[#eef4fc] text-sm font-bold transition-colors shadow-lg"
                      >
                        {block.ctaText}
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        }

        return null;
      })}

      {/* Lightbox Modal for Gallery */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-[#061e3c]/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            aria-label="Fechar imagem"
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white text-[#061e3c] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightboxImage}
            alt="Prévia ampliada"
            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
