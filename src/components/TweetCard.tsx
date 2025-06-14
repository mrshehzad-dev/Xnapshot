import { Heart, MessageCircle, Repeat2, Share, Eye, TrendingUp } from 'lucide-react';
import { Tweet } from '../types';

interface TweetCardProps {
  tweet: Tweet;
  isTopTweet?: boolean;
}

export default function TweetCard({ tweet, isTopTweet = false }: TweetCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-blue-600 bg-blue-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 transition-all duration-200 hover:shadow-xl hover:scale-105 ${
      isTopTweet ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
    }`}>
      {isTopTweet && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-1 rounded-full">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">Top Performing Tweet</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getPerformanceColor(tweet.performance_score)}`}>
            {tweet.performance_score}/100
          </div>
        </div>
      )}

      <div className="flex items-start space-x-3 mb-4">
        <img
          src={tweet.author.profile_image_url}
          alt={tweet.author.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-900">{tweet.author.name}</h3>
            <span className="text-gray-500">@{tweet.author.username}</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-500 text-sm">{formatDate(tweet.created_at)}</span>
          </div>
        </div>
      </div>

      <p className="text-gray-900 mb-4 leading-relaxed">{tweet.text}</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <Eye className="h-4 w-4" />
          <span className="text-sm font-medium">{formatNumber(tweet.public_metrics.impression_count)}</span>
          <span className="text-xs text-gray-500">impressions</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-semibold text-blue-600">{tweet.engagement_rate.toFixed(2)}%</span>
          <span className="text-xs text-gray-500 ml-1">engagement</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition-colors cursor-pointer">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">{formatNumber(tweet.public_metrics.reply_count)}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600 hover:text-green-500 transition-colors cursor-pointer">
            <Repeat2 className="h-4 w-4" />
            <span className="text-sm">{formatNumber(tweet.public_metrics.retweet_count)}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition-colors cursor-pointer">
            <Heart className="h-4 w-4" />
            <span className="text-sm">{formatNumber(tweet.public_metrics.like_count)}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition-colors cursor-pointer">
            <Share className="h-4 w-4" />
            <span className="text-sm">{formatNumber(tweet.public_metrics.quote_count)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}