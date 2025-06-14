import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface XOAuthRequest {
  action: 'get_auth_url' | 'exchange_token';
  code?: string;
  state?: string;
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

    const { action, code, state }: XOAuthRequest = await req.json()

    if (action === 'get_auth_url') {
      // Generate PKCE parameters
      const codeVerifier = generateCodeVerifier()
      const codeChallenge = await generateCodeChallenge(codeVerifier)
      const oauthState = generateState()

      // Store PKCE data temporarily (you might want to use a more persistent storage)
      const { error: storeError } = await supabase
        .from('oauth_sessions')
        .insert({
          state: oauthState,
          code_verifier: codeVerifier,
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        })

      if (storeError) {
        throw new Error('Failed to store OAuth session')
      }

      // Build authorization URL
      const authParams = new URLSearchParams({
        response_type: 'code',
        client_id: Deno.env.get('X_CLIENT_ID') ?? '',
        redirect_uri: `${req.headers.get('origin')}/callback`,
        scope: 'tweet.read users.read offline.access',
        state: oauthState,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
      })

      const authUrl = `https://twitter.com/i/oauth2/authorize?${authParams.toString()}`

      return new Response(
        JSON.stringify({ auth_url: authUrl, state: oauthState }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'exchange_token') {
      if (!code || !state) {
        throw new Error('Missing code or state parameter')
      }

      // Retrieve stored PKCE data
      const { data: sessionData, error: sessionError } = await supabase
        .from('oauth_sessions')
        .select('code_verifier')
        .eq('state', state)
        .single()

      if (sessionError || !sessionData) {
        throw new Error('Invalid or expired OAuth session')
      }

      // Exchange code for token
      const tokenParams = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: Deno.env.get('X_CLIENT_ID') ?? '',
        code: code,
        redirect_uri: `${req.headers.get('origin')}/callback`,
        code_verifier: sessionData.code_verifier
      })

      const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${Deno.env.get('X_CLIENT_ID')}:${Deno.env.get('X_CLIENT_SECRET')}`)}`,
        },
        body: tokenParams.toString()
      })

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange authorization code')
      }

      const tokenData = await tokenResponse.json()

      // Clean up OAuth session
      await supabase
        .from('oauth_sessions')
        .delete()
        .eq('state', state)

      return new Response(
        JSON.stringify(tokenData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid action')

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

// Helper functions
function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function generateState(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}