import React, { useState } from 'react'
import { Twitter, TrendingUp, BarChart3, Users, Loader2, AlertCircle, Mail, Lock, User, ArrowRight } from 'lucide-react'
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth'

export default function LoginPage() {
  const { signIn, signUp, isLoading, error } = useSupabaseAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (isSignUp) {
        await signUp(formData.email, formData.password, formData.name)
      } else {
        await signIn(formData.email, formData.password)
      }
    } catch (err) {
      console.error('Authentication failed:', err)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-3 rounded-xl">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Social Snapshot</h1>
          <p className="text-xl text-gray-600">X Performance Tracker</p>
        </header>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Features */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Track Your X Performance Like Never Before
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Get detailed insights into your tweet performance, discover your top content, and grow your audience with data-driven decisions.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Daily Performance Tracking</h3>
                  <p className="text-gray-600">Monitor your tweets' engagement rates, impressions, and overall performance metrics.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-teal-100 p-2 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Top Tweet Analysis</h3>
                  <p className="text-gray-600">Identify your best-performing content and understand what resonates with your audience.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Audience Insights</h3>
                  <p className="text-gray-600">Discover when your audience is most active and optimize your posting schedule.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login/Signup Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-4 rounded-full inline-flex mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {isSignUp ? 'Create Your Account' : 'Welcome Back'}
              </h3>
              <p className="text-gray-600">
                {isSignUp ? 'Start tracking your X performance today' : 'Sign in to access your dashboard'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-red-600 font-medium mb-1">Authentication Error</p>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required={isSignUp}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your password"
                  />
                </div>
                {isSignUp && (
                  <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Secure Login
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                  Free Forever
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                  No Spam
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Features */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Everything You Need to Grow</h3>
            <p className="text-lg text-gray-600">Comprehensive analytics tools to understand and improve your X presence</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-white shadow-lg border border-gray-100">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Real-time Analytics</h4>
              <p className="text-gray-600 text-sm">Track performance as it happens with live updates and instant insights.</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-white shadow-lg border border-gray-100">
              <div className="bg-teal-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-teal-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Smart Recommendations</h4>
              <p className="text-gray-600 text-sm">Get AI-powered suggestions to optimize your content strategy.</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-white shadow-lg border border-gray-100">
              <div className="bg-purple-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Competitor Analysis</h4>
              <p className="text-gray-600 text-sm">Compare your performance with industry leaders and competitors.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}