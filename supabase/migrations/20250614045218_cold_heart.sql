/*
  # X Analytics Dashboard Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `x_user_id` (text, unique) - X platform user ID
      - `username` (text) - X username
      - `name` (text) - Display name
      - `profile_image_url` (text) - Profile image URL
      - `followers_count` (integer) - Follower count
      - `following_count` (integer) - Following count
      - `access_token` (text, encrypted) - X API access token
      - `refresh_token` (text, encrypted) - X API refresh token
      - `token_expires_at` (timestamptz) - Token expiration
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `tweets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `x_tweet_id` (text, unique) - X platform tweet ID
      - `text` (text) - Tweet content
      - `created_at` (timestamptz) - Tweet creation time
      - `retweet_count` (integer)
      - `like_count` (integer)
      - `reply_count` (integer)
      - `quote_count` (integer)
      - `impression_count` (integer)
      - `engagement_rate` (decimal)
      - `performance_score` (integer)
      - `fetched_at` (timestamptz) - When data was last fetched

    - `daily_metrics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `date` (date) - Metrics date
      - `total_tweets` (integer)
      - `total_engagement` (integer)
      - `total_impressions` (integer)
      - `avg_engagement_rate` (decimal)
      - `top_tweet_id` (uuid, foreign key to tweets)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  x_user_id text UNIQUE NOT NULL,
  username text NOT NULL,
  name text NOT NULL,
  profile_image_url text,
  followers_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tweets table
CREATE TABLE IF NOT EXISTS tweets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  x_tweet_id text UNIQUE NOT NULL,
  text text NOT NULL,
  created_at timestamptz NOT NULL,
  retweet_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  reply_count integer DEFAULT 0,
  quote_count integer DEFAULT 0,
  impression_count integer DEFAULT 0,
  engagement_rate decimal DEFAULT 0,
  performance_score integer DEFAULT 0,
  fetched_at timestamptz DEFAULT now()
);

-- Create daily_metrics table
CREATE TABLE IF NOT EXISTS daily_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  total_tweets integer DEFAULT 0,
  total_engagement integer DEFAULT 0,
  total_impressions integer DEFAULT 0,
  avg_engagement_rate decimal DEFAULT 0,
  top_tweet_id uuid REFERENCES tweets(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = x_user_id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = x_user_id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = x_user_id);

-- Create policies for tweets table
CREATE POLICY "Users can read own tweets"
  ON tweets
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE x_user_id = auth.uid()::text));

CREATE POLICY "Users can insert own tweets"
  ON tweets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE x_user_id = auth.uid()::text));

CREATE POLICY "Users can update own tweets"
  ON tweets
  FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE x_user_id = auth.uid()::text));

-- Create policies for daily_metrics table
CREATE POLICY "Users can read own metrics"
  ON daily_metrics
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE x_user_id = auth.uid()::text));

CREATE POLICY "Users can insert own metrics"
  ON daily_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE x_user_id = auth.uid()::text));

CREATE POLICY "Users can update own metrics"
  ON daily_metrics
  FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE x_user_id = auth.uid()::text));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_x_user_id ON users(x_user_id);
CREATE INDEX IF NOT EXISTS idx_tweets_user_id ON tweets(user_id);
CREATE INDEX IF NOT EXISTS idx_tweets_x_tweet_id ON tweets(x_tweet_id);
CREATE INDEX IF NOT EXISTS idx_tweets_created_at ON tweets(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_user_date ON daily_metrics(user_id, date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();