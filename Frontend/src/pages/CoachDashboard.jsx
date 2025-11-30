import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Button, Card, StatCard, Badge, Skeleton, Alert } from '../components/DesignSystem'

export default function CoachDashboard() {
  const { user } = useAuth()
  const [trainees, setTrainees] = useState([])
  const [tasks, setTasks] = useState([])
  const [notifications, setNotifications] = useState([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)

  // Fetch trainees dan tasks dari backend saat component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.id) return

        console.log('📥 Fetching coach data from database...')

        // Fetch trainees untuk coach ini
        const traineeRes = await api.get(`/coach/trainees`)
        setTrainees(traineeRes.data.data || [])
        console.log('✅ Trainees fetched:', traineeRes.data.data)

        // Fetch tasks untuk coach ini
        const taskRes = await api.get(`/coach/tasks`)
        setTasks(taskRes.data.data || [])
        console.log('✅ Tasks fetched:', taskRes.data.data)

        // Fetch notifications
        const notifRes = await api.get(`/coach/notifications`)
        setNotifications(notifRes.data.data || [])
        console.log('✅ Notifications fetched:', notifRes.data.data)
      } catch (err) {
        console.error('❌ Error fetching data:', err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const activeTrainees = trainees.filter(t => t.status === 'active').length
  const totalWorkouts = tasks.length
  const totalTrainees = trainees.length
  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001a3d] to-[#002451] text-white pb-20">
      {/* Header Dashboard */}
      <div className="px-6 md:px-16 py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                <span className="text-yellow-400">⚽ Coach Dashboard</span>
              </h1>
              <p className="text-white/70 mt-1">Manage your trainees, track progress, and assign workouts</p>
            </div>
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => window.location.href = '/coach/assign-task'}
            >
              + Assign New Task
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="px-6 md:px-16 py-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
          {loading ? (
            <>
              <Skeleton />
              <Skeleton />
            </>
          ) : (
            <>
              <StatCard 
                icon="👥" 
                label="Total Trainees" 
                value={totalTrainees.toString()}
                trend={activeTrainees}
              />
              <StatCard 
                icon="📋" 
                label="Active Tasks" 
                value={totalWorkouts.toString()}
                trend={5}
              />
            </>
          )}
        </div>
      </div>

      {/* Main Content: Two Columns */}
      <div className="px-6 md:px-16 pb-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Left Column: Recent Notifications */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-400/10 to-transparent p-5 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-lg font-bold text-yellow-400">🔔 Notifications</h2>
                {unreadCount > 0 && (
                  <Badge variant="danger">{unreadCount}</Badge>
                )}
              </div>
              <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-white/50 text-sm">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n))
                      }}
                      className={`p-4 cursor-pointer transition hover:bg-white/5 ${!notif.is_read ? 'bg-yellow-400/5 border-l-2 border-yellow-400' : ''}`}
                    >
                      <div className="flex gap-3">
                        <span className="text-2xl flex-shrink-0">
                          {notif.type === 'completion' && '✅'}
                          {notif.type === 'upcoming' && '⏰'}
                          {notif.type === 'inactive' && '⚠️'}
                          {notif.type === 'new_trainee' && '🆕'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{notif.title}</p>
                          <p className="text-xs text-white/60 mt-0.5">{notif.message}</p>
                          <p className="text-xs text-white/40 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                        </div>
                        {!notif.is_read && (
                          <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Right Column: Trainees Overview */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-green-400/10 to-transparent p-5 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-lg font-bold text-green-400">👥 Your Trainees</h2>
                <NavLink to="/coach/trainees" className="text-xs text-yellow-400 hover:underline font-medium">
                  View All →
                </NavLink>
              </div>

              {/* Filter Buttons */}
              <div className="px-5 pt-4 pb-0 flex gap-2 border-b border-white/5">
                {['all', 'active', 'inactive'].map(status => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                  >
                    {status === 'all' ? 'All' : status === 'active' ? 'Active' : 'Inactive'}
                  </Button>
                ))}
              </div>

              {/* Trainees List */}
              <div className="divide-y divide-white/5">
                {loading ? (
                  <div className="p-6 text-center text-white/50">⏳ Loading trainees...</div>
                ) : trainees.length === 0 ? (
                  <div className="p-6 text-center text-white/50 text-sm">
                    No trainees yet. <NavLink to="/coach/trainees" className="text-yellow-400 hover:underline">Add one now</NavLink>
                  </div>
                ) : (
                  trainees
                    .filter(t => filterStatus === 'all' || t.status === filterStatus)
                    .map(trainee => (
                      <NavLink
                        key={trainee.id}
                        to={`/coach/trainee/${trainee.id}`}
                        className="block p-5 hover:bg-white/5 transition group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4 flex-1">
                            <div className="text-3xl">{trainee.avatar || '👤'}</div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white group-hover:text-yellow-400 transition">
                                {trainee.name}
                              </h3>
                              <p className="text-xs text-white/50">{trainee.email}</p>
                              <div className="flex gap-3 mt-2 text-xs">
                                <Badge variant={trainee.status === 'active' ? 'success' : 'warning'}>
                                  {trainee.status === 'active' ? '🟢 Active' : '⚪ Inactive'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-xs">
                            <p className="text-white/70">Joined</p>
                            <p className="text-yellow-400 font-semibold">{new Date(trainee.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </NavLink>
                    ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="text-center group hover:shadow-lg hover:scale-105 transition-transform cursor-pointer">
              <NavLink to="/coach/statistics" className="block">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold text-white group-hover:text-yellow-400 transition">View Statistics</h3>
                <p className="text-xs text-white/60 mt-1">See detailed trainee stats</p>
              </NavLink>
            </Card>

            <Card className="text-center group hover:shadow-lg hover:scale-105 transition-transform cursor-pointer">
              <NavLink to="/coach/tasks" className="block">
                <div className="text-3xl mb-2">📋</div>
                <h3 className="font-semibold text-white group-hover:text-yellow-400 transition">Manage Tasks</h3>
                <p className="text-xs text-white/60 mt-1">View and edit assigned tasks</p>
              </NavLink>
            </Card>

            <Card className="text-center group hover:shadow-lg hover:scale-105 transition-transform cursor-pointer">
              <NavLink to="/coach/assign-task" className="block">
                <div className="text-3xl mb-2">➕</div>
                <h3 className="font-semibold text-white group-hover:text-yellow-400 transition">Create Task</h3>
                <p className="text-xs text-white/60 mt-1">Assign new workout</p>
              </NavLink>
            </Card>

            <Card className="text-center group hover:shadow-lg hover:scale-105 transition-transform cursor-pointer">
              <NavLink to="/coach/trainees" className="block">
                <div className="text-3xl mb-2">📈</div>
                <h3 className="font-semibold text-white group-hover:text-yellow-400 transition">Progress Report</h3>
                <p className="text-xs text-white/60 mt-1">Team performance</p>
              </NavLink>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
