import { Plus, AlertCircle } from 'lucide-react';
import { Item } from '../lib/supabase';

interface MenuItemProps {
  item: Item;
  onAddToCart: (item: Item) => void;
}

export default function MenuItem({ item, onAddToCart }: MenuItemProps) {
  const displayPrice = item.has_offer && item.offer_price ? item.offer_price : item.price;

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 border-purple-500/30 hover:border-purple-400 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 overflow-hidden group">
      <div className="relative h-48 bg-gray-900 overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/30 to-gray-900">
            <span className="text-6xl">🎮</span>
          </div>
        )}

        {item.has_offer && item.offer_price && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
            عرض خاص!
          </div>
        )}

        {!item.is_available && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="bg-red-500/90 px-4 py-2 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-white" />
              <span className="text-white font-bold">غير متوفر حالياً</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-white text-right mb-1">{item.name}</h3>
        <p className="text-purple-300 text-sm text-right mb-3">{item.name_en}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={() => item.is_available && onAddToCart(item)}
            disabled={!item.is_available}
            className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-bold"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة</span>
          </button>

          <div className="text-right">
            {item.has_offer && item.offer_price && (
              <div className="text-gray-400 line-through text-sm">{item.price} ج</div>
            )}
            <div className="text-2xl font-black text-purple-400">
              {displayPrice} <span className="text-lg">ج</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}