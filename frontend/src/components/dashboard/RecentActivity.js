// frontend/src/components/dashboard/RecentActivity.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { useSocket } from '../../context/SocketContext';
import Button from '../common/Button';
import Loading from '../common/Loading';
import {
  User,
  CheckCircle,
  Plus,
  MessageCircle,
  FileText,
  Users,
  Clock,
  Edit,
  Trash2,
  Archive,
  Star,
  Lightbulb,
  Target,
  Calendar,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Filter,
  Eye,
  Activity
} from 'lucide-react';
import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';

const RecentActivity = () => {
  const { user } = useAuth();
  const { projects } = useProject();
  const { on, off } = useSocket();
  
  // State
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'mine', 'team', 'projects'
  const [showFilters, setShowFilters] = useState(false);

  // Activity types configuration
  const activityTypes = {
    project_created: {
      icon: Plus,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      label: 'created project'
    },
    project_updated: {
      icon: Edit,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      label: 'updated project'
    },
    project_archived: {
      icon: Archive,
      color: 'text-gray-600 dark:text-gray-400',
      bg: 'bg-gray-100 dark:bg-gray-700',
      label: 'archived project'
    },
    task_created: {
      icon: Target,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
      label: 'created task'
    },
    task_completed: {
      icon: CheckCircle,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      label: 'completed task'
    },
    task_updated: {
      icon: Edit,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      label: 'updated task'
    },
    comment_added: {
      icon: MessageCircle,
      color: 'text-pink-600 dark:text-pink-400',
      bg: 'bg-pink-100 dark:bg-pink-900/30',
      label: 'commented on'
    },
    member_added: {
      icon: Users,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-100 dark:bg-indigo-900/30',
      label: 'added member to'
    },
    document_created: {
      icon: FileText,
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-100 dark:bg-teal-900/30',
      label: 'created document'
    },
    idea_generated: {
      icon: Lightbulb,
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      label: 'generated idea'
    },
    meeting_scheduled: {
      icon: Calendar,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-100 dark:bg-violet-900/30',
      label: 'scheduled meeting'
    },
    deadline_approaching: {
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/30',
      label: 'deadline approaching for'
    }
  };

  // Load activities on component mount
  useEffect(() => {
    loadActivities();
  }, [projects]);

  // Set up real-time activity updates
  useEffect(() => {
    const handleNewActivity = (activityData) => {
      setActivities(prev => [activityData, ...prev.slice(0, 49)]); // Keep max 50 activities
    };

    // Listen for real-time activity updates
    on('activity:new', handleNewActivity);
    on('task:created', (data) => handleNewActivity({
      id: Date.now(),
      type: 'task_created',
      user: data.user,
      target: data.task.title,
      project: data.projectName,
      projectId: data.projectId,
      timestamp: new Date().toISOString()
    }));
    on('task:completed', (data) => handleNewActivity({
      id: Date.now(),
      type: 'task_completed',
      user: data.user,
      target: data.task.title,
      project: data.projectName,
      projectId: data.projectId,
      timestamp: new Date().toISOString()
    }));

    return () => {
      off('activity:new', handleNewActivity);
      off('task:created');
      off('task:completed');
    };
  }, [on, off]);

  // Generate mock activity data (replace with real API call)
  const loadActivities = () => {
    setIsLoading(true);
    
    // Mock activities based on current projects
    const mockActivities = [
      {
        id: 1,
        type: 'task_completed',
        user: {
          _id: 'user1',
          name: 'Sarah Johnson',
          avatar: '/api/placeholder/32/32'
        },
        target: 'Design homepage wireframes',
        project: 'Website Redesign',
        projectId: 'project1',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        metadata: {
          taskId: 'task1',
          priority: 'high'
        }
      },
      {
        id: 2,
        type: 'comment_added',
        user: {
          _id: 'user2',
          name: 'Mike Chen',
          avatar: '/api/placeholder/32/32'
        },
        target: 'API Integration',
        project: 'Mobile App',
        projectId: 'project2',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        metadata: {
          comment: 'Great progress on the authentication flow!'
        }
      },
      {
        id: 3,
        type: 'project_created',
        user: {
          _id: 'user3',
          name: 'Emma Wilson',
          avatar: '/api/placeholder/32/32'
        },
        target: 'Q1 Marketing Campaign',
        project: null,
        projectId: 'project3',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        metadata: {
          description: 'Launch campaign for new product line'
        }
      },
      {
        id: 4,
        type: 'member_added',
        user: {
          _id: user._id,
          name: user.name,
          avatar: user.avatar
        },
        target: 'Alex Rodriguez',
        project: 'Backend Services',
        projectId: 'project4',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        metadata: {
          role: 'developer'
        }
      },
      {
        id: 5,
        type: 'deadline_approaching',
        user: {
          _id: 'system',
          name: 'System',
          avatar: null
        },
        target: 'Q4 Financial Reports',
        project: 'Analytics Dashboard',
        projectId: 'project5',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        metadata: {
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
          priority: 'urgent'
        }
      },
      {
        id: 6,
        type: 'idea_generated',
        user: {
          _id: user._id,
          name: user.name,
          avatar: user.avatar
        },
        target: 'User onboarding improvements',
        project: 'UX Research',
        projectId: 'project6',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        metadata: {
          aiGenerated: true,
          confidence: 0.87
        }
      },
      {
        id: 7,
        type: 'document_created',
        user: {
          _id: 'user4',
          name: 'David Park',
          avatar: '/api/placeholder/32/32'
        },
        target: 'Technical Requirements',
        project: 'Mobile App',
        projectId: 'project2',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        metadata: {
          documentType: 'specification'
        }
      }
    ];

    // Simulate API delay
    setTimeout(() => {
      setActivities(mockActivities);
      setIsLoading(false);
    }, 800);
  };

  // Filter activities
  const getFilteredActivities = () => {
    return activities.filter(activity => {
      switch (filter) {
        case 'mine':
          return activity.user._id === user._id;
        case 'team':
          return activity.user._id !== user._id && activity.user._id !== 'system';
        case 'projects':
          return activity.type.includes('project');
        default:
          return true;
      }
    });
  };

  // Group activities by date
  const groupActivitiesByDate = (activities) => {
    const groups = {};
    
    activities.forEach(activity => {
      const activityDate = new Date(activity.timestamp);
      let dateKey;
      
      if (isToday(activityDate)) {
        dateKey = 'Today';
      } else if (isYesterday(activityDate)) {
        dateKey = 'Yesterday';
      } else {
        dateKey = format(activityDate, 'MMM dd, yyyy');
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
    });
    
    return groups;
  };

  // Render activity item
  const renderActivityItem = (activity) => {
    const config = activityTypes[activity.type] || activityTypes.task_updated;
    const Icon = config.icon;

    return (
      <div key={activity.id} className="flex items-start space-x-3 py-3">
        {/* User avatar */}
        <div className="flex-shrink-0">
          {activity.user.avatar ? (
            <img
              src={activity.user.avatar}
              alt={activity.user.name}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              {activity.user.name === 'System' ? (
                <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {activity.user.name?.charAt(0) || '?'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Activity content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-white">
                <span className="font-medium">{activity.user.name}</span>{' '}
                <span className="text-gray-600 dark:text-gray-400">{config.label}</span>{' '}
                <span className="font-medium text-gray-900 dark:text-white">
                  "{activity.target}"
                </span>
                {activity.project && (
                  <>
                    <span className="text-gray-600 dark:text-gray-400"> in </span>
                    <Link
                      to={`/workspace/${activity.projectId}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-500 font-medium"
                    >
                      {activity.project}
                    </Link>
                  </>
                )}
              </p>
              
              {/* Additional metadata */}
              {activity.metadata && (
                <div className="mt-1">
                  {activity.metadata.comment && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                      "{activity.metadata.comment.length > 60 
                        ? activity.metadata.comment.substring(0, 60) + '...' 
                        : activity.metadata.comment}"
                    </p>
                  )}
                  {activity.metadata.aiGenerated && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 mt-1">
                      AI Generated • {Math.round(activity.metadata.confidence * 100)}% confidence
                    </span>
                  )}
                  {activity.metadata.priority === 'urgent' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 mt-1">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Urgent
                    </span>
                  )}
                </div>
              )}
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </p>
            </div>

            {/* Activity icon */}
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${config.bg} ml-3`}>
              <Icon className={`h-3 w-3 ${config.color}`} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filteredActivities = getFilteredActivities();
  const groupedActivities = groupActivitiesByDate(filteredActivities);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Recent Activity
        </h4>
        
        <div className="flex items-center space-x-2">
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ${
              showFilters ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
            title="Filter activities"
          >
            <Filter className="h-4 w-4" />
          </button>
          
          {/* Refresh button */}
          <button
            onClick={loadActivities}
            className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Refresh activities"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {[
            { key: 'all', label: 'All Activity' },
            { key: 'mine', label: 'My Activity' },
            { key: 'team', label: 'Team Activity' },
            { key: 'projects', label: 'Projects Only' }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === filterOption.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Loading type="spinner" size="small" />
        </div>
      )}

      {/* Activity feed */}
      {!isLoading && (
        <div className="space-y-4">
          {Object.keys(groupedActivities).length > 0 ? (
            Object.entries(groupedActivities).map(([date, dateActivities]) => (
              <div key={date}>
                {/* Date header */}
                <div className="sticky top-0 bg-white dark:bg-gray-900 py-2 border-b border-gray-200 dark:border-gray-700">
                  <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {date}
                  </h5>
                </div>
                
                {/* Activities for this date */}
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {dateActivities.map(renderActivityItem)}
                </div>
              </div>
            ))
          ) : (
            /* Empty state */
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <Activity className="h-6 w-6 text-gray-400" />
              </div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                No recent activity
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {filter === 'all' 
                  ? 'Activity will appear here as your team collaborates'
                  : `No ${filter} activity found`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* View more */}
      {!isLoading && filteredActivities.length > 0 && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            size="small"
            fullWidth
            rightIcon={<ExternalLink className="h-3 w-3" />}
            onClick={() => window.location.href = '/activity'}
          >
            View All Activity
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;