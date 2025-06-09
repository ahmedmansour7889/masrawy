import React, { useState, useEffect } from 'react';
import { Plus, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Story {
  id: string;
  user_id: string;
  content: string;
  media_url: string;
  created_at: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

export default function Stories() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Group stories by user, keeping only the latest story per user
      const userStories = new Map();
      data?.forEach(story => {
        if (!userStories.has(story.user_id)) {
          userStories.set(story.user_id, story);
        }
      });
      
      setStories(Array.from(userStories.values()));
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex space-x-4 space-x-reverse p-4 overflow-x-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0">
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-12 h-3 bg-gray-200 rounded mt-2 mx-auto animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex space-x-4 space-x-reverse overflow-x-auto">
        {/* Add Story Button */}
        <div className="flex-shrink-0 text-center">
          <Link
            to="/create-story"
            className="relative block w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white hover:from-blue-500 hover:to-blue-700 transition-colors"
          >
            <Plus className="w-6 h-6" />
          </Link>
          <p className="text-xs text-gray-600 mt-1 truncate w-16">قصتك</p>
        </div>

        {/* Stories */}
        {stories.map((story) => (
          <div key={story.id} className="flex-shrink-0 text-center">
            <Link
              to={`/story/${story.id}`}
              className="relative block w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-pink-500 to-yellow-500"
            >
              <div className="w-full h-full rounded-full bg-white p-0.5">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold overflow-hidden">
                  {story.profiles.avatar_url ? (
                    <img
                      src={story.profiles.avatar_url}
                      alt={story.profiles.full_name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    story.profiles.full_name.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
              {story.media_url && (
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <Play className="w-3 h-3 text-white" />
                </div>
              )}
            </Link>
            <p className="text-xs text-gray-600 mt-1 truncate w-16">
              {story.profiles.full_name}
            </p>
          </div>
        ))}

        {stories.length === 0 && (
          <div className="flex-1 text-center py-4">
            <p className="text-gray-500 text-sm">لا توجد قصص حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
}