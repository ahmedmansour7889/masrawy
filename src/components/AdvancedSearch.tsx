import React, { useState } from 'react';
import { Search, Filter, Calendar, MapPin, User, Hash } from 'lucide-react';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface SearchFilters {
  query: string;
  type: 'all' | 'posts' | 'users' | 'hashtags';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  location?: string;
  verified?: boolean;
  mediaType?: 'all' | 'images' | 'videos';
}

export default function AdvancedSearch({ onSearch, isOpen, onClose }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: 'all',
    dateRange: 'all',
    verified: false,
    mediaType: 'all',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      query: '',
      type: 'all',
      dateRange: 'all',
      verified: false,
      mediaType: 'all',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Filter className="w-5 h-5 ml-2" />
              البحث المتقدم
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Search Query */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمات البحث
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={filters.query}
                  onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                  className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ابحث عن..."
                />
              </div>
            </div>

            {/* Content Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع المحتوى
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'all', label: 'الكل', icon: '🔍' },
                  { value: 'posts', label: 'المنشورات', icon: '📝' },
                  { value: 'users', label: 'الأشخاص', icon: '👥' },
                  { value: 'hashtags', label: 'الهاشتاغ', icon: '#️⃣' },
                ].map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      filters.type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={filters.type === type.value}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
                      className="sr-only"
                    />
                    <span className="text-lg ml-2">{type.icon}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline ml-1" />
                الفترة الزمنية
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as any })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">كل الأوقات</option>
                <option value="today">اليوم</option>
                <option value="week">هذا الأسبوع</option>
                <option value="month">هذا الشهر</option>
                <option value="year">هذا العام</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline ml-1" />
                الموقع
              </label>
              <input
                type="text"
                value={filters.location || ''}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="أدخل اسم المدينة أو البلد"
              />
            </div>

            {/* Media Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الوسائط
              </label>
              <div className="flex space-x-2 space-x-reverse">
                {[
                  { value: 'all', label: 'الكل' },
                  { value: 'images', label: 'صور' },
                  { value: 'videos', label: 'فيديوهات' },
                ].map((type) => (
                  <label
                    key={type.value}
                    className={`flex-1 text-center p-2 border rounded-lg cursor-pointer transition-colors ${
                      filters.mediaType === type.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mediaType"
                      value={type.value}
                      checked={filters.mediaType === type.value}
                      onChange={(e) => setFilters({ ...filters, mediaType: e.target.value as any })}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Verified Users Only */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.verified}
                  onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="mr-2 text-sm text-gray-700">
                  المستخدمون المُوثقون فقط ✓
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 space-x-reverse pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                بحث
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                إعادة تعيين
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}