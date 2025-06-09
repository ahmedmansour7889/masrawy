import React, { useState, useEffect } from 'react';
import { Users, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SuggestedUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  followers_count: number;
}

export default function SuggestedUsers() {
  const { user } = useAuth();
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSuggestedUsers();
  }, [user]);

  const fetchSuggestedUsers = async () => {
    try {
      // Get users that current user is not following
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .neq('id', user?.id)
        .limit(5);

      if (error) throw error;

      // Get follower counts and check follow status
      const usersWithData = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: followers } = await supabase
            .from('follows')
            .select('id')
            .eq('following_id', profile.id);

          const { data: isFollowing } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', user?.id)
            .eq('following_id', profile.id)
            .single();

          return {
            ...profile,
            followers_count: followers?.length || 0,
            isFollowing: !!isFollowing,
          };
        })
      );

      // Filter out users already being followed and sort by followers
      const notFollowing = usersWithData
        .filter(user => !user.isFollowing)
        .sort((a, b) => b.followers_count - a.followers_count)
        .slice(0, 3);

      setSuggestedUsers(notFollowing);
    } catch (error) {
      console.error('Error fetching suggested users:', error);
    }
  };

  const handleFollow = async (userId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: userId,
        });

      setFollowingUsers(prev => new Set([...prev, userId]));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  if (suggestedUsers.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Users className="w-5 h-5 ml-2 text-green-600" />
        أشخاص مقترحون
      </h2>
      <div className="space-y-4">
        {suggestedUsers.map((suggestedUser) => (
          <div key={suggestedUser.id} className="flex items-center justify-between">
            <Link
              to={`/profile/${suggestedUser.username}`}
              className="flex items-center space-x-3 space-x-reverse flex-1"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                {suggestedUser.avatar_url ? (
                  <img
                    src={suggestedUser.avatar_url}
                    alt={suggestedUser.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  suggestedUser.full_name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {suggestedUser.full_name}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  @{suggestedUser.username}
                </p>
                <p className="text-xs text-gray-400">
                  {suggestedUser.followers_count} متابع
                </p>
              </div>
            </Link>
            <button
              onClick={() => handleFollow(suggestedUser.id)}
              disabled={followingUsers.has(suggestedUser.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                followingUsers.has(suggestedUser.id)
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {followingUsers.has(suggestedUser.id) ? 'تمت المتابعة' : 'متابعة'}
            </button>
          </div>
        ))}
      </div>
      <Link
        to="/explore"
        className="block mt-4 text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        عرض المزيد
      </Link>
    </div>
  );
}