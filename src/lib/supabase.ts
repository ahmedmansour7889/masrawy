import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string;
          bio: string;
          avatar_url: string;
          is_verified: boolean;
          location: string;
          website: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string;
          bio?: string;
          avatar_url?: string;
          is_verified?: boolean;
          location?: string;
          website?: string;
        };
        Update: {
          username?: string;
          full_name?: string;
          bio?: string;
          avatar_url?: string;
          is_verified?: boolean;
          location?: string;
          website?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          image_url: string;
          video_url: string;
          media_type: string;
          privacy_level: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          content: string;
          image_url?: string;
          video_url?: string;
          media_type?: string;
          privacy_level?: string;
        };
        Update: {
          content?: string;
          image_url?: string;
          video_url?: string;
          media_type?: string;
          privacy_level?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
          content: string;
        };
        Update: {
          content?: string;
        };
      };
      reactions: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          reaction_type: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
          reaction_type: string;
        };
        Update: {
          reaction_type?: string;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          follower_id: string;
          following_id: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          type: string;
          title: string;
          message: string;
        };
        Update: {
          read?: boolean;
        };
      };
      media_uploads: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          file_url: string;
          thumbnail_url: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          file_url: string;
          thumbnail_url?: string;
        };
      };
      stories: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          media_url: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          content?: string;
          media_url?: string;
          expires_at?: string;
        };
      };
      hashtags: {
        Row: {
          id: string;
          name: string;
          usage_count: number;
          created_at: string;
        };
        Insert: {
          name: string;
          usage_count?: number;
        };
        Update: {
          usage_count?: number;
        };
      };
      post_hashtags: {
        Row: {
          post_id: string;
          hashtag_id: string;
        };
        Insert: {
          post_id: string;
          hashtag_id: string;
        };
      };
      mentions: {
        Row: {
          id: string;
          post_id: string;
          mentioned_user_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          mentioned_user_id: string;
        };
      };
    };
  };
};