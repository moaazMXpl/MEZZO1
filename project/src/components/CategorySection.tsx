import { Category, Item } from '../lib/supabase';
import MenuItem from './MenuItem';

interface CategorySectionProps {
  category: Category;
  items: Item[];
  onAddToCart: (item: Item) => void;
}

export default function CategorySection({ category, items, onAddToCart }: CategorySectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="bg-gradient-to-r from-purple-900/50 to-gray-900/50 border-2 border-purple-500/50 rounded-xl p-6 mb-6 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-4">
          <div className="text-5xl">{category.icon}</div>
          <div className="text-center">
            <h2 className="text-4xl font-black text-white mb-1">{category.name}</h2>
            <p className="text-xl text-purple-300 font-bold tracking-wider">{category.name_en}</p>
          </div>
          <div className="text-5xl">{category.icon}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map(item => (
          <MenuItem key={item.id} item={item} onAddToCart={onAddToCart} />
        ))}
      </div>
    </section>
  );
}