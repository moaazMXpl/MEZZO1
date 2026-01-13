import { useState, useEffect } from 'react';
import { supabase, Order, OrderItem, Customer, CustomerNote } from '../../lib/supabase';
import { Clock, Package, Truck, CheckCircle, XCircle, AlertTriangle, StickyNote, User, Phone, MapPin } from 'lucide-react';

interface OrderWithDetails extends Order {
  items: OrderItem[];
  customer: Customer | null;
  notes: CustomerNote[];
}

export default function OrdersManagement() {
  const [activeOrders, setActiveOrders] = useState<OrderWithDetails[]>([]);
  const [completedOrders, setCompletedOrders] = useState<OrderWithDetails[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [noteText, setNoteText] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetchOrders();

    const ordersChannel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      ordersChannel.unsubscribe();
    };
  }, []);

  const fetchOrders = async () => {
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersData) {
      const ordersWithDetails = await Promise.all(
        ordersData.map(async (order) => {
          const [{ data: items }, { data: customer }, { data: notes }] = await Promise.all([
            supabase.from('order_items').select('*').eq('order_id', order.id),
            supabase.from('customers').select('*').eq('id', order.customer_id).maybeSingle(),
            supabase.from('customer_notes').select('*').eq('order_id', order.id)
          ]);

          return {
            ...order,
            items: items || [],
            customer: customer || null,
            notes: notes || []
          };
        })
      );

      setActiveOrders(ordersWithDetails.filter(o => !['completed', 'cancelled'].includes(o.status)));
      setCompletedOrders(ordersWithDetails.filter(o => ['completed', 'cancelled'].includes(o.status)));
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    fetchOrders();
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!cancelReason.trim()) {
      alert('الرجاء إدخال سبب الإلغاء');
      return;
    }

    await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancellation_reason: cancelReason,
        cancelled_by: 'operator',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    setShowCancelModal(false);
    setCancelReason('');
    fetchOrders();
  };

  const handleCancellationRequest = async (orderId: string, approve: boolean) => {
    if (approve) {
      await supabase
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', orderId);
    } else {
      await supabase
        .from('orders')
        .update({
          status: 'under_review',
          cancellation_reason: '',
          cancelled_by: '',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
    }

    fetchOrders();
  };

  const addCustomerNote = async () => {
    if (!selectedOrder || !noteText.trim()) return;

    await supabase.from('customer_notes').insert([{
      customer_id: selectedOrder.customer_id,
      order_id: selectedOrder.id,
      note: noteText,
      created_by: 'operator'
    }]);

    setNoteText('');
    fetchOrders();
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'under_review':
        return { icon: Clock, text: 'قيد المعاينة', color: 'bg-yellow-600', textColor: 'text-yellow-400' };
      case 'preparing':
        return { icon: Package, text: 'قيد التحضير', color: 'bg-blue-600', textColor: 'text-blue-400' };
      case 'on_way':
        return { icon: Truck, text: 'في الطريق', color: 'bg-purple-600', textColor: 'text-purple-400' };
      case 'arrived':
        return { icon: AlertTriangle, text: 'وصل الآن', color: 'bg-orange-600', textColor: 'text-orange-400' };
      case 'completed':
        return { icon: CheckCircle, text: 'مكتمل', color: 'bg-green-600', textColor: 'text-green-400' };
      case 'cancelled':
        return { icon: XCircle, text: 'ملغي', color: 'bg-red-600', textColor: 'text-red-400' };
      case 'cancellation_pending':
        return { icon: Clock, text: 'طلب إلغاء', color: 'bg-yellow-600', textColor: 'text-yellow-400' };
      default:
        return { icon: Package, text: status, color: 'bg-gray-600', textColor: 'text-gray-400' };
    }
  };

  const renderOrderCard = (order: OrderWithDetails) => {
    const statusInfo = getStatusInfo(order.status);
    const StatusIcon = statusInfo.icon;

    return (
      <div
        key={order.id}
        className="bg-gray-900/50 border-2 border-purple-500/30 rounded-xl p-6 hover:border-purple-400 transition-all"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 text-right">
            <div className="flex items-center justify-end gap-2 mb-2">
              <h3 className="text-xl font-bold text-white">{order.order_number}</h3>
              {order.status === 'cancellation_pending' && (
                <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                  طلب إلغاء!
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm">
              {new Date(order.created_at).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div className={`${statusInfo.color} text-white px-4 py-2 rounded-lg flex items-center gap-2`}>
            <span className="font-bold">{statusInfo.text}</span>
            <StatusIcon className="w-5 h-5" />
          </div>
        </div>

        {order.customer && (
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-4">
            <div className="space-y-2 text-right">
              <div className="flex items-center justify-end gap-2 text-white">
                <span>{order.customer.name}</span>
                <User className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex items-center justify-end gap-2 text-purple-300" dir="ltr">
                <span>{order.customer.phone}</span>
                <Phone className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex items-center justify-end gap-2 text-purple-300">
                <span>{order.customer.street}, {order.customer.area}, {order.customer.city}</span>
                <MapPin className="w-4 h-4 text-purple-400" />
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-purple-500/30 pt-4 mb-4">
          <h4 className="text-white font-bold mb-2 text-right">الأصناف:</h4>
          <div className="space-y-2">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm bg-gray-800/50 p-2 rounded">
                <span className="text-purple-400 font-bold">{item.subtotal} ج</span>
                <div className="text-right">
                  <span className="text-white">{item.item_name}</span>
                  <span className="text-gray-400 mr-2">x{item.quantity}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-purple-500/30">
            <span className="text-2xl font-black text-white">{order.total_amount} ج</span>
            <span className="text-purple-300 font-bold">المجموع</span>
          </div>
        </div>

        {order.notes.length > 0 && (
          <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-2 justify-end">
              <span className="text-yellow-300 font-bold">الملاحظات</span>
              <StickyNote className="w-5 h-5 text-yellow-300" />
            </div>
            {order.notes.map(note => (
              <p key={note.id} className="text-yellow-200 text-sm text-right mb-1">
                • {note.note}
              </p>
            ))}
          </div>
        )}

        {order.status === 'cancellation_pending' && (
          <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4 mb-4">
            <p className="text-yellow-300 text-right mb-2 font-bold">العميل يريد إلغاء الطلب</p>
            <p className="text-yellow-200 text-right text-sm mb-3">السبب: {order.cancellation_reason}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleCancellationRequest(order.id, false)}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg transition-colors font-bold"
              >
                رفض الإلغاء
              </button>
              <button
                onClick={() => handleCancellationRequest(order.id, true)}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg transition-colors font-bold"
              >
                موافقة على الإلغاء
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {order.status === 'under_review' && (
            <>
              <button
                onClick={() => updateOrderStatus(order.id, 'preparing')}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg transition-colors font-bold"
              >
                قيد التحضير
              </button>
              <button
                onClick={() => {
                  setSelectedOrder(order);
                  setShowCancelModal(true);
                }}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors font-bold"
              >
                إلغاء
              </button>
            </>
          )}

          {order.status === 'preparing' && (
            <>
              <button
                onClick={() => updateOrderStatus(order.id, 'on_way')}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg transition-colors font-bold"
              >
                في الطريق
              </button>
              <button
                onClick={() => {
                  setSelectedOrder(order);
                  setShowCancelModal(true);
                }}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors font-bold"
              >
                إلغاء
              </button>
            </>
          )}

          {order.status === 'on_way' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'arrived')}
              className="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-2 rounded-lg transition-colors font-bold"
            >
              وصل الآن
            </button>
          )}

          {order.status === 'arrived' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'completed')}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg transition-colors font-bold"
            >
              تم التسليم والدفع
            </button>
          )}

          {!['completed', 'cancelled', 'cancellation_pending'].includes(order.status) && (
            <button
              onClick={() => setSelectedOrder(order)}
              className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg transition-colors font-bold flex items-center gap-2"
            >
              <StickyNote className="w-4 h-4" />
              ملاحظة
            </button>
          )}
        </div>

        {selectedOrder?.id === order.id && !showCancelModal && (
          <div className="mt-4 bg-yellow-900/20 border border-yellow-500 rounded-lg p-4">
            <label className="block text-yellow-300 mb-2 text-right">إضافة ملاحظة للعميل</label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full bg-gray-800 border border-yellow-500 rounded-lg p-3 text-white text-right resize-none mb-2"
              rows={3}
              placeholder="اكتب ملاحظة..."
              dir="rtl"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setNoteText('');
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={addCustomerNote}
                className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white py-2 rounded-lg transition-colors font-bold"
              >
                حفظ الملاحظة
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setShowCompleted(false)}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              !showCompleted
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-700 text-purple-300 hover:bg-gray-600'
            }`}
          >
            الطلبات الحالية ({activeOrders.length})
          </button>
          <button
            onClick={() => setShowCompleted(true)}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              showCompleted
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-700 text-purple-300 hover:bg-gray-600'
            }`}
          >
            الطلبات السابقة ({completedOrders.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(showCompleted ? completedOrders : activeOrders).map(renderOrderCard)}
      </div>

      {showCancelModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border-2 border-red-500 p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4 text-right">إلغاء الطلب</h3>
            <label className="block text-red-300 mb-2 text-right">سبب الإلغاء</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full bg-gray-800 border border-red-500 rounded-lg p-3 text-white text-right resize-none mb-4"
              rows={4}
              placeholder="اكتب سبب الإلغاء..."
              dir="rtl"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setSelectedOrder(null);
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleCancelOrder(selectedOrder.id)}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg transition-colors font-bold"
              >
                تأكيد الإلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}