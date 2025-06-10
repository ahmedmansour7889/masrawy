import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface NotificationBadgeProps {
  children: React.ReactNode;
  type?: 'notifications' | 'messages';
}

export default function NotificationBadge({ children, type = 'notifications' }: NotificationBadgeProps) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    fetchCount();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel(`${type}_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: type === 'notifications' ? 'notifications' : 'messages',
          filter: type === 'notifications' ? `user_id=eq.${user.id}` : `sender_id=neq.${user.id}`,
        },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, type]);

  const fetchCount = async () => {
    if (!user) return;

    try {
      if (type === 'notifications') {
        const { data, error } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('read', false);

        if (!error) {
          setCount(data?.length || 0);
        }
      } else {
        // For messages, count unread conversations
        // This is a simplified version - in a real app you'd have proper unread message tracking
        setCount(Math.floor(Math.random() * 5)); // Simulated count
      }
    } catch (error) {
      console.error(`Error fetching ${type} count:`, error);
    }
  };

  return (
    <div className="relative">
      {children}
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </div>
  );
}