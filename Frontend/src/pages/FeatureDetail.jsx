import React from 'react'
import { useParams, Link } from 'react-router-dom'

const features = [
  {
    slug: 'meal-planning',
    title: 'AI Meal Planning',
    icon: '🍽️',
    shortDesc: 'Personalized nutrition plans powered by AI',
    fullDesc: 'Get customized meal plans based on your goals, dietary preferences, and restrictions.',
    benefits: ['Personalized nutrition', 'Easy to follow', 'Flexible meal options']
  },
  {
    slug: 'workout-tracking',
    title: 'Workout Tracking',
    icon: '💪',
    shortDesc: 'Track your progress and stay motivated',
    fullDesc: 'Monitor your workouts, track progress, and achieve your fitness goals.',
    benefits: ['Progress monitoring', 'Detailed analytics', 'Achievement tracking']
  },
  {
    slug: 'coach-support',
    title: 'Coach Support',
    icon: '👨‍🏫',
    shortDesc: 'Get guidance from certified coaches',
    fullDesc: 'Work with professional coaches who provide personalized guidance and support.',
    benefits: ['Expert guidance', 'Personalized plans', '24/7 support']
  }
]

const getFeatureBySlug = (slug) => features.find(f => f.slug === slug)

export default function FeatureDetail() {
  const { slug } = useParams()
  const feature = getFeatureBySlug(slug)

  if (!feature) {
    return (
      <div className="min-h-screen bg-[#001a3d] text-white px-6 md:px-16 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4 text-yellow-400">Feature Not Found</h1>
          <p className="text-white/70 mb-8">The feature you are looking for does not exist or has been moved.</p>
          <NavLink to="/features" className="px-5 py-2 rounded bg-yellow-400 text-[#001a3d] font-medium hover:bg-yellow-300 transition">Back to Features</NavLink>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#001a3d] text-white px-6 md:px-16 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 flex items-center justify-center rounded-lg bg-[#002e63] text-yellow-400">
            {feature.icon}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400">{feature.title}</h1>
            <p className="text-white/70 text-sm md:text-base mt-2 max-w-2xl">{feature.long}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-8 md:mt-10">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Key Capabilities</h2>
            <ul className="space-y-3 text-sm md:text-base list-disc pl-6 marker:text-yellow-400">
              {feature.bullets.map(b => <li key={b}>{b}</li>)}
            </ul>
          </div>
          <div className="bg-[#002451] rounded-lg p-6 border border-white/5">
            <h2 className="text-xl font-semibold mb-4">Why it Matters</h2>
            <p className="text-sm text-white/70 leading-relaxed">This feature directly accelerates user progress by reducing planning friction and increasing adherence. It integrates seamlessly with other modules so coaching decisions rely on unified data rather than fragmented spreadsheets.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {['Scalable','Data-driven','User-centric','Coach-ready'].map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-[#003266] text-xs font-medium text-yellow-300 tracking-wide">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-xl font-semibold mb-4">Explore Other Features</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {features.filter(f => f.slug !== feature.slug).map(f => (
              <NavLink key={f.slug} to={`/feature/${f.slug}`} className="group bg-[#001f47] rounded-lg p-4 border border-white/5 hover:border-yellow-400/40 transition block">
                <div className="w-10 h-10 flex items-center justify-center rounded-md bg-[#003266] text-yellow-400 mb-3 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-medium text-sm mb-1">{f.title}</h3>
                <p className="text-[11px] text-white/60 leading-snug line-clamp-3">{f.short}</p>
                <span className="mt-2 text-[11px] inline-block text-yellow-400 group-hover:underline">View →</span>
              </NavLink>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <NavLink to="/features" className="inline-block mt-4 px-5 py-2 rounded bg-yellow-400 text-[#001a3d] font-medium hover:bg-yellow-300 transition">Back to All Features</NavLink>
        </div>
      </div>
    </div>
  )
}
