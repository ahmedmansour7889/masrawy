import React, { useState, useEffect } from 'react';
import { Plus, Play, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Story {
  id: string;
  user_id: string;
  content: string;
  media_url: string;
  created_at: string;
  expires_at: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface StoryViewerProps {
  stories: Story[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

function StoryViewer({ stories, currentIndex, onClose, onNext, onPrev }: StoryViewerProps) {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const story = stories[currentIndex];

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          onNext();
          return 0;
        }
        return prev + 1;
      });
    }, 50); // 5 seconds total (100 * 50ms)

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, onNext]);

  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') onNext();
    if (e.key === 'ArrowRight') onPrev();
    if (e.key === 'Escape') onClose();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!story) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex space-x-1 space-x-reverse z-10">
        {stories.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-100"
              style={{ 
                width: index < currentIndex ? '100%' : 
                       index === currentIndex ? `${progress}%` : '0%' 
              }}
            />
          </div>
        ))}
      </div>

      {/* Story header */}
      <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
            {story.profiles.avatar_url ? (
              <img
                src={story.profiles.avatar_url}
                alt={story.profiles.full_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              story.profiles.full_name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold">{story.profiles.full_name}</h3>
            <p className="text-gray-300 text-sm">
              {new Date(story.created_at).toLocaleTimeString('ar-EG', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-white hover:bg-gray-800 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Story content */}
      <div 
        className="relative w-full h-full flex items-center justify-center"
        onClick={() => setIsPaused(!isPaused)}
      >
        {story.media_url ? (
          story.media_url.includes('video') ? (
            <video
              src={story.media_url}
              className="max-w-full max-h-full object-contain"
              autoPlay
              muted
              onEnded={onNext}
            />
          ) : (
            <img
              src={story.media_url}
              alt="Story"
              className="max-w-full max-h-full object-contain"
            />
          )
        ) : (
          <div className="text-white text-center p-8">
            <p className="text-xl leading-relaxed">{story.content}</p>
          </div>
        )}

        {/* Navigation areas */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-0 top-0 w-1/3 h-full flex items-center justify-start pl-4 text-white opacity-0 hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-0 top-0 w-1/3 h-full flex items-center justify-end pr-4 text-white opacity-0 hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      </div>

      {/* Story text overlay */}
      {story.content && story.media_url && (
        <div className="absolute bottom-20 left-4 right-4 text-center">
          <p className="text-white text-lg bg-black bg-opacity-50 p-4 rounded-lg">
            {story.content}
          </p>
        </div>
      )}

      {/* Pause indicator */}
      {isPaused && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-black bg-opacity-50 rounded-full p-4">
            <Play className="w-8 h-8 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Stories() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [userStories, setUserStories] = useState<Record<string, Story[]>>({});

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
      
      // Group stories by user
      const grouped: Record<string, Story[]> = {};
      data?.forEach(story => {
        if (!grouped[story.user_id]) {
          grouped[story.user_id] = [];
        }
        grouped[story.user_id].push(story);
      });
      
      setUserStories(grouped);
      
      // Get latest story per user for display
      const latestStories = Object.values(grouped).map(userStories => 
        userStories.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
      );
      
      setStories(latestStories);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const openStoryViewer = (storyIndex: number) => {
    setCurrentStoryIndex(storyIndex);
    setViewerOpen(true);
  };

  const closeStoryViewer = () => {
    setViewerOpen(false);
  };

  const nextStory = () => {
    const allStories = Object.values(userStories).flat();
    if (currentStoryIndex < allStories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      closeStoryViewer();
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  const hasUserStory = (userId: string) => {
    return userStories[userId] && userStories[userId].length > 0;
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

  const allStories = Object.values(userStories).flat();

  return (
    <>
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex space-x-4 space-x-reverse overflow-x-auto">
          {/* Add Story Button */}
          <div className="flex-shrink-0 text-center">
            <Link
              to="/create-story"
              className="relative block w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white hover:from-blue-500 hover:to-blue-700 transition-colors"
            >
              {user?.user_metadata?.avatar_url ? (
                <div className="relative">
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Your avatar"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                    <Plus className="w-3 h-3 text-white" />
                  </div>
                </div>
              ) : (
                <Plus className="w-6 h-6" />
              )}
            </Link>
            <p className="text-xs text-gray-600 mt-1 truncate w-16">
              {hasUserStory(user?.id || '') ? 'قصتك' : 'أضف قصة'}
            </p>
          </div>

          {/* Stories */}
          {stories.map((story, index) => (
            <div key={story.id} className="flex-shrink-0 text-center">
              <button
                onClick={() => openStoryViewer(index)}
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
              </button>
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

      {/* Story Viewer */}
      {viewerOpen && allStories.length > 0 && (
        <StoryViewer
          stories={allStories}
          currentIndex={currentStoryIndex}
          onClose={closeStoryViewer}
          onNext={nextStory}
          onPrev={prevStory}
        />
      )}
    </>
  );
}