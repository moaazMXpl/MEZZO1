import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase, Category, Item, OrderItem, isSupabaseConfigured } from './lib/supabase';
import Header from './components/Header';
import CategorySection from './components/CategorySection';
import Cart from './components/Cart';
import Checkout, { CustomerData } from './components/Checkout';
import CustomerProfile from './components/CustomerProfile';
import CheatCodeInput from './components/CheatCodeInput';
import OperatorLogin from './components/OperatorLogin';
import OperatorDashboard from './components/OperatorDashboard';

interface CartItem extends Item {
  quantity: number;
}

function AppContent() {
  const { isOperator } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showOperatorLogin, setShowOperatorLogin] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [cheatCode, setCheatCode] = useState('admin123123');

  useEffect(() => {
    fetchData();
    fetchCheatCode();

    const categoriesChannel = supabase
      .channel('categories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        fetchData();
      })
      .subscribe();

    const itemsChannel = supabase
      .channel('items-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      categoriesChannel.unsubscribe();
      itemsChannel.unsubscribe();
    };
  }, []);

  const fetchCheatCode = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'cheat_code')
        .maybeSingle();

      if (error) {
        console.warn('Error fetching cheat code:', error);
        return;
      }

      if (data) {
        setCheatCode(data.value);
      }
    } catch (error) {
      console.warn('Error fetching cheat code:', error);
    }
  };

  useEffect(() => {
    const savedPhone = localStorage.getItem('customer_phone');
    if (savedPhone) {
      setCustomerPhone(savedPhone);
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);

    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('display_order'),
        supabase.from('items').select('*').eq('is_active', true).order('display_order')
      ]);

      if (categoriesRes.error) {
        console.error('Error fetching categories:', categoriesRes.error);
      } else if (categoriesRes.data) {
        setCategories(categoriesRes.data);
      }

      if (itemsRes.error) {
        console.error('Error fetching items:', itemsRes.error);
      } else if (itemsRes.data) {
        setItems(itemsRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: Item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveItem(itemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleCheckout = () => {
    setShowCart(false);
    setShowCheckout(true);
  };

  const handleConfirmOrder = async (customerData: CustomerData, paymentMethod: 'cash' | 'instant_transfer') => {
    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      alert('⚠️ خطأ في الإعدادات!\n\nيرجى إعداد Supabase:\n1. أنشئ ملف .env في مجلد المشروع\n2. أضف المتغيرات التالية:\n   VITE_SUPABASE_URL=your_supabase_url\n   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key\n\nراجع ملف .env.example للمزيد من التفاصيل.');
      return;
    }

    // Validate cart is not empty
    if (cartItems.length === 0) {
      alert('السلة فارغة. يرجى إضافة منتجات قبل تأكيد الطلب.');
      return;
    }

    // Validate customer data
    if (!customerData.name.trim() || !customerData.phone.trim() || !customerData.street.trim() || !customerData.area.trim() || !customerData.city.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }

    try {
      // Check if customer exists
      const { data: existingCustomer, error: customerCheckError } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', customerData.phone)
        .maybeSingle();

      if (customerCheckError) {
        throw new Error(`خطأ في التحقق من بيانات العميل: ${customerCheckError.message}`);
      }

      let customerId = existingCustomer?.id;

      // Create or update customer
      if (!customerId) {
        const { data: newCustomer, error: insertError } = await supabase
          .from('customers')
          .insert([{
            name: customerData.name.trim(),
            phone: customerData.phone.trim(),
            street: customerData.street.trim(),
            area: customerData.area.trim(),
            city: customerData.city.trim()
          }])
          .select('id')
          .single();

        if (insertError) {
          throw new Error(`خطأ في إنشاء العميل: ${insertError.message}`);
        }
        customerId = newCustomer?.id;
      } else {
        const { error: updateError } = await supabase
          .from('customers')
          .update({
            name: customerData.name.trim(),
            phone: customerData.phone.trim(),
            street: customerData.street.trim(),
            area: customerData.area.trim(),
            city: customerData.city.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', customerId);

        if (updateError) {
          throw new Error(`خطأ في تحديث بيانات العميل: ${updateError.message}`);
        }
      }

      if (!customerId) {
        throw new Error('فشل في الحصول على معرف العميل');
      }

      // Calculate total amount
      const orderNumber = `ORD-${Date.now()}`;
      const totalAmount = cartItems.reduce((sum, item) => {
        const price = item.has_offer && item.offer_price ? item.offer_price : item.price;
        return sum + price * item.quantity;
      }, 0);

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_id: customerId,
          order_number: orderNumber,
          payment_method: paymentMethod,
          total_amount: totalAmount,
          status: 'under_review'
        }])
        .select()
        .single();

      if (orderError) {
        throw new Error(`خطأ في إنشاء الطلب: ${orderError.message}`);
      }

      if (!order) {
        throw new Error('فشل في إنشاء الطلب');
      }

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        item_id: item.id,
        item_name: item.name,
        quantity: item.quantity,
        unit_price: item.has_offer && item.offer_price ? item.offer_price : item.price,
        subtotal: (item.has_offer && item.offer_price ? item.offer_price : item.price) * item.quantity
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) {
        // Try to delete the order if items insertion fails
        await supabase.from('orders').delete().eq('id', order.id);
        throw new Error(`خطأ في إضافة عناصر الطلب: ${itemsError.message}`);
      }

      // Success - clear cart and save customer phone
      localStorage.setItem('customer_phone', customerData.phone);
      setCustomerPhone(customerData.phone);
      setCartItems([]);
      setShowCheckout(false);

      setTimeout(() => {
        alert(`✅ تم تأكيد طلبك بنجاح!\n\nرقم الطلب: ${orderNumber}\nالمجموع: ${totalAmount} ج\nحالة الطلب: قيد المعاينة\n\nشكراً لك!`);
      }, 100);
    } catch (error: any) {
      console.error('Error creating order:', error);
      const errorMessage = error?.message || 'حدث خطأ غير متوقع أثناء إنشاء الطلب';
      setTimeout(() => {
        alert(`❌ خطأ في إنشاء الطلب\n\n${errorMessage}\n\nالرجاء المحاولة مرة أخرى أو الاتصال بالدعم الفني.`);
      }, 100);
    }
  };

  const handleCheatCodeEntered = () => {
    setShowOperatorLogin(true);
  };

  const handleCategoryClick = (categoryId: string) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isOperator) {
    return <OperatorDashboard />;
  }

  const totalAmount = cartItems.reduce((sum, item) => {
    const price = item.has_offer && item.offer_price ? item.offer_price : item.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <CheatCodeInput onCodeEntered={handleCheatCodeEntered} cheatCode={cheatCode} />

      <Header
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setShowCart(true)}
        onProfileClick={() => setShowProfile(true)}
        categories={categories}
        onCategorySelect={handleCategoryClick}
      />

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-24">
            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-2xl text-gray-300 font-bold">جاري التحميل...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map(category => {
              const categoryItems = items.filter(item => item.category_id === category.id);
              return (
                <div key={category.id} id={`category-${category.id}`}>
                  <CategorySection
                    category={category}
                    items={categoryItems}
                    onAddToCart={handleAddToCart}
                  />
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Cart
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      <Checkout
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        total={totalAmount}
        onConfirm={handleConfirmOrder}
      />

      <CustomerProfile
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        customerPhone={customerPhone}
      />

      {showOperatorLogin && (
        <OperatorLogin onClose={() => setShowOperatorLogin(false)} />
      )}

      <footer className="bg-gray-900 border-t-2 border-gray-700 mt-16 py-8">
        <div className="container mx-auto text-center">
          <p className="text-gray-300 text-lg font-bold">MEZZO - Level Up Your Taste!</p>
          <p className="text-gray-500 mt-2">جميع الحقوق محفوظة © 2024</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
