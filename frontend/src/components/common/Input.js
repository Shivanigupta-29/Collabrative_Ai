// frontend/src/components/common/Input.js
import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle, Search, X } from 'lucide-react';

// Base Input Component
const Input = forwardRef(({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  helperText,
  required = false,
  disabled = false,
  readOnly = false,
  size = 'default', // 'small', 'default', 'large'
  variant = 'default', // 'default', 'filled', 'outlined'
  leftIcon = null,
  rightIcon = null,
  className = '',
  labelClassName = '',
  inputClassName = '',
  id,
  name,
  autoComplete,
  autoFocus = false,
  maxLength,
  minLength,
  pattern,
  step,
  min,
  max,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // Generate ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  // Size classes
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    default: 'px-3 py-2 text-sm',
    large: 'px-4 py-3 text-base'
  };

  // Variant classes
  const variantClasses = {
    default: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
    filled: 'border-0 bg-gray-100 dark:bg-gray-700',
    outlined: 'border-2 border-gray-300 dark:border-gray-600 bg-transparent'
  };

  // State classes
  const stateClasses = error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600' 
    : isFocused
    ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20'
    : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20';

  // Base input classes
  const baseClasses = `
    block w-full rounded-lg transition-all duration-200 
    text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400
    focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${stateClasses}
    ${leftIcon ? 'pl-10' : ''}
    ${rightIcon ? 'pr-10' : ''}
    ${inputClassName}
  `.trim().replace(/\s+/g, ' ');

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur && onBlur(e);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 dark:text-gray-500">
              {leftIcon}
            </span>
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          type={type}
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          step={step}
          min={min}
          max={max}
          className={baseClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400 dark:text-gray-500">
              {rightIcon}
            </span>
          </div>
        )}

        {/* Error Icon */}
        {error && !rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Password Input Component
export const PasswordInput = forwardRef((props, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Input
      ref={ref}
      type={showPassword ? 'text' : 'password'}
      rightIcon={
        <button
          type="button"
          onClick={togglePassword}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 pointer-events-auto"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      }
      {...props}
    />
  );
});

PasswordInput.displayName = 'PasswordInput';

// Search Input Component
export const SearchInput = forwardRef(({
  onClear,
  clearable = true,
  ...props
}, ref) => {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (props.onChange) {
      props.onChange({ target: { value: '' } });
    }
  };

  const rightIcon = props.value && clearable ? (
    <button
      type="button"
      onClick={handleClear}
      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 pointer-events-auto"
    >
      <X className="h-4 w-4" />
    </button>
  ) : null;

  return (
    <Input
      ref={ref}
      type="search"
      leftIcon={<Search className="h-5 w-5" />}
      rightIcon={rightIcon}
      {...props}
    />
  );
});

SearchInput.displayName = 'SearchInput';

// Textarea Component
export const Textarea = forwardRef(({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  helperText,
  required = false,
  disabled = false,
  readOnly = false,
  rows = 3,
  maxRows = 10,
  autoResize = false,
  className = '',
  labelClassName = '',
  textareaClassName = '',
  id,
  name,
  maxLength,
  minLength,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  // Auto resize functionality
  const handleChange = (e) => {
    if (autoResize) {
      const textarea = e.target;
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, maxRows * 24);
      textarea.style.height = newHeight + 'px';
    }
    onChange && onChange(e);
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur && onBlur(e);
  };

  const baseClasses = `
    block w-full px-3 py-2 text-sm rounded-lg border transition-all duration-200
    text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400
    bg-white dark:bg-gray-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
    resize-none
    ${error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600' 
      : isFocused
        ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20'
        : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
    }
    ${textareaClassName}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={textareaId}
          className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Textarea */}
      <textarea
        ref={ref}
        id={textareaId}
        name={name}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        rows={rows}
        maxLength={maxLength}
        minLength={minLength}
        className={baseClasses}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
        {...props}
      />

      {/* Character count */}
      {maxLength && (
        <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{helperText}</span>
          <span>{(value?.length || 0)}/{maxLength}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p id={`${textareaId}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && !maxLength && (
        <p id={`${textareaId}-helper`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

// Select Component
export const Select = forwardRef(({
  label,
  options = [],
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  helperText,
  required = false,
  disabled = false,
  placeholder = 'Select an option',
  className = '',
  labelClassName = '',
  selectClassName = '',
  id,
  name,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  const baseClasses = `
    block w-full px-3 py-2 text-sm rounded-lg border transition-all duration-200
    text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800
    focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
    ${error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600' 
      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
    }
    ${selectClassName}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={selectId}
          className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select */}
      <select
        ref={ref}
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        required={required}
        disabled={disabled}
        className={baseClasses}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option, index) => (
          <option key={index} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>

      {/* Error Message */}
      {error && (
        <p id={`${selectId}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p id={`${selectId}-helper`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

// Checkbox Component
export const Checkbox = forwardRef(({
  label,
  description,
  checked,
  onChange,
  error,
  required = false,
  disabled = false,
  size = 'default', // 'small', 'default', 'large'
  className = '',
  labelClassName = '',
  id,
  name,
  value,
  ...props
}, ref) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-5 w-5',
    large: 'h-6 w-6'
  };

  return (
    <div className={`relative flex items-start ${className}`}>
      <div className="flex items-center h-5">
        <input
          ref={ref}
          id={checkboxId}
          name={name}
          type="checkbox"
          value={value}
          checked={checked}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`
            ${sizeClasses[size]} text-blue-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600
            rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-300 dark:border-red-600' : ''}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${checkboxId}-error` : undefined}
          {...props}
        />
      </div>
      
      {label && (
        <div className="ml-3 text-sm">
          <label 
            htmlFor={checkboxId}
            className={`font-medium text-gray-700 dark:text-gray-300 ${labelClassName} ${disabled ? 'opacity-50' : ''}`}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {description && (
            <p className="text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <p id={`${checkboxId}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

// Radio Component
export const Radio = forwardRef(({
  label,
  description,
  checked,
  onChange,
  error,
  required = false,
  disabled = false,
  size = 'default',
  className = '',
  labelClassName = '',
  id,
  name,
  value,
  ...props
}, ref) => {
  const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-5 w-5',
    large: 'h-6 w-6'
  };

  return (
    <div className={`relative flex items-start ${className}`}>
      <div className="flex items-center h-5">
        <input
          ref={ref}
          id={radioId}
          name={name}
          type="radio"
          value={value}
          checked={checked}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`
            ${sizeClasses[size]} text-blue-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600
            focus:ring-blue-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-300 dark:border-red-600' : ''}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${radioId}-error` : undefined}
          {...props}
        />
      </div>
      
      {label && (
        <div className="ml-3 text-sm">
          <label 
            htmlFor={radioId}
            className={`font-medium text-gray-700 dark:text-gray-300 ${labelClassName} ${disabled ? 'opacity-50' : ''}`}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {description && (
            <p className="text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <p id={`${radioId}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});

Radio.displayName = 'Radio';

// File Input Component
export const FileInput = forwardRef(({
  label,
  accept,
  multiple = false,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  labelClassName = '',
  id,
  name,
  ...props
}, ref) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  
  const inputId = id || `file-${Math.random().toString(36).substr(2, 9)}`;

  const handleFiles = (fileList) => {
    const filesArray = Array.from(fileList);
    setFiles(filesArray);
    if (onChange) {
      onChange({ target: { files: fileList, value: filesArray } });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors
          ${dragActive 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : error
              ? 'border-red-300 dark:border-red-600'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && document.getElementById(inputId)?.click()}
      >
        <input
          ref={ref}
          id={inputId}
          name={name}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
          {...props}
        />
        
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="mt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-blue-600 dark:text-blue-400">
                Click to upload
              </span>
              {' '}or drag and drop
            </p>
            {accept && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {accept.split(',').map(type => type.trim().toUpperCase()).join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="mt-2 space-y-1">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span className="truncate">{file.name}</span>
              <span className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

FileInput.displayName = 'FileInput';

export default Input;