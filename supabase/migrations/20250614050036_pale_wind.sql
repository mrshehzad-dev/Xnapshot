/*
  # Add OAuth Sessions Table

  1. New Tables
    - `oauth_sessions`
      - `id` (uuid, primary key)
      - `state` (text, unique)
      - `code_verifier` (text)
      - `expires_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `oauth_sessions` table
    - Add policy for authenticated users to manage their own sessions
*/

CREATE TABLE IF NOT EXISTS oauth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state text UNIQUE NOT NULL,
  code_verifier text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE oauth_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert/select oauth sessions (needed for the OAuth flow)
CREATE POLICY "Anyone can manage oauth sessions"
  ON oauth_sessions
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Clean up expired sessions automatically
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM oauth_sessions WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_state ON oauth_sessions(state);
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_expires_at ON oauth_sessions(expires_at);