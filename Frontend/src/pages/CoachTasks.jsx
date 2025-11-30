import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Button, Input, Card, Badge, Select, Skeleton, Alert } from '../components/DesignSystem'

export default function CoachTasksPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    difficulty: '',
    sortBy: 'newest'
  })

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('📥 Fetching tasks for coach...')
      
      const response = await api.get('/tasks/my-tasks')
      
      console.log('✅ Tasks response:', response.data)
      
      if (response.data.success) {
        const tasksData = response.data.data || []
        setTasks(tasksData)
        console.log(`✅ Loaded ${tasksData.length} tasks`)
      } else {
        setError('Failed to load tasks')
      }
    } catch (err) {
      console.error('❌ Error fetching tasks:', err)
      setError(err.response?.data?.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const filteredTasks = tasks
    .filter(task => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchTitle = task.title?.toLowerCase().includes(searchLower)
        const matchDesc = task.description?.toLowerCase().includes(searchLower)
        if (!matchTitle && !matchDesc) return false
      }

      if (filters.difficulty && task.difficulty_level !== filters.difficulty) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      if (filters.sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt)
      } else if (filters.sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt)
      }
      return 0
    })

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-400/20 text-green-300',
      intermediate: 'bg-yellow-400/20 text-yellow-300',
      advanced: 'bg-red-400/20 text-red-300'
    }
    return colors[difficulty] || 'bg-gray-400/20 text-gray-300'
  }

  const getDifficultyIcon = (difficulty) => {
    const icons = {
      beginner: '🟢',
      intermediate: '🟡',
      advanced: '🔴'
    }
    return icons[difficulty] || '⚪'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001a3d] to-[#002451] text-white pb-20">
      <div className="px-6 md:px-16 py-8 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">📋 My Tasks</h1>
            <p className="text-white/70">Manage and assign workout tasks to your trainees</p>
          </div>
          <button
            onClick={() => navigate('/coach/assign-task')}
            className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-[#001a3d] font-semibold rounded-lg transition shadow-lg"
          >
            ➕ Create New Task
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div>
            <input
              type="text"
              placeholder="🔍 Search tasks..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-[#002451] border border-white/10 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition"
            />
          </div>

          <div>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-[#002451] border border-white/10 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition"
            >
              <option value="">All Difficulties</option>
              <option value="beginner">🟢 Beginner</option>
              <option value="intermediate">🟡 Intermediate</option>
              <option value="advanced">🔴 Advanced</option>
            </select>
          </div>

          <div>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-[#002451] border border-white/10 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-16 py-8">
        {error && (
          <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-4 mb-6">
            <p className="text-red-300">❌ {error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
            <p className="text-white/60 mt-4">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-white/80 mb-2">
              {filters.search || filters.difficulty ? 'No tasks found' : 'No tasks created yet'}
            </h3>
            <p className="text-white/60 mb-6">
              {filters.search || filters.difficulty
                ? 'Try adjusting your filters'
                : 'Create your first workout task to get started'}
            </p>
            {!filters.search && !filters.difficulty && (
              <button
                onClick={() => navigate('/coach/assign-task')}
                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-[#001a3d] font-semibold rounded-lg transition"
              >
                ➕ Create First Task
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map(task => (
              <div
                key={task._id}
                className="bg-[#002451] rounded-lg border border-white/10 p-6 shadow-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-white line-clamp-2 flex-1">
                    {task.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${getDifficultyColor(task.difficulty_level)}`}>
                    {getDifficultyIcon(task.difficulty_level)} {task.difficulty_level}
                  </span>
                </div>

                {task.description && (
                  <p className="text-sm text-white/60 line-clamp-2 mb-4">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-white/60 mb-4">
                  <span className="flex items-center gap-1">
                    ⏱️ {task.duration_minutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    💪 {task.exercises?.length || 0} exercises
                  </span>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <span className="text-xs text-white/50">
                    Created: {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && tasks.length > 0 && (
          <div className="mt-8 bg-[#002451] rounded-lg border border-white/10 p-6">
            <h3 className="font-semibold text-white mb-3">📊 Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-white/60">Total Tasks</p>
                <p className="text-2xl font-bold text-yellow-400">{tasks.length}</p>
              </div>
              <div>
                <p className="text-white/60">Beginner</p>
                <p className="text-2xl font-bold text-green-400">
                  {tasks.filter(t => t.difficulty_level === 'beginner').length}
                </p>
              </div>
              <div>
                <p className="text-white/60">Intermediate</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {tasks.filter(t => t.difficulty_level === 'intermediate').length}
                </p>
              </div>
              <div>
                <p className="text-white/60">Advanced</p>
                <p className="text-2xl font-bold text-red-400">
                  {tasks.filter(t => t.difficulty_level === 'advanced').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
