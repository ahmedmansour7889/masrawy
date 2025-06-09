import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, UserPlus, Bell, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false);

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-6 h-6 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-6 h-6 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-6 h-6 text-green-500" />;
      default:
        return <Bell className="w-6 h-6 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'الآن';
    } else if (diffHours < 24) {
      return `${diffHours} ساعة`;
    } else if (diffDays < 7) {
      return `${diffDays} يوم`;
    } else {
      return date.toLocaleDateString('ar-EG');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">الإشعارات</h1>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Check className="w-4 h-4 ml-1" />
                تحديد الكل كمقروء
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لا توجد إشعارات
            </h3>
            <p className="text-gray-600">
              ستظهر هنا الإشعارات عند تفاعل الآخرين مع منشوراتك
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border border-gray-200 rounded-lg transition-colors cursor-pointer ${
                  notification.read
                    ? 'bg-white hover:bg-gray-50'
                    : 'bg-blue-50 hover:bg-blue-100 border-blue-200'
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </h4>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.created_at)}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}