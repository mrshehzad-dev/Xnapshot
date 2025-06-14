import { supabase } from '../lib/supabase'
import { Database } from '../lib/supabase'

type User = Database['public']['Tables']['users']['Row']
type Tweet = Database['public']['Tables']['tweets']['Row']
type DailyMetrics = Database['public']['Tables']['daily_metrics']['Row']

class SupabaseDataService {
  async getCurrentUser(): Promise<User | null> {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return null

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUser.id)
      .single()

    if (error) {
      // Handle the case where no user record exists yet
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error fetching user:', error)
      return null
    }

    return data
  }

  async getTodaysTweets(): Promise<Tweet[]> {
    const user = await this.getCurrentUser()
    if (!user || !user.x_connected) return []

    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

    // First try to get from database
    const { data: cachedTweets, error: cacheError } = await supabase
      .from('tweets')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startOfDay.toISOString())
      .lt('created_at', endOfDay.toISOString())
      .order('created_at', { ascending: false })

    if (cacheError) {
      console.error('Error fetching cached tweets:', cacheError)
    }

    // If we have recent data (fetched within last hour), return it
    if (cachedTweets && cachedTweets.length > 0) {
      const lastFetch = new Date(cachedTweets[0].fetched_at)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      
      if (lastFetch > oneHourAgo) {
        return cachedTweets
      }
    }

    // Otherwise, fetch fresh data from X API via edge function
    try {
      const { data: freshTweets, error: apiError } = await supabase.functions.invoke('x-api', {
        body: {
          endpoint: 'tweets',
          start_time: startOfDay.toISOString(),
          end_time: endOfDay.toISOString(),
          max_results: 10
        }
      })

      if (apiError) throw apiError

      // Return the fresh data (it's already stored in the database by the edge function)
      const { data: updatedTweets } = await supabase
        .from('tweets')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startOfDay.toISOString())
        .lt('created_at', endOfDay.toISOString())
        .order('created_at', { ascending: false })

      return updatedTweets || []
    } catch (error) {
      console.error('Error fetching fresh tweets:', error)
      // Return cached data if available, even if stale
      return cachedTweets || []
    }
  }

  async getDailyMetrics(date: string): Promise<DailyMetrics | null> {
    const user = await this.getCurrentUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('daily_metrics')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching daily metrics:', error)
      return null
    }

    return data
  }

  async calculateAndStoreDailyMetrics(date: string): Promise<DailyMetrics | null> {
    const user = await this.getCurrentUser()
    if (!user) return null

    // Get all tweets for the day
    const startOfDay = new Date(date + 'T00:00:00Z')
    const endOfDay = new Date(date + 'T23:59:59Z')

    const { data: tweets, error: tweetsError } = await supabase
      .from('tweets')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())

    if (tweetsError) {
      console.error('Error fetching tweets for metrics:', tweetsError)
      return null
    }

    if (!tweets || tweets.length === 0) {
      return null
    }

    // Calculate metrics
    const totalTweets = tweets.length
    const totalEngagement = tweets.reduce((sum, tweet) => 
      sum + tweet.like_count + tweet.retweet_count + tweet.reply_count + tweet.quote_count, 0)
    const totalImpressions = tweets.reduce((sum, tweet) => sum + tweet.impression_count, 0)
    const avgEngagementRate = tweets.reduce((sum, tweet) => sum + tweet.engagement_rate, 0) / tweets.length
    
    // Find top tweet
    const topTweet = tweets.reduce((prev, current) => 
      prev.performance_score > current.performance_score ? prev : current)

    // Store metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('daily_metrics')
      .upsert({
        user_id: user.id,
        date,
        total_tweets: totalTweets,
        total_engagement: totalEngagement,
        total_impressions: totalImpressions,
        avg_engagement_rate: avgEngagementRate,
        top_tweet_id: topTweet.id
      }, {
        onConflict: 'user_id,date'
      })
      .select('*')
      .single()

    if (metricsError) {
      console.error('Error storing daily metrics:', metricsError)
      return null
    }

    return metrics
  }

  async refreshUserData(): Promise<User | null> {
    try {
      const { data, error } = await supabase.functions.invoke('x-api', {
        body: { endpoint: 'user' }
      })
      
      if (error) throw error
      
      return await this.getCurrentUser()
    } catch (error) {
      console.error('Error refreshing user data:', error)
      return null
    }
  }
}

export const supabaseData = new SupabaseDataService()