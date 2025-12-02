// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ProjectProvider } from './context/ProjectContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Workspace from './pages/Workspace';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Global Styles
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <ProjectProvider>
            <Router>
              <div className="App min-h-screen bg-gray-50">
                {/* Global Toast Notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#22c55e',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />

                {/* App Routes */}
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/projects" element={
                    <ProtectedRoute>
                      <Projects />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/workspace/:projectId" element={
                    <ProtectedRoute>
                      <Workspace />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />

                  {/* Admin Routes (Role-based protection will be added) */}
                  <Route path="/admin/*" element={
                    <ProtectedRoute requiredRole="admin">
                      <Navigate to="/dashboard" />
                    </ProtectedRoute>
                  } />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </Router>
          </ProjectProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;