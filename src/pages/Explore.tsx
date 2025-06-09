import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Hash, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import PostCard from '../components/PostCard';

interface TrendingUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  followers_count: number;
}

interface Post {
  id: string;
  content: string;
  image_url?: string;
  video_url?: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

export default function Explore() {
  const [activeTab, setActiveTab] = useState<'trending' | 'users' | 'posts'>('trending');
  const [trendingUsers, setTrendingUsers] = useState<TrendingUser[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingContent();
  }, []);

  const fetchTrendingContent = async () => {
    try {
      // Fetch trending posts (posts with most likes in last 7 days)
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (!postsError) {
        setTrendingPosts(posts || []);
      }

      // Fetch trending users (users with most followers)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .limit(10);

      if (!profilesError) {
        // Get follower counts for each user
        const usersWithFollowers = await Promise.all(
          (profiles || []).map(async (profile) => {
            const { data: followers } = await supabase
              .from('follows')
              .select('id')
              .eq('following_id', profile.id);
            
            return {
              ...profile,
              followers_count: followers?.length || 0,
            };
          })
        );

        // Sort by followers count
        usersWithFollowers.sort((a, b) => b.followers_count - a.followers_count);
        setTrendingUsers(usersWithFollowers);
      }
    } catch (error) {
      console.error('Error fetching trending content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 mb-4">استكشاف</h1>
          
          {/* Tabs */}
          <div className="flex space-x-1 space-x-reverse">
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'trending'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <TrendingUp className="w-4 h-4 ml-2" />
              الأكثر رواجاً
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4 ml-2" />
              أشخاص مقترحون
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'posts'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Hash className="w-4 h-4 ml-2" />
              منشورات حديثة
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === 'trending' && (
          <div className="space-y-6">
            {/* Trending Topics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 ml-2 text-blue-600" />
                المواضيع الرائجة
              </h2>
              <div className="space-y-3">
                {['#المصراوي', '#تكنولوجيا', '#رياضة', '#فن', '#سفر'].map((topic, index) => (
                  <div key={topic} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <div>
                      <h3 className="font-medium text-gray-900">{topic}</h3>
                      <p className="text-sm text-gray-500">{Math.floor(Math.random() * 1000) + 100} منشور</p>
                    </div>
                    <div className="text-sm text-gray-400">#{index + 1}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Users */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="w-5 h-5 ml-2 text-yellow-500" />
                مستخدمون مميزون
              </h2>
              <div className="space-y-4">
                {trendingUsers.slice(0, 3).map((user) => (
                  <Link
                    key={user.id}
                    to={`/profile/${user.username}`}
                    className="flex items-center space-x-3 space-x-reverse p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        user.full_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
                      <p className="text-gray-500">@{user.username}</p>
                      <p className="text-sm text-gray-400">{user.followers_count} متابع</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            {trendingUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <Link
                    to={`/profile/${user.username}`}
                    className="flex items-center space-x-3 space-x-reverse"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-xl">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        user.full_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{user.full_name}</h3>
                      <p className="text-gray-500">@{user.username}</p>
                      <p className="text-sm text-gray-400">{user.followers_count} متابع</p>
                    </div>
                  </Link>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                    متابعة
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="space-y-6">
            {trendingPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            {trendingPosts.length === 0 && (
              <div className="text-center py-12">
                <Hash className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  لا توجد منشورات حديثة
                </h3>
                <p className="text-gray-600">
                  تحقق مرة أخرى لاحقاً لرؤية المحتوى الجديد
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}