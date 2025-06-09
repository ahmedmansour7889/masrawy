import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Link as LinkIcon, Edit, UserPlus, UserMinus, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  bio: string;
  avatar_url?: string;
  created_at: string;
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

export default function Profile() {
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'likes'>('posts');

  const isOwnProfile = user?.user_metadata?.username === username;

  useEffect(() => {
    if (username) {
      fetchProfile();
      fetchPosts();
      fetchFollowStats();
    }
  }, [username, user?.id]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('profiles.username', username)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowStats = async () => {
    if (!profile?.id) return;

    try {
      // Get followers count
      const { data: followers } = await supabase
        .from('follows')
        .select('id')
        .eq('following_id', profile.id);

      // Get following count
      const { data: following } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', profile.id);

      // Check if current user follows this profile
      if (user?.id) {
        const { data: followStatus } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', profile.id)
          .single();

        setIsFollowing(!!followStatus);
      }

      setFollowersCount(followers?.length || 0);
      setFollowingCount(following?.length || 0);
    } catch (error) {
      console.error('Error fetching follow stats:', error);
    }
  };

  const handleFollow = async () => {
    if (!user || !profile) return;

    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id);
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: profile.id,
          });
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">المستخدم غير موجود</h3>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors ml-4"
            >
              <ArrowRight className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{profile.full_name}</h1>
              <p className="text-sm text-gray-500">{posts.length} منشور</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white border-b border-gray-200">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500"></div>
          
          {/* Profile Info */}
          <div className="px-4 pb-6">
            <div className="flex justify-between items-start -mt-16 mb-4">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  profile.full_name.charAt(0).toUpperCase()
                )}
              </div>
              
              <div className="mt-16">
                {isOwnProfile ? (
                  <Link
                    to="/edit-profile"
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="w-4 h-4 ml-2" />
                    تعديل الملف الشخصي
                  </Link>
                ) : (
                  <button
                    onClick={handleFollow}
                    className={`flex items-center px-6 py-2 rounded-full font-medium transition-colors ${
                      isFollowing
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="w-4 h-4 ml-2" />
                        إلغاء المتابعة
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 ml-2" />
                        متابعة
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
                <p className="text-gray-500">@{profile.username}</p>
              </div>

              {profile.bio && (
                <p className="text-gray-900 leading-relaxed">{profile.bio}</p>
              )}

              <div className="flex items-center space-x-4 space-x-reverse text-gray-500">
                <div className="flex items-center space-x-1 space-x-reverse">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    انضم في {new Date(profile.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-6 space-x-reverse">
                <div className="flex items-center space-x-1 space-x-reverse">
                  <span className="font-bold text-gray-900">{followingCount}</span>
                  <span className="text-gray-500">متابَع</span>
                </div>
                <div className="flex items-center space-x-1 space-x-reverse">
                  <span className="font-bold text-gray-900">{followersCount}</span>
                  <span className="text-gray-500">متابِع</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === 'posts'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              المنشورات
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === 'media'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              الوسائط
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === 'likes'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              الإعجابات
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-4 py-6">
          {activeTab === 'posts' && (
            <div className="space-y-6">
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    لا توجد منشورات بعد
                  </h3>
                  <p className="text-gray-600">
                    {isOwnProfile ? 'ابدأ بنشر محتوى جديد!' : 'لم ينشر هذا المستخدم أي محتوى بعد'}
                  </p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </div>
          )}

          {activeTab === 'media' && (
            <div className="grid grid-cols-3 gap-1">
              {posts
                .filter(post => post.image_url || post.video_url)
                .map((post) => (
                  <Link
                    key={post.id}
                    to={`/post/${post.id}`}
                    className="aspect-square bg-gray-200 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                  >
                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        alt="Post media"
                        className="w-full h-full object-cover"
                      />
                    ) : post.video_url ? (
                      <video
                        src={post.video_url}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </Link>
                ))}
              {posts.filter(post => post.image_url || post.video_url).length === 0 && (
                <div className="col-span-3 text-center py-12">
                  <div className="text-4xl mb-4">📷</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    لا توجد وسائط
                  </h3>
                  <p className="text-gray-600">
                    لم يتم نشر أي صور أو فيديوهات بعد
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'likes' && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">❤️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                الإعجابات خاصة
              </h3>
              <p className="text-gray-600">
                لا يمكن عرض الإعجابات للآخرين
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}