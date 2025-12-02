// frontend/src/components/dashboard/ProjectCard.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Users,
  Clock,
  MessageCircle,
  MoreHorizontal,
  Star,
  StarOff,
  Edit,
  Archive,
  Trash2,
  ExternalLink,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  Settings,
  TrendingUp,
  FileText,
  Target,
  Zap
} from 'lucide-react';
import { formatDistanceToNow, format, isAfter, isBefore } from 'date-fns';
import toast from 'react-hot-toast';

const ProjectCard = ({ 
  project, 
  viewMode = 'grid', 
  isSelected = false,
  onSelect,
  onDelete,
  onArchive,
  onFavorite 
}) => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Get project status configuration
  const getStatusConfig = () => {
    const configs = {
      active: {
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-100 dark:bg-green-900/30',
        dot: 'bg-green-500',
        label: 'Active'
      },
      completed: {
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        dot: 'bg-blue-500',
        label: 'Completed'
      },
      on_hold: {
        color: 'text-yellow-600 dark:text-yellow-400',
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        dot: 'bg-yellow-500',
        label: 'On Hold'
      },
      archived: {
        color: 'text-gray-600 dark:text-gray-400',
        bg: 'bg-gray-100 dark:bg-gray-700',
        dot: 'bg-gray-500',
        label: 'Archived'
      }
    };
    return configs[project.status] || configs.active;
  };

  // Get priority configuration
  const getPriorityConfig = () => {
    const configs = {
      low: { color: 'text-gray-500', bg: 'bg-gray-100' },
      medium: { color: 'text-blue-500', bg: 'bg-blue-100' },
      high: { color: 'text-orange-500', bg: 'bg-orange-100' },
      urgent: { color: 'text-red-500', bg: 'bg-red-100' }
    };
    return configs[project.priority] || configs.medium;
  };

  // Calculate project progress
  const getProgress = () => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completed = project.tasks.filter(task => task.status === 'done').length;
    return Math.round((completed / project.tasks.length) * 100);
  };

  // Get due date status
  const getDueDateStatus = () => {
    if (!project.dueDate) return null;
    
    const dueDate = new Date(project.dueDate);
    const now = new Date();
    const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: 'overdue', color: 'text-red-600', days: Math.abs(diffDays) };
    } else if (diffDays <= 7) {
      return { status: 'soon', color: 'text-orange-600', days: diffDays };
    }
    return { status: 'normal', color: 'text-gray-600', days: diffDays };
  };

  // Get user role in project
  const getUserRole = () => {
    if (project.createdBy === user._id) return 'owner';
    const member = project.members?.find(m => 
      (m.user._id || m.user) === user._id
    );
    return member?.role || 'viewer';
  };

  // Handle menu actions
  const handleMenuAction = (action, e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    
    switch (action) {
      case 'favorite':
        onFavorite && onFavorite(project._id, !project.isFavorite);
        toast.success(project.isFavorite ? 'Removed from favorites' : 'Added to favorites');
        break;
      case 'archive':
        onArchive && onArchive(project._id);
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this project?')) {
          onDelete && onDelete(project._id);
        }
        break;
      default:
        break;
    }
  };

  const statusConfig = getStatusConfig();
  const priorityConfig = getPriorityConfig();
  const progress = getProgress();
  const dueDateStatus = getDueDateStatus();
  const userRole = getUserRole();

  // Grid view
  if (viewMode === 'grid') {
    return (
      <div 
        className={`group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-200 ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Selection checkbox */}
        {onSelect && (
          <div className="absolute top-3 left-3 z-10">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(project._id)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Favorite star */}
        <div className="absolute top-3 right-12 z-10">
          <button
            onClick={(e) => handleMenuAction('favorite', e)}
            className={`opacity-0 group-hover:opacity-100 transition-opacity ${
              project.isFavorite ? 'opacity-100 text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
            }`}
          >
            {project.isFavorite ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
          </button>
        </div>

        {/* Menu */}
        <div className="absolute top-3 right-3 z-10">
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <button
                  onClick={(e) => handleMenuAction('favorite', e)}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {project.isFavorite ? <StarOff className="h-3 w-3 mr-2" /> : <Star className="h-3 w-3 mr-2" />}
                  {project.isFavorite ? 'Unfavorite' : 'Favorite'}
                </button>
                
                {userRole === 'owner' && (
                  <>
                    <button
                      onClick={(e) => handleMenuAction('archive', e)}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Archive className="h-3 w-3 mr-2" />
                      Archive
                    </button>
                    
                    <button
                      onClick={(e) => handleMenuAction('delete', e)}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <Link 
          to={`/workspace/${project._id}`}
          className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 pr-16">
                {project.name}
              </h3>
            </div>
            
            {project.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>

          {/* Status and Priority */}
          <div className="flex items-center space-x-2 mb-4">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
              <span className={`w-2 h-2 rounded-full mr-1 ${statusConfig.dot}`} />
              {statusConfig.label}
            </span>
            
            {project.priority && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.bg} ${priorityConfig.color}`}>
                {project.priority}
              </span>
            )}
          </div>

          {/* Progress */}
          {project.tasks && project.tasks.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="text-gray-900 dark:text-white font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>{project.tasks.filter(t => t.status === 'done').length} completed</span>
                <span>{project.tasks.length} total tasks</span>
              </div>
            </div>
          )}

          {/* Team Members */}
          {project.members && project.members.length > 0 && (
            <div className="flex items-center mb-4">
              <Users className="h-4 w-4 text-gray-400 mr-2" />
              <div className="flex -space-x-2">
                {project.members.slice(0, 4).map((member, index) => (
                  <div
                    key={member.user._id || member.user || index}
                    className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden"
                    title={member.user.name || 'Team member'}
                  >
                    {member.user.avatar ? (
                      <img
                        src={member.user.avatar}
                        alt={member.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                        {member.user.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                ))}
                {project.members.length > 4 && (
                  <div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      +{project.members.length - 4}
                    </span>
                  </div>
                )}
              </div>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                {project.members.length} member{project.members.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              {/* Due date */}
              {dueDateStatus && (
                <div className={`flex items-center ${dueDateStatus.color}`}>
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>
                    {dueDateStatus.status === 'overdue' 
                      ? `${dueDateStatus.days} days overdue`
                      : dueDateStatus.status === 'soon'
                        ? `Due in ${dueDateStatus.days} days`
                        : format(new Date(project.dueDate), 'MMM dd')
                    }
                  </span>
                </div>
              )}

              {/* Last activity */}
              {project.updatedAt && (
                <div className="flex items-center">
                  <Activity className="h-3 w-3 mr-1" />
                  <span>{formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className={`flex items-center space-x-2 transition-opacity ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Open project in new tab
                  window.open(`/workspace/${project._id}`, '_blank');
                }}
                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                title="Open in new tab"
              >
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // List view
  return (
    <div className={`group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 ${
      isSelected ? 'ring-2 ring-blue-500' : ''
    }`}>
      <Link 
        to={`/workspace/${project._id}`}
        className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Selection checkbox */}
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(project._id)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {/* Project info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {project.name}
                </h3>
                
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                  <span className={`w-2 h-2 rounded-full mr-1 ${statusConfig.dot}`} />
                  {statusConfig.label}
                </span>

                {project.isFavorite && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
              </div>
              
              {project.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {/* Center - Progress and stats */}
          <div className="hidden md:flex items-center space-x-8 mx-8">
            {/* Progress */}
            <div className="flex items-center space-x-2">
              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {progress}%
              </span>
            </div>

            {/* Tasks count */}
            {project.tasks && project.tasks.length > 0 && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                <span>{project.tasks.filter(t => t.status === 'done').length}/{project.tasks.length}</span>
              </div>
            )}

            {/* Team size */}
            {project.members && project.members.length > 0 && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Users className="h-4 w-4 mr-1" />
                <span>{project.members.length}</span>
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Due date */}
            {dueDateStatus && (
              <div className={`flex items-center text-sm ${dueDateStatus.color}`}>
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {dueDateStatus.status === 'overdue' 
                    ? `${dueDateStatus.days}d overdue`
                    : dueDateStatus.status === 'soon'
                      ? `${dueDateStatus.days}d left`
                      : format(new Date(project.dueDate), 'MMM dd')
                  }
                </span>
              </div>
            )}

            {/* Last activity */}
            <div className="hidden lg:flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Activity className="h-4 w-4 mr-1" />
              <span>{formatDistanceToNow(new Date(project.updatedAt || project.createdAt), { addSuffix: true })}</span>
            </div>

            {/* Actions menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  <button
                    onClick={(e) => handleMenuAction('favorite', e)}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {project.isFavorite ? <StarOff className="h-3 w-3 mr-2" /> : <Star className="h-3 w-3 mr-2" />}
                    {project.isFavorite ? 'Unfavorite' : 'Favorite'}
                  </button>
                  
                  {userRole === 'owner' && (
                    <>
                      <button
                        onClick={(e) => handleMenuAction('archive', e)}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Archive className="h-3 w-3 mr-2" />
                        Archive
                      </button>
                      
                      <button
                        onClick={(e) => handleMenuAction('delete', e)}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProjectCard;