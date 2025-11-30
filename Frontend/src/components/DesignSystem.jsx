/**
 * MoveOn Design System
 * Futuristic UI Components Library
 * Color Scheme: Navy Blue + Yellow Gold
 */


import React from 'react'

// ============================================
// COLOR TOKENS
// ============================================
export const colors = {
  primary: '#FCD34D',      // Yellow-400
  primaryHover: '#FBBF24', // Yellow-300
  darkBg: '#001a3d',       // Deep Navy
  cardBg: '#002451',       // Navy Blue
  border: '#ffffff20',     // White 20% opacity
  text: '#ffffff',         // White
  textSecondary: '#ffffff80', // White 80% opacity
  textMuted: '#ffffff40',  // White 40% opacity
  success: '#10b981',      // Green
  warning: '#f59e0b',      // Orange
  danger: '#ef4444',       // Red
}

// ============================================
// SPACING TOKENS (8px grid)
// ============================================
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
}

// ============================================
// BORDER RADIUS
// ============================================
export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
}

// ============================================
// SHADOWS (Dark theme optimized)
// ============================================
export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px rgba(0, 0, 0, 0.4)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.6)',
  glow: '0 0 20px rgba(252, 211, 77, 0.2)',
}

// ============================================
// BUTTON COMPONENT
// ============================================
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  disabled = false,
  ...props 
}) => {
  const baseStyles = `
    font-semibold rounded-lg transition-all duration-200 
    flex items-center justify-center gap-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const variants = {
    primary: `bg-yellow-400 hover:bg-yellow-300 text-[#001a3d] shadow-md hover:shadow-lg hover:shadow-yellow-400/20`,
    secondary: `bg-[#002451] hover:bg-[#003366] text-white border border-white/20 hover:border-white/40`,
    danger: `bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30`,
    ghost: `text-white hover:bg-white/10`,
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

// ============================================
// CARD COMPONENT
// ============================================
export const Card = ({ children, className = '', hover = true, ...props }) => {
  return (
    <div
      className={`
        bg-[#002451] rounded-xl border border-white/10 p-6
        ${hover ? 'hover:border-white/30 hover:shadow-lg hover:shadow-yellow-400/10 transition-all duration-200' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

// ============================================
// BADGE COMPONENT
// ============================================
export const Badge = ({ children, variant = 'primary', ...props }) => {
  const variants = {
    primary: 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30',
    success: 'bg-green-400/20 text-green-300 border border-green-400/30',
    warning: 'bg-orange-400/20 text-orange-300 border border-orange-400/30',
    danger: 'bg-red-400/20 text-red-300 border border-red-400/30',
    default: 'bg-white/10 text-white/80 border border-white/20',
  }

  return (
    <span
      className={`
        inline-block px-3 py-1 rounded-full text-xs font-semibold
        ${variants[variant]}
      `}
      {...props}
    >
      {children}
    </span>
  )
}

// ============================================
// STAT CARD COMPONENT
// ============================================
export const StatCard = ({ icon, label, value, trend, className = '' }) => {
  return (
    <Card className={`text-center ${className}`}>
      <div className="text-3xl mb-3">{icon}</div>
      <p className="text-white/60 text-sm mb-2">{label}</p>
      <p className="text-3xl font-bold text-yellow-400 mb-2">{value}</p>
      {trend && (
        <p className={`text-xs font-semibold ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? '📈' : '📉'} {Math.abs(trend)}%
        </p>
      )}
    </Card>
  )
}

// ============================================
// PROGRESS BAR COMPONENT
// ============================================
export const ProgressBar = ({ value = 0, max = 100, label = '', color = 'yellow' }) => {
  const percentage = (value / max) * 100
  
  const colorMap = {
    yellow: 'bg-yellow-400',
    green: 'bg-green-400',
    blue: 'bg-blue-400',
    red: 'bg-red-400',
  }

  return (
    <div className="space-y-2">
      {label && <p className="text-sm text-white/60">{label}</p>}
      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${colorMap[color]} transition-all duration-300 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-white/40 text-right">{percentage.toFixed(0)}%</p>
    </div>
  )
}

// ============================================
// INPUT COMPONENT
// ============================================
export const Input = ({ 
  label, 
  placeholder = '', 
  className = '',
  error = '',
  ...props 
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white/80">{label}</label>
      )}
      <input
        className={`
          w-full px-4 py-3 rounded-lg
          bg-[#001f47] border border-white/10
          text-white placeholder-white/40
          focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400
          outline-none transition-all duration-200
          ${error ? 'border-red-500/50 focus:ring-red-500' : ''}
          ${className}
        `}
        placeholder={placeholder}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

// ============================================
// SELECT COMPONENT
// ============================================
export const Select = ({ 
  label, 
  options = [], 
  className = '',
  ...props 
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white/80">{label}</label>
      )}
      <select
        className={`
          w-full px-4 py-3 rounded-lg
          bg-[#001f47] border border-white/10
          text-white
          focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400
          outline-none transition-all duration-200
          ${className}
        `}
        {...props}
      >
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

// ============================================
// MODAL COMPONENT
// ============================================
export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'md'
}) => {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-[#002451] rounded-xl border border-yellow-400/30 w-full ${sizes[size]} shadow-2xl`}>
        {/* Header */}
        <div className="border-b border-white/10 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-yellow-400">{title}</h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-white/10 p-6 flex gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// ALERT COMPONENT
// ============================================
export const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  icon,
  onClose 
}) => {
  const typeStyles = {
    success: 'bg-green-500/10 border-green-500/30 text-green-300',
    error: 'bg-red-500/10 border-red-500/30 text-red-300',
    warning: 'bg-orange-500/10 border-orange-500/30 text-orange-300',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
  }

  return (
    <div className={`border rounded-lg p-4 ${typeStyles[type]} flex gap-3`}>
      <div className="text-2xl flex-shrink-0">{icon}</div>
      <div className="flex-1">
        {title && <p className="font-semibold">{title}</p>}
        <p className="text-sm">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-2xl">✕</button>
      )}
    </div>
  )
}

// ============================================
// AVATAR COMPONENT
// ============================================
export const Avatar = ({ 
  src, 
  fallback = '👤', 
  size = 'md',
  className = ''
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
  }

  return (
    <div
      className={`
        flex items-center justify-center rounded-full
        bg-gradient-to-br from-yellow-400/20 to-blue-400/20
        border border-yellow-400/30
        ${sizes[size]}
        ${className}
      `}
    >
      {src ? (
        <img src={src} alt="avatar" className="w-full h-full rounded-full object-cover" />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  )
}

// ============================================
// SKELETON LOADER
// ============================================
export const Skeleton = ({ width = 'w-full', height = 'h-4', className = '' }) => {
  return (
    <div
      className={`
        ${width} ${height} rounded
        bg-gradient-to-r from-white/5 via-white/10 to-white/5
        animate-pulse
        ${className}
      `}
    />
  )
}

// ============================================
// DIVIDER COMPONENT
// ============================================
export const Divider = ({ text = '', className = '' }) => {
  if (text) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/40 text-sm">{text}</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>
    )
  }

  return <div className={`h-px bg-white/10 ${className}`} />
}

export default {
  Button,
  Card,
  Badge,
  StatCard,
  ProgressBar,
  Input,
  Select,
  Modal,
  Alert,
  Avatar,
  Skeleton,
  Divider,
  colors,
  spacing,
  borderRadius,
  shadows,
}
