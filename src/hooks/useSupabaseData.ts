import { useState, useEffect } from 'react'
import { supabaseData } from '../services/supabaseData'
import { Database } from '../lib/supabase'
import { useSupabaseAuth } from './useSupabaseAuth'

type User = Database['public']['Tables']['users']['Row']
type Tweet = Database['public']['Tables']['tweets']['Row']
type DailyMetrics = Database['public']['Tables']['daily_metrics']['Row']

export const useSupabaseData = () => {
  const { user: authUser, isAuthenticated } = useSupabaseAuth()
  const [user, setUser] = useState<User | null>(null)
  const [todaysTweets, setTodaysTweets] = useState<Tweet[]>([])
  const [dayMetrics, setDayMetrics] = useState<DailyMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUserData = async () => {
    if (!isAuthenticated) return

    setIsLoading(true)
    setError(null)

    try {
      const userData = await supabaseData.getCurrentUser()
      setUser(userData)
    } catch (err: any) {
      setError('Failed to fetch user data')
      console.error('Error fetching user data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTodaysTweets = async () => {
    if (!isAuthenticated) return

    setIsLoading(true)
    setError(null)

    try {
      const tweets = await supabaseData.getTodaysTweets()
      setTodaysTweets(tweets)

      // Calculate and store daily metrics
      const today = new Date().toISOString().split('T')[0]
      const metrics = await supabaseData.calculateAndStoreDailyMetrics(today)
      setDayMetrics(metrics)
    } catch (err: any) {
      setError('Failed to fetch tweets data')
      console.error('Error fetching tweets:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    await Promise.all([
      supabaseData.refreshUserData(),
      fetchTodaysTweets()
    ])
    await fetchUserData()
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (user) {
      fetchTodaysTweets()
    }
  }, [user])

  return {
    user,
    todaysTweets,
    dayMetrics,
    isLoading,
    error,
    refreshData
  }
}