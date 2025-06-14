import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabaseAuth } from '../services/supabaseAuth'

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnectingX, setIsConnectingX] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get initial user
    supabaseAuth.getCurrentUser().then(setUser).finally(() => setIsLoading(false))

    // Listen for auth changes
    const { data: { subscription } } = supabaseAuth.onAuthStateChange((user) => {
      setUser(user)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const user = await supabaseAuth.signUp(email, password, name)
      setUser(user)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const user = await supabaseAuth.signIn(email, password)
      setUser(user)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const connectWithX = async () => {
    setIsConnectingX(true)
    setError(null)

    try {
      const { auth_url, state } = await supabaseAuth.connectWithX()
      
      // Store state for validation
      sessionStorage.setItem('x_oauth_state', state)
      
      // Redirect to X authorization
      window.location.href = auth_url
    } catch (err: any) {
      setError(err.message)
      setIsConnectingX(false)
    }
  }

  const handleCallback = async (code: string, state: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const storedState = sessionStorage.getItem('x_oauth_state')
      if (!storedState || storedState !== state) {
        throw new Error('Invalid state parameter. Please try connecting again.')
      }

      await supabaseAuth.handleXCallback(code, state)
      
      // Clean up session storage
      sessionStorage.removeItem('x_oauth_state')
      
      // Force refresh of user data
      const currentUser = await supabaseAuth.getCurrentUser()
      setUser(currentUser)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
      setIsConnectingX(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      await supabaseAuth.signOut()
      setUser(null)
      sessionStorage.removeItem('x_oauth_state')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    user,
    isLoading,
    isConnectingX,
    error,
    signUp,
    signIn,
    connectWithX,
    handleCallback,
    signOut,
    isAuthenticated: !!user
  }
}