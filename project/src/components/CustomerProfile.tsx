import { useState, useEffect } from 'react';
import { X, Package, Clock, Truck, CheckCircle, XCircle, AlertTriangle, StickyNote } from 'lucide-react';
import { supabase, Order, OrderItem, CustomerNote } from '../lib/supabase';

interface CustomerProfileProps {
  isOpen: boolean;
  onClose: () => void;
  customerPhone: string;
}

interface OrderWithDetails extends Order {
  items: OrderItem[];
  notes: CustomerNote[];
}

export default function CustomerProfile({ isOpen, onClose, customerPhone }: CustomerProfileProps) {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (isOpen && customerPhone) {
      fetchOrders();
    }
  }, [isOpen, customerPhone]);

  const fetchOrders = async () => {
    setLoading(true);

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', customerPhone)
      .maybeSingle();

    if (!customer) {
      setLoading(false);
      return;
    }

    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false });

    if (ordersData) {
      const ordersWithDetails = await Promise.all(
        ordersData.map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

          const { data: notes } = await supabase
            .from('customer_notes')
            .select('*')
            .eq('order_id', order.id);

          return {
            ...order,
            items: items || [],
            notes: notes || []
          };
        })
      );

      setOrders(ordersWithDetails);
    }

    setLoading(false);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!cancelReason.trim()) {
      alert('الرجاء إدخال سبب الإلغاء');
      return;
    }

    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (order.status === 'on_way' || order.status === 'arrived') {
      const confirm = window.confirm(
        'تنبيه: إلغاء الطلب الآن سيسبب خسائر على الشركة. هل أنت متأكد من الإلغاء؟'
      );
      if (!confirm) {
        return;
      }
    }

    await supabase
      .from('orders')
      .update({
        status: 'cancellation_pending',
        cancellation_reason: cancelReason,
        cancelled_by: 'customer',
        cancellation_stage: order.status
      })
      .eq('id', orderId);

    setCancelOrderId(null);
    setCancelReason('');
    fetchOrders();
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'under_review':
        return { icon: Clock, text: 'قيد المعاينة', color: 'text-yellow-400' };
      case 'preparing':
        return { icon: Package, text: 'قيد التحضير', color: 'text-blue-400' };
      case 'on_way':
        return { icon: Truck, text: 'في الطريق', color: 'text-purple-400' };
      case 'arrived':
        return { icon: AlertTriangle, text: 'وصل الآن', color: 'text-orange-400' };
      case 'completed':
        return { icon: CheckCircle, text: 'تم التسليم والدفع', color: 'text-green-400' };
      case 'cancelled':
        return { icon: XCircle, text: 'ملغي', color: 'text-red-400' };
      case 'cancellation_pending':
        return { icon: Clock, text: 'إلغاء قيد المعاينة', color: 'text-yellow-400' };
      default:
        return { icon: Package, text: status, color: 'text-gray-400' };
    }
  };

  const canCancel = (status: string) => {
    return status === 'under_review' || status === 'preparing' || status === 'on_way' || status === 'arrived';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl border-2 border-purple-500 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl my-8">
        <div className="bg-purple-800/50 p-4 flex items-center justify-between border-b-2 border-purple-500">
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-500 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <h2 className="text-2xl font-black text-white">طلباتي</h2>
          <div className="w-10"></div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-purple-300 mt-4">جاري التحميل...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-24 h-24 text-purple-400/50 mx-auto mb-4" />
              <p className="text-2xl text-purple-300 font-bold">لا توجد طلبات</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <div
                    key={order.id}
                    className="bg-gray-800/50 border border-purple-500/30 rounded-xl p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-right flex-1">
                        <p className="text-purple-300 text-sm mb-1">رقم الطلب</p>
                        <p className="text-white font-bold text-lg">{order.order_number}</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {new Date(order.created_at).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      <div className={`flex items-center gap-2 ${statusInfo.color}`}>
                        <span className="font-bold">{statusInfo.text}</span>
                        <StatusIcon className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="border-t border-purple-500/30 pt-4 mb-4">
                      <h4 className="text-white font-bold mb-2 text-right">الأصناف:</h4>
                      <div className="space-y-2">
                        {order.items.map(item => (
                          <div key={item.id} className="flex items-center justify-between text-sm bg-gray-900/50 p-2 rounded">
                            <span className="text-purple-400 font-bold">{item.subtotal} ج</span>
                            <div className="text-right">
                              <span className="text-white">{item.item_name}</span>
                              <span className="text-gray-400 mr-2">x{item.quantity}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {order.notes.length > 0 && (
                      <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 mb-2 justify-end">
                          <span className="text-yellow-300 font-bold">ملاحظات</span>
                          <StickyNote className="w-5 h-5 text-yellow-300" />
                        </div>
                        {order.notes.map(note => (
                          <p key={note.id} className="text-yellow-200 text-sm text-right">
                            {note.note}
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-purple-500/30 pt-4">
                      {canCancel(order.status) && order.status !== 'cancellation_pending' && (
                        <button
                          onClick={() => setCancelOrderId(order.id)}
                          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors font-bold"
                        >
                          إلغاء الطلب
                        </button>
                      )}
                      {order.status === 'cancellation_pending' && (
                        <div className="bg-yellow-900/30 text-yellow-300 px-4 py-2 rounded-lg text-sm">
                          في انتظار مراجعة الإلغاء
                        </div>
                      )}
                      <div className="text-2xl font-black text-white">
                        {order.total_amount} <span className="text-lg">ج</span>
                      </div>
                    </div>

                    {cancelOrderId === order.id && (
                      <div className="mt-4 bg-red-900/20 border border-red-500 rounded-lg p-4">
                        <label className="block text-red-300 mb-2 text-right">سبب الإلغاء</label>
                        <textarea
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          className="w-full bg-gray-800 border border-red-500 rounded-lg p-3 text-white text-right resize-none"
                          rows={3}
                          placeholder="الرجاء كتابة سبب الإلغاء..."
                          dir="rtl"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              setCancelOrderId(null);
                              setCancelReason('');
                            }}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                          >
                            إلغاء
                          </button>
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg transition-colors font-bold"
                          >
                            تأكيد الإلغاء
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}