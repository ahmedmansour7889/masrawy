import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import PostCard from '../components/PostCard';
import TrendingSection from '../components/TrendingSection';
import SuggestedUsers from '../components/SuggestedUsers';
import { useAuth } from '../contexts/AuthContext';
import { RefreshCw, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

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

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'following' | 'all'>('all');

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `);

      if (activeTab === 'following') {
        // Get posts from users that current user follows
        const { data: following } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user?.id);

        const followingIds = following?.map(f => f.following_id) || [];
        if (followingIds.length > 0) {
          query = query.in('user_id', followingIds);
        } else {
          // If not following anyone, show empty state
          setPosts([]);
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        setPosts(data || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
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
      <div className="bg-white border-b border-gray-200 sticky top-0 lg:top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <h1 className="text-xl font-bold text-gray-900 lg:hidden">المصراوي</h1>
              <div className="hidden lg:flex space-x-1 space-x-reverse">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'all'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4 ml-2 inline" />
                  الكل
                </button>
                <button
                  onClick={() => setActiveTab('following')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'following'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  المتابعون
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <Link
                to="/create-post"
                className="lg:hidden p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          {/* Mobile Tabs */}
          <div className="lg:hidden flex space-x-1 space-x-reverse mt-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 text-center rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`flex-1 py-2 text-center rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'following'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              المتابعون
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Quick Post (Desktop) */}
            <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex space-x-4 space-x-reverse">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                  {user?.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Your avatar"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    user?.user_metadata?.full_name?.charAt(0).toUpperCase() || 'أ'
                  )}
                </div>
                <Link
                  to="/create-post"
                  className="flex-1 p-4 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  ما الذي تريد مشاركته؟
                </Link>
              </div>
            </div>

            {/* Posts Feed */}
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">
                  {activeTab === 'following' ? '👥' : '📱'}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'following' 
                    ? 'لا توجد منشورات من المتابعين'
                    : 'لا توجد منشورات حتى الآن'
                  }
                </h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === 'following'
                    ? 'ابدأ بمتابعة أشخاص لرؤية منشوراتهم هنا'
                    : 'ابدأ بمتابعة أشخاص أو انشر محتوى جديد!'
                  }
                </p>
                {activeTab === 'following' && (
                  <Link
                    to="/explore"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    اكتشف أشخاص جدد
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-4 space-y-6">
            <TrendingSection />
            <SuggestedUsers />
            
            {/* Footer */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center text-gray-500 text-sm space-y-2">
                <p className="font-semibold text-blue-800">المصراوي</p>
                <p>منصة التواصل الاجتماعي المصرية</p>
                <div className="flex justify-center space-x-4 space-x-reverse text-xs">
                  <button className="text-blue-600 hover:text-blue-700">حول</button>
                  <button className="text-blue-600 hover:text-blue-700">الخصوصية</button>
                  <button className="text-blue-600 hover:text-blue-700">الشروط</button>
                  <button className="text-blue-600 hover:text-blue-700">المساعدة</button>
                </div>
                <p className="text-xs">© 2024 المصراوي. جميع الحقوق محفوظة.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}