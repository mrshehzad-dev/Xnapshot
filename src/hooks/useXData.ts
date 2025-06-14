import { useState, useEffect } from 'react';
import { xApiService, XUser, XTweet } from '../services/xApi';
import { Tweet, DayMetrics, User } from '../types';

// Transform X API data to our internal types
const transformXUser = (xUser: XUser): User => ({
  id: xUser.id,
  name: xUser.name,
  username: xUser.username,
  profile_image_url: xUser.profile_image_url,
  followers_count: xUser.public_metrics.followers_count,
  following_count: xUser.public_metrics.following_count,
});

const transformXTweet = (xTweet: XTweet, author: XUser): Tweet => {
  const totalEngagement = 
    xTweet.public_metrics.like_count +
    xTweet.public_metrics.retweet_count +
    xTweet.public_metrics.reply_count +
    xTweet.public_metrics.quote_count;

  const impressions = xTweet.non_public_metrics?.impression_count || 
                     xTweet.organic_metrics?.impression_count || 
                     totalEngagement * 10; // Fallback estimation

  const engagementRate = impressions > 0 ? (totalEngagement / impressions) * 100 : 0;

  return {
    id: xTweet.id,
    text: xTweet.text,
    created_at: xTweet.created_at,
    author: transformXUser(author),
    public_metrics: {
      retweet_count: xTweet.public_metrics.retweet_count,
      like_count: xTweet.public_metrics.like_count,
      reply_count: xTweet.public_metrics.reply_count,
      quote_count: xTweet.public_metrics.quote_count,
      impression_count: impressions,
    },
    engagement_rate: engagementRate,
    performance_score: Math.min(100, Math.round(engagementRate * 20)), // Scale to 0-100
  };
};

export const useXData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [todaysTweets, setTodaysTweets] = useState<Tweet[]>([]);
  const [dayMetrics, setDayMetrics] = useState<DayMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    if (!xApiService.isAuthenticated()) return;

    setIsLoading(true);
    setError(null);

    try {
      const xUser = await xApiService.getCurrentUser();
      setUser(transformXUser(xUser));
    } catch (err) {
      setError('Failed to fetch user data');
      console.error('Error fetching user data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTodaysTweets = async () => {
    if (!xApiService.isAuthenticated() || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { tweets: xTweets, users: xUsers } = await xApiService.getTodaysTweets(user.id);
      
      // Create a map of users for easy lookup
      const userMap = new Map(xUsers.map(u => [u.id, u]));
      
      // Transform tweets
      const transformedTweets = xTweets.map(tweet => {
        const author = userMap.get(tweet.author_id) || xUsers[0]; // Fallback to first user
        return transformXTweet(tweet, author);
      });

      setTodaysTweets(transformedTweets);

      // Calculate day metrics
      if (transformedTweets.length > 0) {
        const totalEngagement = transformedTweets.reduce((sum, tweet) => 
          sum + tweet.public_metrics.like_count + tweet.public_metrics.retweet_count + 
          tweet.public_metrics.reply_count + tweet.public_metrics.quote_count, 0);

        const totalImpressions = transformedTweets.reduce((sum, tweet) => 
          sum + tweet.public_metrics.impression_count, 0);

        const avgEngagementRate = transformedTweets.reduce((sum, tweet) => 
          sum + tweet.engagement_rate, 0) / transformedTweets.length;

        const topTweet = transformedTweets.reduce((prev, current) => 
          prev.performance_score > current.performance_score ? prev : current);

        setDayMetrics({
          date: new Date().toISOString().split('T')[0],
          total_tweets: transformedTweets.length,
          total_engagement: totalEngagement,
          total_impressions: totalImpressions,
          avg_engagement_rate: avgEngagementRate,
          top_tweet: topTweet,
        });
      }
    } catch (err) {
      setError('Failed to fetch tweets data');
      console.error('Error fetching tweets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (xApiService.isAuthenticated()) {
      fetchUserData();
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchTodaysTweets();
    }
  }, [user]);

  const refreshData = async () => {
    await fetchUserData();
    await fetchTodaysTweets();
  };

  return {
    user,
    todaysTweets,
    dayMetrics,
    isLoading,
    error,
    refreshData,
  };
};