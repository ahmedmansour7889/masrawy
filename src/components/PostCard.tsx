import React, { useState, useEffect } from 'react';
import { MessageCircle, Share, MoreHorizontal, MapPin, Eye, Edit, Trash2, Flag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ReactionButton from './ReactionButton';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    image_url?: string;
    video_url?: string;
    media_type?: string;
    privacy_level?: string;
    created_at: string;
    updated_at?: string;
    user_id: string;
    profiles: {
      username: string;
      full_name: string;
      avatar_url?: string;
      is_verified?: boolean;
    };
  };
  showComments?: boolean;
  onDelete?: (postId: string) => void;
}

export default function PostCard({ post, showComments = false, onDelete }: PostCardProps) {
  const { user } = useAuth();
  const [commentsCount, setCommentsCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const isOwnPost = user?.id === post.user_id;

  useEffect(() => {
    fetchPostStats();
  }, [post.id]);

  const fetchPostStats = async () => {
    try {
      // Get comments count
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('id')
        .eq('post_id', post.id);

      if (!commentsError && comments) {
        setCommentsCount(comments.length);
      }
    } catch (error) {
      console.error('Error fetching post stats:', error);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({ content: editContent.trim() })
        .eq('id', post.id);

      if (!error) {
        setIsEditing(false);
        // Refresh the page or update the post in parent component
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating post:', error);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنشور؟')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (!error) {
        onDelete?.(post.id);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
    setLoading(false);
  };

  const handleShare = async (platform: string) => {
    const url = `${window.location.origin}/post/${post.id}`;
    const text = post.content.substring(0, 100) + '...';

    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('تم نسخ الرابط');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
        break;
    }
    setShowShareMenu(false);
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

  const renderContent = (content: string) => {
    // Convert hashtags to clickable links
    const hashtagRegex = /#([\w\u0600-\u06FF]+)/g;
    const mentionRegex = /@([\w\u0600-\u06FF]+)/g;
    
    let processedContent = content
      .replace(hashtagRegex, '<a href="/search?q=%23$1" class="text-blue-600 hover:text-blue-700 font-medium">#$1</a>')
      .replace(mentionRegex, '<a href="/profile/$1" class="text-blue-600 hover:text-blue-700 font-medium">@$1</a>');

    return { __html: processedContent };
  };

  const getPrivacyIcon = (level?: string) => {
    switch (level) {
      case 'followers':
        return '👥';
      case 'private':
        return '🔒';
      default:
        return '🌍';
    }
  };

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 relative">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <Link
          to={`/profile/${post.profiles.username}`}
          className="flex items-center space-x-3 space-x-reverse"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold relative">
            {post.profiles.avatar_url ? (
              <img
                src={post.profiles.avatar_url}
                alt={post.profiles.full_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              post.profiles.full_name.charAt(0).toUpperCase()
            )}
            {post.profiles.is_verified && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <h3 className="font-semibold text-gray-900">
                {post.profiles.full_name}
              </h3>
              {post.profiles.is_verified && (
                <span className="text-blue-600">✓</span>
              )}
            </div>
            <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
              <span>@{post.profiles.username}</span>
              <span>•</span>
              <span>{formatDate(post.created_at)}</span>
              {post.updated_at && post.updated_at !== post.created_at && (
                <>
                  <span>•</span>
                  <span className="text-xs">تم التعديل</span>
                </>
              )}
              <span>•</span>
              <span title={`مستوى الخصوصية: ${post.privacy_level}`}>
                {getPrivacyIcon(post.privacy_level)}
              </span>
            </div>
          </div>
        </Link>
        
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 min-w-48">
                {isOwnPost ? (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-right hover:bg-gray-50 flex items-center space-x-2 space-x-reverse"
                    >
                      <Edit className="w-4 h-4" />
                      <span>تعديل</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2 text-right hover:bg-gray-50 flex items-center space-x-2 space-x-reverse text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>حذف</span>
                    </button>
                  </>
                ) : (
                  <button className="w-full px-4 py-2 text-right hover:bg-gray-50 flex items-center space-x-2 space-x-reverse text-red-600">
                    <Flag className="w-4 h-4" />
                    <span>إبلاغ</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
            />
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={handleEdit}
                disabled={loading || !editContent.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'حفظ...' : 'حفظ'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(post.content);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                إلغاء
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="text-gray-900 leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={renderContent(post.content)}
          />
        )}
      </div>

      {/* Post Media */}
      {post.image_url && (
        <div className="px-4 pb-3">
          <img
            src={post.image_url}
            alt="Post image"
            className="w-full rounded-lg object-cover max-h-96 cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => window.open(post.image_url, '_blank')}
          />
        </div>
      )}

      {post.video_url && (
        <div className="px-4 pb-3">
          <video
            src={post.video_url}
            controls
            className="w-full rounded-lg max-h-96"
            preload="metadata"
          />
        </div>
      )}

      {/* Media Type Indicator */}
      {post.media_type && post.media_type !== 'text' && (
        <div className="px-4 pb-2">
          <div className="flex items-center space-x-2 space-x-reverse text-xs text-gray-500">
            {post.media_type === 'image' && <span>📷 صورة</span>}
            {post.media_type === 'video' && <span>🎥 فيديو</span>}
            {post.media_type === 'mixed' && <span>📱 وسائط متعددة</span>}
          </div>
        </div>
      )}

      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 space-x-reverse">
            {/* Reactions */}
            <ReactionButton postId={post.id} />

            {/* Comments */}
            <Link
              to={`/post/${post.id}`}
              className="flex items-center space-x-2 space-x-reverse text-gray-600 hover:text-blue-600 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{commentsCount}</span>
            </Link>

            {/* Share */}
            <div className="relative">
              <button 
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center space-x-2 space-x-reverse text-gray-600 hover:text-green-600 transition-colors"
              >
                <Share className="w-5 h-5" />
                <span className="text-sm font-medium">مشاركة</span>
              </button>
              
              {showShareMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowShareMenu(false)}
                  />
                  <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 min-w-48">
                    <button
                      onClick={() => handleShare('copy')}
                      className="w-full px-4 py-2 text-right hover:bg-gray-50"
                    >
                      📋 نسخ الرابط
                    </button>
                    <button
                      onClick={() => handleShare('whatsapp')}
                      className="w-full px-4 py-2 text-right hover:bg-gray-50"
                    >
                      📱 واتساب
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="w-full px-4 py-2 text-right hover:bg-gray-50"
                    >
                      🐦 تويتر
                    </button>
                    <button
                      onClick={() => handleShare('facebook')}
                      className="w-full px-4 py-2 text-right hover:bg-gray-50"
                    >
                      📘 فيسبوك
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Views */}
          <div className="flex items-center space-x-1 space-x-reverse text-gray-500">
            <Eye className="w-4 h-4" />
            <span className="text-xs">{Math.floor(Math.random() * 1000) + 100}</span>
          </div>
        </div>
      </div>
    </article>
  );
}