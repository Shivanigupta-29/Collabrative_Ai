// frontend/src/components/common/Loading.js
import React from 'react';
import { Loader2 } from 'lucide-react';

// Basic Loading Spinner
export const LoadingSpinner = ({ 
  size = 'default', 
  color = 'primary',
  className = '' 
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-6 w-6',
    large: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600'
  };

  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    />
  );
};

// Dots Loading Animation
export const LoadingDots = ({ 
  size = 'default',
  color = 'primary',
  className = ''
}) => {
  const sizeClasses = {
    small: 'h-1 w-1',
    default: 'h-2 w-2',
    large: 'h-3 w-3'
  };

  const colorClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    white: 'bg-white',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600'
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse`}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s'
          }}
        />
      ))}
    </div>
  );
};

// Pulse Loading Animation
export const LoadingPulse = ({ 
  className = '',
  children 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {children}
    </div>
  );
};

// Skeleton Loading Components
export const SkeletonText = ({ 
  lines = 1, 
  className = '' 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`bg-gray-300 dark:bg-gray-600 rounded h-4 ${
            i < lines - 1 ? 'mb-2' : ''
          } ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
};

export const SkeletonCard = ({ 
  showAvatar = false,
  className = '' 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        {showAvatar && (
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full" />
            <div className="ml-3 flex-1">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-1" />
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
            </div>
          </div>
        )}
        <div className="space-y-3">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6" />
        </div>
      </div>
    </div>
  );
};

// Full Page Loading
export const LoadingPage = ({ 
  message = 'Loading...',
  showLogo = true 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
      {showLogo && (
        <div className="mb-8">
          <div className="h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
            <div className="h-8 w-8 bg-white rounded-lg"></div>
          </div>
        </div>
      )}
      
      <div className="text-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
          {message}
        </p>
      </div>
    </div>
  );
};

// Loading Overlay
export const LoadingOverlay = ({ 
  isLoading,
  message = 'Loading...',
  className = '',
  children 
}) => {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center z-50 rounded-lg">
          <div className="text-center">
            <LoadingSpinner size="large" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Progress Bar Loading
export const LoadingProgress = ({ 
  progress = 0,
  message = 'Loading...',
  className = '' 
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="mb-2 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {message}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

// Circular Progress Loading
export const LoadingCircular = ({ 
  progress = 0,
  size = 'default',
  strokeWidth = 2,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'h-8 w-8',
    default: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 50 50">
        <circle
          cx="25"
          cy="25"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx="25"
          cy="25"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-blue-600 transition-all duration-300 ease-out"
        />
      </svg>
    </div>
  );
};

// Loading States for Different Content Types
export const LoadingTable = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="animate-pulse">
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-3">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div className={`h-4 bg-gray-300 dark:bg-gray-600 rounded ${
                      colIndex === 0 ? 'w-3/4' : colIndex === columns - 1 ? 'w-1/2' : 'w-full'
                    }`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const LoadingGrid = ({ items = 6, columns = 3 }) => {
  const gridClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-6 animate-pulse`}>
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export const LoadingList = ({ items = 5 }) => {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Button Loading State
export const LoadingButton = ({ 
  isLoading = false,
  children,
  className = '',
  loadingText = 'Loading...',
  ...props 
}) => {
  return (
    <button
      className={`${className} ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center">
          <LoadingSpinner size="small" color="white" className="mr-2" />
          {loadingText}
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// Wave Loading Animation
export const LoadingWave = ({ 
  color = 'primary',
  className = '' 
}) => {
  const colorClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600'
  };

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-1 h-8 ${colorClasses[color]} rounded-full animate-pulse`}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
};

// Typing Indicator
export const LoadingTyping = ({ 
  className = '' 
}) => {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '1.4s'
            }}
          />
        ))}
      </div>
      <span className="text-sm text-gray-500 ml-2">Typing...</span>
    </div>
  );
};

// Default Loading Component
const Loading = ({ 
  type = 'spinner',
  size = 'default',
  message = 'Loading...',
  className = '',
  ...props 
}) => {
  switch (type) {
    case 'dots':
      return <LoadingDots size={size} className={className} {...props} />;
    case 'pulse':
      return <LoadingPulse className={className} {...props} />;
    case 'wave':
      return <LoadingWave className={className} {...props} />;
    case 'progress':
      return <LoadingProgress message={message} className={className} {...props} />;
    case 'circular':
      return <LoadingCircular size={size} className={className} {...props} />;
    case 'typing':
      return <LoadingTyping className={className} {...props} />;
    case 'page':
      return <LoadingPage message={message} {...props} />;
    case 'spinner':
    default:
      return <LoadingSpinner size={size} className={className} {...props} />;
  }
};

export default Loading;