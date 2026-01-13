import { useState } from 'react';
import { LogOut, Package, ShoppingBag, BarChart3, Settings, List } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import OrdersManagement from './operator/OrdersManagement';
import ItemsManagement from './operator/ItemsManagement';
import Analytics from './operator/Analytics';
import SettingsPanel from './operator/SettingsPanel';

type Tab = 'orders' | 'items' | 'analytics' | 'settings';

export default function OperatorDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('orders');

  const tabs = [
    { id: 'orders' as Tab, label: 'الطلبات', icon: Package },
    { id: 'items' as Tab, label: 'الأصناف', icon: ShoppingBag },
    { id: 'analytics' as Tab, label: 'الإحصائيات', icon: BarChart3 },
    { id: 'settings' as Tab, label: 'الإعدادات', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <header className="bg-purple-900/80 backdrop-blur-sm border-b-2 border-purple-500 sticky top-0 z-40 shadow-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-bold"
            >
              <LogOut className="w-5 h-5" />
              <span>خروج</span>
            </button>

            <h1 className="text-3xl font-black text-white flex items-center gap-2">
              <List className="w-8 h-8" />
              لوحة التحكم
            </h1>

            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="bg-gray-800/50 rounded-xl border-2 border-purple-500/50 p-2 mb-6 flex gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 font-bold ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-700/50 text-purple-300 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="bg-gray-800/30 rounded-xl border-2 border-purple-500/30 p-6">
          {activeTab === 'orders' && <OrdersManagement />}
          {activeTab === 'items' && <ItemsManagement />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'settings' && <SettingsPanel />}
        </div>
      </div>
    </div>
  );
}