import { useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  GripVertical,
  Image as ImageIcon,
  LayoutTemplate,
  Loader2,
  Megaphone,
  Pencil,
  Plus,
  Rocket,
  Save,
  ShoppingBag,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { WHATSAPP_NUMBER } from '../../data';
import { ImageUploader } from '../ImageUploader';
import { PromoRenderer } from '../PromoRenderer';
import { slugify } from '../../lib/supabase';
import type { PromoBlock, PromoBlockType, Promotion } from '../../types';

function createDefaultBlock(type: PromoBlockType): PromoBlock {
  const id = `blk-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  switch (type) {
    case 'hero':
      return {
        id,
        type: 'hero',
        badge: 'PROMOÇÃO EXCLUSIVA',
        title: 'Título Principal da Promoção',
        subtitle:
          'Descreva os destaques, descontos ou combos especiais desta campanha.',
        imageUrl: '',
        ctaText: 'Ver Ofertas',
        ctaLink: '#promo-products',
      };
    case 'products':
      return {
        id,
        type: 'products',
        title: 'Produtos em Destaque',
        subtitle: 'Selecione os produtos participantes desta promoção.',
        productSlugs: [],
      };
    case 'gallery':
      return {
        id,
        type: 'gallery',
        title: 'Galeria da Campanha',
        layout: 'grid-3',
        images: [],
      };
    case 'text':
      return {
        id,
        type: 'text',
        badge: 'DETALHES',
        title: 'Por que você vai amar esta edição',
        body: 'Conte a história, os diferenciais artesanais e como aproveitar esta promoção especial.',
        imageUrl: '',
        align: 'right',
      };
    case 'cta':
      return {
        id,
        type: 'cta',
        badge: 'TEMPO LIMITADO',
        title: 'Garanta sua encomenda agora mesmo!',
        subtitle: 'Fale com a equipe Bris pelo WhatsApp e reserve já.',
        highlight: 'Entregas em Torres Vedras',
        ctaText: 'Encomendar pelo WhatsApp',
        ctaLink: `https://wa.me/${WHATSAPP_NUMBER}`,
      };
  }
}

const PALETTE_ITEMS: {
  type: PromoBlockType;
  label: string;
  desc: string;
  icon: typeof Sparkles;
}[] = [
  {
    type: 'hero',
    label: 'Hero Banner',
    desc: 'Topo com título, foto e botão',
    icon: LayoutTemplate,
  },
  {
    type: 'products',
    label: 'Vitrine de Produtos',
    desc: 'Grade clicável do catálogo',
    icon: ShoppingBag,
  },
  {
    type: 'gallery',
    label: 'Galeria de Fotos',
    desc: 'Upload de múltiplas fotos',
    icon: ImageIcon,
  },
  {
    type: 'text',
    label: 'Texto & Foto',
    desc: 'História, regras ou detalhes',
    icon: FileText,
  },
  {
    type: 'cta',
    label: 'Banner CTA',
    desc: 'Chamada final para ação',
    icon: Megaphone,
  },
];

interface AdminPromotionsTabProps {
  onOpenLivePromo: (promo: Promotion) => void;
}

export function AdminPromotionsTab({
  onOpenLivePromo,
}: AdminPromotionsTabProps) {
  const { products, promotions, savePromotion, deletePromotion } = useStore();
  const [editing, setEditing] = useState<
    (Omit<Promotion, 'id'> & { id?: number }) | null
  >(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Drag-and-drop state
  const [draggedBlockIdx, setDraggedBlockIdx] = useState<number | null>(null);
  const [draggedPaletteType, setDraggedPaletteType] =
    useState<PromoBlockType | null>(null);
  const [dropTargetIdx, setDropTargetIdx] = useState<number | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  }

  function startNewPromotion() {
    const hero = createDefaultBlock('hero');
    const prods = createDefaultBlock('products');
    setEditing({
      title: 'Nova Promoção Bris',
      slug: `promocao-${Date.now().toString().slice(-4)}`,
      subtitle: 'Oferta especial preparada com carinho na Bris Pastelaria.',
      badge: 'OFERTA ESPECIAL',
      thumbnailUrl: '',
      blocks: [hero, prods],
      isPublished: false,
      displayOrder: promotions.length + 1,
    });
    setSelectedBlockId(hero.id);
    setMode('edit');
  }

  function startEditPromotion(promo: Promotion) {
    setEditing({
      ...promo,
      blocks: promo.blocks.map((b) => ({ ...b })),
    });
    setSelectedBlockId(promo.blocks[0]?.id || null);
    setMode('edit');
  }

  function addBlock(type: PromoBlockType, insertAt?: number) {
    if (!editing) return;
    const newBlock = createDefaultBlock(type);
    const nextBlocks = [...editing.blocks];
    if (typeof insertAt === 'number') {
      nextBlocks.splice(insertAt, 0, newBlock);
    } else {
      nextBlocks.push(newBlock);
    }
    setEditing({ ...editing, blocks: nextBlocks });
    setSelectedBlockId(newBlock.id);
  }

  function updateBlock(blockId: string, updater: (b: PromoBlock) => PromoBlock) {
    if (!editing) return;
    setEditing({
      ...editing,
      blocks: editing.blocks.map((b) => (b.id === blockId ? updater(b) : b)),
    });
  }

  function removeBlock(blockId: string) {
    if (!editing) return;
    const next = editing.blocks.filter((b) => b.id !== blockId);
    setEditing({ ...editing, blocks: next });
    if (selectedBlockId === blockId) {
      setSelectedBlockId(next[0]?.id || null);
    }
  }

  function duplicateBlock(idx: number) {
    if (!editing) return;
    const original = editing.blocks[idx];
    const clone = {
      ...original,
      id: `blk-${original.type}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    };
    const next = [...editing.blocks];
    next.splice(idx + 1, 0, clone);
    setEditing({ ...editing, blocks: next });
    setSelectedBlockId(clone.id);
  }

  function moveBlock(from: number, to: number) {
    if (!editing || to < 0 || to >= editing.blocks.length || from === to) return;
    const next = [...editing.blocks];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setEditing({ ...editing, blocks: next });
  }

  function handleCanvasDrop(targetIdx: number) {
    if (draggedPaletteType) {
      addBlock(draggedPaletteType, targetIdx);
    } else if (draggedBlockIdx !== null) {
      const adjusted =
        draggedBlockIdx < targetIdx ? targetIdx - 1 : targetIdx;
      moveBlock(draggedBlockIdx, adjusted);
    }
    setDraggedBlockIdx(null);
    setDraggedPaletteType(null);
    setDropTargetIdx(null);
  }

  async function handleSaveOrPublish(publish: boolean) {
    if (!editing) return;
    if (!editing.title.trim()) {
      showToast('Informe o título da promoção antes de salvar.');
      return;
    }
    setSaving(true);
    try {
      const saved = await savePromotion({
        ...editing,
        slug: slugify(editing.slug || editing.title),
        isPublished: publish,
      });
      setEditing(saved);
      showToast(
        publish
          ? 'Promoção publicada! A thumbnail já está visível na página inicial.'
          : 'Rascunho salvo com sucesso.'
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Erro ao salvar promoção.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePromo(promo: Promotion) {
    if (!window.confirm(`Deseja excluir a promoção "${promo.title}"?`)) return;
    await deletePromotion(promo.id);
  }

  // =========================================================================
  // VIEW 1: PROMOTIONS LIST
  // =========================================================================
  if (!editing) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-[#071f3b]">
              Promoções & Page Builder
            </h2>
            <p className="text-sm text-[#647b96]">
              Monte páginas promocionais completas arrastando e soltando blocos
              e publique a thumbnail direto na landing page.
            </p>
          </div>
          <button
            type="button"
            onClick={startNewPromotion}
            className="px-5 py-3 rounded-xl bg-[#0d4380] hover:bg-[#092d58] text-white text-sm font-bold inline-flex items-center justify-center gap-2 shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nova Promoção
          </button>
        </div>

        {promotions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-[#cbd9ec] p-14 text-center">
            <Sparkles className="w-10 h-10 text-[#0d4380] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#071f3b]">
              Nenhuma promoção criada ainda
            </h3>
            <p className="text-sm text-[#647b96] mt-1 max-w-md mx-auto">
              Use o Page Builder arrasta-e-solta para criar uma página de
              campanha com hero, produtos selecionados e galeria de fotos.
            </p>
            <button
              type="button"
              onClick={startNewPromotion}
              className="mt-5 px-5 py-2.5 rounded-xl bg-[#0d4380] text-white text-sm font-bold hover:bg-[#092d58] cursor-pointer"
            >
              Criar Primeira Promoção
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="bg-white rounded-2xl border border-[#e3ebf5] overflow-hidden flex flex-col shadow-xs hover:shadow-md transition-all"
              >
                <div className="relative aspect-[16/9] bg-[#eef3fa] overflow-hidden">
                  {promo.thumbnailUrl ? (
                    <img
                      src={promo.thumbnailUrl}
                      alt={promo.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#8aa1bc]">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  <span
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      promo.isPublished
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#071f3b]/75 text-white'
                    }`}
                  >
                    {promo.isPublished ? 'Publicada' : 'Rascunho'}
                  </span>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0d4380]">
                    {promo.badge}
                  </span>
                  <h3 className="text-lg font-extrabold text-[#071f3b] mt-1">
                    {promo.title}
                  </h3>
                  <p className="text-xs text-[#647b96] mt-1 line-clamp-2 flex-1">
                    {promo.subtitle}
                  </p>
                  <p className="text-[11px] text-[#8aa1bc] mt-3">
                    {promo.blocks.length}{' '}
                    {promo.blocks.length === 1 ? 'bloco' : 'blocos'} · /sale/
                    {promo.slug}
                  </p>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#eff4fa]">
                    <button
                      type="button"
                      onClick={() => startEditPromotion(promo)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#0d4380] hover:bg-[#092d58] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Editar Builder
                    </button>
                    {promo.isPublished && (
                      <button
                        type="button"
                        onClick={() => onOpenLivePromo(promo)}
                        title="Ver página publicada"
                        className="p-2 rounded-xl border border-[#dce6f2] text-[#0d4380] hover:bg-[#eef4fc] cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeletePromo(promo)}
                      title="Excluir promoção"
                      className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: DRAG-AND-DROP PAGE BUILDER
  // =========================================================================
  const selectedBlock =
    editing.blocks.find((b) => b.id === selectedBlockId) || null;

  return (
    <div className="space-y-5">
      {/* Builder Top Action Bar */}
      <div className="bg-white rounded-2xl border border-[#e3ebf5] p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#dce6f2] text-xs font-bold text-[#0d4380] hover:bg-[#eef4fc] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-[#071f3b]">
                {editing.title || 'Sem título'}
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  editing.isPublished
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {editing.isPublished ? 'Publicada' : 'Rascunho'}
              </span>
            </div>
            <p className="text-[11px] text-[#647b96]">/sale/{editing.slug}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-[#f4f7fb] p-1 border border-[#dce6f2]">
            <button
              type="button"
              onClick={() => setMode('edit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                mode === 'edit'
                  ? 'bg-white text-[#0d4380] shadow-xs'
                  : 'text-[#647b96]'
              }`}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => setMode('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer ${
                mode === 'preview'
                  ? 'bg-white text-[#0d4380] shadow-xs'
                  : 'text-[#647b96]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Pré-visualizar
            </button>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSaveOrPublish(false)}
            className="px-4 py-2 rounded-xl border border-[#0d4380]/30 text-[#0d4380] hover:bg-[#eef4fc] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Salvar Rascunho
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSaveOrPublish(true)}
            className="px-5 py-2 rounded-xl bg-[#0d4380] hover:bg-[#092d58] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Rocket className="w-3.5 h-3.5" />
            )}
            Publicar Promoção
          </button>
        </div>
      </div>

      {toast && (
        <div className="px-4 py-3 rounded-xl bg-[#0d4380] text-white text-xs font-bold flex items-center gap-2 shadow-md">
          <Check className="w-4 h-4" />
          {toast}
        </div>
      )}

      {mode === 'preview' ? (
        <div className="rounded-3xl overflow-hidden border border-[#dce6f2] shadow-lg bg-white">
          <PromoRenderer blocks={editing.blocks} previewMode />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* LEFT SIDEBAR: Campaign Card Settings + Draggable Block Palette */}
          <div className="xl:col-span-4 space-y-5">
            {/* Landing Page Card / Metadata Settings */}
            <div className="bg-white rounded-2xl border border-[#e3ebf5] p-5 space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0d4380]">
                Card da Promoção (Landing Page)
              </h3>
              <div>
                <label className="block text-[11px] font-bold text-[#526d8a] mb-1">
                  Título da Promoção
                </label>
                <input
                  type="text"
                  value={editing.title}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      title: e.target.value,
                      slug: editing.id ? editing.slug : slugify(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#d6e4f7] text-sm focus:outline-none focus:border-[#0d4380]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#526d8a] mb-1">
                    Selo / Badge
                  </label>
                  <input
                    type="text"
                    value={editing.badge}
                    onChange={(e) =>
                      setEditing({ ...editing, badge: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#d6e4f7] text-xs focus:outline-none focus:border-[#0d4380]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#526d8a] mb-1">
                    Slug da URL
                  </label>
                  <input
                    type="text"
                    value={editing.slug}
                    onChange={(e) =>
                      setEditing({ ...editing, slug: slugify(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#d6e4f7] text-xs focus:outline-none focus:border-[#0d4380]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#526d8a] mb-1">
                  Resumo no Card
                </label>
                <textarea
                  rows={2}
                  value={editing.subtitle}
                  onChange={(e) =>
                    setEditing({ ...editing, subtitle: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#d6e4f7] text-xs focus:outline-none focus:border-[#0d4380]"
                />
              </div>
              <ImageUploader
                images={editing.thumbnailUrl ? [editing.thumbnailUrl] : []}
                onChange={(urls) =>
                  setEditing({ ...editing, thumbnailUrl: urls[0] || '' })
                }
                multiple={false}
                folder="bris-pastelaria/promocoes"
                label="Thumbnail da Promoção (Upload)"
                helperText="Imagem que aparece no card entre Featured e Best Sellers."
              />
            </div>

            {/* Draggable Block Palette */}
            <div className="bg-white rounded-2xl border border-[#e3ebf5] p-5 space-y-3">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0d4380]">
                  Blocos Arrasta e Solta
                </h3>
                <p className="text-[11px] text-[#647b96] mt-0.5">
                  Arraste um bloco para a área da página ou clique para adicionar.
                </p>
              </div>
              <div className="space-y-2">
                {PALETTE_ITEMS.map(({ type, label, desc, icon: Icon }) => (
                  <div
                    key={type}
                    draggable
                    onDragStart={() => {
                      setDraggedPaletteType(type);
                      setDraggedBlockIdx(null);
                    }}
                    onDragEnd={() => {
                      setDraggedPaletteType(null);
                      setDropTargetIdx(null);
                    }}
                    onClick={() => addBlock(type)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[#dce6f2] bg-[#f8fafd] hover:border-[#0d4380] hover:bg-[#eef4fc] transition-all cursor-grab active:cursor-grabbing"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white border border-[#dce6f2] text-[#0d4380] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#071f3b]">{label}</p>
                      <p className="text-[11px] text-[#647b96] truncate">
                        {desc}
                      </p>
                    </div>
                    <Plus className="w-4 h-4 text-[#0d4380] shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT AREA: Draggable Canvas + Selected Block Inspector */}
          <div className="xl:col-span-8 space-y-5">
            {/* Drag-and-Drop Canvas */}
            <div className="bg-white rounded-2xl border border-[#e3ebf5] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0d4380]">
                  Estrutura da Página ({editing.blocks.length} blocos)
                </h3>
                <span className="text-[11px] text-[#647b96]">
                  Arraste pela alça para reordenar
                </span>
              </div>

              {editing.blocks.length === 0 ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDropTargetIdx(0);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleCanvasDrop(0);
                  }}
                  className={`py-14 rounded-2xl border-2 border-dashed text-center text-sm transition-colors ${
                    dropTargetIdx === 0
                      ? 'border-[#0d4380] bg-[#eef4fc] text-[#0d4380]'
                      : 'border-[#cbd9ec] text-[#647b96]'
                  }`}
                >
                  Solte um bloco aqui para começar a construir a página.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {editing.blocks.map((block, idx) => {
                    const isSelected = block.id === selectedBlockId;
                    const paletteInfo = PALETTE_ITEMS.find(
                      (p) => p.type === block.type
                    );
                    const Icon = paletteInfo?.icon || Sparkles;
                    const titlePreview =
                      'title' in block && block.title
                        ? block.title
                        : paletteInfo?.label || block.type;

                    return (
                      <div key={block.id}>
                        {/* Drop indicator above block */}
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDropTargetIdx(idx);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleCanvasDrop(idx);
                          }}
                          className={`h-2 rounded-full transition-all mb-1 ${
                            dropTargetIdx === idx
                              ? 'bg-[#0d4380] h-3 my-1'
                              : 'bg-transparent'
                          }`}
                        />

                        <div
                          draggable
                          onDragStart={() => {
                            setDraggedBlockIdx(idx);
                            setDraggedPaletteType(null);
                          }}
                          onDragEnd={() => {
                            setDraggedBlockIdx(null);
                            setDropTargetIdx(null);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDropTargetIdx(idx);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleCanvasDrop(idx);
                          }}
                          onClick={() => setSelectedBlockId(block.id)}
                          className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#0d4380] bg-[#f4f8ff] shadow-sm'
                              : 'border-[#e6edf6] bg-white hover:border-[#b7cde8]'
                          }`}
                        >
                          <div className="text-[#8aa1bc] cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <div className="w-9 h-9 rounded-xl bg-[#eef4fc] text-[#0d4380] flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#0d4380]">
                              {paletteInfo?.label}
                            </p>
                            <p className="text-sm font-bold text-[#071f3b] truncate">
                              {titlePreview}
                            </p>
                          </div>

                          <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveBlock(idx, idx - 1)}
                              className="p-1.5 rounded-lg text-[#526d8a] hover:bg-[#e6effa] disabled:opacity-30 cursor-pointer"
                              title="Subir"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === editing.blocks.length - 1}
                              onClick={() => moveBlock(idx, idx + 1)}
                              className="p-1.5 rounded-lg text-[#526d8a] hover:bg-[#e6effa] disabled:opacity-30 cursor-pointer"
                              title="Descer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => duplicateBlock(idx)}
                              className="p-1.5 rounded-lg text-[#526d8a] hover:bg-[#e6effa] cursor-pointer"
                              title="Duplicar"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeBlock(block.id)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Remover bloco"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* End dropzone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDropTargetIdx(editing.blocks.length);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleCanvasDrop(editing.blocks.length);
                    }}
                    className={`py-3 rounded-xl border-2 border-dashed text-center text-xs font-semibold transition-all ${
                      dropTargetIdx === editing.blocks.length
                        ? 'border-[#0d4380] bg-[#eef4fc] text-[#0d4380]'
                        : 'border-transparent text-[#94a8c0]'
                    }`}
                  >
                    Solte aqui para adicionar ao final da página
                  </div>
                </div>
              )}
            </div>

            {/* Selected Block Inspector */}
            {selectedBlock && (
              <div className="bg-white rounded-2xl border border-[#e3ebf5] p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-[#eff4fa] pb-3">
                  <h3 className="text-sm font-extrabold text-[#071f3b]">
                    Editar Bloco:{' '}
                    <span className="text-[#0d4380]">
                      {
                        PALETTE_ITEMS.find((p) => p.type === selectedBlock.type)
                          ?.label
                      }
                    </span>
                  </h3>
                </div>

                {selectedBlock.type === 'hero' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#526d8a] mb-1">
                          Selo Superior
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.badge}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, (b) =>
                              b.type === 'hero'
                                ? { ...b, badge: e.target.value }
                                : b
                            )
                          }
                          className="w-full px-3.5 py-2 rounded-xl border border-[#d6e4f7] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#526d8a] mb-1">
                          Texto do Botão
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.ctaText}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, (b) =>
                              b.type === 'hero'
                                ? { ...b, ctaText: e.target.value }
                                : b
                            )
                          }
                          className="w-full px-3.5 py-2 rounded-xl border border-[#d6e4f7] text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#526d8a] mb-1">
                        Título Principal
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.title}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, (b) =>
                            b.type === 'hero'
                              ? { ...b, title: e.target.value }
                              : b
                          )
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-[#d6e4f7] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#526d8a] mb-1">
                        Subtítulo
                      </label>
                      <textarea
                        rows={3}
                        value={selectedBlock.subtitle}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, (b) =>
                            b.type === 'hero'
                              ? { ...b, subtitle: e.target.value }
                              : b
                          )
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-[#d6e4f7] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#526d8a] mb-1">
                        Destino do Botão (ex: #promo-products ou link WhatsApp)
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.ctaLink}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, (b) =>
                            b.type === 'hero'
                              ? { ...b, ctaLink: e.target.value }
                              : b
                          )
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-[#d6e4f7] text-sm"
                      />
                    </div>
                    <ImageUploader
                      images={
                        selectedBlock.imageUrl ? [selectedBlock.imageUrl] : []
                      }
                      onChange={(urls) =>
                        updateBlock(selectedBlock.id, (b) =>
                          b.type === 'hero'
                            ? { ...b, imageUrl: urls[0] || '' }
                            : b
                        )
                      }
                      multiple={false}
                      folder="bris-pastelaria/promocoes"
                      label="Foto Principal do Hero (Upload)"
                    />
                  </div>
                )}

                {selectedBlock.type === 'products' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#526d8a] mb-1">
                        Título da Seção
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.title}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, (b) =>
                            b.type === 'products'
                              ? { ...b, title: e.target.value }
                              : b
                          )
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-[#d6e4f7] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#526d8a] mb-1">
                        Subtítulo
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.subtitle}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, (b) =>
                            b.type === 'products'
                              ? { ...b, subtitle: e.target.value }
                              : b
                          )
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-[#d6e4f7] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#526d8a] mb-2">
                        Selecione os Produtos da Vitrine (
                        {selectedBlock.productSlugs.length} selecionados)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto p-1">
                        {products.map((prod) => {
                          const checked = selectedBlock.productSlugs.includes(
                            prod.slug
                          );
                          return (
                            <button
                              key={prod.id}
                              type="button"
                              onClick={() =>
                                updateBlock(selectedBlock.id, (b) => {
                                  if (b.type !== 'products') return b;
                                  const nextSlugs = checked
                                    ? b.productSlugs.filter(
                                        (s) => s !== prod.slug
                                      )
                                    : [...b.productSlugs, prod.slug];
                                  return { ...b, productSlugs: nextSlugs };
                                })
                              }
                              className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                checked
                                  ? 'border-[#0d4380] bg-[#eef4fc]'
                                  : 'border-[#dce6f2] bg-white hover:bg-[#f8fafd]'
                              }`}
                            >
                              <img
                                src={prod.images[0]}
                                alt={prod.name}
                                className="w-10 h-10 rounded-lg object-cover shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-[#071f3b] truncate">
                                  {prod.name}
                                </p>
                                <p className="text-[11px] text-[#647b96]">
                                  {prod.category}
                                </p>
                              </div>
                              <div
                                className={`w-5 h-5 rounded-md flex items-center justify-center ${
                                  checked
                                    ? 'bg-[#0d4380] text-white'
                                    : 'border border-[#cbd9ec]'
                                }`}
                              >
                                {checked && <Check className="w-3.5 h-3.5" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {selectedBlock.type === 'gallery' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#526d8a] mb-1">
                          Título da Galeria
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.title}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, (b) =>
                              b.type === 'gallery'
                                ? { ...b, title: e.target.value }
                                : b
                            )
                          }
                          className="w-full px-3.5 py-2 rounded-xl border border-[#d6e4f7] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#526d8a] mb-1">
                          Layout da Grade
                        </label>
                        <select
                          value={selectedBlock.layout}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, (b) =>
                              b.type === 'gallery'
                                ? {
                                    ...b,
                                    layout: e.target.value as
                                      | 'grid-2'
                                      | 'grid-3'
                                      | 'mosaic',
                                  }
                                : b
                            )
                          }
                          className="w-full px-3.5 py-2 rounded-xl border border-[#d6e4f7] text-sm bg-white"
                        >
                          <option value="grid-2">2 Colunas</option>
                          <option value="grid-3">3 Colunas</option>
                          <option value="mosaic">Mosaico Destaque</option>
                        </select>
                      </div>
                    </div>

                    <ImageUploader
                      images={selectedBlock.images}
                      onChange={(urls) =>
                        updateBlock(selectedBlock.id, (b) =>
                          b.type === 'gallery' ? { ...b, images: urls } : b
                        )
                      }
                      multiple
                      folder="bris-pastelaria/promocoes"
                      label="Fotos da Galeria (Upload múltiplo)"
                    />
                  </div>
                )}

                {selectedBlock.type === 'text' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#526d8a] mb-1">
                          Selo / Etiqueta
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.badge}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, (b) =>
                              b.type === 'text'
                                ? { ...b, badge: e.target.value }
                                : b
                            )
                          }
                          className="w-full px-3.5 py-2 rounded-xl border border-[#d6e4f7] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#526d8a] mb-1">
                          Posição da Foto
                        </label>
                        <select
                          value={selectedBlock.align}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, (b) =>
                              b.type === 'text'
                                ? {
                                    ...b,
                                    align: e.target.value as 'left' | 'right',
                                  }
                                : b
                            )
                          }
                          className="w-full px-3.5 py-2 rounded-xl border border-[#d6e4f7] text-sm bg-white"
                        >
                          <option value="right">Foto à Direita</option>
                          <option value="left">Foto à Esquerda</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#526d8a] mb-1">
                        Título
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.title}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, (b) =>
                            b.type === 'text'
                              ? { ...b, title: e.target.value }
                              : b
                          )
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-[#d6e4f7] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#526d8a] mb-1">
                        Texto
                      </label>
                      <textarea
                        rows={4}
                        value={selectedBlock.body}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, (b) =>
                            b.type === 'text'
                              ? { ...b, body: e.target.value }
                              : b
                          )
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-[#d6e4f7] text-sm"
                      />
                    </div>
                    <ImageUploader
                      images={
                        selectedBlock.imageUrl ? [selectedBlock.imageUrl] : []
                      }
                      onChange={(urls) =>
                        updateBlock(selectedBlock.id, (b) =>
                          b.type === 'text'
                            ? { ...b, imageUrl: urls[0] || '' }
                            : b
                        )
                      }
                      multiple={false}
                      folder="bris-pastelaria/promocoes"
                      label="Foto Lateral Opcional (Upload)"
                    />
                  </div>
                )}

                {selectedBlock.type === 'cta' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#526d8a] mb-1">
                          Selo
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.badge}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, (b) =>
                              b.type === 'cta'
                                ? { ...b, badge: e.target.value }
                                : b
                            )
                          }
                          className="w-full px-3.5 py-2 rounded-xl border border-[#d6e4f7] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#526d8a] mb-1">
                          Destaque / Cupom
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.highlight}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, (b) =>
                              b.type === 'cta'
                                ? { ...b, highlight: e.target.value }
                                : b
                            )
                          }
                          className="w-full px-3.5 py-2 rounded-xl border border-[#d6e4f7] text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#526d8a] mb-1">
                        Título
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.title}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, (b) =>
                            b.type === 'cta'
                              ? { ...b, title: e.target.value }
                              : b
                          )
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-[#d6e4f7] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#526d8a] mb-1">
                        Subtítulo
                      </label>
                      <textarea
                        rows={2}
                        value={selectedBlock.subtitle}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, (b) =>
                            b.type === 'cta'
                              ? { ...b, subtitle: e.target.value }
                              : b
                          )
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-[#d6e4f7] text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#526d8a] mb-1">
                          Texto do Botão
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.ctaText}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, (b) =>
                              b.type === 'cta'
                                ? { ...b, ctaText: e.target.value }
                                : b
                            )
                          }
                          className="w-full px-3.5 py-2 rounded-xl border border-[#d6e4f7] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#526d8a] mb-1">
                          Link do Botão
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.ctaLink}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, (b) =>
                              b.type === 'cta'
                                ? { ...b, ctaLink: e.target.value }
                                : b
                            )
                          }
                          className="w-full px-3.5 py-2 rounded-xl border border-[#d6e4f7] text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
