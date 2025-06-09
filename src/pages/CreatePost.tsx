import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, Video, Send, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl && !videoUrl) {
      setError('يجب إضافة محتوى للمنشور');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user?.id,
          content: content.trim(),
          image_url: imageUrl || '',
          video_url: videoUrl || '',
        });

      if (error) {
        setError('حدث خطأ أثناء نشر المحتوى');
      } else {
        navigate('/home');
      }
    } catch (error) {
      setError('حدث خطأ أثناء نشر المحتوى');
    }

    setLoading(false);
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    if (e.target.value) {
      setVideoUrl(''); // Clear video URL if image is added
    }
  };

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value);
    if (e.target.value) {
      setImageUrl(''); // Clear image URL if video is added
    }
  };

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
              disabled={loading || (!content.trim() && !imageUrl && !videoUrl)}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Content Input */}
            <div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="ما الذي تريد مشاركته؟"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[120px] text-lg placeholder-gray-500"
                maxLength={500}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {content.length}/500
              </div>
            </div>

            {/* Media Inputs */}
            <div className="space-y-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Image className="w-4 h-4 ml-2" />
                  رابط الصورة (اختياري)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Video className="w-4 h-4 ml-2" />
                  رابط الفيديو (اختياري)
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={handleVideoUrlChange}
                  placeholder="https://example.com/video.mp4"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Media Preview */}
            {imageUrl && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">معاينة الصورة:</h4>
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded-lg"
                  onError={() => setError('رابط الصورة غير صحيح')}
                />
              </div>
            )}

            {videoUrl && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">معاينة الفيديو:</h4>
                <video
                  src={videoUrl}
                  controls
                  className="max-w-full h-auto rounded-lg"
                  onError={() => setError('رابط الفيديو غير صحيح')}
                />
              </div>
            )}

            {/* Submit Button - Mobile */}
            <div className="lg:hidden pt-4">
              <button
                type="submit"
                disabled={loading || (!content.trim() && !imageUrl && !videoUrl)}
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