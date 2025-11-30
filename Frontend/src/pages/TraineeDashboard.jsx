import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Button, Card, StatCard, Badge, ProgressBar, Skeleton } from '../components/DesignSystem'

export default function TraineeDashboard() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    totalCalories: 0,
    totalHours: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('📥 Fetching trainee dashboard data...')

        // Fetch dashboard data from the dashboard endpoint
        const dashboardRes = await api.get('/dashboard/trainee')
        
        if (dashboardRes.data.success) {
          const data = dashboardRes.data.data
          console.log('✅ Dashboard data received:', data)
          
          // Set stats from backend
          setStats({
            totalTasks: data.stats?.totalTasks || 0,
            completedTasks: data.stats?.completed || 0,
            inProgressTasks: data.stats?.inProgress || 0,
            totalCalories: 0,
            totalHours: data.stats?.totalHours || 0,
          })
          
          // Set recent tasks
          setAssignments(data.recentTasks || [])
        }
      } catch (err) {
        console.error('❌ Error fetching dashboard data:', err)
        console.error('Error details:', err.response?.data)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const completionPercentage = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001a3d] to-[#002451] text-white pb-20">
      {/* Header */}
      <div className="px-6 md:px-16 py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                <span className="text-yellow-400">💪 My Fitness Journey</span>
              </h1>
              <p className="text-white/70 mt-1">Welcome back, {user?.name}! Here are your assigned tasks.</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="secondary"
                size="lg"
                onClick={() => window.location.reload()}
                disabled={loading}
              >
                🔄 Refresh
              </Button>
              <Button 
                variant="primary"
                size="lg"
                onClick={() => window.location.href = '/trainee/profile'}
              >
                👤 Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="px-6 md:px-16 py-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {loading ? (
            <>
              <Skeleton />
              <Skeleton />
              <Skeleton />
              <Skeleton />
              <Skeleton />
            </>
          ) : (
            <>
              <StatCard 
                icon="📋" 
                label="Total Tasks" 
                value={stats.totalTasks.toString()}
              />
              <StatCard 
                icon="✅" 
                label="Completed" 
                value={stats.completedTasks.toString()}
                trend={stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}
              />
              <StatCard 
                icon="⏳" 
                label="In Progress" 
                value={stats.inProgressTasks.toString()}
              />
              <StatCard 
                icon="⏱️" 
                label="Total Hours" 
                value={stats.totalHours.toFixed(1)}
              />
              <StatCard 
                icon="🔥" 
                label="Progress" 
                value={`${completionPercentage}%`}
                trend={completionPercentage}
              />
            </>
          )}
        </div>
      </div>

      {/* Overall Progress - Enhanced Design */}
      <div className="px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-[#002451] via-[#003166] to-[#002451] rounded-2xl p-8 border border-yellow-400/20 shadow-2xl relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                <span>Overall Progress</span>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Left: Circular Progress */}
                <div className="flex justify-center">
                  <div className="relative w-56 h-56">
                    {/* Background circle */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="112"
                        cy="112"
                        r="100"
                        stroke="currentColor"
                        strokeWidth="16"
                        fill="none"
                        className="text-white/10"
                      />
                      {/* Progress circle with gradient */}
                      <circle
                        cx="112"
                        cy="112"
                        r="100"
                        stroke="url(#gradient)"
                        strokeWidth="16"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 100}`}
                        strokeDashoffset={`${2 * Math.PI * 100 * (1 - completionPercentage / 100)}`}
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FBBF24" />
                          <stop offset="50%" stopColor="#F59E0B" />
                          <stop offset="100%" stopColor="#EF4444" />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-5xl font-extrabold bg-gradient-to-br from-yellow-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent mb-1">
                        {completionPercentage}%
                      </div>
                      <div className="text-white/60 text-sm font-medium">Complete</div>
                      <div className="mt-2 flex items-center gap-1">
                        {completionPercentage >= 75 && <span className="text-2xl">🔥</span>}
                        {completionPercentage >= 50 && completionPercentage < 75 && <span className="text-2xl">💪</span>}
                        {completionPercentage >= 25 && completionPercentage < 50 && <span className="text-2xl">📈</span>}
                        {completionPercentage < 25 && stats.totalTasks > 0 && <span className="text-2xl">🚀</span>}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right: Stats breakdown */}
                <div className="space-y-4">
                  {/* Completed Tasks */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70 text-sm flex items-center gap-2">
                        <span className="text-xl">✅</span>
                        Completed Tasks
                      </span>
                      <span className="text-green-400 font-bold text-lg">{stats.completedTasks}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* In Progress Tasks */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70 text-sm flex items-center gap-2">
                        <span className="text-xl">⏳</span>
                        In Progress
                      </span>
                      <span className="text-yellow-400 font-bold text-lg">{stats.inProgressTasks}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${stats.totalTasks > 0 ? (stats.inProgressTasks / stats.totalTasks) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Pending Tasks */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70 text-sm flex items-center gap-2">
                        <span className="text-xl">📋</span>
                        Pending Tasks
                      </span>
                      <span className="text-blue-400 font-bold text-lg">
                        {stats.totalTasks - stats.completedTasks - stats.inProgressTasks}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${stats.totalTasks > 0 ? ((stats.totalTasks - stats.completedTasks - stats.inProgressTasks) / stats.totalTasks) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Total summary */}
                  <div className="bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-xl p-4 border border-yellow-400/30 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-400 font-semibold flex items-center gap-2">
                        <span className="text-xl">📊</span>
                        Total Tasks
                      </span>
                      <span className="text-white font-bold text-2xl">{stats.totalTasks}</span>
                    </div>
                  </div>
                  
                  {/* Motivational message */}
                  <div className="text-center pt-2">
                    {completionPercentage >= 75 && (
                      <p className="text-sm text-yellow-400 font-medium">🎉 Amazing work! You're crushing it!</p>
                    )}
                    {completionPercentage >= 50 && completionPercentage < 75 && (
                      <p className="text-sm text-green-400 font-medium">💪 Great progress! Keep it up!</p>
                    )}
                    {completionPercentage >= 25 && completionPercentage < 50 && (
                      <p className="text-sm text-blue-400 font-medium">📈 You're on the right track!</p>
                    )}
                    {completionPercentage < 25 && stats.totalTasks > 0 && (
                      <p className="text-sm text-white/70 font-medium">🚀 Let's get started on those tasks!</p>
                    )}
                    {stats.totalTasks === 0 && (
                      <p className="text-sm text-white/60 font-medium">Waiting for your coach to assign tasks...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Tasks */}
      <div className="px-6 md:px-16 py-10">
        <div className="max-w-7xl mx-auto">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-400/10 to-transparent p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-blue-400">📝 Your Assigned Tasks</h2>
              <NavLink to="/trainee/tasks" className="text-xs text-yellow-400 hover:underline font-medium">
                View All →
              </NavLink>
            </div>

            {loading ? (
              <div className="p-8 text-center text-white/50">⏳ Loading tasks...</div>
            ) : assignments.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3">🎯</div>
                <p className="text-white/70 mb-4">No tasks assigned yet</p>
                <p className="text-sm text-white/50">Your coach will assign tasks here. Check back soon!</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {assignments.map(assignment => (
                  <NavLink
                    key={assignment._id}
                    to={`/trainee/tasks`}
                    className="block p-6 hover:bg-white/5 transition group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-white group-hover:text-yellow-400 transition text-lg">
                            {assignment.task?.title || 'Untitled Task'}
                          </h3>
                          <Badge variant={
                            assignment.status === 'completed' ? 'success' :
                            assignment.status === 'in_progress' ? 'info' :
                            assignment.status === 'pending' ? 'warning' :
                            'default'
                          }>
                            {assignment.status === 'completed' ? '✅ Done' :
                             assignment.status === 'in_progress' ? '⏳ In Progress' :
                             assignment.status === 'pending' ? '📋 Pending' :
                             assignment.status === 'overdue' ? '⚠️ Overdue' :
                             'Unknown'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-white/60 mb-3">{assignment.task?.description || 'No description'}</p>
                        
                        <div className="flex flex-wrap gap-4 text-xs text-white/50">
                          <span>📅 {assignment.task?.difficulty || 'N/A'} Level</span>
                          <span>⏱️ {assignment.task?.duration_minutes ? `${assignment.task.duration_minutes} mins` : 'N/A'}</span>
                          {assignment.due_date && <span>📍 Due: {new Date(assignment.due_date).toLocaleDateString()}</span>}
                          {assignment.coach && <span>👨‍🏫 {assignment.coach.full_name || assignment.coach.username}</span>}
                        </div>
                      </div>

                      <div className="text-right text-xs">
                        <div className="text-white/70">{assignment.task?.type || 'Task'}</div>
                        <div className="text-yellow-400 font-semibold mt-1">
                          {assignment.status === 'completed' ? '100%' : 
                           assignment.status === 'in_progress' ? '50%' : '0%'}
                        </div>
                      </div>
                    </div>
                  </NavLink>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="text-center group hover:shadow-lg hover:scale-105 transition-transform cursor-pointer">
              <NavLink to="/trainee/tasks" className="block">
                <div className="text-3xl mb-2">📋</div>
                <h3 className="font-semibold text-white group-hover:text-yellow-400 transition">All Tasks</h3>
                <p className="text-xs text-white/60 mt-1">View all assigned tasks</p>
              </NavLink>
            </Card>

            <Card className="text-center group hover:shadow-lg hover:scale-105 transition-transform cursor-pointer">
              <NavLink to="/trainee/progress" className="block">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold text-white group-hover:text-yellow-400 transition">Progress</h3>
                <p className="text-xs text-white/60 mt-1">Track your fitness progress</p>
              </NavLink>
            </Card>

            <Card className="text-center group hover:shadow-lg hover:scale-105 transition-transform cursor-pointer">
              <NavLink to="/trainee/profile" className="block">
                <div className="text-3xl mb-2">👤</div>
                <h3 className="font-semibold text-white group-hover:text-yellow-400 transition">Profile</h3>
                <p className="text-xs text-white/60 mt-1">Edit your profile info</p>
              </NavLink>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
