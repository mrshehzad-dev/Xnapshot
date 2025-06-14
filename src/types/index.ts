export interface Tweet {
  id: string;
  text: string;
  created_at: string;
  author: {
    id: string;
    name: string;
    username: string;
    profile_image_url: string;
  };
  public_metrics: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
    impression_count: number;
  };
  engagement_rate: number;
  performance_score: number;
}

export interface DayMetrics {
  date: string;
  total_tweets: number;
  total_engagement: number;
  total_impressions: number;
  avg_engagement_rate: number;
  top_tweet: Tweet;
}

export interface User {
  id: string;
  name: string;
  username: string;
  profile_image_url: string;
  followers_count: number;
  following_count: number;
}