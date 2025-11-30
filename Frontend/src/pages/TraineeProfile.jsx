import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function TraineeProfile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    bio: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        phone: user.phone || '',
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await api.put(`/trainee/profile`, {
        name: form.name,
        bio: form.bio,
        phone: form.phone,
      })

      setSuccess('Profile updated successfully!')
      console.log('✅ Profile updated:', response.data)
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update profile'
      setError(errorMsg)
      console.error('❌ Update failed:', errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001a3d] to-[#002451] text-white pb-20">
      {/* Header */}
      <div className="px-6 md:px-16 py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-yellow-400">👤 My Profile</span>
          </h1>
          <p className="text-white/70">Manage your account information</p>
        </div>
      </div>

      <div className="px-6 md:px-16 py-10">
        <div className="max-w-2xl mx-auto">
          {/* Profile Info Card */}
          <div className="bg-[#002451] rounded-lg border border-white/10 overflow-hidden shadow-lg mb-8">
            <div className="bg-gradient-to-r from-yellow-400/10 to-transparent p-8 border-b border-white/10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-yellow-400 mb-2">{user?.name}</h2>
                  <p className="text-sm text-white/70">{user?.role === 'trainee' ? 'Trainee' : 'Coach'}</p>
                </div>
                <div className="text-5xl">👤</div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="p-8 space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#001a3d] rounded-lg border border-white/5">
                <span className="text-white/70">Email</span>
                <span className="font-mono text-sm text-yellow-400">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#001a3d] rounded-lg border border-white/5">
                <span className="text-white/70">Status</span>
                <span className="px-3 py-1 rounded-full bg-green-400/20 text-green-300 text-sm font-medium">
                  ✅ {user?.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#001a3d] rounded-lg border border-white/5">
                <span className="text-white/70">Member Since</span>
                <span className="text-sm text-white/50">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="bg-[#002451] rounded-lg border border-white/10 overflow-hidden shadow-lg mb-8">
            <div className="bg-gradient-to-r from-blue-400/10 to-transparent p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-blue-400">Edit Information</h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-4 bg-red-400/10 border border-red-400/30 rounded-lg text-red-300 text-sm">
                  ❌ {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-400/10 border border-green-400/30 rounded-lg text-green-300 text-sm">
                  ✅ {success}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full bg-[#001a3d] border border-white/10 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 rounded-lg px-4 py-2 text-white outline-none transition disabled:opacity-50"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email (Read-only)</label>
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className="w-full bg-[#001a3d] border border-white/10 rounded-lg px-4 py-2 text-white/50 outline-none opacity-50"
                />
                <p className="text-xs text-white/50 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  disabled={loading}
                  rows="4"
                  className="w-full bg-[#001a3d] border border-white/10 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 rounded-lg px-4 py-2 text-white outline-none transition disabled:opacity-50 resize-none"
                  placeholder="Tell us about your fitness goals..."
                />
                <p className="text-xs text-white/50 mt-1">{form.bio.length}/500 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full bg-[#001a3d] border border-white/10 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 rounded-lg px-4 py-2 text-white outline-none transition disabled:opacity-50"
                  placeholder="+62 812 3456 7890"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-400 text-[#001a3d] font-semibold rounded-lg py-3 transition disabled:cursor-not-allowed"
              >
                {loading ? '💾 Saving...' : '💾 Save Changes'}
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="bg-[#002451] rounded-lg border border-red-400/20 overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-red-400/10 to-transparent p-6 border-b border-red-400/20">
              <h3 className="text-xl font-bold text-red-400">⚠️ Danger Zone</h3>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-white/70">
                These actions are permanent and cannot be undone.
              </p>

              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to logout?')) {
                    logout()
                    navigate('/')
                  }
                }}
                className="w-full px-6 py-3 rounded-lg border border-red-400/50 text-red-400 hover:bg-red-400/10 transition font-medium"
              >
                🚪 Logout
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
                    // TODO: Implement account deletion
                    alert('Account deletion feature coming soon!')
                  }
                }}
                className="w-full px-6 py-3 rounded-lg bg-red-400/10 border border-red-400/50 text-red-400 hover:bg-red-400/20 transition font-medium"
              >
                🗑️ Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
