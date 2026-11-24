import { useState } from 'react';
import {
  Database,
  ExternalLink,
  LogOut,
  Package,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { imgBrisLogotipoWhite } from '../data';
import { AdminProductsTab } from '../components/admin/AdminProductsTab';
import { AdminPromotionsTab } from '../components/admin/AdminPromotionsTab';
import type { Promotion } from '../types';

interface AdminDashboardPageProps {
  onNavigate: (path: string) => void;
  onOpenLivePromo: (promo: Promotion) => void;
}

export function AdminDashboardPage({
  onNavigate,
  onOpenLivePromo,
}: AdminDashboardPageProps) {
  const { dbStatus, logoutAdmin } = useStore();
  const [activeTab, setActiveTab] = useState<'products' | 'promotions'>(
    'products'
  );

  async function handleLogout() {
    await logoutAdmin();
    onNavigate('/admin/login');
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-[#092d58] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={imgBrisLogotipoWhite}
              alt="Bris Admin"
              className="h-8 w-auto"
            />
            <span className="hidden sm:inline-block h-5 w-px bg-white/20" />
            <span className="hidden sm:inline-block text-xs font-bold uppercase tracking-widest text-white/80">
              Painel Admin
            </span>
          </div>

          {/* Tabs */}
          <nav className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-white text-[#092d58]'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              Produtos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('promotions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'promotions'
                  ? 'bg-white text-[#092d58]'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Promoções
            </button>
          </nav>

          {/* Status + Store + Logout */}
          <div className="flex items-center gap-2">
            <span
              title={
                dbStatus === 'supabase'
                  ? 'Conectado ao Supabase'
                  : 'Modo local (execute supabase/schema.sql no Supabase SQL Editor para sincronizar)'
              }
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                dbStatus === 'supabase'
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                  : 'bg-amber-500/20 text-amber-200 border border-amber-400/30'
              }`}
            >
              <Database className="w-3 h-3" />
              {dbStatus === 'supabase' ? 'Supabase Online' : 'Sync Local'}
            </span>

            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Loja</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/35 text-red-100 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {dbStatus === 'local' && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>
              <strong>Banco Supabase pendente de migração:</strong> Execute{' '}
              <code className="px-1.5 py-0.5 rounded bg-amber-100 font-mono">
                supabase/schema.sql
              </code>{' '}
              no SQL Editor do seu projeto Supabase e rode{' '}
              <code className="px-1.5 py-0.5 rounded bg-amber-100 font-mono">
                SELECT private.set_admin_pin(&apos;...&apos;);
              </code>{' '}
              para persistência remota. Enquanto isso, as alterações ficam
              salvas localmente e o upload Cloudinary já funciona normalmente.
            </span>
          </div>
        )}

        {activeTab === 'products' ? (
          <AdminProductsTab />
        ) : (
          <AdminPromotionsTab onOpenLivePromo={onOpenLivePromo} />
        )}
      </main>
    </div>
  );
}
