import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode, } from 'react';
import { adminLoginApi, adminLogoutApi, checkAdminSessionApi, slugify, supabase, } from '../lib/supabase';
import type { CartItem, Product, Promotion, PromoBlock } from '../types';
const LS_CART_KEY = 'bris_cart_v1';
const SS_SB_TOKEN_KEY = 'bris_sb_admin_token';
interface DbProductRow {
    id: number;
    slug: string;
    name: string;
    price: number | string;
    original_price: number | string | null;
    description: string;
    category: string;
    images: string[] | null;
    weight: string | null;
    ingredients: string[] | null;
    recheios: string[] | null;
    allergens: string[] | null;
    shelf: string | null;
    servings: string | null;
    rating: number | string | null;
    is_featured: boolean;
    is_best_seller: boolean;
    display_order: number | null;
}
interface DbPromotionRow {
    id: number;
    slug: string;
    title: string;
    subtitle: string | null;
    badge: string | null;
    thumbnail_url: string | null;
    blocks: PromoBlock[] | null;
    is_published: boolean;
    display_order: number | null;
    updated_at?: string;
}
function mapProductFromDb(row: DbProductRow): Product { return { id: Number(row.id), slug: row.slug, name: row.name, price: Number(row.price), originalPrice: row.original_price !== null && row.original_price !== undefined ? Number(row.original_price) : null, description: row.description || '', category: row.category, images: Array.isArray(row.images) ? row.images : [], weight: row.weight || null, ingredients: Array.isArray(row.ingredients) ? row.ingredients : [], recheios: Array.isArray(row.recheios) ? row.recheios : [], allergens: Array.isArray(row.allergens) ? row.allergens : [], shelf: row.shelf || null, servings: row.servings || null, rating: row.rating !== null && row.rating !== undefined ? Number(row.rating) : 5, isFeatured: Boolean(row.is_featured), isBestSeller: Boolean(row.is_best_seller), displayOrder: Number(row.display_order || 0), }; }
function mapPromotionFromDb(row: DbPromotionRow): Promotion { return { id: Number(row.id), slug: row.slug, title: row.title, subtitle: row.subtitle || '', badge: row.badge || 'PROMOÇÃO', thumbnailUrl: row.thumbnail_url || '', blocks: Array.isArray(row.blocks) ? row.blocks : [], isPublished: Boolean(row.is_published), displayOrder: Number(row.display_order || 0), updatedAt: row.updated_at, }; }
function loadLocal<T>(key: string, fallback: T): T { try {
    const raw = localStorage.getItem(key);
    if (!raw)
        return fallback;
    return JSON.parse(raw) as T;
}
catch {
    return fallback;
} }
interface StoreContextValue {
    products: Product[];
    promotions: Promotion[];
    publishedPromotions: Promotion[];
    loading: boolean;
    dbStatus: 'supabase' | 'local';
    isAdmin: boolean;
    adminChecked: boolean;
    cart: CartItem[];
    cartCount: number;
    cartTotal: number;
    cartOpen: boolean;
    setCartOpen: (open: boolean) => void;
    addToCart: (product: Product, flavor?: string, quantity?: number) => void;
    updateCartQty: (key: string, delta: number) => void;
    removeFromCart: (key: string) => void;
    clearCart: () => void;
    loginAdmin: (pin: string) => Promise<{
        ok: boolean;
        error?: string;
    }>;
    logoutAdmin: () => Promise<void>;
    refreshData: () => Promise<void>;
    saveProduct: (draft: Omit<Product, 'id'> & {
        id?: number;
    }) => Promise<Product>;
    deleteProduct: (id: number) => Promise<void>;
    toggleProductFlag: (product: Product, flag: 'isFeatured' | 'isBestSeller') => Promise<void>;
    savePromotion: (draft: Omit<Promotion, 'id'> & {
        id?: number;
    }) => Promise<Promotion>;
    deletePromotion: (id: number) => Promise<void>;
    subscribeNewsletter: (email: string) => Promise<{
        ok: boolean;
        message: string;
    }>;
}
const StoreContext = createContext<StoreContextValue | null>(null);
export function StoreProvider({ children }: {
    children: ReactNode;
}) {
    const [products, setProducts] = useState<Product[]>([]);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [dbStatus, setDbStatus] = useState<'supabase' | 'local'>('local');
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminChecked, setAdminChecked] = useState(false);
    const [cart, setCart] = useState<CartItem[]>(() => loadLocal(LS_CART_KEY, []));
    const [cartOpen, setCartOpen] = useState(false);
    // Sync cart to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(LS_CART_KEY, JSON.stringify(cart));
        }
        catch {
            // ignore quota issues
        }
    }, [cart]);
    const fetchAllData = useCallback(async (adminActive: boolean) => {
        setLoading(true);
        try {
            if (!supabase)
                throw new Error('Supabase não configurado.');
            const { data: prodData, error: prodError } = await supabase.from('products').select('*').order('display_order').order('id');
            if (prodError)
                throw prodError;
            setProducts(((prodData || []) as DbProductRow[]).map(mapProductFromDb));
            const token = sessionStorage.getItem(SS_SB_TOKEN_KEY);
            if (adminActive && !token)
                throw new Error('Sessão Supabase ausente.');
            const result = adminActive ? await supabase.rpc('admin_list_promotions', { p_token: token }) : await supabase.from('promotions').select('*').order('display_order');
            if (result.error)
                throw result.error;
            setPromotions(((result.data || []) as DbPromotionRow[]).map(mapPromotionFromDb));
            setDbStatus('supabase');
        }
        catch (error) {
            console.error('Falha ao carregar catálogo Supabase:', error);
            setPromotions([]);
            setDbStatus('local');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        let active = true;
        (async () => {
            let authenticated = false;
            try {
                const serverAuth = await checkAdminSessionApi();
                const token = sessionStorage.getItem(SS_SB_TOKEN_KEY);
                if (serverAuth && supabase && token) {
                    const { data, error } = await supabase.rpc('admin_verify_session', { p_token: token });
                    authenticated = !error && data === true;
                }
            }
            catch (error) {
                console.error('Falha ao verificar sessão:', error);
            }
            if (!active)
                return;
            if (!authenticated)
                sessionStorage.removeItem(SS_SB_TOKEN_KEY);
            setIsAdmin(authenticated);
            setAdminChecked(true);
            await fetchAllData(authenticated);
        })();
        return () => { active = false; };
    }, [fetchAllData]);
    const loginAdmin = useCallback(async (pin: string): Promise<{
        ok: boolean;
        error?: string;
    }> => {
        if (!/^\d{6}$/.test(pin))
            return { ok: false, error: 'A senha deve conter exatamente 6 números.' };
        if (!supabase)
            return { ok: false, error: 'Supabase não configurado. Verifique as variáveis VITE_.' };
        sessionStorage.removeItem(SS_SB_TOKEN_KEY);
        setIsAdmin(false);
        try {
            const serverRes = await adminLoginApi(pin);
            if (!serverRes.ok)
                return { ok: false, error: serverRes.error || 'Erro na autenticação do servidor.' };
            const { data, error } = await supabase.rpc('admin_login', { p_pin: pin });
            if (error)
                throw new Error(error.message);
            const payload = data as {
                ok?: boolean;
                token?: string;
                error?: string;
            } | null;
            if (!payload?.ok || !payload.token)
                throw new Error(payload?.error || 'Supabase não retornou uma sessão válida.');
            sessionStorage.setItem(SS_SB_TOKEN_KEY, payload.token);
            setIsAdmin(true);
            await fetchAllData(true);
            return { ok: true };
        }
        catch (error) {
            sessionStorage.removeItem(SS_SB_TOKEN_KEY);
            try {
                await adminLogoutApi();
            }
            catch { /* sessão local já removida */ }
            return { ok: false, error: error instanceof Error ? error.message : 'Falha na autenticação do Supabase.' };
        }
    }, [fetchAllData]);
    const logoutAdmin = useCallback(async () => { const sbToken = sessionStorage.getItem(SS_SB_TOKEN_KEY); sessionStorage.removeItem(SS_SB_TOKEN_KEY); await adminLogoutApi(); if (supabase && sbToken) {
        try {
            await supabase.rpc('admin_logout', { p_token: sbToken });
        }
        catch { /* ignore */ }
    } setIsAdmin(false); await fetchAllData(false); }, [fetchAllData]);
    const saveProduct = useCallback(async (draft: Omit<Product, 'id'> & {
        id?: number;
    }): Promise<Product> => {
        const cleanSlug = slugify(draft.slug || draft.name) || `produto-${Date.now()}`;
        const sbToken = sessionStorage.getItem(SS_SB_TOKEN_KEY);
        if (!supabase)
            throw new Error('Supabase não configurado. Verifique as variáveis de ambiente.');
        if (!sbToken || !isAdmin)
            throw new Error('Sessão administrativa ausente. Faça login novamente.');
        {
            const { data, error } = await supabase.rpc('admin_upsert_product', { p_token: sbToken, p_id: draft.id ?? null, p_slug: cleanSlug, p_name: draft.name.trim(), p_price: draft.price, p_original_price: draft.originalPrice ?? null, p_description: draft.description.trim(), p_category: draft.category.trim(), p_images: draft.images, p_weight: draft.weight || null, p_ingredients: draft.ingredients, p_recheios: draft.recheios, p_allergens: draft.allergens, p_shelf: draft.shelf || null, p_servings: draft.servings || null, p_rating: draft.rating, p_is_featured: draft.isFeatured, p_is_best_seller: draft.isBestSeller, p_display_order: draft.displayOrder, });
            if (error) {
                throw new Error(error.message || 'Erro ao salvar produto no Supabase.');
            }
            if (!data || !data.id)
                throw new Error('O Supabase não retornou o registro salvo.');
            const saved = mapProductFromDb(data as DbProductRow);
            setProducts((prev) => { const exists = prev.some((p) => p.id === saved.id); const next = exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [...prev, saved]; return next; });
            return saved;
        }
    }, [isAdmin]);
    const deleteProduct = useCallback(async (id: number) => {
        const sbToken = sessionStorage.getItem(SS_SB_TOKEN_KEY);
        if (!supabase)
            throw new Error('Supabase não configurado. Verifique as variáveis de ambiente.');
        if (!sbToken || !isAdmin)
            throw new Error('Sessão administrativa ausente. Faça login novamente.');
        {
            const { error } = await supabase.rpc('admin_delete_product', { p_token: sbToken, p_id: id, });
            if (error) {
                throw new Error(error.message || 'Erro ao excluir produto.');
            }
        }
        setProducts((prev) => { const next = prev.filter((p) => p.id !== id); return next; });
    }, [isAdmin]);
    const toggleProductFlag = useCallback(async (product: Product, flag: 'isFeatured' | 'isBestSeller') => { await saveProduct({ ...product, [flag]: !product[flag], }); }, [saveProduct]);
    const savePromotion = useCallback(async (draft: Omit<Promotion, 'id'> & {
        id?: number;
    }): Promise<Promotion> => {
        const cleanSlug = slugify(draft.slug || draft.title) || `promocao-${Date.now()}`;
        const sbToken = sessionStorage.getItem(SS_SB_TOKEN_KEY);
        if (!supabase)
            throw new Error('Supabase não configurado. Verifique as variáveis de ambiente.');
        if (!sbToken || !isAdmin)
            throw new Error('Sessão administrativa ausente. Faça login novamente.');
        {
            const { data, error } = await supabase.rpc('admin_upsert_promotion', { p_token: sbToken, p_id: draft.id ?? null, p_slug: cleanSlug, p_title: draft.title.trim(), p_subtitle: draft.subtitle.trim(), p_badge: draft.badge.trim() || 'PROMOÇÃO', p_thumbnail_url: draft.thumbnailUrl, p_blocks: draft.blocks, p_is_published: draft.isPublished, p_display_order: draft.displayOrder, });
            if (error) {
                throw new Error(error.message || 'Erro ao salvar promoção no Supabase.');
            }
            if (!data || !data.id)
                throw new Error('O Supabase não retornou o registro salvo.');
            const saved = mapPromotionFromDb(data as DbPromotionRow);
            setPromotions((prev) => { const exists = prev.some((p) => p.id === saved.id); const next = exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [...prev, saved]; return next; });
            return saved;
        }
    }, [isAdmin]);
    const deletePromotion = useCallback(async (id: number) => {
        const sbToken = sessionStorage.getItem(SS_SB_TOKEN_KEY);
        if (!supabase)
            throw new Error('Supabase não configurado. Verifique as variáveis de ambiente.');
        if (!sbToken || !isAdmin)
            throw new Error('Sessão administrativa ausente. Faça login novamente.');
        {
            const { error } = await supabase.rpc('admin_delete_promotion', { p_token: sbToken, p_id: id, });
            if (error) {
                throw new Error(error.message || 'Erro ao excluir promoção.');
            }
        }
        setPromotions((prev) => { const next = prev.filter((p) => p.id !== id); return next; });
    }, [isAdmin]);
    const addToCart = useCallback((product: Product, flavor?: string, quantity = 1) => { const chosenFlavor = flavor || product.recheios[0] || undefined; const key = `${product.id}::${chosenFlavor || 'default'}`; setCart((prev) => { const existing = prev.find((item) => item.key === key); if (existing) {
        return prev.map((item) => item.key === key ? { ...item, quantity: item.quantity + quantity } : item);
    } return [...prev, { key, productId: product.id, productSlug: product.slug, name: product.name, price: product.price, image: product.images[0] || '', flavor: chosenFlavor, quantity, },]; }); setCartOpen(true); }, []);
    const updateCartQty = useCallback((key: string, delta: number) => { setCart((prev) => prev.map((item) => item.key === key ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0)); }, []);
    const removeFromCart = useCallback((key: string) => { setCart((prev) => prev.filter((item) => item.key !== key)); }, []);
    const clearCart = useCallback(() => setCart([]), []);
    const subscribeNewsletter = useCallback(async (email: string): Promise<{
        ok: boolean;
        message: string;
    }> => {
        const cleaned = email.trim().toLowerCase();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleaned)) {
            return { ok: false, message: 'Digite um e-mail válido.' };
        }
        if (supabase) {
            try {
                const { error } = await supabase.from('newsletter_subscribers').insert({ email: cleaned });
                if (error) {
                    if (error.code === '23505') {
                        return { ok: true, message: 'Este e-mail já está inscrito na nossa lista!', };
                    }
                }
                else {
                    return { ok: true, message: 'Obrigado! Você receberá nossas novidades e promoções.', };
                }
            }
            catch {
                // Falha de conexão
            }
        }
        return { ok: false, message: 'Não foi possível registrar a inscrição. Tente novamente.', };
    }, []);
    const publishedPromotions = useMemo(() => promotions.filter((p) => p.isPublished).sort((a, b) => a.displayOrder - b.displayOrder), [promotions]);
    const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
    const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
    const value = useMemo<StoreContextValue>(() => ({ products, promotions, publishedPromotions, loading, dbStatus, isAdmin, adminChecked, cart, cartCount, cartTotal, cartOpen, setCartOpen, addToCart, updateCartQty, removeFromCart, clearCart, loginAdmin, logoutAdmin, refreshData: () => fetchAllData(isAdmin), saveProduct, deleteProduct, toggleProductFlag, savePromotion, deletePromotion, subscribeNewsletter, }), [products, promotions, publishedPromotions, loading, dbStatus, isAdmin, adminChecked,
        cart, cartCount, cartTotal, cartOpen, addToCart, updateCartQty, removeFromCart, clearCart, loginAdmin, logoutAdmin, fetchAllData, saveProduct, deleteProduct, toggleProductFlag, savePromotion, deletePromotion, subscribeNewsletter,]);
    return (<StoreContext.Provider value={value}>{children}</StoreContext.Provider>);
}
export function useStore() { const ctx = useContext(StoreContext); if (!ctx) {
    throw new Error('useStore must be used inside StoreProvider');
} return ctx; }
