/*
  # Enhanced Social Platform Features

  1. New Tables
    - `media_uploads` - Store uploaded media files
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `file_name` (text)
      - `file_type` (text) - image/video/audio
      - `file_size` (bigint)
      - `file_url` (text)
      - `thumbnail_url` (text)
      - `created_at` (timestamp)
    
    - `reactions` - Post reactions (like, love, laugh, etc.)
      - `id` (uuid, primary key)
      - `post_id` (uuid, references posts)
      - `user_id` (uuid, references profiles)
      - `reaction_type` (text) - like, love, laugh, angry, sad, wow
      - `created_at` (timestamp)
    
    - `stories` - User stories feature
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `content` (text)
      - `media_url` (text)
      - `expires_at` (timestamp)
      - `created_at` (timestamp)
    
    - `hashtags` - Hashtag system
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `usage_count` (integer)
      - `created_at` (timestamp)
    
    - `post_hashtags` - Many-to-many relationship
      - `post_id` (uuid, references posts)
      - `hashtag_id` (uuid, references hashtags)
    
    - `mentions` - User mentions in posts
      - `id` (uuid, primary key)
      - `post_id` (uuid, references posts)
      - `mentioned_user_id` (uuid, references profiles)
      - `created_at` (timestamp)

  2. Enhanced Tables
    - Add `media_type` to posts table
    - Add `is_verified` to profiles table
    - Add `privacy_level` to posts table

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies
*/

-- Media uploads table
CREATE TABLE IF NOT EXISTS media_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('image', 'video', 'audio')),
  file_size bigint NOT NULL,
  file_url text NOT NULL,
  thumbnail_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Reactions table (replacing simple likes)
CREATE TABLE IF NOT EXISTS reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'angry', 'sad', 'wow')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Stories table
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text DEFAULT '',
  media_url text DEFAULT '',
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  created_at timestamptz DEFAULT now()
);

-- Hashtags table
CREATE TABLE IF NOT EXISTS hashtags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Post hashtags junction table
CREATE TABLE IF NOT EXISTS post_hashtags (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  hashtag_id uuid REFERENCES hashtags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (post_id, hashtag_id)
);

-- Mentions table
CREATE TABLE IF NOT EXISTS mentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  mentioned_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add new columns to existing tables
DO $$
BEGIN
  -- Add media_type to posts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'media_type'
  ) THEN
    ALTER TABLE posts ADD COLUMN media_type text DEFAULT 'text' CHECK (media_type IN ('text', 'image', 'video', 'mixed'));
  END IF;

  -- Add privacy_level to posts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'privacy_level'
  ) THEN
    ALTER TABLE posts ADD COLUMN privacy_level text DEFAULT 'public' CHECK (privacy_level IN ('public', 'followers', 'private'));
  END IF;

  -- Add is_verified to profiles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_verified boolean DEFAULT false;
  END IF;

  -- Add location to profiles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'location'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location text DEFAULT '';
  END IF;

  -- Add website to profiles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'website'
  ) THEN
    ALTER TABLE profiles ADD COLUMN website text DEFAULT '';
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE media_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentions ENABLE ROW LEVEL SECURITY;

-- Media uploads policies
CREATE POLICY "Media uploads are viewable by everyone"
  ON media_uploads FOR SELECT
  USING (true);

CREATE POLICY "Users can upload their own media"
  ON media_uploads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media"
  ON media_uploads FOR DELETE
  USING (auth.uid() = user_id);

-- Reactions policies
CREATE POLICY "Reactions are viewable by everyone"
  ON reactions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can react to posts"
  ON reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions"
  ON reactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
  ON reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Stories policies
CREATE POLICY "Stories are viewable by everyone"
  ON stories FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own stories"
  ON stories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories"
  ON stories FOR DELETE
  USING (auth.uid() = user_id);

-- Hashtags policies
CREATE POLICY "Hashtags are viewable by everyone"
  ON hashtags FOR SELECT
  USING (true);

CREATE POLICY "System can manage hashtags"
  ON hashtags FOR ALL
  USING (true);

-- Post hashtags policies
CREATE POLICY "Post hashtags are viewable by everyone"
  ON post_hashtags FOR SELECT
  USING (true);

CREATE POLICY "System can manage post hashtags"
  ON post_hashtags FOR ALL
  USING (true);

-- Mentions policies
CREATE POLICY "Mentions are viewable by everyone"
  ON mentions FOR SELECT
  USING (true);

CREATE POLICY "System can create mentions"
  ON mentions FOR INSERT
  WITH CHECK (true);

-- Functions for hashtag extraction and management
CREATE OR REPLACE FUNCTION extract_hashtags(content text)
RETURNS text[] AS $$
DECLARE
  hashtag_array text[];
BEGIN
  SELECT array_agg(DISTINCT lower(substring(match FROM 2)))
  INTO hashtag_array
  FROM regexp_split_to_table(content, '\s+') AS match
  WHERE match ~ '^#[a-zA-Z0-9_\u0600-\u06FF]+$';
  
  RETURN COALESCE(hashtag_array, ARRAY[]::text[]);
END;
$$ LANGUAGE plpgsql;

-- Function to process hashtags when post is created/updated
CREATE OR REPLACE FUNCTION process_post_hashtags()
RETURNS TRIGGER AS $$
DECLARE
  hashtag_name text;
  hashtag_id uuid;
  hashtag_array text[];
BEGIN
  -- Extract hashtags from content
  hashtag_array := extract_hashtags(NEW.content);
  
  -- Delete existing hashtag associations for this post
  DELETE FROM post_hashtags WHERE post_id = NEW.id;
  
  -- Process each hashtag
  FOREACH hashtag_name IN ARRAY hashtag_array
  LOOP
    -- Insert or get existing hashtag
    INSERT INTO hashtags (name, usage_count)
    VALUES (hashtag_name, 1)
    ON CONFLICT (name) 
    DO UPDATE SET usage_count = hashtags.usage_count + 1
    RETURNING id INTO hashtag_id;
    
    -- If no ID returned, get existing hashtag ID
    IF hashtag_id IS NULL THEN
      SELECT id INTO hashtag_id FROM hashtags WHERE name = hashtag_name;
    END IF;
    
    -- Link post to hashtag
    INSERT INTO post_hashtags (post_id, hashtag_id)
    VALUES (NEW.id, hashtag_id)
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for hashtag processing
CREATE OR REPLACE TRIGGER process_hashtags_trigger
  AFTER INSERT OR UPDATE OF content ON posts
  FOR EACH ROW
  EXECUTE FUNCTION process_post_hashtags();

-- Function to clean up expired stories
CREATE OR REPLACE FUNCTION cleanup_expired_stories()
RETURNS void AS $$
BEGIN
  DELETE FROM stories WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_media_uploads_user_id ON media_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_media_uploads_file_type ON media_uploads(file_type);
CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_type ON reactions(reaction_type);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_hashtags_name ON hashtags(name);
CREATE INDEX IF NOT EXISTS idx_hashtags_usage_count ON hashtags(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_mentions_post_id ON mentions(post_id);
CREATE INDEX IF NOT EXISTS idx_mentions_user_id ON mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_posts_media_type ON posts(media_type);
CREATE INDEX IF NOT EXISTS idx_posts_privacy_level ON posts(privacy_level);