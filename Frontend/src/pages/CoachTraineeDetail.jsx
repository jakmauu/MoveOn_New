import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, NavLink } from 'react-router-dom'
import { coachAPI, submissionAPI } from '../services/api'
import api from '../services/api'

export default function TraineeDetailPage() {
  const { id } = useParams() // trainee ID
  const navigate = useNavigate()
  const [trainee, setTrainee] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTab, setSelectedTab] = useState('overview')
  const [sendingFeedback, setSendingFeedback] = useState(false)

  useEffect(() => {
    fetchTraineeData()
  }, [id])

  const fetchTraineeData = async () => {
    try {
      setLoading(true)
      setError('')

      console.log('📥 Fetching trainee detail for ID:', id)

      // Fetch trainee details
      const traineeResponse = await coachAPI.getTraineeDetails(id)
      console.log('✅ Trainee data:', traineeResponse)

      if (traineeResponse.success) {
        setTrainee(traineeResponse.data)
      }

      // Fetch trainee's assignments
      const assignmentsResponse = await api.get(`/assignments/trainee/${id}`)
      console.log('✅ Assignments data:', assignmentsResponse.data)

      if (assignmentsResponse.data.success) {
        const tasksList = assignmentsResponse.data.data || []
        setAssignments(tasksList)

        // Calculate stats
        const totalTasks = tasksList.length
        const completedTasks = tasksList.filter(t => t.status === 'completed').length
        const pendingTasks = tasksList.filter(t => t.status === 'pending').length
        const inProgressTasks = tasksList.filter(t => t.status === 'in_progress').length

        setStats({
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          in_progress: inProgressTasks,
          completion_rate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        })
      }

      // Fetch trainee's submissions
      try {
        const submissionsResponse = await submissionAPI.getTraineeSubmissions(id)
        console.log('✅ Submissions data:', submissionsResponse)

        if (submissionsResponse.success) {
          setSubmissions(submissionsResponse.data || [])
        }
      } catch (subErr) {
        console.warn('⚠️ Could not fetch submissions:', subErr)
      }

    } catch (err) {
      console.error('❌ Error fetching trainee data:', err)
      setError(err.response?.data?.message || err.message || 'Failed to load trainee data')
    } finally {
      setLoading(false)
    }
  }

  const handleSendFeedback = async (feedbackText) => {
    if (!feedbackText || !feedbackText.trim()) {
      alert('⚠️ Please enter feedback text')
      return
    }

    try {
      setSendingFeedback(true)
      
      // Get the actual trainee ID
      const traineeIdToUse = trainee?.trainee_id || trainee?._id || trainee?.id || id
      
      console.log('📤 Sending feedback to trainee ID:', traineeIdToUse)
      console.log('💬 Feedback:', feedbackText)
      console.log('🔍 Full URL will be:', `/coach/trainees/${traineeIdToUse}/feedback`)

      // Send feedback to trainee
      const response = await api.post(`/coach/trainees/${traineeIdToUse}/feedback`, {
        feedback: feedbackText
      })

      console.log('✅ Response:', response.data)

      if (response.data.success) {
        alert('✅ Feedback sent successfully!')
        // Refresh trainee data to show updated feedback
        await fetchTraineeData()
      }
    } catch (error) {
      console.error('❌ Error sending feedback:', error)
      console.error('❌ Error response:', error.response)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to send feedback'
      alert(`❌ ${errorMsg}`)
    } finally {
      setSendingFeedback(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#001a3d] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4"></div>
          <p className="text-white/60">Loading trainee data...</p>
        </div>
      </div>
    )
  }

  if (error || !trainee) {
    return (
      <div className="min-h-screen bg-[#001a3d] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{error || 'Trainee not found'}</h2>
          <NavLink to="/coach/trainees" className="text-yellow-400 hover:underline">← Back to Trainees</NavLink>
        </div>
      </div>
    )
  }

  const completionRate = stats?.completion_rate || 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001a3d] to-[#002451] text-white pb-20">
      {/* Header */}
      <div className="px-6 md:px-16 py-8 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-2xl">
              {trainee.full_name ? trainee.full_name.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{trainee.full_name || 'Unknown'}</h1>
              <p className="text-white/70 mt-1">@{trainee.username} • {trainee.email}</p>
              <div className="flex gap-3 mt-3">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-400/20 text-green-300">
                  🟢 Active Trainee
                </span>
                {trainee.fitness_level && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-400/20 text-yellow-300">
                    Level: {trainee.fitness_level}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={() => navigate(-1)} className="text-white/70 hover:text-white transition">
            ✕
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="px-6 md:px-16 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#002451] rounded-lg p-5 border border-white/10">
            <p className="text-white/60 text-sm">Total Tasks</p>
            <h3 className="text-3xl font-bold text-yellow-400 mt-2">{stats?.total || 0}</h3>
          </div>
          <div className="bg-[#002451] rounded-lg p-5 border border-white/10">
            <p className="text-white/60 text-sm">Completed</p>
            <h3 className="text-3xl font-bold text-green-400 mt-2">{stats?.completed || 0}</h3>
          </div>
          <div className="bg-[#002451] rounded-lg p-5 border border-white/10">
            <p className="text-white/60 text-sm">In Progress</p>
            <h3 className="text-3xl font-bold text-blue-400 mt-2">{stats?.in_progress || 0}</h3>
          </div>
          <div className="bg-[#002451] rounded-lg p-5 border border-white/10">
            <p className="text-white/60 text-sm">Completion Rate</p>
            <h3 className="text-3xl font-bold text-red-400 mt-2">{completionRate}%</h3>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-6 md:px-16">
        <div className="max-w-6xl mx-auto flex gap-4 border-b border-white/10">
          {['overview', 'tasks', 'submissions'].map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-3 font-medium transition border-b-2 ${
                selectedTab === tab
                  ? 'border-yellow-400 text-yellow-400'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              {tab === 'overview' && '📊 Overview'}
              {tab === 'tasks' && '📋 Assigned Tasks'}
              {tab === 'submissions' && '✅ Submissions'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 md:px-16 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Progress Chart */}
              <div className="lg:col-span-2 bg-[#002451] rounded-lg border border-white/10 p-6">
                <h2 className="text-xl font-bold text-yellow-400 mb-6">Performance Summary</h2>
                
                <div className="space-y-6">
                  {/* Progress Bar 1 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium">Completion Rate</p>
                      <span className="text-lg font-bold text-yellow-400">{completionRate}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 h-full rounded-full" style={{ width: `${completionRate}%` }} />
                    </div>
                  </div>

                  {/* Progress Bar 2 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium">Tasks In Progress</p>
                      <span className="text-lg font-bold text-green-400">{stats?.in_progress || 0}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-green-400 to-green-300 h-full rounded-full" style={{ width: `${stats?.in_progress ? (stats.in_progress / stats.total * 100) : 0}%` }} />
                    </div>
                  </div>

                  {/* Progress Bar 3 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium">Pending Tasks</p>
                      <span className="text-lg font-bold text-blue-400">{stats?.pending || 0}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-400 to-blue-300 h-full rounded-full" style={{ width: `${stats?.pending ? (stats.pending / stats.total * 100) : 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback Form */}
              <div className="bg-[#002451] rounded-lg border border-white/10 p-6">
                <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                  <span>💬</span> Send Feedback
                </h2>
                <p className="text-white/60 text-sm mb-4">Provide personalized feedback to help your trainee improve</p>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const feedback = e.target.feedback.value;
                  if (feedback.trim()) {
                    handleSendFeedback(feedback);
                    e.target.reset();
                  }
                }}>
                  <textarea
                    name="feedback"
                    placeholder="Type your feedback here... (e.g., Great progress! Keep up the good work!)" 
                    className="w-full px-4 py-3 bg-[#001a3d] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400 transition resize-none mb-4"
                    rows={6}
                    required
                  />
                  <button 
                    type="submit"
                    className="w-full px-4 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-[#001a3d] font-bold rounded-lg transition shadow-lg"
                  >
                    📤 Send Feedback
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {selectedTab === 'tasks' && (
            <div className="bg-[#002451] rounded-lg border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-yellow-400">Assigned Tasks</h2>
              </div>
              {assignments.length === 0 ? (
                <div className="p-12 text-center text-white/60">
                  <p className="text-lg mb-4">No tasks assigned yet</p>
                  <NavLink to="/coach/assign-task" className="text-yellow-400 hover:underline">Assign a task →</NavLink>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {assignments.map(assignment => {
                    const task = assignment.task_id
                    const submission = submissions.find(s => s.assignment_id?._id === assignment._id)
                    
                    return (
                      <div key={assignment._id} className="p-6 hover:bg-white/5 transition">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-white flex items-center gap-2">
                            {task.title}
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              task.difficulty_level === 'beginner' ? 'bg-green-400/20 text-green-300' :
                              task.difficulty_level === 'intermediate' ? 'bg-yellow-400/20 text-yellow-300' :
                              'bg-red-400/20 text-red-300'
                            }`}>
                              {task.difficulty_level}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              assignment.status === 'completed' ? 'bg-green-400/20 text-green-300' :
                              assignment.status === 'in_progress' ? 'bg-blue-400/20 text-blue-300' :
                              'bg-gray-400/20 text-gray-300'
                            }`}>
                              {assignment.status}
                            </span>
                            {submission && (
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                submission.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                submission.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                submission.status === 'needs_revision' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                📝 {submission.status}
                              </span>
                            )}
                          </h3>
                          <span className="text-sm text-white/60">
                            Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <p className="text-sm text-white/60 mb-3">{task.description || 'No description'}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-blue-400">⏱️ {task.duration_minutes} min</span>
                          <span className="text-green-400">📝 {task.exercises?.length || 0} exercises</span>
                          {submission && (
                            <>
                              <span className="text-yellow-400">🔥 {submission.calories_burned || 0} cal</span>
                              <span className="text-purple-400">⏰ {submission.duration_minutes || 0} min done</span>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Submissions Tab */}
          {selectedTab === 'submissions' && (
            <div className="bg-[#002451] rounded-lg border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-yellow-400">Task Submissions</h2>
                <p className="text-sm text-white/60 mt-1">Review and approve trainee submissions</p>
              </div>
              {submissions.length === 0 ? (
                <div className="p-12 text-center text-white/60">
                  <p className="text-lg">No submissions yet</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {submissions.map(submission => {
                    const assignment = submission.assignment_id
                    const task = assignment?.task_id
                    
                    return (
                      <div key={submission._id} className="p-6 hover:bg-white/5 transition">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-white mb-1">
                              {task?.title || 'Unknown Task'}
                            </h3>
                            <p className="text-sm text-white/60">
                              Submitted: {new Date(submission.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            submission.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            submission.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                            submission.status === 'needs_revision' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {submission.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div className="bg-[#001a3d] p-3 rounded">
                            <p className="text-xs text-white/60">Duration</p>
                            <p className="text-lg font-semibold text-blue-400">{submission.duration_minutes || 0} min</p>
                          </div>
                          <div className="bg-[#001a3d] p-3 rounded">
                            <p className="text-xs text-white/60">Calories</p>
                            <p className="text-lg font-semibold text-red-400">{submission.calories_burned || 0}</p>
                          </div>
                          <div className="bg-[#001a3d] p-3 rounded">
                            <p className="text-xs text-white/60">Rating</p>
                            <p className="text-lg font-semibold text-yellow-400">
                              {submission.rating ? `⭐ ${submission.rating}/5` : 'Not rated'}
                            </p>
                          </div>
                          <div className="bg-[#001a3d] p-3 rounded">
                            <p className="text-xs text-white/60">Reviewed</p>
                            <p className="text-lg font-semibold text-green-400">
                              {submission.reviewed_at ? '✅' : '⏳'}
                            </p>
                          </div>
                        </div>

                        {submission.notes && (
                          <div className="mb-3 p-3 bg-blue-900/30 rounded">
                            <p className="text-xs text-white/60 mb-1">Trainee Notes:</p>
                            <p className="text-sm text-white">{submission.notes}</p>
                          </div>
                        )}

                        {submission.coach_feedback && (
                          <div className="mb-3 p-3 bg-yellow-900/30 rounded">
                            <p className="text-xs text-white/60 mb-1">Your Feedback:</p>
                            <p className="text-sm text-white">{submission.coach_feedback}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
