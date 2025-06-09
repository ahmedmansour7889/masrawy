import React, { useState } from 'react';
import { ArrowRight, Shield, Bell, Eye, Trash2, Key, User, Moon, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    follows: true,
    mentions: true,
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    messagePermissions: 'everyone',
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      // Handle account deletion
      console.log('Delete account');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors ml-4"
            >
              <ArrowRight className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">الإعدادات</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Account Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="w-5 h-5 ml-2 text-blue-600" />
              إعدادات الحساب
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            <button
              onClick={() => navigate('/edit-profile')}
              className="w-full p-4 text-right hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-900">تعديل الملف الشخصي</span>
                <ArrowRight className="w-5 h-5 text-gray-400 rotate-180" />
              </div>
            </button>
            <button className="w-full p-4 text-right hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Key className="w-5 h-5 text-gray-400 ml-3" />
                  <span className="text-gray-900">تغيير كلمة المرور</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 rotate-180" />
              </div>
            </button>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Shield className="w-5 h-5 ml-2 text-green-600" />
              الخصوصية والأمان
            </h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-900 font-medium">رؤية الملف الشخصي</h3>
                <p className="text-sm text-gray-500">من يمكنه رؤية ملفك الشخصي</p>
              </div>
              <select
                value={privacy.profileVisibility}
                onChange={(e) => setPrivacy({...privacy, profileVisibility: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="public">عام</option>
                <option value="followers">المتابعون فقط</option>
                <option value="private">خاص</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-900 font-medium">الرسائل المباشرة</h3>
                <p className="text-sm text-gray-500">من يمكنه إرسال رسائل لك</p>
              </div>
              <select
                value={privacy.messagePermissions}
                onChange={(e) => setPrivacy({...privacy, messagePermissions: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="everyone">الجميع</option>
                <option value="followers">المتابعون فقط</option>
                <option value="none">لا أحد</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Bell className="w-5 h-5 ml-2 text-yellow-600" />
              إعدادات الإشعارات
            </h2>
          </div>
          <div className="p-4 space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-900 font-medium">
                    {key === 'likes' && 'الإعجابات'}
                    {key === 'comments' && 'التعليقات'}
                    {key === 'follows' && 'المتابعات الجديدة'}
                    {key === 'mentions' && 'الإشارات'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {key === 'likes' && 'عندما يعجب أحد بمنشوراتك'}
                    {key === 'comments' && 'عندما يعلق أحد على منشوراتك'}
                    {key === 'follows' && 'عندما يتابعك أحد'}
                    {key === 'mentions' && 'عندما يشير إليك أحد'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setNotifications({...notifications, [key]: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* App Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Globe className="w-5 h-5 ml-2 text-purple-600" />
              إعدادات التطبيق
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Moon className="w-5 h-5 text-gray-400 ml-3" />
                <div>
                  <h3 className="text-gray-900 font-medium">الوضع المظلم</h3>
                  <p className="text-sm text-gray-500">تفعيل المظهر المظلم</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <button className="w-full p-4 text-right hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-gray-400 ml-3" />
                  <span className="text-gray-900">اللغة</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm ml-2">العربية</span>
                  <ArrowRight className="w-5 h-5 text-gray-400 rotate-180" />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow-sm border border-red-200">
          <div className="p-4 border-b border-red-200">
            <h2 className="text-lg font-semibold text-red-900 flex items-center">
              <Trash2 className="w-5 h-5 ml-2 text-red-600" />
              المنطقة الخطرة
            </h2>
          </div>
          <div className="p-4 space-y-4">
            <button
              onClick={handleSignOut}
              className="w-full p-3 text-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              تسجيل الخروج
            </button>
            <button
              onClick={handleDeleteAccount}
              className="w-full p-3 text-center bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
            >
              حذف الحساب نهائياً
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-center text-gray-500 text-sm space-y-2">
            <p>المصراوي - منصة التواصل الاجتماعي</p>
            <p>الإصدار 1.0.0</p>
            <div className="flex justify-center space-x-4 space-x-reverse">
              <button className="text-blue-600 hover:text-blue-700">سياسة الخصوصية</button>
              <button className="text-blue-600 hover:text-blue-700">شروط الاستخدام</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}