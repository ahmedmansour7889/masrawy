import React, { useState, useEffect } from 'react';
import { MessageCircle, Share, MoreHorizontal, MapPin, Eye } from 'lucide-react';
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
    user_id: string;
    profiles: {
      username: string;
      full_name: string;
      avatar_url?: string;
      is_verified?: boolean;
    };
  };
  showComments?: boolean;
}

export default function PostCard({ post, showComments = false }: PostCardProps) {
  const { user } = useAuth();
  const [commentsCount, setCommentsCount] = useState(0);
  const [loading, setLoading] = useState(false);

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
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
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
              <span>•</span>
              <span title={`مستوى الخصوصية: ${post.privacy_level}`}>
                {getPrivacyIcon(post.privacy_level)}
              </span>
            </div>
          </div>
        </Link>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <MoreHorizontal className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <div 
          className="text-gray-900 leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={renderContent(post.content)}
        />
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
            <button className="flex items-center space-x-2 space-x-reverse text-gray-600 hover:text-green-600 transition-colors">
              <Share className="w-5 h-5" />
              <span className="text-sm font-medium">مشاركة</span>
            </button>
          </div>

          {/* Views (if applicable) */}
          <div className="flex items-center space-x-1 space-x-reverse text-gray-500">
            <Eye className="w-4 h-4" />
            <span className="text-xs">{Math.floor(Math.random() * 1000) + 100}</span>
          </div>
        </div>
      </div>
    </article>
  );
}