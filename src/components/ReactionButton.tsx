import React, { useState, useEffect } from 'react';
import { Heart, Smile, Angry, Frown, Surprise, ThumbsUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ReactionButtonProps {
  postId: string;
  showCounts?: boolean;
}

const reactionTypes = {
  like: { icon: ThumbsUp, emoji: '👍', label: 'إعجاب' },
  love: { icon: Heart, emoji: '❤️', label: 'حب' },
  laugh: { icon: Smile, emoji: '😂', label: 'ضحك' },
  angry: { icon: Angry, emoji: '😡', label: 'غضب' },
  sad: { icon: Frown, emoji: '😢', label: 'حزن' },
  wow: { icon: Surprise, emoji: '😮', label: 'تعجب' }
};

export default function ReactionButton({ postId, showCounts = true }: ReactionButtonProps) {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReactions();
  }, [postId, user?.id]);

  const fetchReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('reactions')
        .select('reaction_type, user_id')
        .eq('post_id', postId);

      if (error) throw error;

      // Count reactions by type
      const reactionCounts: Record<string, number> = {};
      let currentUserReaction = null;

      data?.forEach(reaction => {
        reactionCounts[reaction.reaction_type] = (reactionCounts[reaction.reaction_type] || 0) + 1;
        if (reaction.user_id === user?.id) {
          currentUserReaction = reaction.reaction_type;
        }
      });

      setReactions(reactionCounts);
      setUserReaction(currentUserReaction);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const handleReaction = async (reactionType: string) => {
    if (!user || loading) return;

    setLoading(true);
    try {
      if (userReaction === reactionType) {
        // Remove reaction
        await supabase
          .from('reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        setUserReaction(null);
        setReactions(prev => ({
          ...prev,
          [reactionType]: Math.max(0, (prev[reactionType] || 0) - 1)
        }));
      } else {
        // Add or update reaction
        await supabase
          .from('reactions')
          .upsert({
            post_id: postId,
            user_id: user.id,
            reaction_type: reactionType
          });

        // Update local state
        const newReactions = { ...reactions };
        
        // Remove old reaction count
        if (userReaction) {
          newReactions[userReaction] = Math.max(0, (newReactions[userReaction] || 0) - 1);
        }
        
        // Add new reaction count
        newReactions[reactionType] = (newReactions[reactionType] || 0) + 1;
        
        setReactions(newReactions);
        setUserReaction(reactionType);
      }
      
      setShowPicker(false);
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
    setLoading(false);
  };

  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

  return (
    <div className="relative">
      {/* Main reaction button */}
      <div className="flex items-center space-x-2 space-x-reverse">
        <button
          onClick={() => setShowPicker(!showPicker)}
          onMouseEnter={() => setShowPicker(true)}
          className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-full transition-colors ${
            userReaction
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {userReaction ? (
            <span className="text-lg">{reactionTypes[userReaction as keyof typeof reactionTypes].emoji}</span>
          ) : (
            <ThumbsUp className="w-5 h-5" />
          )}
          {showCounts && totalReactions > 0 && (
            <span className="text-sm font-medium">{totalReactions}</span>
          )}
        </button>

        {/* Reaction picker */}
        {showPicker && (
          <div
            className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-lg border border-gray-200 p-2 flex space-x-1 space-x-reverse z-10"
            onMouseLeave={() => setShowPicker(false)}
          >
            {Object.entries(reactionTypes).map(([type, config]) => (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                className="w-10 h-10 flex items-center justify-center text-xl hover:scale-125 transition-transform rounded-full hover:bg-gray-100"
                title={config.label}
              >
                {config.emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reaction summary */}
      {showCounts && totalReactions > 0 && (
        <div className="mt-1 flex items-center space-x-1 space-x-reverse">
          {Object.entries(reactions)
            .filter(([_, count]) => count > 0)
            .sort(([_, a], [__, b]) => b - a)
            .slice(0, 3)
            .map(([type, count]) => (
              <div key={type} className="flex items-center space-x-1 space-x-reverse">
                <span className="text-sm">{reactionTypes[type as keyof typeof reactionTypes].emoji}</span>
                <span className="text-xs text-gray-500">{count}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}