import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid authentication token')
    }

    // Get user's data from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()

    if (userError || !userData?.access_token) {
      throw new Error('X access token not found. Please connect your X account first.')
    }

    const { endpoint, ...params } = await req.json()

    if (endpoint === 'user') {
      // Get current user from X API
      const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics', {
        headers: {
          'Authorization': `Bearer ${userData.access_token}`,
          'Content-Type': 'application/json',
        }
      })

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data from X API')
      }

      const xUserData = await userResponse.json()
      
      // Update user data in database
      await supabase
        .from('users')
        .update({
          name: xUserData.data.name,
          username: xUserData.data.username,
          profile_image_url: xUserData.data.profile_image_url,
          followers_count: xUserData.data.public_metrics.followers_count,
          following_count: xUserData.data.public_metrics.following_count,
          updated_at: new Date().toISOString()
        })
        .eq('auth_user_id', user.id)

      return new Response(
        JSON.stringify(xUserData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (endpoint === 'tweets') {
      // Get user's tweets
      const startTime = params.start_time
      const endTime = params.end_time
      const maxResults = params.max_results || '10'

      let tweetsUrl = `https://api.twitter.com/2/users/${userData.x_user_id}/tweets?max_results=${maxResults}&tweet.fields=created_at,public_metrics&expansions=author_id&user.fields=profile_image_url,public_metrics`
      
      if (startTime) tweetsUrl += `&start_time=${startTime}`
      if (endTime) tweetsUrl += `&end_time=${endTime}`

      const tweetsResponse = await fetch(tweetsUrl, {
        headers: {
          'Authorization': `Bearer ${userData.access_token}`,
          'Content-Type': 'application/json',
        }
      })

      if (!tweetsResponse.ok) {
        throw new Error('Failed to fetch tweets from X API')
      }

      const tweetsData = await tweetsResponse.json()

      // Store tweets in database
      if (tweetsData.data && tweetsData.data.length > 0) {
        const tweetsToInsert = tweetsData.data.map((tweet: any) => ({
          user_id: userData.id,
          x_tweet_id: tweet.id,
          text: tweet.text,
          created_at: tweet.created_at,
          retweet_count: tweet.public_metrics.retweet_count,
          like_count: tweet.public_metrics.like_count,
          reply_count: tweet.public_metrics.reply_count,
          quote_count: tweet.public_metrics.quote_count,
          impression_count: tweet.public_metrics.impression_count || 0,
          engagement_rate: calculateEngagementRate(tweet.public_metrics),
          performance_score: calculatePerformanceScore(tweet.public_metrics),
          fetched_at: new Date().toISOString()
        }))

        await supabase
          .from('tweets')
          .upsert(tweetsToInsert, { onConflict: 'x_tweet_id' })
      }

      return new Response(
        JSON.stringify(tweetsData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid endpoint')

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function calculateEngagementRate(metrics: any): number {
  const totalEngagement = metrics.like_count + metrics.retweet_count + metrics.reply_count + metrics.quote_count
  const impressions = metrics.impression_count || totalEngagement * 10 // Fallback estimation
  return impressions > 0 ? (totalEngagement / impressions) * 100 : 0
}

function calculatePerformanceScore(metrics: any): number {
  const engagementRate = calculateEngagementRate(metrics)
  return Math.min(100, Math.round(engagementRate * 20))
}