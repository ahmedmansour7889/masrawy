import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { Home, Search, PlusSquare, Heart, User, Settings, LogOut, MessageCircle, Compass } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/home" className="text-2xl font-bold text-blue-800">
              المصراوي
            </Link>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link to="/notifications" className="text-gray-600 hover:text-blue-600 relative">
                <Heart className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Link>
              <Link to="/messages" className="text-gray-600 hover:text-blue-600 relative">
                <MessageCircle className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></span>
              </Link>
              <Link to="/create-post" className="text-gray-600 hover:text-blue-600">
                <PlusSquare className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center h-16 px-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-blue-800">المصراوي</h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
              <Link
                to="/home"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/home')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Home className="w-5 h-5 ml-3" />
                الرئيسية
              </Link>
              <Link
                to="/search"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/search')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Search className="w-5 h-5 ml-3" />
                البحث
              </Link>
              <Link
                to="/explore"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/explore')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Compass className="w-5 h-5 ml-3" />
                استكشاف
              </Link>
              <Link
                to="/messages"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors relative ${
                  isActive('/messages')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <MessageCircle className="w-5 h-5 ml-3" />
                الرسائل
                <span className="absolute top-2 left-2 w-2 h-2 bg-blue-500 rounded-full"></span>
              </Link>
              <Link
                to="/notifications"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors relative ${
                  isActive('/notifications')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Heart className="w-5 h-5 ml-3" />
                الإشعارات
                <span className="absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </Link>
              <Link
                to="/create-post"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/create-post')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <PlusSquare className="w-5 h-5 ml-3" />
                منشور جديد
              </Link>
              <Link
                to={`/profile/${user?.user_metadata?.username || 'me'}`}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname.startsWith('/profile')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User className="w-5 h-5 ml-3" />
                الملف الشخصي
              </Link>
              <Link
                to="/settings"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/settings')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-5 h-5 ml-3" />
                الإعدادات
              </Link>
            </nav>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5 ml-3" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:mr-64">
          <Outlet />
        </main>

        {/* Mobile Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="flex justify-around py-2">
            <Link
              to="/home"
              className={`flex flex-col items-center px-2 py-2 text-xs ${
                isActive('/home') ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="mt-1">الرئيسية</span>
            </Link>
            <Link
              to="/search"
              className={`flex flex-col items-center px-2 py-2 text-xs ${
                isActive('/search') ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <Search className="w-6 h-6" />
              <span className="mt-1">البحث</span>
            </Link>
            <Link
              to="/explore"
              className={`flex flex-col items-center px-2 py-2 text-xs ${
                isActive('/explore') ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <Compass className="w-6 h-6" />
              <span className="mt-1">استكشاف</span>
            </Link>
            <Link
              to="/messages"
              className={`flex flex-col items-center px-2 py-2 text-xs relative ${
                isActive('/messages') ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <MessageCircle className="w-6 h-6" />
              <span className="mt-1">الرسائل</span>
              <span className="absolute top-1 right-3 w-2 h-2 bg-blue-500 rounded-full"></span>
            </Link>
            <Link
              to={`/profile/${user?.user_metadata?.username || 'me'}`}
              className={`flex flex-col items-center px-2 py-2 text-xs ${
                location.pathname.startsWith('/profile') ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <User className="w-6 h-6" />
              <span className="mt-1">الملف</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}