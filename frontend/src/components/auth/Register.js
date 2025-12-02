// frontend/src/components/auth/Register.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Building, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: '',
    role: 'user',
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { register, isLoading, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    const calculatePasswordStrength = (password) => {
      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[a-z]/.test(password)) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      return strength;
    };
    setPasswordStrength(calculatePasswordStrength(formData.password));
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (passwordStrength < 3) {
      newErrors.password = 'Password is too weak. Include uppercase, lowercase, numbers, and special characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await register(formData);
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  const getPasswordStrengthInfo = () => {
    const strengthLevels = [
      { color: 'bg-red-500', text: 'Very Weak' },
      { color: 'bg-orange-500', text: 'Weak' },
      { color: 'bg-yellow-500', text: 'Fair' },
      { color: 'bg-blue-500', text: 'Good' },
      { color: 'bg-green-500', text: 'Strong' },
    ];
    return strengthLevels[passwordStrength] || strengthLevels[0];
  };

  const handleSocialRegister = (provider) => {
    toast.error(`${provider} registration not implemented yet`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
            <div className="h-6 w-6 bg-white rounded-sm"></div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-600 mt-2">
            Join thousands of teams collaborating with AI
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-red-700 text-sm">{error}</div>
                </div>
              )}

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`pl-10 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 w-full ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter your full name"
                  />

                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 w-full ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Organization */}
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                  Organization (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="organization"
                    name="organization"
                    type="text"
                    value={formData.organization}
                    onChange={handleChange}
                    className={`pl-10 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 w-full `}
                    placeholder="Enter your organization name"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 w-full ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthInfo().color}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{getPasswordStrengthInfo().text}</span>
                    </div>
                  </div>
                )}
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`pl-10 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 w-full ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div> {/* ✅ FIXED missing closing div */}
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-center">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
                  I agree to the <a href="/terms" className="text-purple-600 underline">terms and conditions</a>
                </label>
              </div>
              {errors.agreeToTerms && <p className="text-sm text-red-600">{errors.agreeToTerms}</p>}

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  {isLoading ? 'Registering...' : 'Register'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>

              {/* Login Link */}
              <p className="mt-4 text-sm text-gray-600 text-center">
                Already have an account?{' '}
                <Link to="/login" className="text-purple-600 hover:underline">
                  Log in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
