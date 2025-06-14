import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          x_user_id: string
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
        }
        Insert: {
          id?: string
          x_user_id: string
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
        }
        Update: {
          id?: string
          x_user_id?: string
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
        }
      }
      tweets: {
        Row: {
          id: string
          user_id: string
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
          user_id: string
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
          user_id?: string
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
          user_id: string
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
          user_id: string
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
          user_id?: string
          date?: string
          total_tweets?: number
          total_engagement?: number
          total_impressions?: number
          avg_engagement_rate?: number
          top_tweet_id?: string | null
          created_at?: string
        }
      }
    }
  }
}