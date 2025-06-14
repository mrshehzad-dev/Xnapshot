import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Add validation for URL format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  throw new Error('Invalid Supabase URL format')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  }
})

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          x_user_id: string | null
          username: string
          name: string
          profile_image_url: string | null
          followers_count: number
          following_count: number
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string | null
          created_at: string
          updated_at: string
          x_connected: boolean
          auth_user_id: string | null
        }
        Insert: {
          id?: string
          x_user_id?: string | null
          username: string
          name: string
          profile_image_url?: string | null
          followers_count?: number
          following_count?: number
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          created_at?: string
          updated_at?: string
          x_connected?: boolean
          auth_user_id?: string | null
        }
        Update: {
          id?: string
          x_user_id?: string | null
          username?: string
          name?: string
          profile_image_url?: string | null
          followers_count?: number
          following_count?: number
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          created_at?: string
          updated_at?: string
          x_connected?: boolean
          auth_user_id?: string | null
        }
      }
      tweets: {
        Row: {
          id: string
          user_id: string | null
          x_tweet_id: string
          text: string
          created_at: string
          retweet_count: number
          like_count: number
          reply_count: number
          quote_count: number
          impression_count: number
          engagement_rate: number
          performance_score: number
          fetched_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          x_tweet_id: string
          text: string
          created_at: string
          retweet_count?: number
          like_count?: number
          reply_count?: number
          quote_count?: number
          impression_count?: number
          engagement_rate?: number
          performance_score?: number
          fetched_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          x_tweet_id?: string
          text?: string
          created_at?: string
          retweet_count?: number
          like_count?: number
          reply_count?: number
          quote_count?: number
          impression_count?: number
          engagement_rate?: number
          performance_score?: number
          fetched_at?: string
        }
      }
      daily_metrics: {
        Row: {
          id: string
          user_id: string | null
          date: string
          total_tweets: number
          total_engagement: number
          total_impressions: number
          avg_engagement_rate: number
          top_tweet_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          date: string
          total_tweets?: number
          total_engagement?: number
          total_impressions?: number
          avg_engagement_rate?: number
          top_tweet_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          date?: string
          total_tweets?: number
          total_engagement?: number
          total_impressions?: number
          avg_engagement_rate?: number
          top_tweet_id?: string | null
          created_at?: string
        }
      }
      oauth_sessions: {
        Row: {
          id: string
          state: string
          code_verifier: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          state: string
          code_verifier: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          state?: string
          code_verifier?: string
          expires_at?: string
          created_at?: string
        }
      }
    }
  }
}