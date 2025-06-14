import React, { useState, useEffect } from 'react'
import LoginPage from './components/Auth/LoginPage'
import CallbackPage from './components/Auth/CallbackPage'
import Dashboard from './components/Dashboard'
import { useSupabaseAuth } from './hooks/useSupabaseAuth'

function App() {
  const { isAuthenticated } = useSupabaseAuth()
  const [currentView, setCurrentView] = useState<'login' | 'callback' | 'dashboard'>('login')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')

    if (code && state && window.location.pathname === '/callback') {
      setCurrentView('callback')
    } else if (isAuthenticated) {
      setCurrentView('dashboard')
    } else {
      setCurrentView('login')
    }
  }, [isAuthenticated])

  const handleAuthComplete = () => {
    window.history.replaceState({}, document.title, '/')
    setCurrentView('dashboard')
  }

  const handleLogout = () => {
    setCurrentView('login')
  }

  switch (currentView) {
    case 'callback':
      return <CallbackPage onAuthComplete={handleAuthComplete} />
    case 'dashboard':
      return <Dashboard onLogout={handleLogout} />
    default:
      return <LoginPage />
  }
}

export default App