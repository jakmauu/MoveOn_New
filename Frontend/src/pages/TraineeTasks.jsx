import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api, { submissionAPI } from '../services/api'
import { Button, Card, Badge, StatCard, Skeleton } from '../components/DesignSystem'

export default function TraineeTasksPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    overdue: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all, pending, in_progress, completed

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('📥 Fetching trainee tasks...')
      
      const response = await api.get('/trainee/tasks')
      
      console.log('✅ Tasks response:', response.data)
      
      if (response.data.success) {
        setTasks(response.data.data.tasks || [])
        setStats(response.data.data.stats || {})
        console.log(`✅ Loaded ${response.data.data.tasks.length} tasks`)
      }
    } catch (err) {
      console.error('❌ Error fetching tasks:', err)
      setError(err.response?.data?.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleTaskAction = async (assignmentId, action) => {
    try {
      if (action === 'start') {
        // Update assignment status to in_progress
        console.log('🚀 Starting task, assignment ID:', assignmentId)
        await api.patch(`/assignments/${assignmentId}/status`, { status: 'in_progress' })
        alert('✅ Task started!')
        // Refresh tasks to show updated status
        await fetchTasks()
      } else if (action === 'complete') {
        // Show submission form
        const duration = prompt('How many minutes did you complete? (e.g., 30):')
        if (!duration) return
        
        const calories = prompt('How many calories did you burn? (estimate):')
        const notes = prompt('Add completion notes (optional):')
        
        console.log('✅ Submitting task completion, assignment ID:', assignmentId)
        
        const submissionData = {
          assignment_id: assignmentId,
          duration_minutes: parseInt(duration) || 0,
          calories_burned: parseInt(calories) || 0,
          notes: notes || ''
        }
        
        const response = await submissionAPI.submitTask(submissionData)
        
        if (response.success) {
          alert('✅ Task completed and submitted successfully! Your progress has been updated.')
          // Refresh tasks to show updated stats
          await fetchTasks()
        }
      }
    } catch (err) {
      console.error('❌ Error updating task:', err)
      alert('Error: ' + (err.response?.data?.message || err.message))
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    return task.status === filter
  })

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-400/20 text-green-300 border-green-400/30',
      intermediate: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30',
      advanced: 'bg-red-400/20 text-red-300 border-red-400/30'
    }
    return colors[difficulty] || 'bg-gray-400/20 text-gray-300 border-gray-400/30'
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-blue-400/20 text-blue-300',
      in_progress: 'bg-yellow-400/20 text-yellow-300',
      completed: 'bg-green-400/20 text-green-300',
      overdue: 'bg-red-400/20 text-red-300'
    }
    return colors[status] || 'bg-gray-400/20 text-gray-300'
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      in_progress: '🏃',
      completed: '✅',
      overdue: '⚠️'
    }
    return icons[status] || '📋'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001a3d] to-[#002451] text-white pb-20">
      {/* Header */}
      <div className="px-6 md:px-16 py-8 border-b border-white/10">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">💪 My Workout Tasks</h1>
        <p className="text-white/70">Complete your assigned workouts to reach your fitness goals</p>
      </div>

      {/* Stats Cards */}
      <div className="px-6 md:px-16 py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-[#002451] rounded-lg p-4 border border-white/10">
            <p className="text-white/60 text-sm mb-1">Total Tasks</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-[#002451] rounded-lg p-4 border border-blue-400/30">
            <p className="text-white/60 text-sm mb-1">⏳ Pending</p>
            <p className="text-2xl font-bold text-blue-400">{stats.pending}</p>
          </div>
          <div className="bg-[#002451] rounded-lg p-4 border border-yellow-400/30">
            <p className="text-white/60 text-sm mb-1">🏃 In Progress</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.in_progress}</p>
          </div>
          <div className="bg-[#002451] rounded-lg p-4 border border-green-400/30">
            <p className="text-white/60 text-sm mb-1">✅ Completed</p>
            <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
          </div>
          <div className="bg-[#002451] rounded-lg p-4 border border-red-400/30">
            <p className="text-white/60 text-sm mb-1">⚠️ Overdue</p>
            <p className="text-2xl font-bold text-red-400">{stats.overdue}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'pending', 'in_progress', 'completed', 'overdue'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                filter === status
                  ? 'bg-yellow-400 text-[#001a3d]'
                  : 'bg-[#002451] text-white hover:bg-[#003166] border border-white/10'
              }`}
            >
              {status === 'all' && '📋 All Tasks'}
              {status === 'pending' && '⏳ Pending'}
              {status === 'in_progress' && '🏃 In Progress'}
              {status === 'completed' && '✅ Completed'}
              {status === 'overdue' && '⚠️ Overdue'}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-4 mb-6">
            <p className="text-red-300">❌ {error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
            <p className="text-white/60 mt-4">Loading your tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {filter === 'all' ? '📭' : '🔍'}
            </div>
            <h3 className="text-xl font-semibold text-white/80 mb-2">
              {filter === 'all' ? 'No tasks assigned yet' : `No ${filter} tasks`}
            </h3>
            <p className="text-white/60">
              {filter === 'all' 
                ? 'Your coach will assign workout tasks soon' 
                : 'Try selecting a different filter'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map(task => (
              <div
                key={task.assignment_id}
                className="bg-[#002451] rounded-lg border border-white/10 p-6 hover:border-yellow-400/50 transition shadow-lg"
              >
                {/* Task Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                      {task.title}
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                        {task.difficulty}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {getStatusIcon(task.status)} {task.status.replace('_', ' ')}
                      </span>
                      {task.priority && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'high' ? 'bg-red-400/20 text-red-300' : 
                          task.priority === 'medium' ? 'bg-yellow-400/20 text-yellow-300' : 
                          'bg-gray-400/20 text-gray-300'
                        }`}>
                          {task.priority}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {task.description && (
                  <p className="text-sm text-white/60 line-clamp-2 mb-4">
                    {task.description}
                  </p>
                )}

                {/* Task Info */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-white/70">
                    <span>⏱️</span>
                    <span>{task.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <span>💪</span>
                    <span>{task.exercises?.length || 0} exercises</span>
                  </div>
                  {task.due_date && (
                    <div className="flex items-center gap-2 text-white/70">
                      <span>📅</span>
                      <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {task.coach && (
                    <div className="flex items-center gap-2 text-white/70">
                      <span>👨‍🏫</span>
                      <span>Coach: {task.coach.name}</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {task.notes && (
                  <div className="bg-[#001f47] rounded p-3 mb-4">
                    <p className="text-xs text-yellow-400 font-medium mb-1">📝 Coach Notes:</p>
                    <p className="text-xs text-white/70">{task.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-white/10">
                  {task.status === 'pending' && (
                    <button
                      onClick={() => handleTaskAction(task.assignment_id, 'start')}
                      className="flex-1 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-[#001a3d] font-semibold rounded-lg transition"
                    >
                      Start Task
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <button
                      onClick={() => handleTaskAction(task.assignment_id, 'complete')}
                      className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-lg transition"
                    >
                      ✓ Complete
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/trainee/tasks/${task.assignment_id}`)}
                    className="flex-1 px-4 py-2 border border-white/20 text-white hover:border-white/40 rounded-lg transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
