import { useState, useEffect } from 'react';
import { X, CreditCard, Banknote, User, Phone, MapPin, Building } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onConfirm: (customerData: CustomerData, paymentMethod: 'cash' | 'instant_transfer') => void;
}

export interface CustomerData {
  name: string;
  phone: string;
  street: string;
  area: string;
  city: string;
}

export default function Checkout({ isOpen, onClose, total, onConfirm }: CheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'instant_transfer'>('cash');
  const [instantNumber, setInstantNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    phone: '',
    street: '',
    area: '',
    city: ''
  });

  useEffect(() => {
    const savedData = localStorage.getItem('customer_data');
    if (savedData) {
      setCustomerData(JSON.parse(savedData));
    }

    const fetchInstantNumber = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'instant_transfer_number')
          .maybeSingle();

        if (error) {
          console.warn('Error fetching instant transfer number:', error);
          return;
        }

        if (data) {
          setInstantNumber(data.value);
        }
      } catch (error) {
        console.warn('Error fetching instant transfer number:', error);
      }
    };

    fetchInstantNumber();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      localStorage.setItem('customer_data', JSON.stringify(customerData));
      await onConfirm(customerData, paymentMethod);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl border-2 border-purple-500 max-w-2xl w-full shadow-2xl my-8">
        <div className="bg-purple-800/50 p-4 flex items-center justify-between border-b-2 border-purple-500">
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-500 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <h2 className="text-2xl font-black text-white">إتمام الطلب</h2>
          <div className="w-10"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-purple-900/30 border border-purple-500/50 rounded-xl p-4 text-center">
            <p className="text-purple-300 mb-1">المجموع الكلي</p>
            <p className="text-4xl font-black text-white">{total} <span className="text-2xl">ج</span></p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white text-right border-b border-purple-500 pb-2">بياناتك</h3>

            <div>
              <label className="block text-purple-300 mb-2 text-right flex items-center justify-end gap-2">
                <span>الاسم</span>
                <User className="w-4 h-4" />
              </label>
              <input
                type="text"
                required
                value={customerData.name}
                onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                className="w-full bg-gray-800 border-2 border-purple-500/50 rounded-lg px-4 py-3 text-white text-right focus:outline-none focus:border-purple-400"
                placeholder="أدخل اسمك"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-purple-300 mb-2 text-right flex items-center justify-end gap-2">
                <span>رقم الهاتف</span>
                <Phone className="w-4 h-4" />
              </label>
              <input
                type="tel"
                required
                value={customerData.phone}
                onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                className="w-full bg-gray-800 border-2 border-purple-500/50 rounded-lg px-4 py-3 text-white text-right focus:outline-none focus:border-purple-400"
                placeholder="رقم الهاتف"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-purple-300 mb-2 text-right flex items-center justify-end gap-2">
                <span>الشارع</span>
                <MapPin className="w-4 h-4" />
              </label>
              <input
                type="text"
                required
                value={customerData.street}
                onChange={(e) => setCustomerData({ ...customerData, street: e.target.value })}
                className="w-full bg-gray-800 border-2 border-purple-500/50 rounded-lg px-4 py-3 text-white text-right focus:outline-none focus:border-purple-400"
                placeholder="الشارع"
                dir="rtl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-purple-300 mb-2 text-right flex items-center justify-end gap-2">
                  <span>المدينة</span>
                  <Building className="w-4 h-4" />
                </label>
                <input
                  type="text"
                  required
                  value={customerData.city}
                  onChange={(e) => setCustomerData({ ...customerData, city: e.target.value })}
                  className="w-full bg-gray-800 border-2 border-purple-500/50 rounded-lg px-4 py-3 text-white text-right focus:outline-none focus:border-purple-400"
                  placeholder="المدينة"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-purple-300 mb-2 text-right flex items-center justify-end gap-2">
                  <span>المنطقة</span>
                  <Building className="w-4 h-4" />
                </label>
                <input
                  type="text"
                  required
                  value={customerData.area}
                  onChange={(e) => setCustomerData({ ...customerData, area: e.target.value })}
                  className="w-full bg-gray-800 border-2 border-purple-500/50 rounded-lg px-4 py-3 text-white text-right focus:outline-none focus:border-purple-400"
                  placeholder="المنطقة"
                  dir="rtl"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white text-right border-b border-purple-500 pb-2">طريقة الدفع</h3>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-purple-600 border-purple-400 shadow-lg shadow-purple-500/50'
                    : 'bg-gray-800 border-purple-500/30 hover:border-purple-400'
                }`}
              >
                <Banknote className="w-8 h-8 text-white mx-auto mb-2" />
                <p className="text-white font-bold">نقدي</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('instant_transfer')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'instant_transfer'
                    ? 'bg-purple-600 border-purple-400 shadow-lg shadow-purple-500/50'
                    : 'bg-gray-800 border-purple-500/30 hover:border-purple-400'
                }`}
              >
                <CreditCard className="w-8 h-8 text-white mx-auto mb-2" />
                <p className="text-white font-bold">تحويل فوري</p>
              </button>
            </div>

            {paymentMethod === 'instant_transfer' && instantNumber && (
              <div className="bg-purple-900/30 border border-purple-500/50 rounded-xl p-4 text-center">
                <p className="text-purple-300 mb-2">رقم التحويل الفوري</p>
                <p className="text-2xl font-black text-white" dir="ltr">{instantNumber}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-4 rounded-xl font-black text-xl transition-all transform hover:scale-105 shadow-lg ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                جاري المعالجة...
              </span>
            ) : (
              'تأكيد الطلب'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}