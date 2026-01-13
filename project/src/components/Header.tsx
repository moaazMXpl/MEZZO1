import { Gamepad2, ShoppingCart, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Category } from '../lib/supabase';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onProfileClick: () => void;
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
}

export default function Header({ cartCount, onCartClick, onProfileClick, categories, onCategorySelect }: HeaderProps) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    let angle = -15;
    let direction = 1;
    const interval = setInterval(() => {
      angle += direction * 0.5;
      if (angle >= 15 || angle <= -15) {
        direction *= -1;
      }
      setRotation(angle);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border-b-2 border-gray-700 shadow-2xl">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onProfileClick}
              className="bg-gray-700/50 hover:bg-gray-600/50 p-3 rounded-xl border-2 border-gray-500/50 transition-all hover:scale-110"
            >
              <User className="w-6 h-6 text-gray-200" />
            </button>
            <button
              onClick={onCartClick}
              className="relative bg-gray-700/50 hover:bg-gray-600/50 p-3 rounded-xl border-2 border-gray-500/50 transition-all hover:scale-110"
            >
              <ShoppingCart className="w-6 h-6 text-gray-200" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-gray-900 animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-4 mb-2">
              <Gamepad2
                className="w-12 h-12 text-blue-400"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: 'transform 0.05s linear'
                }}
              />
              <div>
                <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-300 tracking-wider" style={{ fontFamily: 'Arial Black, sans-serif' }}>
                  MEZZO
                </h1>
              </div>
              <Gamepad2
                className="w-12 h-12 text-blue-400"
                style={{
                  transform: `rotate(${-rotation}deg) scaleX(-1)`,
                  transition: 'transform 0.05s linear'
                }}
              />
            </div>
            <p className="text-2xl font-bold text-gray-300 tracking-wide animate-pulse">
              Level Up Your Taste!
            </p>
          </div>

          <div className="w-32"></div>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="border-t border-gray-700 bg-gray-900/50 backdrop-blur-sm overflow-x-auto scrollbar-hide">
          <div className="container mx-auto px-4 flex gap-3 py-3 min-w-max md:min-w-full">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => onCategorySelect(category.id)}
                className="bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 hover:border-blue-500 text-gray-200 px-4 py-2 rounded-lg transition-all whitespace-nowrap flex items-center gap-2 font-bold hover:text-blue-300"
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrolling-behavior: smooth;
        }
      `}</style>
    </header>
  );
}