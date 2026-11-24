import { useMemo, useState } from 'react';
import {
  Flame,
  Loader2,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ImageUploader } from '../ImageUploader';
import { formatPrice, slugify } from '../../lib/supabase';
import type { Product } from '../../types';

interface ProductFormState {
  id?: number;
  name: string;
  slug: string;
  price: string;
  originalPrice: string;
  category: string;
  description: string;
  images: string[];
  weight: string;
  servings: string;
  shelf: string;
  rating: string;
  ingredientsText: string;
  recheiosText: string;
  allergensText: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  displayOrder: number;
}

function emptyForm(nextOrder: number): ProductFormState {
  return {
    name: '',
    slug: '',
    price: '',
    originalPrice: '',
    category: 'Doces',
    description: '',
    images: [],
    weight: '',
    servings: '',
    shelf: '',
    rating: '5.0',
    ingredientsText: '',
    recheiosText: '',
    allergensText: '',
    isFeatured: false,
    isBestSeller: false,
    displayOrder: nextOrder,
  };
}

function productToForm(p: Product): ProductFormState {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: String(p.price),
    originalPrice: p.originalPrice ? String(p.originalPrice) : '',
    category: p.category,
    description: p.description,
    images: [...p.images],
    weight: p.weight || '',
    servings: p.servings || '',
    shelf: p.shelf || '',
    rating: String(p.rating),
    ingredientsText: p.ingredients.join(', '),
    recheiosText: p.recheios.join(', '),
    allergensText: p.allergens.join(', '),
    isFeatured: p.isFeatured,
    isBestSeller: p.isBestSeller,
    displayOrder: p.displayOrder,
  };
}

function parseList(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function AdminProductsTab() {
  const { products, saveProduct, deleteProduct, toggleProductFlag } =
    useStore();
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<
    'all' | 'featured' | 'bestseller'
  >('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ProductFormState>(() => emptyForm(1));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const existingCategories = useMemo(
    () =>
      Array.from(
        new Set(['Pães', 'Doces', 'Biscoitos', 'Bolos', ...products.map((p) => p.category)])
      ),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (filterMode === 'featured' && !p.isFeatured) return false;
      if (filterMode === 'bestseller' && !p.isBestSeller) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [products, search, filterMode]);

  function openCreate() {
    setForm(emptyForm(products.length + 1));
    setError(null);
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setForm(productToForm(product));
    setError(null);
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const priceNum = Number(form.price.replace(',', '.'));
    const origNum = form.originalPrice
      ? Number(form.originalPrice.replace(',', '.'))
      : null;
    const ratingNum = Math.min(5, Math.max(0, Number(form.rating) || 5));

    if (!form.name.trim()) {
      setError('Informe o nome do produto.');
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setError('Informe um preço válido.');
      return;
    }
    if (form.images.length === 0) {
      setError('Envie pelo menos 1 foto do produto pelo upload.');
      return;
    }

    setSaving(true);
    try {
      await saveProduct({
        id: form.id,
        slug: slugify(form.slug || form.name),
        name: form.name.trim(),
        price: priceNum,
        originalPrice:
          origNum !== null && Number.isFinite(origNum) && origNum > 0
            ? origNum
            : null,
        category: form.category.trim() || 'Doces',
        description: form.description.trim(),
        images: form.images,
        weight: form.weight.trim() || null,
        servings: form.servings.trim() || null,
        shelf: form.shelf.trim() || null,
        rating: ratingNum,
        ingredients: parseList(form.ingredientsText),
        recheios: parseList(form.recheiosText),
        allergens: parseList(form.allergensText),
        isFeatured: form.isFeatured,
        isBestSeller: form.isBestSeller,
        displayOrder: form.displayOrder,
      });
      setModalOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao salvar o produto.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(`Deseja excluir "${product.name}"?`)) return;
    setBusyId(product.id);
    try {
      await deleteProduct(product.id);
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggle(
    product: Product,
    flag: 'isFeatured' | 'isBestSeller'
  ) {
    setBusyId(product.id);
    try {
      await toggleProductFlag(product, flag);
    } finally {
      setBusyId(null);
    }
  }

  const featuredCount = products.filter((p) => p.isFeatured).length;
  const bestSellerCount = products.filter((p) => p.isBestSeller).length;

  return (
    <div className="space-y-6">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#071f3b]">
            Gestão de Produtos
          </h2>
          <p className="text-sm text-[#647b96]">
            Crie, edite, faça upload de múltiplas fotos e escolha quais produtos
            aparecem em <strong>Featured</strong> e <strong>Best Sellers</strong>.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="px-5 py-3 rounded-xl bg-[#0d4380] hover:bg-[#092d58] text-white text-sm font-bold inline-flex items-center justify-center gap-2 shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Novo Produto
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#e3ebf5] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#647b96] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produto ou categoria..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#f8fafd] border border-[#dce6f2] text-sm focus:outline-none focus:border-[#0d4380]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: `Todos (${products.length})` },
            { id: 'featured', label: `Featured (${featuredCount})` },
            { id: 'bestseller', label: `Best Sellers (${bestSellerCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setFilterMode(tab.id as 'all' | 'featured' | 'bestseller')
              }
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                filterMode === tab.id
                  ? 'bg-[#0d4380] text-white'
                  : 'bg-[#f4f7fb] text-[#334e68] hover:bg-[#e6effa]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-[#e3ebf5] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafd] border-b border-[#e6edf6] text-[11px] font-bold uppercase tracking-wider text-[#647b96]">
                <th className="py-3.5 px-5">Produto</th>
                <th className="py-3.5 px-4">Categoria</th>
                <th className="py-3.5 px-4">Preço</th>
                <th className="py-3.5 px-4 text-center">Featured</th>
                <th className="py-3.5 px-4 text-center">Best Seller</th>
                <th className="py-3.5 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4fa] text-sm">
              {filteredProducts.map((product) => {
                const isBusy = busyId === product.id;
                return (
                  <tr
                    key={product.id}
                    className="hover:bg-[#fafcfe] transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover bg-[#eef3fa] border border-[#e3ebf5] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[#071f3b] truncate max-w-[220px]">
                            {product.name}
                          </p>
                          <p className="text-xs text-[#647b96]">
                            {product.images.length}{' '}
                            {product.images.length === 1 ? 'foto' : 'fotos'} ·{' '}
                            {product.recheios.length} sabores
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-[#eef4fc] text-[#0d4380] text-xs font-semibold">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#071f3b]">
                      {formatPrice(product.price)}
                      {product.originalPrice && (
                        <span className="block text-[11px] font-normal text-[#94a8c0] line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleToggle(product, 'isFeatured')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          product.isFeatured
                            ? 'bg-[#0d4380] text-white shadow-xs'
                            : 'bg-[#f1f5fa] text-[#7c93ad] hover:bg-[#e3ebf5]'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {product.isFeatured ? 'Sim' : 'Não'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleToggle(product, 'isBestSeller')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          product.isBestSeller
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-[#f1f5fa] text-[#7c93ad] hover:bg-[#e3ebf5]'
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5" />
                        {product.isBestSeller ? 'Sim' : 'Não'}
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          className="p-2 rounded-lg text-[#0d4380] hover:bg-[#eef4fc] transition-colors cursor-pointer"
                          title="Editar produto"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleDelete(product)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Excluir produto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-sm text-[#647b96]"
                  >
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#061e3c]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
            <div className="px-6 py-5 border-b border-[#e6edf6] flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#071f3b]">
                {form.id ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full text-[#647b96] hover:bg-[#f4f7fb] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="flex-1 overflow-y-auto p-6 space-y-5"
            >
              {/* Multi-image Cloudinary File Upload (NO URL input) */}
              <ImageUploader
                images={form.images}
                onChange={(urls) => setForm((f) => ({ ...f, images: urls }))}
                multiple
                folder="bris-pastelaria/produtos"
                label="Fotos do Produto (Upload múltiplo)"
                helperText="Envie uma ou várias fotos direto do computador. A primeira foto será a capa."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#526d8a] mb-1.5">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        name: e.target.value,
                        slug: f.id ? f.slug : slugify(e.target.value),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d6e4f7] text-sm focus:outline-none focus:border-[#0d4380]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#526d8a] mb-1.5">
                    Categoria *
                  </label>
                  <input
                    type="text"
                    list="bris-categories"
                    required
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d6e4f7] text-sm focus:outline-none focus:border-[#0d4380]"
                  />
                  <datalist id="bris-categories">
                    {existingCategories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#526d8a] mb-1.5">
                    Preço (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d6e4f7] text-sm focus:outline-none focus:border-[#0d4380]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#526d8a] mb-1.5">
                    Preço Anterior (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Opcional"
                    value={form.originalPrice}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, originalPrice: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d6e4f7] text-sm focus:outline-none focus:border-[#0d4380]"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#526d8a] mb-1.5">
                    Peso / Tam.
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 700g"
                    value={form.weight}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, weight: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d6e4f7] text-sm focus:outline-none focus:border-[#0d4380]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#526d8a] mb-1.5">
                  Descrição
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d6e4f7] text-sm focus:outline-none focus:border-[#0d4380]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#526d8a] mb-1.5">
                  Sabores / Recheios (separados por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Coco, Goiabada, Nutella, Tradicional"
                  value={form.recheiosText}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, recheiosText: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d6e4f7] text-sm focus:outline-none focus:border-[#0d4380]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#526d8a] mb-1.5">
                    Ingredientes (separados por vírgula)
                  </label>
                  <input
                    type="text"
                    placeholder="Farinha, Ovos, Manteiga..."
                    value={form.ingredientsText}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        ingredientsText: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d6e4f7] text-sm focus:outline-none focus:border-[#0d4380]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#526d8a] mb-1.5">
                    Alergénios (separados por vírgula)
                  </label>
                  <input
                    type="text"
                    placeholder="Glúten, Lactose, Ovos"
                    value={form.allergensText}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, allergensText: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d6e4f7] text-sm focus:outline-none focus:border-[#0d4380]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#526d8a] mb-1.5">
                    Porções
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 6 a 8 porções"
                    value={form.servings}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, servings: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d6e4f7] text-sm focus:outline-none focus:border-[#0d4380]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#526d8a] mb-1.5">
                    Validade / Conservação
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 5 dias no frigorífico"
                    value={form.shelf}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, shelf: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d6e4f7] text-sm focus:outline-none focus:border-[#0d4380]"
                  />
                </div>
              </div>

              {/* Featured & Best Seller Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-[#dce6f2] bg-[#f8fafd] cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#0d4380]" />
                    <div>
                      <p className="text-xs font-bold text-[#071f3b]">
                        Featured Collection
                      </p>
                      <p className="text-[11px] text-[#647b96]">
                        Destaque na página inicial
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isFeatured: e.target.checked }))
                    }
                    className="w-4 h-4 accent-[#0d4380]"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-[#dce6f2] bg-[#f8fafd] cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="text-xs font-bold text-[#071f3b]">
                        Best Seller
                      </p>
                      <p className="text-[11px] text-[#647b96]">
                        Exibir nos mais vendidos
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isBestSeller}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isBestSeller: e.target.checked }))
                    }
                    className="w-4 h-4 accent-[#0d4380]"
                  />
                </label>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#eff4fa]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#dce6f2] text-sm font-semibold text-[#526d8a] hover:bg-[#f4f7fb] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#0d4380] hover:bg-[#092d58] disabled:opacity-50 text-white text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {form.id ? 'Salvar Alterações' : 'Criar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
