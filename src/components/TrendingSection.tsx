import React from 'react';
import { TrendingUp, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TrendingTopic {
  tag: string;
  posts: number;
  trend: 'up' | 'down' | 'stable';
}

const trendingTopics: TrendingTopic[] = [
  { tag: 'المصراوي', posts: 1250, trend: 'up' },
  { tag: 'تكنولوجيا', posts: 890, trend: 'up' },
  { tag: 'رياضة', posts: 654, trend: 'stable' },
  { tag: 'فن', posts: 432, trend: 'down' },
  { tag: 'سفر', posts: 321, trend: 'up' },
];

export default function TrendingSection() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 ml-2 text-blue-600" />
        المواضيع الرائجة
      </h2>
      <div className="space-y-3">
        {trendingTopics.map((topic, index) => (
          <Link
            key={topic.tag}
            to={`/search?q=${encodeURIComponent('#' + topic.tag)}`}
            className="block p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Hash className="w-4 h-4 text-gray-400" />
                <div>
                  <h3 className="font-medium text-gray-900">#{topic.tag}</h3>
                  <p className="text-sm text-gray-500">{topic.posts.toLocaleString()} منشور</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-sm text-gray-400">#{index + 1}</span>
                <div className={`w-2 h-2 rounded-full ${
                  topic.trend === 'up' ? 'bg-green-500' :
                  topic.trend === 'down' ? 'bg-red-500' : 'bg-gray-400'
                }`} />
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Link
        to="/explore"
        className="block mt-4 text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        عرض المزيد
      </Link>
    </div>
  );
}