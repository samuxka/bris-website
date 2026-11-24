import { useEffect, useMemo, useState } from 'react';
import { Search, ShoppingBag, Star, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../lib/supabase';
import type { Product } from '../types';

interface CatalogPageProps {
  initialSearch?: string;
  onSelectProduct: (product: Product) => void;
  onClearInitialSearch?: () => void;
}

export function CatalogPage({
  initialSearch = '',
  onSelectProduct,
  onClearInitialSearch,
}: CatalogPageProps) {
  const { products, addToCart } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [query, setQuery] = useState(initialSearch);

  useEffect(() => {
    setQuery(initialSearch);
  }, [initialSearch]);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'Todos' || p.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.recheios.some((r) => r.toLowerCase().includes(q)) ||
        p.ingredients.some((i) => i.toLowerCase().includes(q))
      );
    });
  }, [products, selectedCategory, query]);

  const groupedByCategory = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of filteredProducts) {
      const list = map.get(p.category) || [];
      list.push(p);
      map.set(p.category, list);
    }
    return Array.from(map.entries());
  }, [filteredProducts]);

  return (
    <main className="bg-white min-h-[75vh]">
      {/* Page Header Banner */}
      <section className="bg-[#f4f7fb] border-b border-[#e3ebf5] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#e3eefb] text-[#0d4380] text-xs font-bold uppercase tracking-wider mb-3">
                Cardápio Completo
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#071f3b] tracking-tight">
                Nossos Produtos Artesanais
              </h1>
              <p className="text-sm text-[#526d8a] mt-2 max-w-xl">
                Explore todas as nossas categorias preparadas com ingredientes
                selecionados e muito carinho. Clique em qualquer produto para
                ver sabores, fotos e detalhes.
              </p>
            </div>

            {/* Catalog Search Input */}
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-[#526d8a] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar por nome ou sabor..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-[#d6e4f7] text-sm text-[#0b223d] placeholder:text-[#8aa1bc] focus:outline-none focus:border-[#0d4380]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    onClearInitialSearch?.();
                  }}
                  aria-label="Limpar busca"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8aa1bc] hover:text-[#0d4380] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-8">
            <button
              type="button"
              onClick={() => setSelectedCategory('Todos')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === 'Todos'
                  ? 'bg-[#0d4380] text-white shadow-sm'
                  : 'bg-white text-[#334e68] border border-[#dce6f2] hover:border-[#0d4380] hover:text-[#0d4380]'
              }`}
            >
              Todos ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) => p.category === cat).length;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0d4380] text-white shadow-sm'
                      : 'bg-white text-[#334e68] border border-[#dce6f2] hover:border-[#0d4380] hover:text-[#0d4380]'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categorized Product Sections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
        {groupedByCategory.length === 0 ? (
          <div className="text-center py-20 bg-[#f8fafd] rounded-3xl border border-[#e6edf6]">
            <p className="text-lg font-bold text-[#071f3b]">
              Nenhum produto encontrado
            </p>
            <p className="text-sm text-[#647b96] mt-1">
              Tente outro termo de busca ou selecione outra categoria.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedCategory('Todos');
                onClearInitialSearch?.();
              }}
              className="mt-5 px-5 py-2.5 rounded-xl bg-[#0d4380] text-white text-xs font-semibold hover:bg-[#092d58] cursor-pointer"
            >
              Mostrar todos os produtos
            </button>
          </div>
        ) : (
          groupedByCategory.map(([category, items]) => (
            <div key={category} className="space-y-6">
              <div className="flex items-baseline justify-between border-b border-[#e6edf6] pb-3">
                <h2 className="text-2xl font-extrabold text-[#071f3b] tracking-tight">
                  {category}
                </h2>
                <span className="text-xs font-semibold text-[#647b96]">
                  {items.length} {items.length === 1 ? 'produto' : 'produtos'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((product) => (
                  <article
                    key={product.id}
                    className="bg-white rounded-2xl border border-[#e3ebf5] overflow-hidden flex flex-col hover:shadow-lg hover:shadow-[#0d4380]/8 transition-all duration-300 group"
                  >
                    <button
                      type="button"
                      onClick={() => onSelectProduct(product)}
                      className="relative aspect-[4/3.4] bg-[#eef3fa] overflow-hidden cursor-pointer block w-full"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.originalPrice &&
                        product.originalPrice > product.price && (
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#0d4380] text-white text-[10px] font-bold uppercase">
                            Oferta
                          </span>
                        )}
                    </button>

                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#647b96]">
                          {product.category}
                        </span>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span className="text-xs font-bold text-[#0b223d] ml-0.5">
                            {product.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>

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

                      {product.recheios.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {product.recheios.slice(0, 3).map((r) => (
                            <span
                              key={r}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#f0f5fc] text-[#0d4380]"
                            >
                              {r}
                            </span>
                          ))}
                          {product.recheios.length > 3 && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#f0f5fc] text-[#647b96]">
                              +{product.recheios.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-baseline gap-2 mt-4 mb-4">
                        <span className="text-lg font-extrabold text-[#071f3b]">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice &&
                          product.originalPrice > product.price && (
                            <span className="text-xs text-[#94a8c0] line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                      </div>

                      <div className="mt-auto flex gap-2">
                        <button
                          type="button"
                          onClick={() => addToCart(product)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-[#0d4380] hover:bg-[#092d58] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Adicionar
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectProduct(product)}
                          className="px-3.5 py-2.5 rounded-xl border border-[#d6e4f7] text-[#0d4380] hover:bg-[#eef4fc] text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Detalhes
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
