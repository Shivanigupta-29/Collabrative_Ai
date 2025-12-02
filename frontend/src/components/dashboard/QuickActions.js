// frontend/src/components/dashboard/QuickActions.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import Modal from '../common/Modal';
import ProjectForm from '../projects/ProjectForm';
import {
  Plus,
  Target,
  Lightbulb,
  Users,
  Calendar,
  MessageCircle,
  FileText,
  BarChart3,
  Settings,
  Zap,
  Brain,
  Clock,
  Search,
  Archive,
  Upload,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuickActions = () => {
  const { user, hasPermission } = useAuth();
  const { createProject } = useProject();
  const navigate = useNavigate();
  
  // State
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Quick actions configuration
  const quickActions = [
    {
      id: 'new-project',
      title: 'New Project',
      description: 'Create a new collaborative project',
      icon: Target,
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      action: () => setShowProjectModal(true),
      permission: 'projects:create'
    },
    {
      id: 'ai-ideas',
      title: 'AI Ideas',
      description: 'Generate ideas with AI assistance',
      icon: Lightbulb,
      color: 'bg-purple-500 hover:bg-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      action: () => navigate('/ai/ideas'),
      permission: 'ai:access'
    },
    {
      id: 'invite-team',
      title: 'Invite Team',
      description: 'Add team members to collaborate',
      icon: Users,
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      action: () => navigate('/team/invite'),
      permission: 'team:invite'
    },
    {
      id: 'schedule-meeting',
      title: 'Schedule Meeting',
      description: 'Plan team meetings and reviews',
      icon: Calendar,
      color: 'bg-orange-500 hover:bg-orange-600',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      action: () => navigate('/calendar/new'),
      permission: 'calendar:create'
    },
    {
      id: 'quick-chat',
      title: 'Quick Chat',
      description: 'Start instant team communication',
      icon: MessageCircle,
      color: 'bg-pink-500 hover:bg-pink-600',
      textColor: 'text-pink-600',
      bgColor: 'bg-pink-100 dark:bg-pink-900/30',
      action: () => navigate('/chat'),
      permission: 'chat:access'
    },
    {
      id: 'new-document',
      title: 'New Document',
      description: 'Create collaborative documents',
      icon: FileText,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
      action: () => navigate('/documents/new'),
      permission: 'documents:create'
    },
    {
      id: 'view-analytics',
      title: 'Analytics',
      description: 'View project performance metrics',
      icon: BarChart3,
      color: 'bg-teal-500 hover:bg-teal-600',
      textColor: 'text-teal-600',
      bgColor: 'bg-teal-100 dark:bg-teal-900/30',
      action: () => navigate('/analytics'),
      permission: 'analytics:view'
    },
    {
      id: 'ai-insights',
      title: 'AI Insights',
      description: 'Get intelligent project insights',
      icon: Brain,
      color: 'bg-violet-500 hover:bg-violet-600',
      textColor: 'text-violet-600',
      bgColor: 'bg-violet-100 dark:bg-violet-900/30',
      action: () => navigate('/ai/insights'),
      permission: 'ai:insights'
    }
  ];

  // Additional actions (secondary)
  const secondaryActions = [
    {
      id: 'search',
      title: 'Global Search',
      icon: Search,
      action: () => {
        // Focus on global search if available
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
          searchInput.focus();
        } else {
          navigate('/search');
        }
      }
    },
    {
      id: 'time-tracker',
      title: 'Time Tracker',
      icon: Clock,
      action: () => navigate('/time-tracker')
    },
    {
      id: 'archive',
      title: 'Archive',
      icon: Archive,
      action: () => navigate('/archive')
    },
    {
      id: 'import',
      title: 'Import Data',
      icon: Upload,
      action: () => navigate('/import')
    },
    {
      id: 'export',
      title: 'Export Data',
      icon: Download,
      action: () => navigate('/export')
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      action: () => navigate('/settings')
    }
  ];

  // Handle project creation
  const handleCreateProject = async (projectData) => {
    try {
      setIsCreatingProject(true);
      const newProject = await createProject(projectData);
      setShowProjectModal(false);
      navigate(`/workspace/${newProject._id}`);
      toast.success('Project created successfully!');
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project');
    } finally {
      setIsCreatingProject(false);
    }
  };

  // Filter actions based on permissions
  const getAvailableActions = () => {
    return quickActions.filter(action => {
      if (!action.permission) return true;
      return hasPermission(action.permission);
    });
  };

  const availableActions = getAvailableActions();

  return (
    <>
      <div className="space-y-6">
        {/* Primary Quick Actions */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Quick Actions
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {availableActions.slice(0, 6).map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                className="flex items-center p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors text-left group"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${action.bgColor} group-hover:scale-105 transition-transform`}>
                  <action.icon className={`h-5 w-5 ${action.textColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {action.title}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {action.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Actions */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            More Actions
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {secondaryActions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                className="flex items-center p-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left group"
              >
                <action.icon className="h-4 w-4 text-gray-600 dark:text-gray-400 mr-2 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  {action.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Action */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                AI-Powered Productivity
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Let AI help you work smarter with intelligent suggestions
              </p>
            </div>
            <button
              onClick={() => navigate('/ai')}
              className="flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
            >
              <Zap className="h-3 w-3 mr-1" />
              Explore AI
            </button>
          </div>
        </div>

        {/* Recent Actions */}
        {user.recentActions && user.recentActions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Recent Actions
            </h4>
            <div className="space-y-2">
              {user.recentActions.slice(0, 3).map((action, index) => (
                <div
                  key={index}
                  className="flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center mr-2">
                    <action.icon className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {action.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {action.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start">
            <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                Pro Tip
              </h4>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Use keyboard shortcuts to access quick actions faster. Press Cmd/Ctrl + K for global search.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Creation Modal */}
      <Modal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        title="Create New Project"
        size="large"
      >
        <ProjectForm
          onSubmit={handleCreateProject}
          onCancel={() => setShowProjectModal(false)}
          isLoading={isCreatingProject}
        />
      </Modal>
    </>
  );
};

export default QuickActions;