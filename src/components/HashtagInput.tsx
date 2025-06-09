import React, { useState, useEffect } from 'react';
import { Hash } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HashtagInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface Hashtag {
  id: string;
  name: string;
  usage_count: number;
}

export default function HashtagInput({ value, onChange, placeholder }: HashtagInputProps) {
  const [suggestions, setSuggestions] = useState<Hashtag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  useEffect(() => {
    const currentWord = getCurrentWord(value, cursorPosition);
    if (currentWord.startsWith('#') && currentWord.length > 1) {
      fetchHashtagSuggestions(currentWord.slice(1));
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value, cursorPosition]);

  const getCurrentWord = (text: string, position: number) => {
    const words = text.slice(0, position).split(/\s+/);
    return words[words.length - 1] || '';
  };

  const fetchHashtagSuggestions = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('hashtags')
        .select('*')
        .ilike('name', `${query}%`)
        .order('usage_count', { ascending: false })
        .limit(5);

      if (error) throw error;
      setSuggestions(data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching hashtag suggestions:', error);
    }
  };

  const insertHashtag = (hashtag: string) => {
    const currentWord = getCurrentWord(value, cursorPosition);
    const beforeCursor = value.slice(0, cursorPosition - currentWord.length);
    const afterCursor = value.slice(cursorPosition);
    const newValue = `${beforeCursor}#${hashtag} ${afterCursor}`;
    
    onChange(newValue);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === '#') {
      setShowSuggestions(true);
    }
  };

  const extractHashtags = (text: string) => {
    const hashtags = text.match(/#[\w\u0600-\u06FF]+/g) || [];
    return [...new Set(hashtags)];
  };

  const currentHashtags = extractHashtags(value);

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setCursorPosition(e.target.selectionStart);
        }}
        onKeyDown={handleKeyDown}
        onSelect={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        rows={4}
      />

      {/* Hashtag Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {suggestions.map((hashtag) => (
            <button
              key={hashtag.id}
              onClick={() => insertHashtag(hashtag.name)}
              className="w-full px-4 py-2 text-right hover:bg-gray-50 flex items-center justify-between"
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <Hash className="w-4 h-4 text-gray-400" />
                <span className="font-medium">#{hashtag.name}</span>
              </div>
              <span className="text-sm text-gray-500">{hashtag.usage_count} منشور</span>
            </button>
          ))}
        </div>
      )}

      {/* Current Hashtags */}
      {currentHashtags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {currentHashtags.map((hashtag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
            >
              {hashtag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}