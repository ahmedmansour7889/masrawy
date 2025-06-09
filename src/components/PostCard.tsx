import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PostCardProps {
  post: {
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
  };
  showComments?: boolean;
}

export default function PostCard({ post, showComments = false }: PostCardProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPostStats();
  }, [post.id, user?.id]);

  const fetchPostStats = async () => {
    try {
      // Get likes count and user's like status
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select('id, user_id')
        .eq('post_id', post.id);

      if (!likesError && likes) {
        setLikesCount(likes.length);
        setLiked(likes.some(like => like.user_id === user?.id));
      }

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

  const handleLike = async () => {
    if (!user || loading) return;

    setLoading(true);
    try {
      if (liked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);

        if (!error) {
          setLiked(false);
          setLikesCount(prev => prev - 1);
        }
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            post_id: post.id,
            user_id: user.id,
          });

        if (!error) {
          setLiked(true);
          setLikesCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
    setLoading(false);
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

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <Link
          to={`/profile/${post.profiles.username}`}
          className="flex items-center space-x-3 space-x-reverse"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
            {post.profiles.avatar_url ? (
              <img
                src={post.profiles.avatar_url}
                alt={post.profiles.full_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              post.profiles.full_name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {post.profiles.full_name}
            </h3>
            <p className="text-sm text-gray-500">
              @{post.profiles.username} • {formatDate(post.created_at)}
            </p>
          </div>
        </Link>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <MoreHorizontal className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Post Media */}
      {post.image_url && (
        <div className="px-4 pb-3">
          <img
            src={post.image_url}
            alt="Post image"
            className="w-full rounded-lg object-cover max-h-96"
          />
        </div>
      )}

      {post.video_url && (
        <div className="px-4 pb-3">
          <video
            src={post.video_url}
            controls
            className="w-full rounded-lg max-h-96"
          />
        </div>
      )}

      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 space-x-reverse">
            <button
              onClick={handleLike}
              disabled={loading}
              className={`flex items-center space-x-2 space-x-reverse transition-colors ${
                liked
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart
                className={`w-5 h-5 ${liked ? 'fill-current' : ''}`}
              />
              <span className="text-sm font-medium">{likesCount}</span>
            </button>

            <Link
              to={`/post/${post.id}`}
              className="flex items-center space-x-2 space-x-reverse text-gray-600 hover:text-blue-600 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{commentsCount}</span>
            </Link>

            <button className="flex items-center space-x-2 space-x-reverse text-gray-600 hover:text-green-600 transition-colors">
              <Share className="w-5 h-5" />
              <span className="text-sm font-medium">مشاركة</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}