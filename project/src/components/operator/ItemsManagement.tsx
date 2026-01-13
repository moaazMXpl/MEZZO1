import { useState, useEffect } from 'react';
import { supabase, Category, Item } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon, ArrowUp, ArrowDown } from 'lucide-react';

export default function ItemsManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    name_en: '',
    price: '',
    category_id: '',
    image_url: '',
    has_offer: false,
    offer_price: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [categoriesRes, itemsRes] = await Promise.all([
      supabase.from('categories').select('*').order('display_order'),
      supabase.from('items').select('*').order('display_order')
    ]);

    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (itemsRes.data) setItems(itemsRes.data);
  };

  const handleSaveItem = async () => {
    const itemData = {
      name: itemForm.name,
      name_en: itemForm.name_en,
      price: parseFloat(itemForm.price),
      category_id: itemForm.category_id,
      image_url: itemForm.image_url,
      has_offer: itemForm.has_offer,
      offer_price: itemForm.has_offer ? parseFloat(itemForm.offer_price) : null,
      updated_at: new Date().toISOString()
    };

    if (editingItem) {
      await supabase.from('items').update(itemData).eq('id', editingItem.id);
    } else {
      await supabase.from('items').insert([{ ...itemData, is_active: true, is_available: true }]);
    }

    setShowItemModal(false);
    setEditingItem(null);
    resetForm();
    fetchData();
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      name_en: item.name_en,
      price: item.price.toString(),
      category_id: item.category_id,
      image_url: item.image_url,
      has_offer: item.has_offer,
      offer_price: item.offer_price?.toString() || ''
    });
    setShowItemModal(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
      await supabase.from('items').delete().eq('id', id);
      fetchData();
    }
  };

  const toggleItemAvailability = async (item: Item) => {
    await supabase
      .from('items')
      .update({ is_available: !item.is_available, updated_at: new Date().toISOString() })
      .eq('id', item.id);
    fetchData();
  };

  const toggleItemActive = async (item: Item) => {
    await supabase
      .from('items')
      .update({ is_active: !item.is_active, updated_at: new Date().toISOString() })
      .eq('id', item.id);
    fetchData();
  };

  const moveItem = async (item: Item, direction: 'up' | 'down') => {
    const categoryItems = items.filter(i => i.category_id === item.category_id).sort((a, b) => a.display_order - b.display_order);
    const currentIndex = categoryItems.findIndex(i => i.id === item.id);

    if ((direction === 'up' && currentIndex === 0) || (direction === 'down' && currentIndex === categoryItems.length - 1)) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetItem = categoryItems[targetIndex];

    await Promise.all([
      supabase.from('items').update({ display_order: targetItem.display_order }).eq('id', item.id),
      supabase.from('items').update({ display_order: item.display_order }).eq('id', targetItem.id)
    ]);

    fetchData();
  };

  const resetForm = () => {
    setItemForm({
      name: '',
      name_en: '',
      price: '',
      category_id: '',
      image_url: '',
      has_offer: false,
      offer_price: ''
    });
  };

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.category_id === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            resetForm();
            setEditingItem(null);
            setShowItemModal(true);
          }}
          className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة صنف جديد
        </button>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-gray-800 border-2 border-purple-500 rounded-lg px-4 py-3 text-white text-right font-bold"
          dir="rtl"
        >
          <option value="all">جميع الأقسام</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className={`bg-gray-900/50 border-2 rounded-xl p-4 transition-all ${
              item.is_active ? 'border-purple-500/30' : 'border-gray-700'
            }`}
          >
            <div className="relative h-40 bg-gray-800 rounded-lg mb-4 overflow-hidden">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-gray-600" />
                </div>
              )}
              {!item.is_active && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <span className="text-red-400 font-bold">معطل</span>
                </div>
              )}
              {!item.is_available && item.is_active && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                  غير متوفر
                </div>
              )}
              {item.has_offer && (
                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                  عرض
                </div>
              )}
            </div>

            <div className="text-right mb-4">
              <h3 className="text-white font-bold text-lg">{item.name}</h3>
              <p className="text-purple-300 text-sm">{item.name_en}</p>
              <div className="flex items-center justify-end gap-2 mt-2">
                {item.has_offer && item.offer_price && (
                  <span className="text-gray-400 line-through">{item.price} ج</span>
                )}
                <span className="text-purple-400 font-bold text-xl">
                  {item.has_offer && item.offer_price ? item.offer_price : item.price} ج
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleEditItem(item)}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => toggleItemAvailability(item)}
                className={`flex-1 ${
                  item.is_available ? 'bg-orange-600 hover:bg-orange-500' : 'bg-green-600 hover:bg-green-500'
                } text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-1`}
              >
                {item.is_available ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

              <button
                onClick={() => toggleItemActive(item)}
                className={`flex-1 ${
                  item.is_active ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-600 hover:bg-green-500'
                } text-white py-2 rounded-lg transition-colors`}
              >
                {item.is_active ? 'تعطيل' : 'تفعيل'}
              </button>

              <button
                onClick={() => handleDeleteItem(item.id)}
                className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => moveItem(item, 'up')}
                className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-lg transition-colors"
              >
                <ArrowUp className="w-4 h-4" />
              </button>

              <button
                onClick={() => moveItem(item, 'down')}
                className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-lg transition-colors"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showItemModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-xl border-2 border-purple-500 p-6 max-w-2xl w-full my-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-right">
              {editingItem ? 'تعديل الصنف' : 'إضافة صنف جديد'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-purple-300 mb-2 text-right">الاسم بالعربي</label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    className="w-full bg-gray-800 border-2 border-purple-500/50 rounded-lg px-4 py-3 text-white text-right"
                    dir="rtl"
                  />
                </div>

                <div>
                  <label className="block text-purple-300 mb-2 text-right">الاسم بالإنجليزي</label>
                  <input
                    type="text"
                    value={itemForm.name_en}
                    onChange={(e) => setItemForm({ ...itemForm, name_en: e.target.value })}
                    className="w-full bg-gray-800 border-2 border-purple-500/50 rounded-lg px-4 py-3 text-white"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-300 mb-2 text-right">القسم</label>
                <select
                  value={itemForm.category_id}
                  onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })}
                  className="w-full bg-gray-800 border-2 border-purple-500/50 rounded-lg px-4 py-3 text-white text-right"
                  dir="rtl"
                >
                  <option value="">اختر القسم</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-purple-300 mb-2 text-right">السعر</label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    className="w-full bg-gray-800 border-2 border-purple-500/50 rounded-lg px-4 py-3 text-white text-right"
                    dir="rtl"
                  />
                </div>

                <div>
                  <label className="block text-purple-300 mb-2 text-right">سعر العرض</label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemForm.offer_price}
                    onChange={(e) => setItemForm({ ...itemForm, offer_price: e.target.value })}
                    disabled={!itemForm.has_offer}
                    className="w-full bg-gray-800 border-2 border-purple-500/50 rounded-lg px-4 py-3 text-white text-right disabled:opacity-50"
                    dir="rtl"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center justify-end gap-2 text-purple-300 cursor-pointer">
                  <span>يوجد عرض خاص</span>
                  <input
                    type="checkbox"
                    checked={itemForm.has_offer}
                    onChange={(e) => setItemForm({ ...itemForm, has_offer: e.target.checked })}
                    className="w-5 h-5"
                  />
                </label>
              </div>

              <div>
                <label className="block text-purple-300 mb-2 text-right">رابط الصورة</label>
                <input
                  type="text"
                  value={itemForm.image_url}
                  onChange={(e) => setItemForm({ ...itemForm, image_url: e.target.value })}
                  className="w-full bg-gray-800 border-2 border-purple-500/50 rounded-lg px-4 py-3 text-white"
                  placeholder="https://example.com/image.jpg"
                  dir="ltr"
                />
              </div>

              {itemForm.image_url && (
                <div className="h-40 bg-gray-800 rounded-lg overflow-hidden">
                  <img src={itemForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowItemModal(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSaveItem}
                  disabled={!itemForm.name || !itemForm.name_en || !itemForm.price || !itemForm.category_id}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors font-bold"
                >
                  {editingItem ? 'حفظ التعديلات' : 'إضافة الصنف'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}