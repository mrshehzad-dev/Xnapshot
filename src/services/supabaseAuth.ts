import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'

export interface XAuthData {
  access_token: string
  refresh_token?: string
  expires_in?: number
  user_data: {
    id: string
    name: string
    username: string
    profile_image_url: string
    public_metrics: {
      followers_count: number
      following_count: number
    }
  }
}

class SupabaseAuthService {
  async signUp(email: string, password: string, name: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    })

    if (error) throw error
    if (!data.user) throw new Error('Failed to create user')

    // Create user profile in our users table
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        auth_user_id: data.user.id,
        email: email,
        name: name,
        x_connected: false
      })

    if (profileError) {
      console.error('Error creating user profile:', profileError)
      // Don't throw here as the auth user was created successfully
    }

    return data.user
  }

  async signIn(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    if (!data.user) throw new Error('Failed to sign in')

    return data.user
  }

  async connectWithX(): Promise<{ auth_url: string; state: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('x-oauth', {
        body: { action: 'get_auth_url' }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting X auth URL:', error)
      throw new Error('Failed to initiate X authentication')
    }
  }

  async handleXCallback(code: string, state: string): Promise<void> {
    try {
      // Exchange code for X access token
      const { data: tokenData, error: tokenError } = await supabase.functions.invoke('x-oauth', {
        body: { 
          action: 'exchange_token',
          code,
          state
        }
      })

      if (tokenError) throw tokenError

      // Get user data from X API
      const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        }
      })

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data from X')
      }

      const xUserData = await userResponse.json()
      const xUser = xUserData.data

      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) throw new Error('User not authenticated')

      // Update user profile with X data
      const expiresAt = tokenData.expires_in 
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null

      const { error: updateError } = await supabase
        .from('users')
        .update({
          x_user_id: xUser.id,
          username: xUser.username,
          name: xUser.name,
          profile_image_url: xUser.profile_image_url,
          followers_count: xUser.public_metrics.followers_count,
          following_count: xUser.public_metrics.following_count,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: expiresAt,
          x_connected: true,
          updated_at: new Date().toISOString()
        })
        .eq('auth_user_id', user.id)

      if (updateError) {
        console.error('Error updating user profile:', updateError)
        throw new Error('Failed to save X account data')
      }
    } catch (error) {
      console.error('Error handling X callback:', error)
      throw new Error('Failed to complete X authentication')
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_, session) => {
      callback(session?.user || null)
    })
  }
}

export const supabaseAuth = new SupabaseAuthService()