import React, { useEffect } from 'react'
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth'
import { Loader2 } from 'lucide-react'

interface CallbackPageProps {
  onAuthComplete: () => void
}

export default function CallbackPage({ onAuthComplete }: CallbackPageProps) {
  const { handleCallback, isLoading, error } = useSupabaseAuth()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    const errorParam = urlParams.get('error')

    if (errorParam) {
      console.error('OAuth error:', errorParam)
      setTimeout(() => {
        window.location.href = '/'
      }, 3000)
      return
    }

    if (code && state) {
      handleCallback(code, state).then(() => {
        onAuthComplete()
      }).catch((err) => {
        console.error('Callback failed:', err)
      })
    } else {
      console.error('Missing code or state parameters')
      setTimeout(() => {
        window.location.href = '/'
      }, 3000)
    }
  }, [handleCallback, onAuthComplete])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">X Connection Failed</h2>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                Back to Dashboard
              </button>
              <p className="text-xs text-gray-500">
                You can try connecting your X account again from the dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connecting X Account</h2>
          <p className="text-gray-600">Please wait while we connect your X account...</p>
          <div className="mt-4 text-xs text-gray-500">
            Processing authorization with Supabase...
          </div>
        </div>
      </div>
    </div>
  )
}