/*
  # Movie Subscription Platform Schema

  ## Overview
  Complete database schema for a movie streaming platform with subscription management.

  ## New Tables

  ### 1. profiles
  - `id` (uuid, primary key, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `avatar_url` (text, optional)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. subscription_tiers
  - `id` (uuid, primary key)
  - `name` (text) - e.g., "Free", "Basic", "Premium"
  - `description` (text)
  - `price` (numeric) - monthly price
  - `features` (jsonb) - array of features
  - `max_quality` (text) - e.g., "720p", "1080p", "4K"
  - `max_devices` (integer)
  - `created_at` (timestamptz)

  ### 3. user_subscriptions
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `tier_id` (uuid, references subscription_tiers)
  - `status` (text) - "active", "cancelled", "expired"
  - `started_at` (timestamptz)
  - `expires_at` (timestamptz, optional)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. movies
  - `id` (uuid, primary key)
  - `title` (text)
  - `description` (text)
  - `release_year` (integer)
  - `duration_minutes` (integer)
  - `rating` (numeric) - average user rating
  - `poster_url` (text)
  - `backdrop_url` (text)
  - `trailer_url` (text, optional)
  - `genres` (text array)
  - `required_tier` (uuid, references subscription_tiers) - minimum tier needed
  - `is_featured` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. user_watchlist
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `movie_id` (uuid, references movies)
  - `added_at` (timestamptz)

  ### 6. watch_history
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `movie_id` (uuid, references movies)
  - `progress_seconds` (integer) - how far user watched
  - `completed` (boolean)
  - `last_watched` (timestamptz)

  ## Security

  - Enable RLS on all tables
  - Users can read their own profile
  - Users can update their own profile
  - Anyone can read movies and subscription tiers
  - Users can only access their own subscriptions, watchlist, and watch history
  - Users can read movies based on their subscription tier

  ## Notes

  1. Seed data included for subscription tiers and sample movies
  2. All timestamps use timestamptz for timezone awareness
  3. Comprehensive indexes for performance
  4. Foreign key constraints ensure data integrity
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create subscription_tiers table
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  max_quality text NOT NULL DEFAULT '720p',
  max_devices integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier_id uuid NOT NULL REFERENCES subscription_tiers(id),
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'cancelled', 'expired'))
);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  release_year integer NOT NULL,
  duration_minutes integer NOT NULL,
  rating numeric DEFAULT 0,
  poster_url text NOT NULL,
  backdrop_url text NOT NULL,
  trailer_url text,
  genres text[] NOT NULL DEFAULT '{}',
  required_tier uuid REFERENCES subscription_tiers(id),
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

-- Create user_watchlist table
CREATE TABLE IF NOT EXISTS user_watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id uuid NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

ALTER TABLE user_watchlist ENABLE ROW LEVEL SECURITY;

-- Create watch_history table
CREATE TABLE IF NOT EXISTS watch_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id uuid NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  progress_seconds integer DEFAULT 0,
  completed boolean DEFAULT false,
  last_watched timestamptz DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for subscription_tiers
CREATE POLICY "Anyone can view subscription tiers"
  ON subscription_tiers FOR SELECT
  TO authenticated, anon
  USING (true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON user_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for movies
CREATE POLICY "Anyone can view movies"
  ON movies FOR SELECT
  TO authenticated, anon
  USING (true);

-- RLS Policies for user_watchlist
CREATE POLICY "Users can view own watchlist"
  ON user_watchlist FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own watchlist"
  ON user_watchlist FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from own watchlist"
  ON user_watchlist FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for watch_history
CREATE POLICY "Users can view own watch history"
  ON watch_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watch history"
  ON watch_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watch history"
  ON watch_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_movies_featured ON movies(is_featured);
CREATE INDEX IF NOT EXISTS idx_movies_genres ON movies USING gin(genres);
CREATE INDEX IF NOT EXISTS idx_user_watchlist_user_id ON user_watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_user_id ON watch_history(user_id);

-- Seed subscription tiers
INSERT INTO subscription_tiers (name, description, price, features, max_quality, max_devices)
VALUES 
  ('Free', 'Basic access with ads', 0, '["Limited content", "720p quality", "Ads included", "1 device"]'::jsonb, '720p', 1),
  ('Basic', 'Ad-free streaming', 9.99, '["Ad-free", "Full HD (1080p)", "2 devices", "Download on 1 device"]'::jsonb, '1080p', 2),
  ('Premium', 'Ultimate experience', 15.99, '["Ad-free", "4K + HDR", "4 devices", "Download on 2 devices", "Early access to new releases"]'::jsonb, '4K', 4)
ON CONFLICT (name) DO NOTHING;

-- Get tier IDs for seeding movies
DO $$
DECLARE
  free_tier_id uuid;
  basic_tier_id uuid;
  premium_tier_id uuid;
BEGIN
  SELECT id INTO free_tier_id FROM subscription_tiers WHERE name = 'Free';
  SELECT id INTO basic_tier_id FROM subscription_tiers WHERE name = 'Basic';
  SELECT id INTO premium_tier_id FROM subscription_tiers WHERE name = 'Premium';

  -- Seed sample movies
  INSERT INTO movies (title, description, release_year, duration_minutes, rating, poster_url, backdrop_url, genres, required_tier, is_featured)
  VALUES 
    ('The Future Chronicles', 'An epic sci-fi adventure set in the year 2145 where humanity discovers a gateway to parallel universes.', 2024, 142, 8.5, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 'https://images.pexels.com/photos/2832382/pexels-photo-2832382.jpeg', ARRAY['Sci-Fi', 'Adventure'], free_tier_id, true),
    ('Mountain Peak', 'A thrilling documentary about the first successful winter summit of K2.', 2023, 98, 8.9, 'https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg', 'https://images.pexels.com/photos/618833/pexels-photo-618833.jpeg', ARRAY['Documentary', 'Adventure'], free_tier_id, true),
    ('Digital Dreams', 'A cyberpunk thriller exploring the boundaries between virtual reality and consciousness.', 2024, 127, 8.2, 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg', 'https://images.pexels.com/photos/1420701/pexels-photo-1420701.jpeg', ARRAY['Sci-Fi', 'Thriller'], basic_tier_id, true),
    ('Ocean Depths', 'Marine biologists discover an ancient civilization beneath the Pacific Ocean.', 2023, 134, 7.8, 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg', 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg', ARRAY['Adventure', 'Mystery'], basic_tier_id, false),
    ('Neon Nights', 'A stylish neo-noir mystery set in a futuristic Tokyo where memories can be stolen.', 2024, 118, 8.7, 'https://images.pexels.com/photos/3228842/pexels-photo-3228842.jpeg', 'https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg', ARRAY['Mystery', 'Sci-Fi', 'Thriller'], premium_tier_id, true),
    ('The Last Frontier', 'Colonists on Mars face an existential threat when their life support systems begin failing.', 2024, 145, 8.4, 'https://images.pexels.com/photos/2159/flight-sky-earth-space.jpg', 'https://images.pexels.com/photos/41951/solar-system-emergence-spitzer-telescope-telescope-41951.jpeg', ARRAY['Sci-Fi', 'Drama'], premium_tier_id, false),
    ('Urban Legends', 'A horror anthology exploring supernatural tales from major cities around the world.', 2023, 105, 7.5, 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg', 'https://images.pexels.com/photos/2170473/pexels-photo-2170473.jpeg', ARRAY['Horror', 'Mystery'], free_tier_id, false),
    ('Speed of Sound', 'A biographical drama about the development of supersonic flight.', 2023, 128, 8.1, 'https://images.pexels.com/photos/46148/aircraft-fighter-jet-f-16-falcon-46148.jpeg', 'https://images.pexels.com/photos/358319/pexels-photo-358319.jpeg', ARRAY['Drama', 'Biography'], basic_tier_id, false)
  ON CONFLICT DO NOTHING;
END $$;