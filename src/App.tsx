import { useCallback, useEffect, useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar, type NavActive } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { LandingPage } from './pages/LandingPage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { PromotionPage } from './pages/PromotionPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import type { Product, Promotion } from './types';

function AppRouter() {
  const { products, publishedPromotions, isAdmin, adminChecked } = useStore();
  const [pathname, setPathname] = useState<string>(
    () => window.location.pathname || '/'
  );
  const [activeHomeSection, setActiveHomeSection] =
    useState<NavActive>('home');
  const [catalogSearch, setCatalogSearch] = useState('');

  useEffect(() => {
    const onPopState = () => {
      setPathname(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((nextPath: string, hash?: string) => {
    const cleanPath = nextPath.startsWith('/') ? nextPath : `/${nextPath}`;
    const targetUrl = hash ? `${cleanPath}#${hash}` : cleanPath;

    if (window.location.pathname !== cleanPath || hash) {
      window.history.pushState({}, '', targetUrl);
      setPathname(cleanPath);
    }

    if (hash) {
      if (hash === 'featured') setActiveHomeSection('featured');
      else if (hash === 'sale') setActiveHomeSection('sale');
      else setActiveHomeSection('home');

      window.setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      if (cleanPath === '/') setActiveHomeSection('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const openProduct = useCallback(
    (product: Product) => {
      navigate(`/product/${product.slug}`);
    },
    [navigate]
  );

  const openPromotion = useCallback(
    (promo: Promotion) => {
      navigate(`/sale/${promo.slug}`);
    },
    [navigate]
  );

  const handleSearchSubmit = useCallback(
    (query: string) => {
      setCatalogSearch(query);
      navigate('/products');
    },
    [navigate]
  );

  // Admin Routes (no public storefront navbar/footer)
  if (pathname === '/admin/login') {
    if (adminChecked && isAdmin) {
      return (
        <AdminDashboardPage
          onNavigate={navigate}
          onOpenLivePromo={openPromotion}
        />
      );
    }
    return (
      <AdminLoginPage
        onSuccess={() => navigate('/admin')}
        onBack={() => navigate('/')}
      />
    );
  }

  if (pathname.startsWith('/admin')) {
    if (!adminChecked) {
      return (
        <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center text-sm font-semibold text-[#0d4380]">
          Verificando sessão administrativa...
        </div>
      );
    }
    if (!isAdmin) {
      return (
        <AdminLoginPage
          onSuccess={() => navigate('/admin')}
          onBack={() => navigate('/')}
        />
      );
    }
    return (
      <AdminDashboardPage
        onNavigate={navigate}
        onOpenLivePromo={openPromotion}
      />
    );
  }

  // Determine Active Nav Link
  let navActive: NavActive = activeHomeSection;
  if (pathname === '/products' || pathname.startsWith('/product/')) {
    navActive = 'products';
  } else if (pathname.startsWith('/sale/')) {
    navActive = 'sale';
  }

  // Match Product Detail Route
  const productMatch = pathname.match(/^\/product\/([^/]+)$/);
  const matchedProduct = productMatch
    ? products.find((p) => p.slug === decodeURIComponent(productMatch[1]))
    : null;

  // Match Promotion Page Route
  const promoMatch = pathname.match(/^\/sale\/([^/]+)$/);
  const matchedPromo = promoMatch
    ? publishedPromotions.find(
        (p) => p.slug === decodeURIComponent(promoMatch[1])
      )
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar
        active={navActive}
        onNavigate={navigate}
        onSelectProduct={openProduct}
        onSearchSubmit={handleSearchSubmit}
      />

      <div className="flex-1">
        {productMatch && matchedProduct ? (
          <ProductDetailPage
            product={matchedProduct}
            onBack={() => navigate('/products')}
            onSelectProduct={openProduct}
          />
        ) : promoMatch && matchedPromo ? (
          <PromotionPage
            promotion={matchedPromo}
            onBack={() => navigate('/', 'sale')}
            onSelectProduct={openProduct}
          />
        ) : pathname === '/products' ? (
          <CatalogPage
            initialSearch={catalogSearch}
            onSelectProduct={openProduct}
            onClearInitialSearch={() => setCatalogSearch('')}
          />
        ) : (
          <LandingPage
            onNavigate={navigate}
            onSelectProduct={openProduct}
            onSelectPromotion={openPromotion}
          />
        )}
      </div>

      <Footer onNavigate={navigate} />
      <CartDrawer />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppRouter />
    </StoreProvider>
  );
}
