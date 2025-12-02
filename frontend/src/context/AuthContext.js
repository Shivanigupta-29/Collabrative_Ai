// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiHelpers } from '../services/api';
import authService from '../services/authService';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  permissions: [],
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        permissions: action.payload.user.permissions || [],
      };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        permissions: action.payload.permissions || [],
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        permissions: action.payload.permissions || state.permissions,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        permissions: [],
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        permissions: [],
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on app start
  useEffect(() => {
    loadUser();
  }, []);

  // Load user from token
  const loadUser = async () => {
    const token = apiHelpers.getStoredToken();
    
    if (!token) {
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE, payload: 'No token found' });
      return;
    }

    try {
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });
      
      // Set token in axios headers
      apiHelpers.setAuthToken(token);
      
      // Get user data from backend
      const userData = await authService.getCurrentUser();
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      dispatch({ 
        type: AUTH_ACTIONS.LOAD_USER_SUCCESS, 
        payload: userData 
      });
    } catch (error) {
      console.error('Load user error:', error);
      
      // Clear invalid token
      apiHelpers.clearAuth();
      
      dispatch({ 
        type: AUTH_ACTIONS.LOAD_USER_FAILURE, 
        payload: 'Failed to load user' 
      });
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await authService.login(credentials);
      
      // Store token and user data
      apiHelpers.setAuthToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      dispatch({ 
        type: AUTH_ACTIONS.LOGIN_SUCCESS, 
        payload: response 
      });

      toast.success(`Welcome back, ${response.user.name}!`);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      
      dispatch({ 
        type: AUTH_ACTIONS.LOGIN_FAILURE, 
        payload: errorMessage 
      });
      
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START });

      const response = await authService.register(userData);
      
      // Store token and user data
      apiHelpers.setAuthToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      dispatch({ 
        type: AUTH_ACTIONS.REGISTER_SUCCESS, 
        payload: response 
      });

      toast.success(`Welcome, ${response.user.name}! Account created successfully.`);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      
      dispatch({ 
        type: AUTH_ACTIONS.REGISTER_FAILURE, 
        payload: errorMessage 
      });
      
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    // Clear all auth data
    apiHelpers.clearAuth();
    
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    
    toast.success('Logged out successfully');
  };

  // Update user profile
  const updateProfile = async (updateData) => {
    try {
      const updatedUser = await authService.updateProfile(updateData);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      dispatch({ 
        type: AUTH_ACTIONS.UPDATE_USER, 
        payload: updatedUser 
      });

      toast.success('Profile updated successfully');
      return updatedUser;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      await authService.changePassword(passwordData);
      toast.success('Password changed successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!state.user) return false;
    
    // Admin has all permissions
    if (state.user.role === 'admin') return true;
    
    // Check specific permissions
    return state.permissions.includes(permission);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!state.user) return false;
    return state.user.role === role;
  };

  // Check if user can access resource
  const canAccess = (resource, action = 'read') => {
    if (!state.user) return false;
    
    const permission = `${resource}:${action}`;
    return hasPermission(permission);
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    login,
    register,
    logout,
    loadUser,
    updateProfile,
    changePassword,
    
    // Helpers
    hasPermission,
    hasRole,
    canAccess,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;