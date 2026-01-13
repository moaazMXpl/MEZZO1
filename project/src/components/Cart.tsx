import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Item } from '../lib/supabase';

interface CartItem extends Item {
  quantity: number;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

export default function Cart({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartProps) {
  if (!isOpen) return null;

  const total = cartItems.reduce((sum, item) => {
    const price = item.has_offer && item.offer_price ? item.offer_price : item.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl border-2 border-purple-500 max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="bg-purple-800/50 p-4 flex items-center justify-between border-b-2 border-purple-500">
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-500 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" />
            سلة الطلبات
          </h2>
          <div className="w-10"></div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-24 h-24 text-purple-400/50 mx-auto mb-4" />
              <p className="text-2xl text-purple-300 font-bold">السلة فارغة</p>
              <p className="text-gray-400 mt-2">أضف بعض الأصناف للبدء</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map(item => {
                const price = item.has_offer && item.offer_price ? item.offer_price : item.price;
                const subtotal = price * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="bg-gray-800/50 border border-purple-500/30 rounded-xl p-4 flex items-center gap-4"
                  >
                    <div className="flex-1 text-right">
                      <h3 className="text-white font-bold text-lg">{item.name}</h3>
                      <p className="text-purple-300 text-sm">{item.name_en}</p>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <span className="text-purple-400 font-bold">{price} ج</span>
                        {item.has_offer && item.offer_price && (
                          <span className="text-gray-500 line-through text-sm">{item.price} ج</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="bg-red-600 hover:bg-red-500 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>

                      <div className="flex items-center gap-2 bg-purple-900/50 rounded-lg p-1">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="bg-purple-600 hover:bg-purple-500 p-1 rounded transition-colors"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                        <span className="text-white font-bold w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="bg-purple-600 hover:bg-purple-500 p-1 rounded transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4 text-white" />
                        </button>
                      </div>

                      <div className="text-purple-400 font-black text-xl w-24 text-right">
                        {subtotal} ج
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="bg-purple-800/50 p-6 border-t-2 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl font-black text-white">
                {total} <span className="text-xl">ج</span>
              </div>
              <div className="text-xl text-purple-300 font-bold">المجموع الكلي</div>
            </div>

            <button
              onClick={onCheckout}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-4 rounded-xl font-black text-xl transition-all transform hover:scale-105 shadow-lg"
            >
              إتمام الطلب
            </button>
          </div>
        )}
      </div>
    </div>
  );
}