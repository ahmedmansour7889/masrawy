import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, Type, Palette, Camera, Video } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import MediaUpload from '../components/MediaUpload';

export default function CreateStory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [backgroundColor, setBackgroundColor] = useState('#3B82F6');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [storyType, setStoryType] = useState<'text' | 'media'>('text');

  const backgroundColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && selectedFiles.length === 0) {
      setError('يجب إضافة محتوى أو ملف للقصة');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let mediaUrl = '';
      
      if (selectedFiles.length > 0) {
        // In a real app, upload to Supabase Storage
        mediaUrl = URL.createObjectURL(selectedFiles[0]);
      }

      const { error: storyError } = await supabase
        .from('stories')
        .insert({
          user_id: user?.id,
          content: content.trim(),
          media_url: mediaUrl,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        });

      if (storyError) {
        setError('حدث خطأ أثناء نشر القصة');
      } else {
        navigate('/home');
      }
    } catch (error) {
      setError('حدث خطأ أثناء نشر القصة');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/home')}
            className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-white font-semibold">إنشاء قصة</h1>
          <button
            onClick={handleSubmit}
            disabled={loading || (!content.trim() && selectedFiles.length === 0)}
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {loading ? 'نشر...' : 'نشر'}
          </button>
        </div>
      </div>

      {/* Story Type Selector */}
      <div className="absolute top-20 left-4 right-4 z-10">
        <div className="flex space-x-2 space-x-reverse bg-black bg-opacity-50 rounded-lg p-1">
          <button
            onClick={() => setStoryType('text')}
            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-colors ${
              storyType === 'text'
                ? 'bg-white text-gray-900'
                : 'text-white hover:bg-white hover:bg-opacity-20'
            }`}
          >
            <Type className="w-4 h-4 ml-2" />
            نص
          </button>
          <button
            onClick={() => setStoryType('media')}
            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-colors ${
              storyType === 'media'
                ? 'bg-white text-gray-900'
                : 'text-white hover:bg-white hover:bg-opacity-20'
            }`}
          >
            <Camera className="w-4 h-4 ml-2" />
            وسائط
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-4 pt-32 pb-32">
        {storyType === 'text' ? (
          /* Text Story */
          <div 
            className="w-full max-w-sm aspect-[9/16] rounded-2xl flex items-center justify-center p-8 relative overflow-hidden"
            style={{ backgroundColor }}
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب قصتك هنا..."
              className="w-full h-full bg-transparent border-none outline-none resize-none text-center text-xl font-medium placeholder-opacity-70"
              style={{ color: textColor }}
              maxLength={200}
            />
            <div className="absolute bottom-4 right-4 text-xs opacity-70" style={{ color: textColor }}>
              {content.length}/200
            </div>
          </div>
        ) : (
          /* Media Story */
          <div className="w-full max-w-sm aspect-[9/16] rounded-2xl bg-gray-800 flex items-center justify-center overflow-hidden">
            {selectedFiles.length > 0 ? (
              <div className="relative w-full h-full">
                {selectedFiles[0].type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(selectedFiles[0])}
                    alt="Story preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={URL.createObjectURL(selectedFiles[0])}
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
                {content && (
                  <div className="absolute bottom-8 left-4 right-4">
                    <p className="text-white text-lg text-center bg-black bg-opacity-50 p-4 rounded-lg">
                      {content}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <Camera className="w-16 h-16 mx-auto mb-4" />
                <p>اختر صورة أو فيديو</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-4">
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {storyType === 'text' ? (
          /* Text Controls */
          <div className="space-y-4">
            {/* Background Colors */}
            <div className="bg-black bg-opacity-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Palette className="w-5 h-5 text-white ml-2" />
                <span className="text-white text-sm">لون الخلفية</span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {backgroundColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBackgroundColor(color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      backgroundColor === color ? 'border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Text Color */}
            <div className="bg-black bg-opacity-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Type className="w-5 h-5 text-white ml-2" />
                <span className="text-white text-sm">لون النص</span>
              </div>
              <div className="flex space-x-2 space-x-reverse">
                {['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setTextColor(color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      textColor === color ? 'border-white' : 'border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Media Controls */
          <div className="space-y-4">
            {/* Media Upload */}
            <div className="bg-black bg-opacity-50 rounded-lg p-4">
              <MediaUpload
                onMediaSelect={setSelectedFiles}
                maxFiles={1}
                acceptedTypes={['image/*', 'video/*']}
                maxSize={100}
                showPreview={false}
              />
            </div>

            {/* Caption */}
            {selectedFiles.length > 0 && (
              <div className="bg-black bg-opacity-50 rounded-lg p-4">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="أضف تعليق (اختياري)..."
                  className="w-full bg-transparent border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none"
                  rows={3}
                  maxLength={100}
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  {content.length}/100
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit Button - Mobile */}
        <button
          onClick={handleSubmit}
          disabled={loading || (!content.trim() && selectedFiles.length === 0)}
          className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <Send className="w-5 h-5 ml-2" />
          {loading ? 'جاري النشر...' : 'نشر القصة'}
        </button>
      </div>
    </div>
  );
}