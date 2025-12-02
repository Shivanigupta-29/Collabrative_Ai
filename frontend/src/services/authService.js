// frontend/src/services/authService.js
import { apiHelpers } from './api';

const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const { email, password, rememberMe = false } = credentials;

      const response = await apiHelpers.post('/auth/login', {
        email: email.toLowerCase().trim(),
        password,
        rememberMe,
      });

      return response;
    } catch (error) {
      console.error('Login service error:', error);
      throw error;
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      const {
        name,
        email,
        password,
        confirmPassword,
        role = 'user',
        organization,
        agreeToTerms = false,
      } = userData;

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (!agreeToTerms) {
        throw new Error('You must agree to the terms and conditions');
      }

      const response = await apiHelpers.post('/auth/register', {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role,
        organization: organization?.trim(),
      });

      return response;
    } catch (error) {
      console.error('Registration service error:', error);
      throw error;
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await apiHelpers.get('/auth/me');
      return response.user;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (updateData) => {
    try {
      const response = await apiHelpers.put('/auth/profile', updateData);
      return response.user;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const { currentPassword, newPassword, confirmNewPassword } = passwordData;

      if (newPassword !== confirmNewPassword) {
        throw new Error('New passwords do not match');
      }

      if (newPassword === currentPassword) {
        throw new Error('New password must be different from current password');
      }

      const response = await apiHelpers.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      return response;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  // Upload avatar
  uploadAvatar: async (file, onProgress) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await apiHelpers.upload('/auth/avatar', formData, onProgress);
      return response;
    } catch (error) {
      console.error('Upload avatar error:', error);
      throw error;
    }
  },

  // Delete avatar
  deleteAvatar: async () => {
    try {
      const response = await apiHelpers.delete('/auth/avatar');
      return response;
    } catch (error) {
      console.error('Delete avatar error:', error);
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await apiHelpers.post('/auth/forgot-password', {
        email: email.toLowerCase().trim(),
      });

      return response;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (resetData) => {
    try {
      const { token, newPassword, confirmPassword } = resetData;

      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await apiHelpers.post('/auth/reset-password', {
        token,
        newPassword,
      });

      return response;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  // Verify email
  verifyEmail: async (token) => {
    try {
      const response = await apiHelpers.post('/auth/verify-email', { token });
      return response;
    } catch (error) {
      console.error('Verify email error:', error);
      throw error;
    }
  },

  // Resend verification email
  resendVerification: async () => {
    try {
      const response = await apiHelpers.post('/auth/resend-verification');
      return response;
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await apiHelpers.post('/auth/refresh');
      return response;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await apiHelpers.post('/auth/logout');
    } catch (error) {
      console.error('Server logout error:', error);
    } finally {
      apiHelpers.clearAuth();
    }
  },

  // Check if email exists
  checkEmailExists: async (email) => {
    try {
      const response = await apiHelpers.post('/auth/check-email', {
        email: email.toLowerCase().trim(),
      });

      return response.exists;
    } catch (error) {
      console.error('Check email error:', error);
      return false;
    }
  },
};

export default authService;
