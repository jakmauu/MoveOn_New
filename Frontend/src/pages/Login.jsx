import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, user, isAuthenticated } = useAuth()
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [role, setRole] = useState('coach')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = user.role === 'coach' ? '/coach/dashboard' : '/trainee/dashboard'
      navigate(redirectPath, { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await login(formData.username, formData.password)

      if (result.success) {
        const redirectPath = result.user.role === 'coach' 
          ? '/coach/dashboard' 
          : '/trainee/dashboard'
        
        navigate(redirectPath, { replace: true })
      } else {
        setError(result.error || 'Login failed. Please check your credentials.')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001a3d] to-[#002451] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">🏋️ MoveOn</h1>
          <p className="text-white/70">Welcome back! Please login to continue</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#002451] rounded-2xl shadow-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            🔐 Log In
          </h2>
          <p className="text-sm text-white/60 mb-6 text-center">
            Access your dashboard based on your role
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-200 text-sm text-center">❌ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email/Username */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email / Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter email or username"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-[#001a3d] border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400 transition disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-[#001a3d] border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400 transition disabled:opacity-50"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Role
              </label>
              <div className="flex gap-4">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="coach"
                    checked={role === 'coach'}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={loading}
                    className="sr-only peer"
                  />
                  <div className="flex items-center justify-center gap-2 px-4 py-3 bg-[#001a3d] border-2 border-white/20 rounded-lg text-white peer-checked:border-yellow-400 peer-checked:bg-yellow-400/10 transition">
                    <span>👨‍🏫</span>
                    <span className="font-medium">Coach</span>
                  </div>
                </label>

                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="trainee"
                    checked={role === 'trainee'}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={loading}
                    className="sr-only peer"
                  />
                  <div className="flex items-center justify-center gap-2 px-4 py-3 bg-[#001a3d] border-2 border-white/20 rounded-lg text-white peer-checked:border-yellow-400 peer-checked:bg-yellow-400/10 transition">
                    <span>💪</span>
                    <span className="font-medium">Trainee</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-[#001a3d] font-bold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#001a3d]"></div>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Log In</span>
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <p className="mt-6 text-center text-sm text-white/60">
            No account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-yellow-400 hover:text-yellow-300 font-medium transition"
            >
              Register Here
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}