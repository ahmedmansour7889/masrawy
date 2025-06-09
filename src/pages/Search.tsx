import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, User, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface SearchResult {
  type: 'user' | 'post';
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  content?: string;
  created_at?: string;
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'posts'>('all');

  useEffect(() => {
    if (query.trim().length > 2) {
      searchContent();
    } else {
      setResults([]);
    }
  }, [query, activeTab]);

  const searchContent = async () => {
    setLoading(true);
    try {
      let userResults: SearchResult[] = [];
      let postResults: SearchResult[] = [];

      if (activeTab === 'all' || activeTab === 'users') {
        const { data: users } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
          .limit(10);

        userResults = (users || []).map(user => ({
          type: 'user' as const,
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
        }));
      }

      if (activeTab === 'all' || activeTab === 'posts') {
        const { data: posts } = await supabase
          .from('posts')
          .select(`
            id,
            content,
            created_at,
            profiles!inner(username, full_name)
          `)
          .ilike('content', `%${query}%`)
          .limit(20);

        postResults = (posts || []).map(post => ({
          type: 'post' as const,
          id: post.id,
          content: post.content,
          created_at: post.created_at,
        }));
      }

      setResults([...userResults, ...postResults]);
    } catch (error) {
      console.error('Search error:', error);
    }
    setLoading(false);
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
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن أشخاص أو منشورات..."
              className="block w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
            />
          </div>

          {/* Search Tabs */}
          <div className="flex space-x-1 space-x-reverse mt-4">
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
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {query.trim().length === 0 && (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ابحث عن محتوى
            </h3>
            <p className="text-gray-600">
              ابدأ بكتابة ما تريد البحث عنه
            </p>
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
            <p className="text-gray-600">
              جرب كلمات مختلفة أو تحقق من الإملاء
            </p>
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
    </div>
  );
}