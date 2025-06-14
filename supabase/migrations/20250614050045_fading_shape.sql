/*
  # Update Users Table for App Authentication

  1. Changes
    - Make x_user_id nullable (users can exist without X connection)
    - Add email field for app authentication
    - Add x_connected boolean flag
    - Update constraints and policies

  2. Security
    - Update RLS policies to work with Supabase Auth users
    - Allow users to read/update their own data based on auth.uid()
*/

-- Add new columns for app authentication
DO $$
BEGIN
  -- Add email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'email'
  ) THEN
    ALTER TABLE users ADD COLUMN email text;
  END IF;

  -- Add x_connected column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'x_connected'
  ) THEN
    ALTER TABLE users ADD COLUMN x_connected boolean DEFAULT false;
  END IF;

  -- Add auth_user_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE users ADD COLUMN auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Make x_user_id nullable
ALTER TABLE users ALTER COLUMN x_user_id DROP NOT NULL;

-- Drop old constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'users_x_user_id_key'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_x_user_id_key;
  END IF;
END $$;

-- Add new unique constraint for x_user_id when not null
CREATE UNIQUE INDEX IF NOT EXISTS users_x_user_id_unique 
  ON users(x_user_id) 
  WHERE x_user_id IS NOT NULL;

-- Add unique constraint for auth_user_id
CREATE UNIQUE INDEX IF NOT EXISTS users_auth_user_id_unique 
  ON users(auth_user_id);

-- Drop old policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create new policies based on auth.uid()
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Update tweets policies to work with new user structure
DROP POLICY IF EXISTS "Users can read own tweets" ON tweets;
DROP POLICY IF EXISTS "Users can insert own tweets" ON tweets;
DROP POLICY IF EXISTS "Users can update own tweets" ON tweets;

CREATE POLICY "Users can read own tweets"
  ON tweets
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can insert own tweets"
  ON tweets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update own tweets"
  ON tweets
  FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Update daily_metrics policies
DROP POLICY IF EXISTS "Users can read own metrics" ON daily_metrics;
DROP POLICY IF EXISTS "Users can insert own metrics" ON daily_metrics;
DROP POLICY IF EXISTS "Users can update own metrics" ON daily_metrics;

CREATE POLICY "Users can read own metrics"
  ON daily_metrics
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can insert own metrics"
  ON daily_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update own metrics"
  ON daily_metrics
  FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));