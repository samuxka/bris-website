import { ArrowLeft } from 'lucide-react';
import { PromoRenderer } from '../components/PromoRenderer';
import type { Product, Promotion } from '../types';

interface PromotionPageProps {
  promotion: Promotion;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
}

export function PromotionPage({
  promotion,
  onBack,
  onSelectProduct,
}: PromotionPageProps) {
  return (
    <main className="bg-white min-h-screen">
      <div className="bg-[#f4f7fb] border-b border-[#e3ebf5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0d4380] hover:text-[#092d58] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar à página inicial
          </button>
          <span className="text-xs font-bold uppercase tracking-wider text-[#526d8a]">
            {promotion.badge || 'PROMOÇÃO'}
          </span>
        </div>
      </div>

      <PromoRenderer
        blocks={promotion.blocks}
        onSelectProduct={onSelectProduct}
      />
    </main>
  );
}
