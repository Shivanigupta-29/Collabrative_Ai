// frontend/src/components/common/Modal.js
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'default', // 'small', 'default', 'large', 'xl', 'full'
  closeOnOverlay = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  overlayClassName = '',
  preventScroll = true,
  animation = 'fade' // 'fade', 'slide', 'zoom'
}) => {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Size classes
  const sizeClasses = {
    small: 'max-w-md',
    default: 'max-w-lg',
    large: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl mx-4'
  };

  // Animation classes
  const animationClasses = {
    fade: {
      enter: 'opacity-0',
      enterActive: 'opacity-100 transition-opacity duration-300',
      exit: 'opacity-100',
      exitActive: 'opacity-0 transition-opacity duration-200'
    },
    slide: {
      enter: 'opacity-0 transform translate-y-4 sm:translate-y-0 sm:scale-95',
      enterActive: 'opacity-100 transform translate-y-0 sm:scale-100 transition-all duration-300',
      exit: 'opacity-100 transform translate-y-0 sm:scale-100',
      exitActive: 'opacity-0 transform translate-y-4 sm:translate-y-0 sm:scale-95 transition-all duration-200'
    },
    zoom: {
      enter: 'opacity-0 transform scale-95',
      enterActive: 'opacity-100 transform scale-100 transition-all duration-300',
      exit: 'opacity-100 transform scale-100',
      exitActive: 'opacity-0 transform scale-95 transition-all duration-200'
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (closeOnEscape && event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, closeOnEscape, onClose]);

  // Handle focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement;
      
      // Focus the modal
      setTimeout(() => {
        if (modalRef.current) {
          const firstFocusable = modalRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (firstFocusable) {
            firstFocusable.focus();
          } else {
            modalRef.current.focus();
          }
        }
      }, 100);

      return () => {
        // Restore focus to the previously focused element
        if (previousFocusRef.current && previousFocusRef.current.focus) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen]);

  // Handle scroll prevention
  useEffect(() => {
    if (isOpen && preventScroll) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen, preventScroll]);

  // Handle focus trap
  useEffect(() => {
    const handleTabKey = (event) => {
      if (!isOpen || event.key !== 'Tab') return;

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleTabKey);
      return () => document.removeEventListener('keydown', handleTabKey);
    }
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (event) => {
    if (closeOnOverlay && event.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-50 overflow-y-auto ${overlayClassName}`}
      onClick={handleOverlayClick}
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        />

        {/* Modal */}
        <div
          ref={modalRef}
          className={`relative inline-block w-full ${sizeClasses[size]} p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl ${animationClasses[animation].enterActive} ${className}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          tabIndex="-1"
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between mb-6">
              {title && (
                <h3
                  id="modal-title"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                >
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="modal-content">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Confirmation Modal Component
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'default', // 'default', 'danger', 'warning'
  isLoading = false,
}) => {
  const typeClasses = {
    default: 'btn-primary',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <div className="text-center">
        <div className="mt-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {message}
          </p>
        </div>
        
        <div className="mt-6 flex justify-center space-x-3">
          <button
            onClick={onClose}
            className="btn-outline"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`btn ${typeClasses[type]} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner h-4 w-4 mr-2"></div>
                Loading...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Alert Modal Component
export const AlertModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info', // 'info', 'success', 'warning', 'error'
  buttonText = 'OK'
}) => {
  const typeConfig = {
    info: {
      icon: '💡',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-800 dark:text-blue-200',
      buttonClass: 'btn-primary'
    },
    success: {
      icon: '✅',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-800 dark:text-green-200',
      buttonClass: 'bg-green-600 hover:bg-green-700 text-white'
    },
    warning: {
      icon: '⚠️',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-800 dark:text-yellow-200',
      buttonClass: 'bg-yellow-600 hover:bg-yellow-700 text-white'
    },
    error: {
      icon: '❌',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-800 dark:text-red-200',
      buttonClass: 'bg-red-600 hover:bg-red-700 text-white'
    }
  };

  const config = typeConfig[type];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <div className="text-center">
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${config.bgColor} mb-4`}>
          <span className="text-2xl">{config.icon}</span>
        </div>
        
        <div className="mt-2">
          <p className={`text-sm ${config.textColor}`}>
            {message}
          </p>
        </div>
        
        <div className="mt-6">
          <button
            onClick={onClose}
            className={`btn ${config.buttonClass}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default Modal;