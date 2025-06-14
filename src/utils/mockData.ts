import { Tweet, DayMetrics, User } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'John Creator',
  username: 'johncreator',
  profile_image_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  followers_count: 15420,
  following_count: 892,
};

export const mockTweets: Tweet[] = [
  {
    id: '1',
    text: '🚀 Just launched my new project! Excited to share what I\'ve been working on. The future of social media analytics is here! #BuildInPublic #TechStartup',
    created_at: '2024-01-15T10:30:00Z',
    author: mockUser,
    public_metrics: {
      retweet_count: 45,
      like_count: 234,
      reply_count: 28,
      quote_count: 12,
      impression_count: 8920,
    },
    engagement_rate: 3.57,
    performance_score: 95,
  },
  {
    id: '2',
    text: 'Morning coffee ☕ and planning the day ahead. What\'s everyone working on today? Share your goals below! 👇',
    created_at: '2024-01-15T08:15:00Z',
    author: mockUser,
    public_metrics: {
      retweet_count: 12,
      like_count: 89,
      reply_count: 34,
      quote_count: 3,
      impression_count: 4560,
    },
    engagement_rate: 3.03,
    performance_score: 72,
  },
  {
    id: '3',
    text: 'Quick tip: Always backup your work! 💾 Just saved myself from a potential disaster. What are your best productivity tips?',
    created_at: '2024-01-15T14:45:00Z',
    author: mockUser,
    public_metrics: {
      retweet_count: 23,
      like_count: 156,
      reply_count: 19,
      quote_count: 8,
      impression_count: 6780,
    },
    engagement_rate: 3.04,
    performance_score: 78,
  },
  {
    id: '4',
    text: 'Reflecting on 2024 goals... 🎯 1. Build meaningful connections 2. Ship great products 3. Learn something new every day. What are yours?',
    created_at: '2024-01-15T16:20:00Z',
    author: mockUser,
    public_metrics: {
      retweet_count: 18,
      like_count: 124,
      reply_count: 42,
      quote_count: 7,
      impression_count: 5940,
    },
    engagement_rate: 3.22,
    performance_score: 81,
  },
];

export const mockDayMetrics: DayMetrics = {
  date: '2024-01-15',
  total_tweets: mockTweets.length,
  total_engagement: mockTweets.reduce((sum, tweet) => 
    sum + tweet.public_metrics.like_count + tweet.public_metrics.retweet_count + 
    tweet.public_metrics.reply_count + tweet.public_metrics.quote_count, 0),
  total_impressions: mockTweets.reduce((sum, tweet) => sum + tweet.public_metrics.impression_count, 0),
  avg_engagement_rate: mockTweets.reduce((sum, tweet) => sum + tweet.engagement_rate, 0) / mockTweets.length,
  top_tweet: mockTweets[0],
};

export const weeklyData = [
  { date: '2024-01-09', engagement: 420, impressions: 12400 },
  { date: '2024-01-10', engagement: 380, impressions: 11200 },
  { date: '2024-01-11', engagement: 520, impressions: 15600 },
  { date: '2024-01-12', engagement: 290, impressions: 8900 },
  { date: '2024-01-13', engagement: 680, impressions: 18200 },
  { date: '2024-01-14', engagement: 450, impressions: 13500 },
  { date: '2024-01-15', engagement: 638, impressions: 26200 },
];