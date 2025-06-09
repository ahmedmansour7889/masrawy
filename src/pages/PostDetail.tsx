import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, MessageCircle, Share, MoreHorizontal, ArrowRight, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

export default function PostDetail() {
  const { postId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments();
      fetchLikeStatus();
    }
  }, [postId, user?.id]);

  const fetchPost = async () => {
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
        .eq('id', postId)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      navigate('/home');
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchLikeStatus = async () => {
    try {
      const { data: likes, error } = await supabase
        .from('likes')
        .select('id, user_id')
        .eq('post_id', postId);

      if (!error && likes) {
        setLikesCount(likes.length);
        setLiked(likes.some(like => like.user_id === user?.id));
      }
    } catch (error) {
      console.error('Error fetching like status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) return;

    try {
      if (liked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        setLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id });
        setLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment.trim(),
        });

      if (!error) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
    setSubmitting(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">المنشور غير موجود</h3>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors ml-4"
            >
              <ArrowRight className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">المنشور</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Post */}
        <article className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          {/* Post Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <Link
              to={`/profile/${post.profiles.username}`}
              className="flex items-center space-x-3 space-x-reverse"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                {post.profiles.avatar_url ? (
                  <img
                    src={post.profiles.avatar_url}
                    alt={post.profiles.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  post.profiles.full_name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  {post.profiles.full_name}
                </h3>
                <p className="text-gray-500">
                  @{post.profiles.username}
                </p>
              </div>
            </Link>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Post Content */}
          <div className="px-6 pb-4">
            <p className="text-gray-900 leading-relaxed text-lg whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Post Media */}
          {post.image_url && (
            <div className="px-6 pb-4">
              <img
                src={post.image_url}
                alt="Post image"
                className="w-full rounded-lg object-cover"
              />
            </div>
          )}

          {post.video_url && (
            <div className="px-6 pb-4">
              <video
                src={post.video_url}
                controls
                className="w-full rounded-lg"
              />
            </div>
          )}

          {/* Post Meta */}
          <div className="px-6 pb-4">
            <p className="text-gray-500 text-sm">
              {formatDate(post.created_at)}
            </p>
          </div>

          {/* Post Actions */}
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 space-x-reverse">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 space-x-reverse transition-colors ${
                    liked
                      ? 'text-red-500 hover:text-red-600'
                      : 'text-gray-600 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
                  <span className="font-medium">{likesCount}</span>
                </button>

                <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                  <MessageCircle className="w-6 h-6" />
                  <span className="font-medium">{comments.length}</span>
                </div>

                <button className="flex items-center space-x-2 space-x-reverse text-gray-600 hover:text-green-600 transition-colors">
                  <Share className="w-6 h-6" />
                  <span className="font-medium">مشاركة</span>
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* Add Comment */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <form onSubmit={handleSubmitComment} className="flex space-x-4 space-x-reverse">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Your avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                user?.user_metadata?.full_name?.charAt(0).toUpperCase() || 'أ'
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="اكتب تعليقك..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-gray-500">{newComment.length}/280</span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4 ml-2" />
                  {submitting ? 'إرسال...' : 'تعليق'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Comments */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex space-x-3 space-x-reverse">
                <Link to={`/profile/${comment.profiles.username}`}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {comment.profiles.avatar_url ? (
                      <img
                        src={comment.profiles.avatar_url}
                        alt={comment.profiles.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      comment.profiles.full_name.charAt(0).toUpperCase()
                    )}
                  </div>
                </Link>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 space-x-reverse mb-1">
                    <Link
                      to={`/profile/${comment.profiles.username}`}
                      className="font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {comment.profiles.full_name}
                    </Link>
                    <span className="text-gray-500">@{comment.profiles.username}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 text-sm">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-900 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                لا توجد تعليقات بعد
              </h3>
              <p className="text-gray-600">
                كن أول من يعلق على هذا المنشور
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}