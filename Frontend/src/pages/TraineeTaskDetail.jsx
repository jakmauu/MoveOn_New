import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function TraineeTaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  useEffect(() => {
    fetchTaskDetail();
  }, [id]);

  const fetchTaskDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get('/trainee/tasks');
      const allTasks = response.data.data.tasks;
      const foundTask = allTasks.find(t => t.assignment_id === id);
      
      if (foundTask) {
        console.log('📋 Task detail:', foundTask);
        console.log('💬 Coach feedback:', foundTask.coach_feedback);
        setTask(foundTask);
      } else {
        setError('Task not found');
      }
    } catch (err) {
      console.error('Error fetching task detail:', err);
      setError('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async () => {
    try {
      setSubmitting(true);
      await api.put(`/trainee/tasks/${id}/start`);
      await fetchTaskDetail();
    } catch (err) {
      console.error('Error starting task:', err);
      alert('Failed to start task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteTask = async () => {
    try {
      setSubmitting(true);
      await api.put(`/trainee/tasks/${id}/complete`, { notes });
      await fetchTaskDetail();
      setShowCompleteModal(false);
      setNotes('');
    } catch (err) {
      console.error('Error completing task:', err);
      alert('Failed to complete task');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-blue-500/20', text: 'text-blue-300', icon: '⏳', label: 'Pending' },
      in_progress: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', icon: '🔄', label: 'In Progress' },
      completed: { bg: 'bg-green-500/20', text: 'text-green-300', icon: '✅', label: 'Completed' },
      overdue: { bg: 'bg-red-500/20', text: 'text-red-300', icon: '⚠️', label: 'Overdue' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getDifficultyBadge = (difficulty) => {
    const difficultyConfig = {
      beginner: { bg: 'bg-green-500/20', text: 'text-green-300', label: 'Beginner' },
      intermediate: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', label: 'Intermediate' },
      advanced: { bg: 'bg-red-500/20', text: 'text-red-300', label: 'Advanced' }
    };
    const config = difficultyConfig[difficulty] || difficultyConfig.beginner;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getWorkoutTypeIcon = (type) => {
    const icons = {
      strength: '💪',
      cardio: '🏃',
      flexibility: '🧘',
      balance: '⚖️',
      endurance: '🚴',
      HIIT: '🔥',
      yoga: '🧘‍♀️',
      pilates: '🤸'
    };
    return icons[type] || '🏋️';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#001a3d] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-white/70">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-[#001a3d] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">{error || 'Task Not Found'}</h2>
          <button
            onClick={() => navigate('/trainee/tasks')}
            className="mt-4 px-6 py-2 bg-yellow-400 text-[#001a3d] rounded-lg font-medium hover:bg-yellow-300 transition"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#001a3d] py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-6">
        <button
          onClick={() => navigate('/trainee/tasks')}
          className="flex items-center gap-2 text-white/70 hover:text-white transition mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Tasks
        </button>
        
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              {getWorkoutTypeIcon(task.workout_type)} {task.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              {getStatusBadge(task.status)}
              {getDifficultyBadge(task.difficulty)}
              <span className="text-sm text-white/60">
                Assigned by <span className="text-yellow-400 font-medium">{task.coach?.full_name || task.coach?.username || 'Unknown'}</span>
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            {task.status === 'pending' && (
              <button
                onClick={handleStartTask}
                disabled={submitting}
                className="px-6 py-2.5 bg-yellow-400 text-[#001a3d] rounded-lg font-semibold hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {submitting ? 'Starting...' : 'Start Task'}
              </button>
            )}
            {task.status === 'in_progress' && (
              <button
                onClick={() => setShowCompleteModal(true)}
                className="px-6 py-2.5 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition shadow-lg"
              >
                Mark as Complete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Coach's Feedback - Moved to Top for Better Visibility */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-400/30 shadow-lg backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">💬</span> Coach's Feedback
          </h2>
          {task.coach_feedback ? (
            <div className="space-y-3">
              <p className="text-white/90 leading-relaxed whitespace-pre-wrap text-base">
                {task.coach_feedback}
              </p>
              {task.feedback_date && (
                <p className="text-yellow-400/70 text-sm flex items-center gap-2">
                  <span>📅</span>
                  <span>
                    Received: {new Date(task.feedback_date).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </p>
              )}
            </div>
          ) : (
            <p className="text-white/70 italic">
              No feedback yet from your coach. Keep up the good work! 💪
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="bg-[#002451] rounded-xl p-6 border border-white/10 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>📋</span> Description
              </h2>
              <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                {task.description || 'No description provided.'}
              </p>
            </div>

            {/* Exercises Card */}
            {task.exercises && task.exercises.length > 0 && (
              <div className="bg-[#002451] rounded-xl p-6 border border-white/10 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>🏋️</span> Exercises ({task.exercises.length})
                </h2>
                <div className="space-y-4">
                  {task.exercises.map((exercise, index) => (
                    <div
                      key={index}
                      className="bg-[#001a3d] rounded-lg p-4 border border-white/5 hover:border-yellow-400/30 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-lg mb-2">
                            {index + 1}. {exercise.name}
                          </h3>
                          {exercise.description && (
                            <p className="text-white/70 text-sm mb-3">{exercise.description}</p>
                          )}
                          <div className="flex flex-wrap gap-3 text-sm">
                            {exercise.sets && (
                              <span className="flex items-center gap-1 text-white/60">
                                <span className="font-medium text-yellow-400">{exercise.sets}</span> sets
                              </span>
                            )}
                            {exercise.reps && (
                              <span className="flex items-center gap-1 text-white/60">
                                <span className="font-medium text-yellow-400">{exercise.reps}</span> reps
                              </span>
                            )}
                            {exercise.duration && (
                              <span className="flex items-center gap-1 text-white/60">
                                <span className="font-medium text-yellow-400">{exercise.duration}</span> duration
                              </span>
                            )}
                            {exercise.rest && (
                              <span className="flex items-center gap-1 text-white/60">
                                <span className="font-medium text-blue-400">{exercise.rest}</span> rest
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="bg-yellow-400/10 rounded-full w-10 h-10 flex items-center justify-center text-yellow-400 font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes Section (if completed) */}
            {task.status === 'completed' && task.notes && (
              <div className="bg-[#002451] rounded-xl p-6 border border-white/10 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>📝</span> Completion Notes
                </h2>
                <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                  {task.notes}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Stats & Info */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-[#002451] rounded-xl p-6 border border-white/10 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm flex items-center gap-2">
                    <span>⏱️</span> Duration
                  </span>
                  <span className="text-white font-semibold">{task.duration_minutes} min</span>
                </div>
                <div className="h-px bg-white/10"></div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm flex items-center gap-2">
                    <span>🔥</span> Calories
                  </span>
                  <span className="text-white font-semibold">{task.calories_target || 0} kcal</span>
                </div>
                <div className="h-px bg-white/10"></div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm flex items-center gap-2">
                    <span>🎯</span> Type
                  </span>
                  <span className="text-white font-semibold capitalize">{task.workout_type}</span>
                </div>
                {task.exercises && task.exercises.length > 0 && (
                  <>
                    <div className="h-px bg-white/10"></div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm flex items-center gap-2">
                        <span>💪</span> Exercises
                      </span>
                      <span className="text-white font-semibold">{task.exercises.length}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-[#002451] rounded-xl p-6 border border-white/10 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-4">Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-300">📅</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white/70 text-sm">Assigned</p>
                    <p className="text-white font-medium text-sm">
                      {task.assigned_at ? new Date(task.assigned_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>
                
                {task.due_date && (
                  <>
                    <div className="h-px bg-white/10 ml-4"></div>
                    <div className="flex items-start gap-3">
                      <div className="bg-yellow-500/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                        <span className="text-yellow-300">⏰</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white/70 text-sm">Due Date</p>
                        <p className="text-white font-medium text-sm">
                          {new Date(task.due_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {task.started_at && (
                  <>
                    <div className="h-px bg-white/10 ml-4"></div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-500/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                        <span className="text-green-300">▶️</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white/70 text-sm">Started</p>
                        <p className="text-white font-medium text-sm">
                          {new Date(task.started_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {task.completed_at && (
                  <>
                    <div className="h-px bg-white/10 ml-4"></div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-500/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                        <span className="text-green-300">✅</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white/70 text-sm">Completed</p>
                        <p className="text-white font-medium text-sm">
                          {new Date(task.completed_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Coach Info */}
            <div className="bg-[#002451] rounded-xl p-6 border border-white/10 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-4">Your Coach</h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-400/20 flex items-center justify-center">
                  <span className="text-2xl">👨‍🏫</span>
                </div>
                <div>
                  <p className="text-white font-semibold">{task.coach?.full_name || 'Unknown Coach'}</p>
                  <p className="text-white/60 text-sm">{task.coach?.email || task.coach?.username || ''}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Task Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#002451] rounded-xl p-6 max-w-md w-full border border-white/10 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-4">Complete Task</h3>
            <p className="text-white/70 mb-4">
              Great work! Add any notes about how the workout went (optional).
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., Felt great! Increased weights on some exercises..."
              className="w-full px-4 py-3 bg-[#001a3d] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400 transition resize-none"
              rows={4}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 px-4 py-2.5 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteTask}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Completing...' : 'Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
