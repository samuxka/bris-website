import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Star,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { WHATSAPP_NUMBER } from '../data';
import { formatPrice } from '../lib/supabase';
import type { Product } from '../types';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
}

export function ProductDetailPage({
  product,
  onBack,
  onSelectProduct,
}: ProductDetailPageProps) {
  const { products, addToCart } = useStore();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedFlavor, setSelectedFlavor] = useState<string>(
    product.recheios[0] || ''
  );
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<'ingredientes' | 'sabores' | 'especificacoes'>(
    'ingredientes'
  );
  const [justAdded, setJustAdded] = useState(false);

  // Reset state when switching to a recommended product
  useEffect(() => {
    setActiveImageIdx(0);
    setSelectedFlavor(product.recheios[0] || '');
    setQuantity(1);
    setTab('ingredientes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id, product.recheios]);

  const galleryImages =
    product.images.length > 0 ? product.images : [''];

  // Recommended products: prioritize same category, then others (up to 4)
  const recommendedProducts = useMemo(() => {
    const others = products.filter((p) => p.id !== product.id);
    const sameCategory = others.filter((p) => p.category === product.category);
    const differentCategory = others.filter(
      (p) => p.category !== product.category
    );
    return [...sameCategory, ...differentCategory].slice(0, 4);
  }, [products, product.id, product.category]);

  function handleAddToCart() {
    addToCart(product, selectedFlavor || undefined, quantity);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
  }

  function handleOrderWhatsApp() {
    const text = `Olá Bris Pastelaria! Gostaria de encomendar ${quantity}x ${
      product.name
    }${selectedFlavor ? ` (Sabor/Recheio: ${selectedFlavor})` : ''} — ${formatPrice(
      product.price * quantity
    )}.`;
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    );
  }

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back button & breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d4380] hover:text-[#092d58] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Catálogo
          </button>
          <span className="text-xs text-[#647b96] hidden sm:inline">
            Produtos / {product.category} /{' '}
            <strong className="text-[#071f3b]">{product.name}</strong>
          </span>
        </div>

        {/* Product Primary 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left: Multi-Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-[#f2f6fc] border border-[#e3ebf5] flex items-center justify-center">
              <img
                src={galleryImages[activeImageIdx] || galleryImages[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={`${imgUrl}-${idx}`}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-[#f2f6fc] ${
                      idx === activeImageIdx
                        ? 'border-[#0d4380] ring-2 ring-[#0d4380]/20'
                        : 'border-[#e3ebf5] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} foto ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details, Flavors, Quantity, Cart CTA & Tabs */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-[#eef4fc] text-[#0d4380] text-xs font-bold">
                  {product.category}
                </span>
                {product.isFeatured && (
                  <span className="px-3 py-1 rounded-full bg-[#0d4380] text-white text-[11px] font-semibold">
                    Destaque
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold">
                    Best Seller
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#071f3b] tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-[#526d8a]">
                  {product.rating.toFixed(1)} · Feito artesanalmente
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-[#0d4380]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-[#94a8c0] line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {product.weight && (
                <span className="text-xs font-medium text-[#647b96] ml-1">
                  · {product.weight}
                </span>
              )}
            </div>

            <p className="text-sm sm:text-base text-[#445c76] leading-relaxed">
              {product.description}
            </p>

            {/* Flavor / Recheio Selector */}
            {product.recheios.length > 0 && (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#071f3b]">
                  Escolha o Sabor / Recheio:
                  <span className="text-[#0d4380] ml-1.5 normal-case font-semibold">
                    {selectedFlavor}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.recheios.map((flavor) => {
                    const active = selectedFlavor === flavor;
                    return (
                      <button
                        key={flavor}
                        type="button"
                        onClick={() => setSelectedFlavor(flavor)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          active
                            ? 'bg-[#0d4380] text-white border-[#0d4380] shadow-sm'
                            : 'bg-white text-[#334e68] border-[#d6e4f7] hover:border-[#0d4380] hover:text-[#0d4380]'
                        }`}
                      >
                        {flavor}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity + Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
              <div className="inline-flex items-center justify-between sm:justify-center rounded-xl border border-[#d6e4f7] bg-[#f8fafd] px-2 h-12">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 text-[#0d4380] hover:bg-white rounded-lg cursor-pointer"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-[#071f3b] min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-2 text-[#0d4380] hover:bg-white rounded-lg cursor-pointer"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 p-5 rounded-xl bg-[#0d4380] hover:bg-[#092d58] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-md shadow-[#0d4380]/20 cursor-pointer"
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    Adicionado ao Carrinho!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Adicionar ao Carrinho ·{' '}
                    {formatPrice(product.price * quantity)}
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={handleOrderWhatsApp}
              className="w-full h-11 px-5 rounded-xl border border-[#0d4380]/25 text-[#0d4380] hover:bg-[#eef4fc] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              Encomendar diretamente pelo WhatsApp
            </button>

            {/* Product Details Tabs */}
            <div className="pt-4">
              <div className="flex gap-6 border-b border-[#e6edf6]">
                {(
                  [
                    { id: 'ingredientes', label: 'Ingredientes' },
                    { id: 'sabores', label: 'Sabores & Recheios' },
                    { id: 'especificacoes', label: 'Especificações' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px transition-colors cursor-pointer ${
                      tab === item.id
                        ? 'border-[#0d4380] text-[#0d4380]'
                        : 'border-transparent text-[#7c93ad] hover:text-[#0b223d]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="pt-5">
                {tab === 'ingredientes' && (
                  <div className="space-y-5">
                    {product.ingredients.length > 0 ? (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {product.ingredients.map((ing, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2.5 text-sm text-[#334e68]"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0d4380]" />
                            {ing}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-[#647b96]">
                        Lista de ingredientes sob consulta.
                      </p>
                    )}

                    {product.allergens.length > 0 && (
                      <div className="p-4 rounded-2xl bg-[#f4f7fb] border border-[#e3ebf5]">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#526d8a] mb-2">
                          Alergénios
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {product.allergens.map((a) => (
                            <span
                              key={a}
                              className="px-2.5 py-1 rounded-full bg-white border border-[#d6e4f7] text-[#0d4380] text-xs font-semibold"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {tab === 'sabores' && (
                  <div>
                    {product.recheios.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {product.recheios.map((r) => (
                          <span
                            key={r}
                            className="px-3.5 py-2 rounded-xl bg-[#f4f7fb] border border-[#e3ebf5] text-sm font-medium text-[#071f3b]"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#647b96]">
                        Sabor tradicional único.
                      </p>
                    )}
                  </div>
                )}

                {tab === 'especificacoes' && (
                  <dl className="divide-y divide-[#eff4fa]">
                    {[
                      { label: 'Peso / Quantidade', value: product.weight },
                      { label: 'Porções', value: product.servings },
                      { label: 'Validade', value: product.shelf },
                      { label: 'Categoria', value: product.category },
                    ]
                      .filter((r) => Boolean(r.value))
                      .map((row) => (
                        <div
                          key={row.label}
                          className="py-3 flex items-center justify-between gap-4 text-sm"
                        >
                          <dt className="text-[#647b96] font-medium">
                            {row.label}
                          </dt>
                          <dd className="font-semibold text-[#071f3b] text-right">
                            {row.value}
                          </dd>
                        </div>
                      ))}
                  </dl>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Products Section */}
        {recommendedProducts.length > 0 && (
          <section className="mt-20 pt-14 border-t border-[#e6edf6]">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0d4380]">
                  Você Também Pode Gostar
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#071f3b] mt-1">
                  Produtos Recomendados
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((rec) => (
                <article
                  key={rec.id}
                  className="bg-white rounded-2xl border border-[#e3ebf5] overflow-hidden flex flex-col hover:shadow-lg hover:shadow-[#0d4380]/8 transition-all group"
                >
                  <button
                    type="button"
                    onClick={() => onSelectProduct(rec)}
                    className="aspect-[4/3.3] bg-[#eef3fa] overflow-hidden block w-full cursor-pointer"
                  >
                    <img
                      src={rec.images[0]}
                      alt={rec.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </button>
                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#647b96]">
                      {rec.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectProduct(rec)}
                      className="text-left mt-1 cursor-pointer"
                    >
                      <h3 className="text-base font-bold text-[#071f3b] group-hover:text-[#0d4380]">
                        {rec.name}
                      </h3>
                    </button>
                    <p className="text-xs text-[#647b96] mt-1 line-clamp-2">
                      {rec.description}
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#f0f4fa]">
                      <span className="text-base font-extrabold text-[#071f3b]">
                        {formatPrice(rec.price)}
                      </span>
                      <button
                        type="button"
                        onClick={() => addToCart(rec)}
                        className="px-3 py-1.5 rounded-lg bg-[#0d4380] hover:bg-[#092d58] text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Adicionar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
