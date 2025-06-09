import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Camera, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    avatar_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      
      setFormData({
        full_name: data.full_name || '',
        username: data.username || '',
        bio: data.bio || '',
        avatar_url: data.avatar_url || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
        })
        .eq('id', user?.id);

      if (error) throw error;
      
      setSuccess('تم تحديث الملف الشخصي بنجاح');
      setTimeout(() => {
        navigate(`/profile/${formData.username}`);
      }, 1500);
    } catch (error: any) {
      if (error.code === '23505') {
        setError('اسم المستخدم مستخدم بالفعل');
      } else {
        setError('حدث خطأ أثناء تحديث الملف الشخصي');
      }
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors ml-4"
              >
                <ArrowRight className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">تعديل الملف الشخصي</h1>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4 ml-2" />
              {loading ? 'حفظ...' : 'حفظ'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold mx-auto">
                  {formData.avatar_url ? (
                    <img
                      src={formData.avatar_url}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    formData.full_name.charAt(0).toUpperCase()
                  )}
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رابط الصورة الشخصية
              </label>
              <input
                type="url"
                name="avatar_url"
                value={formData.avatar_url}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم الكامل
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="أدخل اسمك الكامل"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المستخدم
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="اختر اسم مستخدم فريد"
              />
              <p className="text-sm text-gray-500 mt-1">
                يمكن أن يحتوي على أحرف وأرقام وشرطات سفلية فقط
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                النبذة الشخصية
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="اكتب نبذة عن نفسك..."
                maxLength={160}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {formData.bio.length}/160
              </div>
            </div>

            {/* Submit Button - Mobile */}
            <div className="lg:hidden">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
              >
                <Save className="w-5 h-5 ml-2" />
                {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}