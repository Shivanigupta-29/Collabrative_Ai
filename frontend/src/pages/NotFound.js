// frontend/src/pages/NotFound.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, ArrowLeft, Search, HelpCircle, MessageCircle } from 'lucide-react';

const NotFound = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            <div className="text-9xl font-bold text-gray-200 select-none">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Search className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className="text-gray-500">
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
          <button
            onClick={handleGoBack}
            className="btn-outline flex items-center px-6 py-3"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </button>
          
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="btn-primary flex items-center px-6 py-3"
          >
            <Home className="h-5 w-5 mr-2" />
            {isAuthenticated ? "Go to Dashboard" : "Go Home"}
          </Link>
        </div>

        {/* Quick Links */}
        {isAuthenticated && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Maybe you're looking for:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                to="/dashboard"
                className="card hover:shadow-md transition-shadow"
              >
                <div className="card-body text-center py-6">
                  <Home className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Dashboard</h4>
                  <p className="text-sm text-gray-600">Your main workspace</p>
                </div>
              </Link>
              
              <Link
                to="/projects"
                className="card hover:shadow-md transition-shadow"
              >
                <div className="card-body text-center py-6">
                  <Search className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Projects</h4>
                  <p className="text-sm text-gray-600">Browse all projects</p>
                </div>
              </Link>
              
              <Link
                to="/profile"
                className="card hover:shadow-md transition-shadow"
              >
                <div className="card-body text-center py-6">
                  <HelpCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Profile</h4>
                  <p className="text-sm text-gray-600">Manage your account</p>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Search Suggestion */}
        <div className="card max-w-md mx-auto">
          <div className="card-body">
            <h4 className="font-medium text-gray-900 mb-3">
              Can't find what you're looking for?
            </h4>
            <div className="flex space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search for pages, projects, or documents..."
                  className="input w-full"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      // Redirect to search with query
                      navigate(`/search?q=${encodeURIComponent(e.target.value)}`);
                    }
                  }}
                />
              </div>
              <button className="btn-primary">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 mb-4">
            Still having trouble? We're here to help.
          </p>
          <div className="flex items-center justify-center space-x-6">
            <Link
              to="/help"
              className="text-blue-600 hover:text-blue-500 font-medium flex items-center"
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              Help Center
            </Link>
            <Link
              to="/contact"
              className="text-blue-600 hover:text-blue-500 font-medium flex items-center"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Contact Support
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            © 2024 CollabAI. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default NotFound;