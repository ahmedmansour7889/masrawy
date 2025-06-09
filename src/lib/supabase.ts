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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string;
          bio?: string;
          avatar_url?: string;
        };
        Update: {
          username?: string;
          full_name?: string;
          bio?: string;
          avatar_url?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          image_url: string;
          video_url: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          content: string;
          image_url?: string;
          video_url?: string;
        };
        Update: {
          content?: string;
          image_url?: string;
          video_url?: string;
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
      likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
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
    };
  };
};