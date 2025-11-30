import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'

const features = [
  {
    slug: 'meal-planning',
    title: 'AI Meal Planning',
    icon: '🍽️',
    short: 'Personalized nutrition plans powered by AI'
  },
  {
    slug: 'workout-tracking',
    title: 'Workout Tracking',
    icon: '💪',
    short: 'Track your progress and stay motivated'
  },
  {
    slug: 'coach-support',
    title: 'Coach Support',
    icon: '👨‍🏫',
    short: 'Get guidance from certified coaches'
  },
  {
    slug: 'progress-analytics',
    title: 'Progress Analytics',
    icon: '📊',
    short: 'Detailed insights into your fitness journey'
  }
]

export default function App() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Redirect coach/trainee to their dashboard on mount
  React.useEffect(() => {
    if (user?.role === 'coach' && !window.location.pathname.startsWith('/coach')) {
      navigate('/coach/dashboard')
    }
    if (user?.role === 'trainee' && !window.location.pathname.startsWith('/trainee')) {
      navigate('/trainee/dashboard')
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-[#001a3d] text-white font-sans">
      {/* Navbar */}
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:px-3 focus:py-2 focus:bg-yellow-400 focus:text-[#001a3d] focus:rounded">Skip to content</a>
      <header className="w-full flex items-center justify-between px-6 md:px-16 py-4 border-b border-white/10 bg-[#001a3d]/95 backdrop-blur supports-[backdrop-filter]:bg-[#001a3d]/85 sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-semibold tracking-wide flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-2" />
            MoveOn
          </span>
        </div>
        <nav className="hidden md:flex items-center space-x-8 text-sm">
          {user?.role !== 'coach' && user?.role !== 'trainee' && (
            <>
              <NavLink to="/" end className={({isActive}) => `hover:text-yellow-400 transition-colors ${isActive ? 'text-yellow-400' : ''}`}>Home</NavLink>
            </>
          )}
          {user?.role === 'coach' && (
            <>
              <NavLink to="/coach/dashboard" className={({isActive}) => `hover:text-yellow-400 transition-colors ${isActive ? 'text-yellow-400' : ''}`}>Dashboard</NavLink>
              <NavLink to="/coach/trainees" className={({isActive}) => `hover:text-yellow-400 transition-colors ${isActive ? 'text-yellow-400' : ''}`}>Trainees</NavLink>
              <NavLink to="/coach/tasks" className={({isActive}) => `hover:text-yellow-400 transition-colors ${isActive ? 'text-yellow-400' : ''}`}>Tasks</NavLink>
              <NavLink to="/coach/statistics" className={({isActive}) => `hover:text-yellow-400 transition-colors ${isActive ? 'text-yellow-400' : ''}`}>Statistics</NavLink>
            </>
          )}
          {user?.role === 'trainee' && (
            <>
              <NavLink to="/trainee/dashboard" className={({isActive}) => `hover:text-yellow-400 transition-colors ${isActive ? 'text-yellow-400' : ''}`}>Dashboard</NavLink>
              <NavLink to="/trainee/tasks" className={({isActive}) => `hover:text-yellow-400 transition-colors ${isActive ? 'text-yellow-400' : ''}`}>My Tasks</NavLink>
              <NavLink to="/trainee/progress" className={({isActive}) => `hover:text-yellow-400 transition-colors ${isActive ? 'text-yellow-400' : ''}`}>Progress</NavLink>
              <NavLink to="/ai-assistant" className={({isActive}) => `hover:text-yellow-400 transition-colors ${isActive ? 'text-yellow-400' : ''}`}>AI Assistant</NavLink>
            </>
          )}
          {!user && <NavLink to="/login" className={({isActive}) => `px-4 py-1.5 border border-yellow-400 text-yellow-400 rounded hover:bg-yellow-400 hover:text-[#001a3d] transition-colors text-sm font-medium ${isActive ? 'bg-yellow-400 text-[#001a3d]' : ''}`}>Log in</NavLink>}
          {!user && <NavLink to="/register" className={({isActive}) => `px-4 py-1.5 border border-yellow-400/40 text-yellow-300 rounded hover:border-yellow-400 hover:text-yellow-400 transition-colors text-sm font-medium ${isActive ? 'border-yellow-400 text-yellow-400' : ''}`}>Register</NavLink>}
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/70">{user.role === 'coach' ? 'Coach' : 'Trainee'} | {user.email}</span>
              <button onClick={() => { logout(); navigate('/'); }} className="px-3 py-1 text-xs rounded bg-yellow-400 text-[#001a3d] font-medium hover:bg-yellow-300">Logout</button>
            </div>
          )}
        </nav>
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="md:hidden p-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"
          aria-label={mobileOpen ? 'Close Menu' : 'Open Menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div id="mobile-menu" className="absolute top-[64px] right-0 left-0 mx-3 bg-[#001f47] border border-white/10 rounded-lg shadow-xl p-4">
            <div className="flex flex-col gap-3 text-sm">
              <NavLink to="/" end onClick={() => setMobileOpen(false)} className={({isActive}) => `px-3 py-2 rounded ${isActive ? 'bg-[#003266] text-yellow-300' : 'hover:bg-white/5'}`}>Home</NavLink>
              <div className="h-px bg-white/10 my-1" />
              {!user && (
                <div className="grid grid-cols-2 gap-2">
                  <NavLink to="/login" onClick={() => setMobileOpen(false)} className="text-center px-3 py-2 rounded border border-yellow-400 text-yellow-400">Log in</NavLink>
                  <NavLink to="/register" onClick={() => setMobileOpen(false)} className="text-center px-3 py-2 rounded border border-yellow-400/40 text-yellow-300">Register</NavLink>
                </div>
              )}
              {user && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-white/70 truncate">{user.role === 'coach' ? 'Coach' : 'Trainee'} | {user.email}</span>
                  <button onClick={() => { setMobileOpen(false); logout(); navigate('/'); }} className="px-3 py-1.5 text-xs rounded bg-yellow-400 text-[#001a3d] font-medium">Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main id="main">
        <Outlet />
      </main>

      <footer className="px-6 md:px-16 py-8 text-center text-xs text-white/50 border-t border-white/10">
        © {new Date().getFullYear()} MoveOn. All rights reserved.
      </footer>
    </div>
  )
}

// Keep existing landing sections as a separate component
export function HomeLanding() {
  return (
    <>
      {/* Hero Section */}
      <section id="home" className="px-6 md:px-16 pt-12 md:pt-14 pb-20 md:pb-24 relative overflow-hidden">
        <div className="max-w-5xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight md:leading-[1.15] tracking-tight">
            ACHIEVE YOUR
            <br />
            FITNESS GOALS
          </h1>
          <p className="mt-4 md:mt-6 max-w-xl text-sm sm:text-base md:text-lg text-white/80">
            Empowering coaches and participants with personalized workout and meal planning.
          </p>
          <div className="mt-6 md:mt-8">
            <NavLink to="/login" className="inline-block bg-yellow-400 text-[#001a3d] font-semibold px-6 py-3 rounded shadow hover:shadow-lg hover:bg-yellow-300 transition">Get Started</NavLink>
          </div>
        </div>
        {/* Illustration (simple placeholder lines) */}
        <div className="absolute right-6 md:right-20 top-20 hidden md:block pointer-events-none select-none">
          <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
            <circle cx="150" cy="150" r="140" stroke="#FDBF00" strokeWidth="4" strokeDasharray="10 14" />
            <path d="M120 180 L150 110 L180 180" stroke="#FDBF00" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="150" cy="95" r="22" stroke="#FDBF00" strokeWidth="4" />
            <path d="M130 200 Q150 215 170 200" stroke="#FDBF00" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 md:px-16 py-16 md:py-20 bg-[#002451]">
        <h2 className="text-center text-2xl md:text-3xl font-bold tracking-wide text-yellow-400 mb-8 md:mb-12">FEATURES</h2>
        <div className="grid gap-5 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.slug} className="bg-[#001f47] rounded-lg p-6 shadow-sm border border-white/5">
              <div className="w-12 h-12 mb-4 flex items-center justify-center rounded-md bg-[#003266] text-yellow-400">
                {f.icon}
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-white/70 leading-relaxed">{f.short}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Secondary Feature Explanation */}
      <section className="px-6 md:px-16 py-14 md:py-16 bg-[#001a3d]">
        <h2 className="text-2xl font-bold text-yellow-400 mb-6 md:mb-8">FEATURES</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10 max-w-5xl">
          {features.slice(0,3).map(f => (
            <div key={f.slug}>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-white/70 leading-relaxed">{f.short}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}