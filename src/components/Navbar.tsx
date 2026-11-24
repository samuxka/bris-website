import { useEffect, useMemo, useRef, useState } from 'react';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import imgBrisLogotipoBlue from '../../public/assets/bee22.png';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../lib/supabase';
import type { Product } from '../types';

export type NavActive = 'home' | 'featured' | 'products' | 'sale';

interface NavbarProps {
  active: NavActive;
  onNavigate: (path: string, hash?: string) => void;
  onSelectProduct: (product: Product) => void;
  onSearchSubmit: (query: string) => void;
}

export function Navbar({
  active,
  onNavigate,
  onSelectProduct,
  onSearchSubmit,
}: NavbarProps) {
  const { products, cartCount, setCartOpen } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(e.target as Node)
      ) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.recheios.some((r) => r.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [products, searchQuery]);

  const navLinks: { id: NavActive; label: string; action: () => void }[] = [
    { id: 'home', label: 'Home', action: () => onNavigate('/') },
    {
      id: 'featured',
      label: 'Featured',
      action: () => onNavigate('/', 'featured'),
    },
    {
      id: 'products',
      label: 'Products',
      action: () => onNavigate('/products'),
    },
    { id: 'sale', label: 'Sale', action: () => onNavigate('/', 'sale') },
  ];

  function handleSearchFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchFocused(false);
    setMobileSearchOpen(false);
    onSearchSubmit(q);
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e6edf6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="flex items-center shrink-0 focus:outline-none group"
          aria-label="Bris Pastelaria - Início"
        >
          <img
            src={imgBrisLogotipoBlue}
            alt="Bris Pastelaria"
            className="h-9 sm:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </button>

        {/* Center Navigation Links (matches reference active pill style in Bris Blue) */}
        <nav
          aria-label="Navegação principal"
          className="hidden md:flex items-center gap-1 h-full"
        >
          {navLinks.map((link) => {
            const isActive = active === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={link.action}
                className={`relative px-5 h-full flex items-center text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#0d4380] text-white font-semibold'
                    : 'text-[#334e68] hover:text-[#0d4380] hover:bg-[#f4f7fb]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Functional Search Bar + Cart (NO avatar) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop functional search bar */}
          <div ref={searchBoxRef} className="relative hidden sm:block">
            <form onSubmit={handleSearchFormSubmit} className="relative">
              <Search className="w-4 h-4 text-[#526d8a] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchFocused(true);
                }}
                onFocus={() => setSearchFocused(true)}
                placeholder="Buscar doces, pães..."
                aria-label="Buscar produtos"
                className="w-48 lg:w-64 pl-9 pr-8 py-2 text-sm rounded-full bg-[#f4f7fb] border border-[#dce6f2] text-[#0b223d] placeholder:text-[#7c93ad] focus:outline-none focus:border-[#0d4380] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7c93ad] hover:text-[#0d4380]"
                  aria-label="Limpar busca"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Live Search Results Dropdown */}
            {searchFocused && searchQuery.trim().length > 0 && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#e3ebf5] overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-[#eff4fa]">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          setSearchFocused(false);
                          setSearchQuery('');
                          onSelectProduct(product);
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-[#f4f7fb] text-left transition-colors cursor-pointer"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover bg-[#eef3fa] shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#0b223d] truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-[#647b96] truncate">
                            {product.category}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-[#0d4380] shrink-0">
                          {formatPrice(product.price)}
                        </span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setSearchFocused(false);
                        onSearchSubmit(searchQuery.trim());
                      }}
                      className="w-full py-2.5 px-4 text-xs font-semibold text-[#0d4380] hover:bg-[#f4f7fb] text-center cursor-pointer"
                    >
                      Ver todos os resultados para "{searchQuery.trim()}" →
                    </button>
                  </div>
                ) : (
                  <div className="p-5 text-center text-sm text-[#647b96]">
                    Nenhum produto encontrado para "{searchQuery.trim()}".
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Search Toggle */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen((v) => !v)}
            className="sm:hidden p-2.5 rounded-full text-[#0b223d] hover:bg-[#f4f7fb] transition-colors"
            aria-label="Abrir busca"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Shopping Cart Button */}
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative p-2.5 rounded-full text-[#0b223d] hover:bg-[#f4f7fb] hover:text-[#0d4380] transition-colors cursor-pointer"
            aria-label={`Carrinho com ${cartCount} itens`}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 rounded-full bg-[#0d4380] text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden p-2.5 rounded-full text-[#0b223d] hover:bg-[#f4f7fb] transition-colors"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {mobileSearchOpen && (
        <div className="sm:hidden px-4 pb-3 border-t border-[#eff4fa] bg-white">
          <form onSubmit={handleSearchFormSubmit} className="relative mt-2">
            <Search className="w-4 h-4 text-[#526d8a] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar doces, pães, biscoitos..."
              autoFocus
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-[#f4f7fb] border border-[#dce6f2] text-[#0b223d] focus:outline-none focus:border-[#0d4380]"
            />
          </form>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#e6edf6] px-4 py-3 space-y-1 shadow-lg">
          {navLinks.map((link) => {
            const isActive = active === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  link.action();
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#0d4380] text-white'
                    : 'text-[#0b223d] hover:bg-[#f4f7fb]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
