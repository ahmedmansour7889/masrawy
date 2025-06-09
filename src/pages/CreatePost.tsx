import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, Video, Send, X, MapPin, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import MediaUpload from '../components/MediaUpload';
import EmojiPicker from '../components/EmojiPicker';
import HashtagInput from '../components/HashtagInput';

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [privacyLevel, setPrivacyLevel] = useState<'public' | 'followers' | 'private'>('public');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && selectedFiles.length === 0) {
      setError('يجب إضافة محتوى أو ملفات للمنشور');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Upload media files first
      let mediaUrls: string[] = [];
      let mediaType = 'text';

      if (selectedFiles.length > 0) {
        // In a real app, you would upload files to a storage service
        // For now, we'll simulate with placeholder URLs
        mediaUrls = selectedFiles.map((file, index) => 
          `https://example.com/uploads/${user?.id}/${Date.now()}_${index}_${file.name}`
        );
        
        // Determine media type
        const hasImages = selectedFiles.some(file => file.type.startsWith('image/'));
        const hasVideos = selectedFiles.some(file => file.type.startsWith('video/'));
        
        if (hasImages && hasVideos) {
          mediaType = 'mixed';
        } else if (hasImages) {
          mediaType = 'image';
        } else if (hasVideos) {
          mediaType = 'video';
        }
      }

      // Create post
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user?.id,
          content: content.trim(),
          image_url: mediaUrls.find(url => url.includes('image')) || '',
          video_url: mediaUrls.find(url => url.includes('video')) || '',
          media_type: mediaType,
          privacy_level: privacyLevel,
        });

      if (postError) {
        setError('حدث خطأ أثناء نشر المحتوى');
      } else {
        navigate('/home');
      }
    } catch (error) {
      setError('حدث خطأ أثناء نشر المحتوى');
    }

    setLoading(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    setContent(prev => prev + emoji);
  };

  const privacyOptions = [
    { value: 'public', label: 'عام', icon: '🌍', description: 'يمكن للجميع رؤيته' },
    { value: 'followers', label: 'المتابعون', icon: '👥', description: 'المتابعون فقط' },
    { value: 'private', label: 'خاص', icon: '🔒', description: 'أنت فقط' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/home')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">منشور جديد</h1>
            <button
              onClick={handleSubmit}
              disabled={loading || (!content.trim() && selectedFiles.length === 0)}
              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {loading ? 'نشر...' : 'نشر'}
            </button>
          </div>
        </div>
      </div>

      {/* Create Post Form */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Info */}
            <div className="flex items-center space-x-3 space-x-reverse">
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
              <div>
                <h3 className="font-semibold text-gray-900">
                  {user?.user_metadata?.full_name || 'المستخدم'}
                </h3>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <select
                    value={privacyLevel}
                    onChange={(e) => setPrivacyLevel(e.target.value as any)}
                    className="text-sm text-gray-600 bg-transparent border-none focus:ring-0 p-0"
                  >
                    {privacyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Content Input with Hashtag Support */}
            <div>
              <HashtagInput
                value={content}
                onChange={setContent}
                placeholder="ما الذي تريد مشاركته؟"
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                </div>
                <div className="text-right text-sm text-gray-500">
                  {content.length}/500
                </div>
              </div>
            </div>

            {/* Media Upload */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">إضافة وسائط</h4>
              <MediaUpload
                onMediaSelect={setSelectedFiles}
                maxFiles={4}
                acceptedTypes={['image/*', 'video/*']}
                maxSize={50}
              />
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 ml-2" />
                الموقع (اختياري)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="أضف موقعك"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Privacy Settings */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">إعدادات الخصوصية</h4>
              <div className="grid grid-cols-1 gap-3">
                {privacyOptions.map(option => (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      privacyLevel === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="privacy"
                      value={option.value}
                      checked={privacyLevel === option.value}
                      onChange={(e) => setPrivacyLevel(e.target.value as any)}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <span className="text-xl">{option.icon}</span>
                      <div>
                        <h5 className="font-medium text-gray-900">{option.label}</h5>
                        <p className="text-sm text-gray-500">{option.description}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button - Mobile */}
            <div className="lg:hidden pt-4">
              <button
                type="submit"
                disabled={loading || (!content.trim() && selectedFiles.length === 0)}
                className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Send className="w-5 h-5 ml-2" />
                {loading ? 'جاري النشر...' : 'نشر المحتوى'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}