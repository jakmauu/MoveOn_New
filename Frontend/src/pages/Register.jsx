import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'trainee', // Default role trainee
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Full name validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    // Validate form
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      console.log('📝 Submitting registration with role:', formData.role);
      
      // Prepare data for API (remove confirmPassword)
      const { confirmPassword, ...registerData } = formData;

      // Call register function from AuthContext
      await register(registerData);

      console.log('✅ Registration successful for role:', formData.role);

      // Redirect based on role
      if (formData.role === 'coach') {
        navigate('/coach/dashboard');
      } else {
        navigate('/trainee/dashboard');
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      setApiError(error.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001a3d] via-[#002451] to-[#001a3d] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-[#002451] rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-400/10 to-transparent p-8 border-b border-white/10">
            <div className="text-center">
              <div className="text-5xl mb-4">🏃</div>
              <h1 className="text-3xl font-bold text-yellow-400 mb-2">Join MoveOn</h1>
              <p className="text-white/70">Create your account and start your fitness journey</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {/* API Error Message */}
            {apiError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                <p className="text-red-400 text-sm">{apiError}</p>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-blue-900/30 border border-blue-700 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition"
                placeholder="johndoe"
              />
              {errors.username && <p className="mt-2 text-red-400 text-xs">{errors.username}</p>}
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full bg-blue-900/30 border border-blue-700 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition"
                placeholder="John Doe"
              />
              {errors.full_name && <p className="mt-2 text-red-400 text-xs">{errors.full_name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-blue-900/30 border border-blue-700 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition"
                placeholder="john@example.com"
              />
              {errors.email && <p className="mt-2 text-red-400 text-xs">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-blue-900/30 border border-blue-700 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition"
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-2 text-red-400 text-xs">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-blue-900/30 border border-blue-700 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition"
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="mt-2 text-red-400 text-xs">{errors.confirmPassword}</p>}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-white text-sm font-medium mb-3">I want to be a</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, role: 'coach' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.role === 'coach'
                      ? 'bg-yellow-400 border-yellow-400 text-blue-900'
                      : 'bg-blue-900/30 border-blue-700 text-white hover:border-yellow-400'
                  }`}
                >
                  <div className="text-2xl mb-1">🏋️</div>
                  <div className="font-semibold">Coach</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, role: 'trainee' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.role === 'trainee'
                      ? 'bg-yellow-400 border-yellow-400 text-blue-900'
                      : 'bg-blue-900/30 border-blue-700 text-white hover:border-yellow-400'
                  }`}
                >
                  <div className="text-2xl mb-1">🏃</div>
                  <div className="font-semibold">Trainee</div>
                </button>
              </div>
              {errors.role && <p className="mt-2 text-red-400 text-xs">{errors.role}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-900"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-white/70 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;