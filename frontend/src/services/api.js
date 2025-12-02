// frontend/src/services/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    // Calculate request duration for performance monitoring
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }
    
    return response;
  },
  (error) => {
    const { response, request, config } = error;
    
    // Calculate request duration even for errors
    if (config?.metadata?.startTime) {
      const endTime = new Date();
      const duration = endTime - config.metadata.startTime;
      console.warn(`API Error: ${config.method?.toUpperCase()} ${config.url} - ${duration}ms`);
    }
    
    // Handle different error scenarios
    if (response) {
      // Server responded with error status
      const { status, data } = response;
      
      switch (status) {
        case 400:
          // Bad Request - show validation errors
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => {
              toast.error(err.msg || err.message || 'Validation error');
            });
          } else {
            toast.error(data.message || 'Bad request');
          }
          break;
          
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
          break;
          
        case 403:
          // Forbidden - user doesn't have permission
          toast.error('You do not have permission to perform this action');
          break;
          
        case 404:
          // Not Found
          toast.error('Requested resource not found');
          break;
          
        case 409:
          // Conflict
          toast.error(data.message || 'Conflict occurred');
          break;
          
        case 422:
          // Unprocessable Entity - validation errors
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => {
              toast.error(err.msg || err.message || 'Validation error');
            });
          } else {
            toast.error(data.message || 'Validation failed');
          }
          break;
          
        case 429:
          // Too Many Requests - rate limiting
          toast.error('Too many requests. Please try again later.');
          break;
          
        case 500:
          // Internal Server Error
          toast.error('Server error. Please try again later.');
          console.error('Server Error:', data);
          break;
          
        default:
          // Other server errors
          toast.error(data.message || `Server error (${status})`);
          console.error('API Error:', error);
      }
    } else if (request) {
      // Network error - no response received
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please check your connection.');
      } else if (error.message === 'Network Error') {
        toast.error('Network error. Please check your internet connection.');
      } else {
        toast.error('Connection error. Please try again.');
      }
      console.error('Network Error:', error);
    } else {
      // Request setup error
      toast.error('Request failed. Please try again.');
      console.error('Request Setup Error:', error);
    }
    
    return Promise.reject(error);
  }
);

// API helper methods
export const apiHelpers = {
  // Get request with error handling
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Post request with error handling
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Put request with error handling
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Patch request with error handling
  patch: async (url, data = {}, config = {}) => {
    try {
      const response = await api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete request with error handling
  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload file with progress
  upload: async (url, formData, onProgress = null) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      };
      
      const response = await api.post(url, formData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Set auth token
  setAuthToken: (token) => {
    if (token) {
      localStorage.setItem('authToken', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('authToken');
      delete api.defaults.headers.common['Authorization'];
    }
  },

  // Clear auth
  clearAuth: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  },

  // Get stored token
  getStoredToken: () => {
    return localStorage.getItem('authToken');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  }
};

export default api;