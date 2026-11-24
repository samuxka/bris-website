import { Minus, Plus, ShoppingBag, Trash2, X, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { WHATSAPP_NUMBER } from '../data';
import { formatPrice } from '../lib/supabase';

export function CartDrawer() {
  const {
    cart,
    cartCount,
    cartTotal,
    cartOpen,
    setCartOpen,
    updateCartQty,
    removeFromCart,
    clearCart,
  } = useStore();

  if (!cartOpen) return null;

  function handleCheckoutWhatsApp() {
    if (cart.length === 0) return;
    const lines = cart.map(
      (item) =>
        `• ${item.quantity}x ${item.name}${
          item.flavor ? ` (${item.flavor})` : ''
        } — ${formatPrice(item.price * item.quantity)}`
    );
    const message = [
      'Olá Bris Pastelaria! Gostaria de fazer a seguinte encomenda:',
      '',
      ...lines,
      '',
      `Total estimado: ${formatPrice(cartTotal)}`,
    ].join('\n');
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#061e3c]/50 backdrop-blur-xs"
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer Panel */}
      <aside className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        <div className="px-6 py-5 border-b border-[#e6edf6] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#eef4fc] text-[#0d4380] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0b223d]">
                Seu Carrinho
              </h2>
              <p className="text-xs text-[#647b96]">
                {cartCount} {cartCount === 1 ? 'item selecionado' : 'itens selecionados'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="p-2 rounded-full text-[#647b96] hover:bg-[#f4f7fb] hover:text-[#0b223d] cursor-pointer"
            aria-label="Fechar carrinho"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-[#f4f7fb] text-[#8aa1bc] flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-semibold text-[#0b223d] mb-1">
                Seu carrinho está vazio
              </p>
              <p className="text-sm text-[#647b96] max-w-xs">
                Explore os nossos pães, brownies, biscoitos e doces artesanais e
                adicione os seus favoritos.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.key}
                className="flex gap-3.5 p-3.5 rounded-2xl bg-[#f8fafd] border border-[#e6edf6]"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover bg-white border border-[#e6edf6] shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#0b223d] truncate">
                        {item.name}
                      </h3>
                      {item.flavor && (
                        <span className="inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#e4eefb] text-[#0d4380]">
                          {item.flavor}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.key)}
                      className="text-[#8aa1bc] hover:text-red-600 p-1 cursor-pointer"
                      aria-label={`Remover ${item.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="inline-flex items-center rounded-lg border border-[#d5e1f0] bg-white">
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.key, -1)}
                        className="p-1.5 text-[#0d4380] hover:bg-[#f4f7fb] rounded-l-lg cursor-pointer"
                        aria-label="Diminuir quantidade"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-[#0b223d]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.key, 1)}
                        className="p-1.5 text-[#0d4380] hover:bg-[#f4f7fb] rounded-r-lg cursor-pointer"
                        aria-label="Aumentar quantidade"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-[#0d4380]">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-[#e6edf6] bg-white space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#526d8a] font-medium">
                Subtotal estimado
              </span>
              <span className="text-xl font-extrabold text-[#0b223d]">
                {formatPrice(cartTotal)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCheckoutWhatsApp}
              className="w-full py-3.5 px-5 rounded-xl bg-[#0d4380] hover:bg-[#092d58] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              Finalizar Pedido no WhatsApp
            </button>
            <button
              type="button"
              onClick={clearCart}
              className="w-full py-2 text-xs font-medium text-[#647b96] hover:text-red-600 transition-colors cursor-pointer"
            >
              Limpar carrinho
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
