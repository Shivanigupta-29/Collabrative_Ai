// frontend/src/components/common/Sidebar.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import {
  Home,
  FolderOpen,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  Plus,
  ChevronRight,
  ChevronDown,
  Star,
  Clock,
  Archive,
  Search,
  X,
  Lightbulb,
  MessageCircle,
  FileText,
  Calendar,
  Bell,
  Shield,
  Zap
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { projects } = useProject();
  const location = useLocation();
  const navigate = useNavigate();

  // Local state
  const [collapsedSections, setCollapsedSections] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickCreate, setShowQuickCreate] = useState(false);

  // Filter recent/favorite projects
  const recentProjects = projects.slice(0, 5);
  const favoriteProjects = projects.filter(p => p.isFavorite).slice(0, 3);

  // Main navigation items
  const mainNavigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      current: location.pathname === '/dashboard'
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: FolderOpen,
      current: location.pathname.startsWith('/projects'),
      badge: projects.length > 0 ? projects.length : null
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: Calendar,
      current: location.pathname === '/calendar'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      current: location.pathname === '/analytics'
    },
  ];

  // Secondary navigation (role-based)
  const secondaryNavigation = [
    {
      name: 'Team',
      href: '/team',
      icon: Users,
      current: location.pathname.startsWith('/team'),
      roles: ['admin', 'project_manager']
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      current: location.pathname.startsWith('/settings')
    },
    {
      name: 'Help & Support',
      href: '/help',
      icon: HelpCircle,
      current: location.pathname === '/help'
    },
  ];

  // Quick actions
  const quickActions = [
    {
      name: 'New Project',
      icon: FolderOpen,
      action: () => navigate('/projects/new')
    },
    {
      name: 'AI Ideas',
      icon: Lightbulb,
      action: () => navigate('/ai/ideas')
    },
    {
      name: 'Quick Chat',
      icon: MessageCircle,
      action: () => navigate('/chat')
    },
    {
      name: 'New Document',
      icon: FileText,
      action: () => navigate('/documents/new')
    }
  ];

  // Toggle section collapse
  const toggleSection = (sectionName) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionName)) {
      newCollapsed.delete(sectionName);
    } else {
      newCollapsed.add(sectionName);
    }
    setCollapsedSections(newCollapsed);
  };

  // Filter projects based on search
  const filteredProjects = recentProjects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if user has required role
  const hasRole = (roles) => {
    if (!roles || roles.length === 0) return true;
    return roles.includes(user?.role);
  };

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  // Sidebar classes
  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={sidebarClasses}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <Link to="/dashboard" className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <div className="h-4 w-4 bg-white rounded-sm"></div>
              </div>
              <span className="ml-3 text-lg font-bold text-gray-900 dark:text-white">
                CollabAI
              </span>
            </Link>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* User Info */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-300">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {user?.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Create Button */}
            <div className="p-4">
              <div className="relative">
                <button
                  onClick={() => setShowQuickCreate(!showQuickCreate)}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Quick Create
                </button>
                
                {showQuickCreate && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          action.action();
                          setShowQuickCreate(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <action.icon className="h-4 w-4 mr-3" />
                        {action.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-4 pb-4">
              <div className="space-y-1">
                {mainNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      item.current
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    {item.name}
                    {item.badge && (
                      <span className="ml-auto bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              {/* Favorite Projects */}
              {favoriteProjects.length > 0 && (
                <div className="mt-8">
                  <button
                    onClick={() => toggleSection('favorites')}
                    className="flex items-center w-full px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Favorites
                    {collapsedSections.has('favorites') ? (
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-auto" />
                    )}
                  </button>
                  
                  {!collapsedSections.has('favorites') && (
                    <div className="mt-2 space-y-1">
                      {favoriteProjects.map((project) => (
                        <Link
                          key={project._id}
                          to={`/workspace/${project._id}`}
                          className="group flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <div className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 ${
                            project.status === 'active' ? 'bg-green-400' :
                            project.status === 'completed' ? 'bg-blue-400' : 'bg-gray-400'
                          }`} />
                          <span className="truncate">{project.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Recent Projects */}
              <div className="mt-8">
                <button
                  onClick={() => toggleSection('recent')}
                  className="flex items-center w-full px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Recent Projects
                  {collapsedSections.has('recent') ? (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-auto" />
                  )}
                </button>
                
                {!collapsedSections.has('recent') && (
                  <div className="mt-2">
                    {/* Project Search */}
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search projects..."
                        className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    {/* Projects List */}
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {filteredProjects.length > 0 ? (
                        filteredProjects.map((project) => (
                          <Link
                            key={project._id}
                            to={`/workspace/${project._id}`}
                            className="group flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <div className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 ${
                              project.status === 'active' ? 'bg-green-400' :
                              project.status === 'completed' ? 'bg-blue-400' : 'bg-gray-400'
                            }`} />
                            <span className="truncate">{project.name}</span>
                            {project.unreadMessages > 0 && (
                              <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                {project.unreadMessages}
                              </span>
                            )}
                          </Link>
                        ))
                      ) : searchTerm ? (
                        <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                          No projects found
                        </p>
                      ) : (
                        <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                          No recent projects
                        </p>
                      )}
                    </div>
                    
                    {/* View All Link */}
                    <Link
                      to="/projects"
                      className="block mt-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                    >
                      View all projects →
                    </Link>
                  </div>
                )}
              </div>

              {/* Secondary Navigation */}
              <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-1">
                  {secondaryNavigation.map((item) => {
                    if (!hasRole(item.roles)) return null;
                    
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          item.current
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Quick Stats
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active Projects</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {projects.filter(p => p.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tasks Today</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {/* This would come from actual data */}
                      8
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Notifications</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      3
                    </span>
                  </div>
                </div>
              </div>

              {/* Upgrade Notice (for free users) */}
              {user?.plan === 'free' && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start">
                    <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Upgrade to Pro
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Unlock advanced AI features and unlimited projects.
                      </p>
                      <Link
                        to="/upgrade"
                        className="inline-block mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
                      >
                        Learn more →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </nav>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>© 2024 CollabAI</span>
              <div className="flex items-center space-x-2">
                <Link to="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300">
                  Privacy
                </Link>
                <span>•</span>
                <Link to="/terms" className="hover:text-gray-700 dark:hover:text-gray-300">
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;