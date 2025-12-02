// frontend/src/components/common/Header.js
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import {
  Menu,
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  Monitor,
  ChevronDown,
  Wifi,
  WifiOff,
  Plus,
  HelpCircle,
  Bookmark,
  Archive,
  Command
} from 'lucide-react';
import toast from 'react-hot-toast';

const Header = ({ onMenuClick, title = '', user, showSearch = true, actions = [] }) => {
  const { logout } = useAuth();
  const { currentTheme, changeTheme, isDark } = useTheme();
  const { isConnected, reconnect } = useSocket();
  const navigate = useNavigate();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New task assigned',
      message: 'Sarah assigned you a task in Website Redesign',
      time: '2 min ago',
      read: false,
      type: 'task'
    },
    {
      id: 2,
      title: 'Project updated',
      message: 'Mobile App Project timeline has been updated',
      time: '1 hour ago',
      read: false,
      type: 'project'
    },
    {
      id: 3,
      title: 'New comment',
      message: 'Mike commented on your document',
      time: '3 hours ago',
      read: true,
      type: 'comment'
    }
  ]);

  // Refs for dropdowns
  const userMenuRef = useRef(null);
  const themeMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const quickActionsRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
        setShowThemeMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target)) {
        setShowQuickActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Cmd/Ctrl + K for search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        document.getElementById('global-search')?.focus();
      }
      
      // Escape to close dropdowns
      if (event.key === 'Escape') {
        setShowUserMenu(false);
        setShowThemeMenu(false);
        setShowNotifications(false);
        setShowQuickActions(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle search
  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout');
    }
  };

  // Mark notification as read
  const markNotificationRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Get unread notification count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Theme icons
  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor
  };

  const ThemeIcon = themeIcons[currentTheme] || Monitor;

  // Quick actions
  const quickActions = [
    { label: 'New Project', icon: Plus, action: () => navigate('/projects/new') },
    { label: 'Help Center', icon: HelpCircle, action: () => navigate('/help') },
    { label: 'Bookmarks', icon: Bookmark, action: () => navigate('/bookmarks') },
    { label: 'Archive', icon: Archive, action: () => navigate('/archive') },
  ];

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center">
            {/* Menu Button */}
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo & Title */}
            <div className="flex items-center ml-4 lg:ml-0">
              <Link to="/dashboard" className="flex items-center">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <div className="h-4 w-4 bg-white rounded-sm"></div>
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                  CollabAI
                </span>
              </Link>
              
              {title && (
                <>
                  <div className="hidden lg:block mx-4 h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                  <h1 className="hidden lg:block text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h1>
                </>
              )}
            </div>
          </div>

          {/* Center Section - Search */}
          {showSearch && (
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="global-search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearch}
                  className="block w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search projects, tasks, documents... (⌘K)"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <div className="hidden sm:flex items-center space-x-1 text-xs text-gray-400 dark:text-gray-500">
                    <Command className="h-3 w-3" />
                    <span>K</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Custom Actions */}
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`p-2 rounded-lg transition-colors ${action.className || 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                title={action.title}
              >
                <action.icon className="h-5 w-5" />
              </button>
            ))}

            {/* Connection Status */}
            <div className="hidden md:flex items-center">
              <button
                onClick={!isConnected ? reconnect : undefined}
                className={`flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                  isConnected 
                    ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900' 
                    : 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900 cursor-pointer hover:bg-red-200 dark:hover:bg-red-800'
                }`}
                title={isConnected ? 'Connected' : 'Disconnected - Click to reconnect'}
              >
                {isConnected ? (
                  <Wifi className="h-3 w-3 mr-1" />
                ) : (
                  <WifiOff className="h-3 w-3 mr-1" />
                )}
                <span className="hidden lg:inline">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="relative" ref={quickActionsRef}>
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Quick actions"
              >
                <Plus className="h-5 w-5" />
              </button>
              
              {showQuickActions && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  {quickActions.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        item.action();
                        setShowQuickActions(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <item.icon className="h-4 w-4 mr-3" />
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Selector */}
            <div className="relative" ref={themeMenuRef}>
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Change theme"
              >
                <ThemeIcon className="h-5 w-5" />
              </button>
              
              {showThemeMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  {[
                    { key: 'light', label: 'Light', icon: Sun },
                    { key: 'dark', label: 'Dark', icon: Moon },
                    { key: 'system', label: 'System', icon: Monitor }
                  ].map((theme) => (
                    <button
                      key={theme.key}
                      onClick={() => {
                        changeTheme(theme.key);
                        setShowThemeMenu(false);
                      }}
                      className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        currentTheme === theme.key
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <theme.icon className="h-4 w-4 mr-3" />
                      {theme.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Notifications
                      </h3>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => markNotificationRead(notification.id)}
                          className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                            !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <div className="flex items-start">
                            <div className={`w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${
                              !notification.read ? 'bg-blue-500' : 'bg-transparent'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    )}
                  </div>
                  
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                      <Link
                        to="/notifications"
                        className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500"
                        onClick={() => setShowNotifications(false)}
                      >
                        View all notifications
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                title="User menu"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-full h-full p-1.5 text-gray-600 dark:text-gray-300" />
                  )}
                </div>
                <ChevronDown className="h-3 w-3 ml-1" />
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                  
                  {/* Menu Items */}
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profile
                  </Link>
                  
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </Link>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                  
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;