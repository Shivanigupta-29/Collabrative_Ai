// frontend/src/components/common/Button.js
import React from 'react';
import { LoadingSpinner } from './Loading';

const Button = ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost', 'link', 'danger', 'success', 'warning'
  size = 'default', // 'small', 'default', 'large'
  isLoading = false,
  loadingText = 'Loading...',
  disabled = false,
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  // Base button classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 border border-gray-300 shadow-sm dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500 bg-transparent',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500 bg-transparent dark:text-gray-400 dark:hover:bg-gray-800',
    link: 'text-blue-600 hover:text-blue-500 focus:ring-blue-500 bg-transparent underline-offset-4 hover:underline',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 shadow-sm'
  };

  // Size classes
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  };

  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';

  // Loading state classes
  const loadingClasses = isLoading ? 'cursor-not-allowed opacity-75' : '';

  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${widthClasses}
    ${loadingClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Handle click
  const handleClick = (event) => {
    if (!disabled && !isLoading && onClick) {
      onClick(event);
    }
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner 
            size="small" 
            color={variant === 'primary' || variant === 'danger' || variant === 'success' || variant === 'warning' ? 'white' : 'primary'} 
            className="mr-2" 
          />
          {loadingText}
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

// Specific button variants as separate components for convenience
export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const OutlineButton = (props) => <Button variant="outline" {...props} />;
export const GhostButton = (props) => <Button variant="ghost" {...props} />;
export const LinkButton = (props) => <Button variant="link" {...props} />;
export const DangerButton = (props) => <Button variant="danger" {...props} />;
export const SuccessButton = (props) => <Button variant="success" {...props} />;
export const WarningButton = (props) => <Button variant="warning" {...props} />;

// Icon Button Component
export const IconButton = ({
  icon: Icon,
  variant = 'ghost',
  size = 'default',
  className = '',
  title,
  'aria-label': ariaLabel,
  ...props
}) => {
  const iconSizes = {
    small: 'h-4 w-4',
    default: 'h-5 w-5',
    large: 'h-6 w-6'
  };

  const buttonSizes = {
    small: 'p-1.5',
    default: 'p-2',
    large: 'p-3'
  };

  return (
    <Button
      variant={variant}
      className={`${buttonSizes[size]} ${className}`}
      title={title}
      aria-label={ariaLabel || title}
      {...props}
    >
      <Icon className={iconSizes[size]} />
    </Button>
  );
};

// Button Group Component
export const ButtonGroup = ({
  children,
  className = '',
  spacing = 'default' // 'none', 'small', 'default', 'large'
}) => {
  const spacingClasses = {
    none: 'space-x-0',
    small: 'space-x-2',
    default: 'space-x-3',
    large: 'space-x-4'
  };

  return (
    <div className={`flex items-center ${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  );
};

// Toggle Button Component
export const ToggleButton = ({
  isActive = false,
  onToggle,
  activeVariant = 'primary',
  inactiveVariant = 'outline',
  children,
  ...props
}) => {
  return (
    <Button
      variant={isActive ? activeVariant : inactiveVariant}
      onClick={() => onToggle && onToggle(!isActive)}
      {...props}
    >
      {children}
    </Button>
  );
};

// Dropdown Button Component
export const DropdownButton = ({
  children,
  dropdownItems = [],
  isOpen = false,
  onToggle,
  className = '',
  ...props
}) => {
  return (
    <div className="relative inline-block text-left">
      <Button
        onClick={() => onToggle && onToggle(!isOpen)}
        className={className}
        {...props}
      >
        {children}
        <svg
          className={`ml-2 h-4 w-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {dropdownItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick && item.onClick();
                  onToggle && onToggle(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {item.icon && <item.icon className="mr-3 h-4 w-4" />}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Floating Action Button Component
export const FloatingActionButton = ({
  icon: Icon,
  position = 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
  size = 'default',
  className = '',
  ...props
}) => {
  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6'
  };

  const sizeClasses = {
    small: 'w-12 h-12',
    default: 'w-14 h-14',
    large: 'w-16 h-16'
  };

  const iconSizes = {
    small: 'h-5 w-5',
    default: 'h-6 w-6',
    large: 'h-7 w-7'
  };

  return (
    <button
      className={`
        ${positionClasses[position]}
        ${sizeClasses[size]}
        bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl 
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        flex items-center justify-center z-50
        ${className}
      `}
      {...props}
    >
      <Icon className={iconSizes[size]} />
    </button>
  );
};

// Split Button Component
export const SplitButton = ({
  children,
  onClick,
  dropdownItems = [],
  isOpen = false,
  onToggle,
  variant = 'primary',
  ...props
}) => {
  return (
    <div className="relative inline-flex">
      <Button
        variant={variant}
        onClick={onClick}
        className="rounded-r-none border-r border-white border-opacity-20"
        {...props}
      >
        {children}
      </Button>
      
      <Button
        variant={variant}
        onClick={() => onToggle && onToggle(!isOpen)}
        className="rounded-l-none px-2"
        aria-label="Open dropdown"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-max rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {dropdownItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick && item.onClick();
                  onToggle && onToggle(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {item.icon && <item.icon className="mr-3 h-4 w-4" />}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Button;