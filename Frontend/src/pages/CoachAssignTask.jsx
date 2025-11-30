import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function AssignTaskPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [trainees, setTrainees] = useState([])
  const [loadingTrainees, setLoadingTrainees] = useState(true)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    title: '',
    description: '',
    template: '',
    duration: 60,
    difficulty: 'intermediate',
    selectedTrainees: [],
    dueDate: '',
    exercises: [],
    notes: ''
  })

  const [newExercise, setNewExercise] = useState({
    name: '',
    sets: '',
    reps: '',
    duration: '',
    intensity: ''
  })

  useEffect(() => {
    const fetchTrainees = async () => {
      try {
        console.log('📥 Fetching coach trainees for assignment...')
        const response = await api.get('/coach/trainees')
        console.log('✅ Trainees loaded:', response.data.data)
        setTrainees(response.data.data || [])
      } catch (err) {
        console.error('❌ Error fetching trainees:', err)
      } finally {
        setLoadingTrainees(false)
      }
    }

    if (user) {
      fetchTrainees()
    }
  }, [user])

  const quickTemplates = [
    { id: 'strength', name: '💪 Strength Training', description: 'Build muscle and increase strength', defaultDuration: 60, icon: '💪' },
    { id: 'cardio', name: '🏃 Cardio Workout', description: 'Improve cardiovascular endurance', defaultDuration: 45, icon: '🏃' },
    { id: 'hiit', name: '🔥 HIIT Session', description: 'High-intensity interval training', defaultDuration: 30, icon: '🔥' },
    { id: 'flexibility', name: '🧘 Flexibility & Mobility', description: 'Stretching and mobility work', defaultDuration: 30, icon: '🧘' },
    { id: 'functional', name: '⚡ Functional Training', description: 'Full-body functional movements', defaultDuration: 50, icon: '⚡' },
    { id: 'custom', name: '✏️ Custom Workout', description: 'Create your own workout from scratch', defaultDuration: 60, icon: '✏️' }
  ]

  const handleTemplateSelect = (template) => {
    setForm(prev => ({
      ...prev,
      template: template.id,
      title: template.name,
      duration: template.defaultDuration
    }))
  }

  const toggleTrainee = (traineeId) => {
    setForm(prev => ({
      ...prev,
      selectedTrainees: prev.selectedTrainees.includes(traineeId)
        ? prev.selectedTrainees.filter(t => t !== traineeId)
        : [...prev.selectedTrainees, traineeId]
    }))
  }

  const addExercise = () => {
    if (newExercise.name.trim()) {
      setForm(prev => ({
        ...prev,
        exercises: [...prev.exercises, { ...newExercise, id: Date.now() }]
      }))
      setNewExercise({ name: '', sets: '', reps: '', duration: '', intensity: '' })
    }
  }

  const removeExercise = (id) => {
    setForm(prev => ({
      ...prev,
      exercises: prev.exercises.filter(e => e.id !== id)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || form.selectedTrainees.length === 0 || !form.dueDate) {
      alert('Please fill all required fields and select at least one trainee')
      return
    }

    try {
      console.log('📤 Creating task with form data:', form)
      console.log('📤 Selected trainees:', form.selectedTrainees)
      
      const difficultyMap = {
        'beginner': 'Beginner',
        'intermediate': 'Intermediate',
        'advanced': 'Advanced'
      }

      const cleanExercises = form.exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets || '',
        reps: ex.reps || '',
        duration: ex.duration || '',
        intensity: ex.intensity || ''
      }))

      const traineeIds = form.selectedTrainees.map(id => {
        if (typeof id === 'string') return id
        return id.trainee_id || id.id || id._id || String(id)
      }).filter(Boolean)

      console.log('🎯 Clean trainee IDs to send:', traineeIds)

      const taskPayload = {
        title: form.title.trim(),
        description: (form.description || '').trim(),
        duration: parseInt(form.duration),
        difficulty: difficultyMap[form.difficulty] || 'Intermediate',
        dueDate: form.dueDate,
        exercises: cleanExercises,
        trainees: traineeIds
      }

      console.log('📤 Final payload:', JSON.stringify(taskPayload, null, 2))
      
      const response = await api.post(`/coach/${user.id}/tasks`, taskPayload)
      console.log('✅ Task created successfully:', response.data)
      
      alert('✅ Task assigned successfully!')
      navigate('/coach/tasks')
    } catch (err) {
      console.error('❌ Error creating task:', err)
      console.error('❌ Error response:', err.response?.data)
      alert('Error creating task: ' + (err.response?.data?.message || err.message))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001a3d] to-[#002451] text-white pb-20">
      <div className="px-6 md:px-16 py-8 border-b border-white/10">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">📋 Assign New Task</h1>
        <p className="text-white/70">Create and assign workout tasks to your trainees</p>
      </div>

      <div className="px-6 md:px-16 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between mb-8">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition ${
                  s <= step ? 'bg-yellow-400 text-[#001a3d]' : 'bg-white/10 text-white/50'
                }`}>
                  {s}
                </div>
                <p className="text-xs mt-2 text-white/60 text-center">
                  {s === 1 && 'Template'}
                  {s === 2 && 'Details'}
                  {s === 3 && 'Exercises'}
                  {s === 4 && 'Assign'}
                </p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="bg-[#002451] rounded-lg border border-white/10 p-8 shadow-lg">
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Choose Workout Template</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {quickTemplates.map(template => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleTemplateSelect(template)}
                      className={`p-5 rounded-lg border-2 transition text-left ${
                        form.template === template.id
                          ? 'border-yellow-400 bg-yellow-400/10'
                          : 'border-white/10 hover:border-white/30 bg-[#001f47]'
                      }`}
                    >
                      <div className="text-3xl mb-2">{template.icon}</div>
                      <h3 className="font-semibold text-white">{template.name}</h3>
                      <p className="text-xs text-white/60 mt-1">{template.description}</p>
                      <p className="text-xs text-yellow-400 mt-2 font-medium">{template.defaultDuration} min</p>
                    </button>
                  ))}
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Or Create Custom Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter custom workout title"
                    className="w-full px-4 py-3 rounded-lg bg-[#001f47] border border-white/10 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Task Details</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2">Task Title *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Upper Body Strength"
                      className="w-full px-4 py-3 rounded-lg bg-[#001f47] border border-white/10 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the purpose and focus of this workout"
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-[#001f47] border border-white/10 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                      <input
                        type="number"
                        value={form.duration}
                        onChange={(e) => setForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                        min="10"
                        max="180"
                        className="w-full px-4 py-3 rounded-lg bg-[#001f47] border border-white/10 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Difficulty Level</label>
                      <select
                        value={form.difficulty}
                        onChange={(e) => setForm(prev => ({ ...prev, difficulty: e.target.value }))}
                        className="w-full px-4 py-3 rounded-lg bg-[#001f47] border border-white/10 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition"
                      >
                        <option value="beginner">🟢 Beginner</option>
                        <option value="intermediate">🟡 Intermediate</option>
                        <option value="advanced">🔴 Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Due Date *</label>
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => setForm(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-[#001f47] border border-white/10 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Additional Notes</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any additional instructions or motivation"
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-[#001f47] border border-white/10 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Add Exercises</h2>

                <div className="bg-[#001f47] rounded-lg p-6 border border-white/10 mb-6">
                  <h3 className="font-semibold mb-4 text-yellow-400">Add Exercise to Task</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-white/60">Exercise Name *</label>
                      <input
                        type="text"
                        value={newExercise.name}
                        onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Barbell Bench Press"
                        className="w-full px-3 py-2 rounded bg-[#001a3d] border border-white/10 focus:border-yellow-400 outline-none text-sm mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-white/60">Sets</label>
                        <input
                          type="text"
                          value={newExercise.sets}
                          onChange={(e) => setNewExercise(prev => ({ ...prev, sets: e.target.value }))}
                          placeholder="e.g., 4"
                          className="w-full px-3 py-2 rounded bg-[#001a3d] border border-white/10 focus:border-yellow-400 outline-none text-sm mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-white/60">Reps</label>
                        <input
                          type="text"
                          value={newExercise.reps}
                          onChange={(e) => setNewExercise(prev => ({ ...prev, reps: e.target.value }))}
                          placeholder="e.g., 8-10"
                          className="w-full px-3 py-2 rounded bg-[#001a3d] border border-white/10 focus:border-yellow-400 outline-none text-sm mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-white/60">Duration (min)</label>
                        <input
                          type="text"
                          value={newExercise.duration}
                          onChange={(e) => setNewExercise(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="e.g., 20"
                          className="w-full px-3 py-2 rounded bg-[#001a3d] border border-white/10 focus:border-yellow-400 outline-none text-sm mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-white/60">Intensity</label>
                        <select
                          value={newExercise.intensity}
                          onChange={(e) => setNewExercise(prev => ({ ...prev, intensity: e.target.value }))}
                          className="w-full px-3 py-2 rounded bg-[#001a3d] border border-white/10 focus:border-yellow-400 outline-none text-sm mt-1"
                        >
                          <option value="">Select...</option>
                          <option value="low">Low</option>
                          <option value="moderate">Moderate</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={addExercise}
                      className="w-full mt-3 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-[#001a3d] font-semibold rounded-lg transition"
                    >
                      ➕ Add Exercise
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-yellow-400 mb-3">Added Exercises ({form.exercises.length})</h3>
                  {form.exercises.length === 0 ? (
                    <p className="text-white/60 text-sm italic">No exercises added yet. Add at least one exercise.</p>
                  ) : (
                    form.exercises.map((exercise) => (
                      <div key={exercise.id} className="flex items-center justify-between bg-[#001f47] p-4 rounded-lg border border-white/10 hover:border-white/20 transition">
                        <div className="flex-1">
                          <p className="font-medium text-white">{exercise.name}</p>
                          <div className="text-xs text-white/60 mt-1">
                            {exercise.sets && <span>{exercise.sets} sets</span>}
                            {exercise.sets && exercise.reps && <span> × </span>}
                            {exercise.reps && <span>{exercise.reps} reps</span>}
                            {exercise.duration && <span> • {exercise.duration} min</span>}
                            {exercise.intensity && <span> • {exercise.intensity}</span>}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExercise(exercise.id)}
                          className="px-3 py-2 text-red-400 hover:bg-red-400/10 rounded transition text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Select Trainees *</h2>
                <p className="text-white/70 text-sm mb-4">Choose which trainees should receive this task</p>

                {loadingTrainees ? (
                  <div className="text-center py-8">
                    <p className="text-white/60">⏳ Loading trainees...</p>
                  </div>
                ) : trainees.length === 0 ? (
                  <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4 mb-6 text-center">
                    <p className="text-sm text-yellow-300">
                      😕 No trainees found. Please add trainees first from the Trainees page.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      {trainees.map(trainee => (
                        <label
                          key={trainee.trainee_id}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                            form.selectedTrainees.includes(trainee.trainee_id)
                              ? 'border-yellow-400 bg-yellow-400/10'
                              : 'border-white/10 bg-[#001f47] hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={form.selectedTrainees.includes(trainee.trainee_id)}
                              onChange={() => toggleTrainee(trainee.trainee_id)}
                              className="mt-1 w-4 h-4 cursor-pointer"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">👤</span>
                                <div>
                                  <p className="font-semibold text-white">{trainee.full_name}</p>
                                  <p className="text-xs text-white/60">{trainee.email}</p>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-2 text-xs">
                                <span className={`px-2 py-0.5 rounded-full font-medium ${
                                  trainee.status === 'active'
                                    ? 'bg-green-400/20 text-green-300'
                                    : 'bg-gray-400/20 text-gray-300'
                                }`}>
                                  {trainee.status === 'active' ? '🟢 Active' : '⚪ Inactive'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>

                    {form.selectedTrainees.length > 0 && (
                      <div className="bg-green-400/10 border border-green-400/30 rounded-lg p-4 mb-6">
                        <p className="text-sm text-green-300 font-medium">
                          ✅ {form.selectedTrainees.length} trainee{form.selectedTrainees.length !== 1 ? 's' : ''} selected
                        </p>
                      </div>
                    )}
                  </>
                )}

                <div className="bg-[#001f47] rounded-lg p-5 border border-white/10 mt-6">
                  <h3 className="font-semibold text-yellow-400 mb-3">Task Summary</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-white/60">Title:</span> <span className="text-white">{form.title}</span></p>
                    <p><span className="text-white/60">Duration:</span> <span className="text-white">{form.duration} minutes</span></p>
                    <p><span className="text-white/60">Difficulty:</span> <span className="text-white capitalize">{form.difficulty}</span></p>
                    <p><span className="text-white/60">Due Date:</span> <span className="text-white">{form.dueDate}</span></p>
                    <p><span className="text-white/60">Exercises:</span> <span className="text-white">{form.exercises.length} exercises</span></p>
                    <p><span className="text-white/60">Trainees:</span> <span className="text-yellow-400 font-semibold">{form.selectedTrainees.length} selected</span></p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t border-white/10 mt-6">
              <button
                type="button"
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="px-6 py-2.5 border border-white/20 text-white rounded-lg hover:border-white/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/coach/tasks')}
                  className="px-6 py-2.5 border border-white/20 text-white rounded-lg hover:border-white/40 transition"
                >
                  Cancel
                </button>

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-[#001a3d] font-semibold rounded-lg transition"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-lg transition"
                  >
                    ✓ Assign Task
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}