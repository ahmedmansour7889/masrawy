import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, User, Hash, Filter, Sliders } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AdvancedSearch from '../components/AdvancedSearch';

interface SearchResult {
  type: 'user' | 'post' | 'hashtag';
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  content?: string;
  created_at?: string;
  name?: string;
  usage_count?: number;
}

interface SearchFilters {
  query: string;
  type: 'all' | 'posts' | 'users' | 'hashtags';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  location?: string;
  verified?: boolean;
  mediaType?: 'all' | 'images' | 'videos';
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'posts' | 'hashtags'>('all');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<SearchResult[]>([]);

  useEffect(() => {
    loadRecentSearches();
    fetchTrendingHashtags();
  }, []);

  useEffect(() => {
    if (query.trim().length > 2) {
      searchContent();
    } else {
      setResults([]);
    }
  }, [query, activeTab]);

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  };

  const saveRecentSearch = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const fetchTrendingHashtags = async () => {
    try {
      const { data, error } = await supabase
        .from('hashtags')
        .select('*')
        .order('usage_count', { ascending: false })
        .limit(10);

      if (!error && data) {
        const hashtagResults: SearchResult[] = data.map(hashtag => ({
          type: 'hashtag',
          id: hashtag.id,
          name: hashtag.name,
          usage_count: hashtag.usage_count,
        }));
        setTrendingHashtags(hashtagResults);
      }
    } catch (error) {
      console.error('Error fetching trending hashtags:', error);
    }
  };

  const searchContent = async (filters?: SearchFilters) => {
    setLoading(true);
    const searchQuery = filters?.query || query;
    
    try {
      let userResults: SearchResult[] = [];
      let postResults: SearchResult[] = [];
      let hashtagResults: SearchResult[] = [];

      if (activeTab === 'all' || activeTab === 'users') {
        const { data: users } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, is_verified')
          .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
          .limit(10);

        userResults = (users || [])
          .filter(user => !filters?.verified || user.is_verified)
          .map(user => ({
            type: 'user' as const,
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            avatar_url: user.avatar_url,
          }));
      }

      if (activeTab === 'all' || activeTab === 'posts') {
        let postsQuery = supabase
          .from('posts')
          .select(`
            id,
            content,
            created_at,
            media_type,
            image_url,
            video_url,
            profiles!inner(username, full_name)
          `)
          .ilike('content', `%${searchQuery}%`);

        // Apply date filter
        if (filters?.dateRange && filters.dateRange !== 'all') {
          const now = new Date();
          let startDate: Date;
          
          switch (filters.dateRange) {
            case 'today':
              startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              break;
            case 'week':
              startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              break;
            case 'month':
              startDate = new Date(now.getFullYear(), now.getMonth(), 1);
              break;
            case 'year':
              startDate = new Date(now.getFullYear(), 0, 1);
              break;
            default:
              startDate = new Date(0);
          }
          
          postsQuery = postsQuery.gte('created_at', startDate.toISOString());
        }

        // Apply media type filter
        if (filters?.mediaType && filters.mediaType !== 'all') {
          if (filters.mediaType === 'images') {
            postsQuery = postsQuery.eq('media_type', 'image');
          } else if (filters.mediaType === 'videos') {
            postsQuery = postsQuery.eq('media_type', 'video');
          }
        }

        const { data: posts } = await postsQuery.limit(20);

        postResults = (posts || []).map(post => ({
          type: 'post' as const,
          id: post.id,
          content: post.content,
          created_at: post.created_at,
        }));
      }

      if (activeTab === 'all' || activeTab === 'hashtags') {
        const { data: hashtags } = await supabase
          .from('hashtags')
          .select('*')
          .ilike('name', `%${searchQuery}%`)
          .order('usage_count', { ascending: false })
          .limit(10);

        hashtagResults = (hashtags || []).map(hashtag => ({
          type: 'hashtag' as const,
          id: hashtag.id,
          name: hashtag.name,
          usage_count: hashtag.usage_count,
        }));
      }

      setResults([...userResults, ...postResults, ...hashtagResults]);
      
      if (searchQuery.trim()) {
        saveRecentSearch(searchQuery.trim());
      }
    } catch (error) {
      console.error('Search error:', error);
    }
    setLoading(false);
  };

  const handleAdvancedSearch = (filters: SearchFilters) => {
    setQuery(filters.query);
    setActiveTab(filters.type === 'all' ? 'all' : filters.type);
    searchContent(filters);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 mb-4">البحث</h1>
          
          {/* Search Input */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن أشخاص أو منشورات أو هاشتاغ..."
              className="block w-full pr-10 pl-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
            />
            <button
              onClick={() => setShowAdvancedSearch(true)}
              className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-blue-600"
            >
              <Sliders className="h-5 w-5" />
            </button>
          </div>

          {/* Search Tabs */}
          <div className="flex space-x-1 space-x-reverse">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              الأشخاص
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'posts'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              المنشورات
            </button>
            <button
              onClick={() => setActiveTab('hashtags')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'hashtags'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              الهاشتاغ
            </button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {query.trim().length === 0 && (
          <div className="space-y-6">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">عمليات البحث الأخيرة</h3>
                  <button
                    onClick={clearRecentSearches}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    مسح الكل
                  </button>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(search)}
                      className="block w-full text-right p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <SearchIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{search}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Hashtags */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">الهاشتاغ الرائجة</h3>
              <div className="space-y-2">
                {trendingHashtags.map((hashtag) => (
                  <button
                    key={hashtag.id}
                    onClick={() => setQuery(`#${hashtag.name}`)}
                    className="block w-full text-right p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">#{hashtag.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{hashtag.usage_count} منشور</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Tips */}
            <div className="text-center py-12">
              <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ابحث عن محتوى
              </h3>
              <p className="text-gray-600 mb-4">
                ابدأ بكتابة ما تريد البحث عنه
              </p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>💡 استخدم # للب حث عن هاشتاغ</p>
                <p>💡 استخدم @ للبحث عن مستخدم</p>
                <p>💡 استخدم البحث المتقدم للمزيد من الخيارات</p>
              </div>
            </div>
          </div>
        )}

        {query.trim().length > 0 && query.trim().length <= 2 && (
          <div className="text-center py-8">
            <p className="text-gray-600">
              اكتب 3 أحرف على الأقل للبحث
            </p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && query.trim().length > 2 && results.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لا توجد نتائج
            </h3>
            <p className="text-gray-600 mb-4">
              جرب كلمات مختلفة أو تحقق من الإملاء
            </p>
            <button
              onClick={() => setShowAdvancedSearch(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Filter className="w-4 h-4 ml-2" />
              جرب البحث المتقدم
            </button>
          </div>
        )}

        {/* Results List */}
        <div className="space-y-4">
          {results.map((result) => (
            <div
              key={`${result.type}-${result.id}`}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              {result.type === 'user' ? (
                <Link
                  to={`/profile/${result.username}`}
                  className="flex items-center space-x-3 space-x-reverse"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {result.avatar_url ? (
                      <img
                        src={result.avatar_url}
                        alt={result.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      result.full_name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {highlightText(result.full_name || '', query)}
                    </h3>
                    <p className="text-gray-600">
                      @{highlightText(result.username || '', query)}
                    </p>
                  </div>
                  <User className="w-5 h-5 text-gray-400" />
                </Link>
              ) : result.type === 'hashtag' ? (
                <button
                  onClick={() => setQuery(`#${result.name}`)}
                  className="w-full text-right"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <Hash className="w-5 h-5 text-gray-400" />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          #{highlightText(result.name || '', query)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {result.usage_count} منشور
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              ) : (
                <Link
                  to={`/post/${result.id}`}
                  className="block"
                >
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <Hash className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-gray-900 leading-relaxed">
                        {highlightText(result.content || '', query)}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(result.created_at || '').toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Search Modal */}
      <AdvancedSearch
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onSearch={handleAdvancedSearch}
      />
    </div>
  );
}