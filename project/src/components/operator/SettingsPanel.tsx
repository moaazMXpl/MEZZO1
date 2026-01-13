import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Lock, CreditCard, Save, Keyboard } from 'lucide-react';

export default function SettingsPanel() {
  const [instantNumber, setInstantNumber] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldCheatCode, setOldCheatCode] = useState('');
  const [newCheatCode, setNewCheatCode] = useState('');
  const [confirmCheatCode, setConfirmCheatCode] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('settings')
      .select('key, value');

    if (data) {
      const instantNumberSetting = data.find(s => s.key === 'instant_transfer_number');
      if (instantNumberSetting) {
        setInstantNumber(instantNumberSetting.value);
      }
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUpdateInstantNumber = async () => {
    if (!instantNumber.trim()) {
      showMessage('الرجاء إدخال رقم صحيح', 'error');
      return;
    }

    await supabase
      .from('settings')
      .update({ value: instantNumber, updated_at: new Date().toISOString() })
      .eq('key', 'instant_transfer_number');

    showMessage('تم تحديث رقم التحويل الفوري بنجاح', 'success');
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showMessage('الرجاء ملء جميع الحقول', 'error');
      return;
    }

    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'admin_password')
      .maybeSingle();

    if (data?.value !== oldPassword) {
      showMessage('كلمة المرور القديمة غير صحيحة', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('كلمة المرور الجديدة غير متطابقة', 'error');
      return;
    }

    if (newPassword.length < 8) {
      showMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل', 'error');
      return;
    }

    await supabase
      .from('settings')
      .update({ value: newPassword, updated_at: new Date().toISOString() })
      .eq('key', 'admin_password');

    showMessage('تم تغيير كلمة المرور بنجاح', 'success');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleChangeCheatCode = async () => {
    if (!oldCheatCode || !newCheatCode || !confirmCheatCode) {
      showMessage('الرجاء ملء جميع الحقول', 'error');
      return;
    }

    if (oldCheatCode !== 'admin123123') {
      showMessage('الشفرة القديمة غير صحيحة', 'error');
      return;
    }

    if (newCheatCode !== confirmCheatCode) {
      showMessage('الشفرة الجديدة غير متطابقة', 'error');
      return;
    }

    if (newCheatCode.length < 5) {
      showMessage('الشفرة يجب أن تكون 5 أحرف على الأقل', 'error');
      return;
    }

    await supabase
      .from('settings')
      .update({ value: newCheatCode, updated_at: new Date().toISOString() })
      .eq('key', 'cheat_code');

    showMessage('تم تغيير الشفرة السرية بنجاح', 'success');
    setOldCheatCode('');
    setNewCheatCode('');
    setConfirmCheatCode('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-white text-right mb-6">الإعدادات</h2>

      {message && (
        <div
          className={`p-4 rounded-lg border-2 text-center font-bold ${
            messageType === 'success'
              ? 'bg-green-900/20 border-green-500 text-green-300'
              : 'bg-red-900/20 border-red-500 text-red-300'
          }`}
        >
          {message}
        </div>
      )}

      <div className="bg-gray-900/50 border-2 border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center justify-end gap-2 mb-6">
          <h3 className="text-2xl font-bold text-white">رقم التحويل الفوري</h3>
          <CreditCard className="w-6 h-6 text-purple-400" />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-purple-300 mb-2 text-right">رقم الهاتف للتحويل الفوري</label>
            <input
              type="text"
              value={instantNumber}
              onChange={(e) => setInstantNumber(e.target.value)}
              className="w-full bg-gray-800 border-2 border-purple-500/50 rounded-lg px-4 py-3 text-white text-right"
              placeholder="01000000000"
              dir="ltr"
            />
          </div>

          <button
            onClick={handleUpdateInstantNumber}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-lg transition-colors font-bold flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            حفظ التغييرات
          </button>
        </div>
      </div>

      <div className="bg-gray-900/50 border-2 border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center justify-end gap-2 mb-6">
          <h3 className="text-2xl font-bold text-white">تغيير كلمة المرور</h3>
          <Lock className="w-6 h-6 text-purple-400" />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-purple-300 mb-2 text-right">كلمة المرور القديمة</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full bg-gray-800 border-2 border-purple-500/50 rounded-lg px-4 py-3 text-white text-right"
              placeholder="أدخل كلمة المرور القديمة"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-purple-300 mb-2 text-right">كلمة المرور الجديدة</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-gray-800 border-2 border-purple-500/50 rounded-lg px-4 py-3 text-white text-right"
              placeholder="أدخل كلمة المرور الجديدة"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-purple-300 mb-2 text-right">تأكيد كلمة المرور الجديدة</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-gray-800 border-2 border-purple-500/50 rounded-lg px-4 py-3 text-white text-right"
              placeholder="أعد إدخال كلمة المرور الجديدة"
              dir="rtl"
            />
          </div>

          <button
            onClick={handleChangePassword}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-lg transition-colors font-bold flex items-center justify-center gap-2"
          >
            <Lock className="w-5 h-5" />
            تغيير كلمة المرور
          </button>
        </div>
      </div>

      <div className="bg-gray-900/50 border-2 border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center justify-end gap-2 mb-6">
          <h3 className="text-2xl font-bold text-white">تغيير الشفرة السرية</h3>
          <Keyboard className="w-6 h-6 text-purple-400" />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-purple-300 mb-2 text-right">الشفرة القديمة</label>
            <input
              type="password"
              value={oldCheatCode}
              onChange={(e) => setOldCheatCode(e.target.value)}
              className="w-full bg-gray-800 border-2 border-purple-500/50 rounded-lg px-4 py-3 text-white text-right"
              placeholder="أدخل الشفرة القديمة"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-purple-300 mb-2 text-right">الشفرة الجديدة</label>
            <input
              type="password"
              value={newCheatCode}
              onChange={(e) => setNewCheatCode(e.target.value)}
              className="w-full bg-gray-800 border-2 border-purple-500/50 rounded-lg px-4 py-3 text-white text-right"
              placeholder="أدخل الشفرة الجديدة"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-purple-300 mb-2 text-right">تأكيد الشفرة الجديدة</label>
            <input
              type="password"
              value={confirmCheatCode}
              onChange={(e) => setConfirmCheatCode(e.target.value)}
              className="w-full bg-gray-800 border-2 border-purple-500/50 rounded-lg px-4 py-3 text-white text-right"
              placeholder="أعد إدخال الشفرة الجديدة"
              dir="rtl"
            />
          </div>

          <button
            onClick={handleChangeCheatCode}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-lg transition-colors font-bold flex items-center justify-center gap-2"
          >
            <Keyboard className="w-5 h-5" />
            تغيير الشفرة السرية
          </button>
        </div>
      </div>
    </div>
  );
}