import React, { useState } from 'react'
import { User, Calendar, BarChart3, TrendingUp, Eye, Heart, MessageCircle, Repeat2, LogOut, RefreshCw, Twitter, Link, CheckCircle, AlertCircle } from 'lucide-react'
import { useSupabaseData } from '../hooks/useSupabaseData'
import { useSupabaseAuth } from '../hooks/useSupabaseAuth'
import TweetCard from './TweetCard'
import MetricsCard from './MetricsCard'
import PerformanceChart from './PerformanceChart'
import { weeklyData } from '../utils/mockData'

interface DashboardProps {
  onLogout: () => void
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('today')
  const { signOut, connectWithX, isConnectingX, user: authUser } = useSupabaseAuth()
  const { user, todaysTweets, dayMetrics, isLoading, error, refreshData } = useSupabaseData()

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const handleLogout = async () => {
    await signOut()
    onLogout()
  }

  const handleRefresh = async () => {
    await refreshData()
  }

  const handleConnectX = async () => {
    try {
      await connectWithX()
    } catch (err) {
      console.error('Failed to connect with X:', err)
    }
  }

  const isXConnected = user?.x_connected || false

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={handleRefresh}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleLogout}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Social Snapshot</h1>
                <p className="text-sm text-gray-600">X Performance Tracker</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* X Connection Status */}
              {isXConnected ? (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">X Connected</span>
                </div>
              ) : (
                <button
                  onClick={handleConnectX}
                  disabled={isConnectingX}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  {isConnectingX ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="text-sm font-medium">Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Twitter className="h-4 w-4" />
                      <span className="text-sm font-medium">Connect X</span>
                      <Link className="h-3 w-3" />
                    </>
                  )}
                </button>
              )}

              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                title="Refresh Data"
              >
                <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              
              {user && (
                <div className="flex items-center space-x-3">
                  <img
                    src={user.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || authUser?.email || 'User')}&background=3b82f6&color=fff`}
                    alt={user.name || authUser?.email}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user.name || authUser?.email}</p>
                    {user.username && <p className="text-xs text-gray-600">@{user.username}</p>}
                  </div>
                </div>
              )}
              
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* X Connection Notice */}
        {!isXConnected && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 rounded-xl">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Twitter className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your X Account</h3>
                <p className="text-gray-700 mb-4">
                  To start tracking your X performance and get detailed analytics, you need to connect your X account.
                </p>
                <button
                  onClick={handleConnectX}
                  disabled={isConnectingX}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  {isConnectingX ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Connecting with X...</span>
                    </>
                  ) : (
                    <>
                      <Twitter className="h-5 w-5" />
                      <span>Connect X Account</span>
                      <Link className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Time Period Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {[
              { key: 'today', label: 'Today' },
              { key: 'week', label: 'This Week' },
              { key: 'month', label: 'This Month' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && !dayMetrics && (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your analytics...</p>
          </div>
        )}

        {/* Metrics Cards */}
        {isXConnected && dayMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricsCard
              title="Total Tweets"
              value={dayMetrics.total_tweets}
              change="Live Data"
              changeType="positive"
              icon={MessageCircle}
              color="bg-gradient-to-r from-blue-500 to-blue-600"
            />
            <MetricsCard
              title="Total Engagement"
              value={formatNumber(dayMetrics.total_engagement)}
              change="Live Data"
              changeType="positive"
              icon={Heart}
              color="bg-gradient-to-r from-red-500 to-pink-600"
            />
            <MetricsCard
              title="Total Impressions"
              value={formatNumber(dayMetrics.total_impressions)}
              change="Live Data"
              changeType="positive"
              icon={Eye}
              color="bg-gradient-to-r from-purple-500 to-purple-600"
            />
            <MetricsCard
              title="Avg. Engagement Rate"
              value={`${dayMetrics.avg_engagement_rate.toFixed(2)}%`}
              change="Live Data"
              changeType="positive"
              icon={TrendingUp}
              color="bg-gradient-to-r from-green-500 to-green-600"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-8">
            <PerformanceChart 
              data={weeklyData} 
              title="Weekly Performance Overview"
            />

            {/* Today's Tweets */}
            {isXConnected && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Today's Tweets</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date().toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {todaysTweets.length > 0 ? (
                    todaysTweets.map((tweet) => (
                      <TweetCard 
                        key={tweet.id} 
                        tweet={{
                          id: tweet.x_tweet_id,
                          text: tweet.text,
                          created_at: tweet.created_at,
                          author: {
                            id: user?.x_user_id || '',
                            name: user?.name || '',
                            username: user?.username || '',
                            profile_image_url: user?.profile_image_url || ''
                          },
                          public_metrics: {
                            retweet_count: tweet.retweet_count,
                            like_count: tweet.like_count,
                            reply_count: tweet.reply_count,
                            quote_count: tweet.quote_count,
                            impression_count: tweet.impression_count
                          },
                          engagement_rate: tweet.engagement_rate,
                          performance_score: tweet.performance_score
                        }} 
                      />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No tweets posted today yet.</p>
                      <p className="text-sm text-gray-400 mt-2">Start tweeting to see your analytics!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Account Stats & Tips */}
          <div className="space-y-8">
            {/* Account Stats */}
            {isXConnected && user && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-500" />
                  <span>Account Overview</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Followers</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatNumber(user.followers_count)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Following</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatNumber(user.following_count)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tweets Today</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {dayMetrics?.total_tweets || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Today's Insight</h3>
              {isXConnected && dayMetrics?.total_tweets ? (
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  You've posted {dayMetrics.total_tweets} tweet{dayMetrics.total_tweets > 1 ? 's' : ''} today with an average engagement rate of {dayMetrics.avg_engagement_rate.toFixed(2)}%!
                </p>
              ) : isXConnected ? (
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  Start tweeting today to get personalized insights about your content performance!
                </p>
              ) : (
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  Connect your X account to start getting detailed analytics and personalized insights about your content performance.
                </p>
              )}
              <div className="bg-white rounded-lg p-3 text-xs text-gray-600">
                <strong>Tip:</strong> {isXConnected ? 'Post consistently and engage with your audience for better performance.' : 'Connect your X account to unlock powerful analytics features.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}