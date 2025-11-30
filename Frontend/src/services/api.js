import axios from 'axios';

// Base API URL - automatically adds /api if not present
const getApiUrl = () => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // Remove trailing slash if present
  const cleanUrl = baseUrl.replace(/\/$/, '');
  // Add /api if not already present
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const API_URL = getApiUrl();

console.log('🌐 API URL:', API_URL);
console.log('🔧 Environment:', import.meta.env.MODE);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increased for production
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`📥 Response from ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.response || error);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// ==================== AUTH APIs ====================

export const authAPI = {
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Registration failed' };
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Login failed' };
    }
  },

  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get user data' };
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update profile' };
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to change password' };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
};

// ==================== COACH APIs ====================

export const coachAPI = {
  // Get my trainees
  getMyTrainees: async () => {
    try {
      const response = await api.get('/coach/trainees');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get trainees' };
    }
  },

  // Get available trainees (NOT in my team)
  getAvailableTrainees: async (search = '') => {
    try {
      const response = await api.get(`/coach/available-trainees${search ? `?search=${search}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get available trainees' };
    }
  },

  // Search trainees (backward compatibility)
  searchTrainees: async (search = '') => {
    try {
      const response = await api.get(`/coach/search-trainees?search=${search}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to search trainees' };
    }
  },

  // Add trainee
  addTrainee: async (traineeData) => {
    try {
      const response = await api.post('/coach/trainees', traineeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to add trainee' };
    }
  },

  // Remove trainee
  removeTrainee: async (relationshipId) => {
    try {
      const response = await api.delete(`/coach/trainees/${relationshipId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to remove trainee' };
    }
  },

  // Get trainee details
  getTraineeDetails: async (traineeId) => {
    try {
      const response = await api.get(`/coach/trainees/${traineeId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get trainee details' };
    }
  },

  // Get trainee stats
  getTraineeStats: async (traineeId) => {
    try {
      const response = await api.get(`/coach/trainees/${traineeId}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get trainee stats' };
    }
  },
};

// ==================== TRAINEE APIs ====================

export const traineeAPI = {
  getMyCoaches: async () => {
    try {
      const response = await api.get('/trainee/coaches');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get coaches' };
    }
  },

  getMyTasks: async (status = '') => {
    try {
      const response = await api.get(`/trainee/tasks${status ? `?status=${status}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get tasks' };
    }
  },

  submitTask: async (submissionData) => {
    try {
      const response = await api.post('/trainee/submissions', submissionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to submit task' };
    }
  },

  getMySubmissions: async () => {
    try {
      const response = await api.get('/trainee/submissions');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get submissions' };
    }
  },

  getMyStats: async () => {
    try {
      const response = await api.get('/trainee/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get stats' };
    }
  },
};

// ==================== TASK APIs ====================

export const taskAPI = {
  createTask: async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to create task' };
    }
  },

  getTasks: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/tasks${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get tasks' };
    }
  },

  getMyTasks: async () => {
    try {
      const response = await api.get('/tasks/my-tasks');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get tasks' };
    }
  },

  getTaskById: async (taskId) => {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get task' };
    }
  },

  updateTask: async (taskId, taskData) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update task' };
    }
  },

  deleteTask: async (taskId) => {
    try {
      const response = await api.delete(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to delete task' };
    }
  },

  // ⭐ Assign task to trainees
  assignTask: async (taskId, assignmentData) => {
    try {
      console.log('📋 Assigning task:', taskId, assignmentData);
      const response = await api.post(`/tasks/${taskId}/assign`, assignmentData);
      return response.data;
    } catch (error) {
      console.error('❌ Assign task error:', error);
      throw error.response?.data || { success: false, message: 'Failed to assign task' };
    }
  },
};

// ==================== ASSIGNMENT APIs ====================

export const assignmentAPI = {
  // Create assignment (coach assigns task to trainee)
  createAssignment: async (assignmentData) => {
    try {
      const response = await api.post('/assignments', assignmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to create assignment' };
    }
  },

  // Get coach's assignments
  getCoachAssignments: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/assignments/coach${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get assignments' };
    }
  },

  // Get trainee's assignments
  getTraineeAssignments: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/assignments/trainee${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get assignments' };
    }
  },

  // Get assignment by ID
  getAssignmentById: async (assignmentId) => {
    try {
      const response = await api.get(`/assignments/${assignmentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get assignment' };
    }
  },

  // Update assignment
  updateAssignment: async (assignmentId, assignmentData) => {
    try {
      const response = await api.put(`/assignments/${assignmentId}`, assignmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update assignment' };
    }
  },

  // Update assignment status
  updateAssignmentStatus: async (assignmentId, status) => {
    try {
      const response = await api.patch(`/assignments/${assignmentId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update status' };
    }
  },

  // Delete assignment
  deleteAssignment: async (assignmentId) => {
    try {
      const response = await api.delete(`/assignments/${assignmentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to delete assignment' };
    }
  },
};

// ==================== SUBMISSION APIs ====================

export const submissionAPI = {
  // Submit task (trainee)
  submitTask: async (submissionData) => {
    try {
      const response = await api.post('/submissions', submissionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to submit task' };
    }
  },

  // Get my submissions (trainee)
  getMySubmissions: async (status = '') => {
    try {
      const response = await api.get(`/submissions/my-submissions${status ? `?status=${status}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get submissions' };
    }
  },

  // Get submission by ID
  getSubmissionById: async (submissionId) => {
    try {
      const response = await api.get(`/submissions/${submissionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get submission' };
    }
  },

  // Update my submission (trainee)
  updateMySubmission: async (submissionId, updates) => {
    try {
      const response = await api.put(`/submissions/${submissionId}`, updates);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update submission' };
    }
  },

  // Get coach's submissions
  getCoachSubmissions: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/submissions/coach/all${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get submissions' };
    }
  },

  // Get trainee submissions (coach view)
  getTraineeSubmissions: async (traineeId) => {
    try {
      const response = await api.get(`/submissions/trainee/${traineeId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get trainee submissions' };
    }
  },

  // Get assignment submissions
  getAssignmentSubmissions: async (assignmentId) => {
    try {
      const response = await api.get(`/submissions/assignment/${assignmentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get assignment submissions' };
    }
  },

  // Review submission (coach)
  reviewSubmission: async (submissionId, reviewData) => {
    try {
      const response = await api.patch(`/submissions/${submissionId}/review`, reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to review submission' };
    }
  },

  // Delete submission
  deleteSubmission: async (submissionId) => {
    try {
      const response = await api.delete(`/submissions/${submissionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to delete submission' };
    }
  },
};

// ==================== DASHBOARD APIs ====================

export const dashboardAPI = {
  getCoachDashboard: async () => {
    try {
      const response = await api.get('/dashboard/coach');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get dashboard' };
    }
  },

  getTraineeDashboard: async () => {
    try {
      const response = await api.get('/dashboard/trainee');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get dashboard' };
    }
  },
};

// ==================== NOTIFICATION APIs ====================

export const notificationAPI = {
  getNotifications: async (limit = 50) => {
    try {
      const response = await api.get(`/notifications?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get notifications' };
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get unread count' };
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to mark as read' };
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to mark all as read' };
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to delete notification' };
    }
  },
};

// ==================== TEMPLATE APIs ====================

export const templateAPI = {
  createTemplate: async (templateData) => {
    try {
      const response = await api.post('/templates', templateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to create template' };
    }
  },

  getTemplates: async () => {
    try {
      const response = await api.get('/templates');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get templates' };
    }
  },

  getPublicTemplates: async () => {
    try {
      const response = await api.get('/templates/public');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get public templates' };
    }
  },

  getTemplateById: async (templateId) => {
    try {
      const response = await api.get(`/templates/${templateId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get template' };
    }
  },

  updateTemplate: async (templateId, templateData) => {
    try {
      const response = await api.put(`/templates/${templateId}`, templateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update template' };
    }
  },

  deleteTemplate: async (templateId) => {
    try {
      const response = await api.delete(`/templates/${templateId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to delete template' };
    }
  },

  useTemplate: async (templateId) => {
    try {
      const response = await api.post(`/templates/${templateId}/use`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to use template' };
    }
  },
};

export default api;