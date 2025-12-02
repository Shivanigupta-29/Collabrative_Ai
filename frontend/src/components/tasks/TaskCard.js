// frontend/src/components/tasks/TaskCard.js
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Calendar,
  MessageCircle,
  Paperclip,
  MoreHorizontal,
  Edit,
  Trash2,
  User,
  Flag,
  Clock,
  CheckSquare,
  Eye,
  ExternalLink,
  AlertTriangle,
  Timer,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { formatDistanceToNow, isAfter, isBefore, startOfDay, format } from 'date-fns';
import toast from 'react-hot-toast';

const TaskCard = ({ 
  task, 
  isDragging = false, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(task.isTimerActive || false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Priority colors and icons
  const getPriorityConfig = () => {
    const configs = {
      low: {
        color: 'text-gray-500 dark:text-gray-400',
        bg: 'bg-gray-100 dark:bg-gray-700',
        border: 'border-gray-200 dark:border-gray-600',
        flag: 'text-gray-400'
      },
      medium: {
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        border: 'border-blue-200 dark:border-blue-800',
        flag: 'text-blue-500'
      },
      high: {
        color: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        border: 'border-orange-200 dark:border-orange-800',
        flag: 'text-orange-500'
      },
      urgent: {
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-100 dark:bg-red-900/30',
        border: 'border-red-200 dark:border-red-800',
        flag: 'text-red-500'
      }
    };
    return configs[task.priority] || configs.medium;
  };

  // Due date status
  const getDueDateStatus = () => {
    if (!task.dueDate) return null;
    
    const dueDate = new Date(task.dueDate);
    const today = startOfDay(new Date());
    const due = startOfDay(dueDate);
    
    if (isBefore(due, today)) {
      return {
        status: 'overdue',
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'Overdue'
      };
    } else if (due.getTime() === today.getTime()) {
      return {
        status: 'today',
        color: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        text: 'Due today'
      };
    } else {
      return {
        status: 'upcoming',
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: format(dueDate, 'MMM dd')
      };
    }
  };

  // Calculate completion percentage for subtasks
  const getCompletionPercentage = () => {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    
    const completed = task.subtasks.filter(subtask => subtask.completed).length;
    return Math.round((completed / task.subtasks.length) * 100);
  };

  // Handle timer toggle
  const handleTimerToggle = async (e) => {
    e.stopPropagation();
    
    try {
      setIsTimerRunning(!isTimerRunning);
      // Here you would call the API to start/stop timer
      // await taskService.toggleTimer(task._id);
      
      toast.success(isTimerRunning ? 'Timer stopped' : 'Timer started');
    } catch (error) {
      setIsTimerRunning(isTimerRunning); // Revert on error
      toast.error('Failed to toggle timer');
    }
  };

  // Handle menu actions
  const handleMenuAction = (action, e) => {
    e.stopPropagation();
    setShowMenu(false);
    
    switch (action) {
      case 'edit':
        onEdit && onEdit(task);
        break;
      case 'view':
        onView && onView(task);
        break;
      case 'delete':
        onDelete && onDelete(task._id);
        break;
      default:
        break;
    }
  };

  const priorityConfig = getPriorityConfig();
  const dueDateStatus = getDueDateStatus();
  const completionPercentage = getCompletionPercentage();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
        isDragging || isSortableDragging ? 'opacity-50 rotate-2 shadow-lg' : ''
      } ${task.blocked ? 'border-red-300 dark:border-red-600' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-2 flex-1 min-w-0">
          {/* Priority Flag */}
          <Flag className={`h-4 w-4 mt-0.5 flex-shrink-0 ${priorityConfig.flag}`} />
          
          {/* Title and Description */}
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium text-gray-900 dark:text-white line-clamp-2 ${
              task.status === 'done' ? 'line-through text-gray-500 dark:text-gray-400' : ''
            }`}>
              {task.title}
            </h4>
            
            {task.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              <button
                onClick={(e) => handleMenuAction('view', e)}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Eye className="h-3 w-3 mr-2" />
                View
              </button>
              <button
                onClick={(e) => handleMenuAction('edit', e)}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Edit className="h-3 w-3 mr-2" />
                Edit
              </button>
              <button
                onClick={(e) => handleMenuAction('delete', e)}
                className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-full">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Subtasks Progress */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <div className="flex items-center">
              <CheckSquare className="h-3 w-3 mr-1" />
              <span>Subtasks</span>
            </div>
            <span>{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                completionPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Blocked Warning */}
      {task.blocked && (
        <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex items-center text-xs text-red-700 dark:text-red-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            <span className="font-medium">Blocked</span>
          </div>
          {task.blockedReason && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1 truncate">
              {task.blockedReason}
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
        {/* Left side - Assignee and attachments */}
        <div className="flex items-center space-x-3">
          {/* Assignee */}
          {task.assignee ? (
            <div className="flex items-center">
              {task.assignee.avatar ? (
                <img
                  src={task.assignee.avatar}
                  alt={task.assignee.name}
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {task.assignee.name?.charAt(0) || '?'}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <User className="h-3 w-3 text-gray-400" />
            </div>
          )}

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Paperclip className="h-3 w-3 mr-1" />
              <span>{task.attachments.length}</span>
            </div>
          )}

          {/* Comments */}
          {task.commentsCount > 0 && (
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <MessageCircle className="h-3 w-3 mr-1" />
              <span>{task.commentsCount}</span>
            </div>
          )}
        </div>

        {/* Right side - Time and due date */}
        <div className="flex items-center space-x-3">
          {/* Timer */}
          {task.estimatedHours && (
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <button
                onClick={handleTimerToggle}
                className={`p-1 rounded transition-colors ${
                  isTimerRunning 
                    ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30' 
                    : 'hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                title={isTimerRunning ? 'Stop timer' : 'Start timer'}
              >
                {isTimerRunning ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
              </button>
              <span className="text-xs">
                {task.timeSpent || 0}h / {task.estimatedHours}h
              </span>
            </div>
          )}

          {/* Due Date */}
          {dueDateStatus && (
            <div className={`flex items-center px-2 py-1 rounded-full ${dueDateStatus.bg}`}>
              <Calendar className={`h-3 w-3 mr-1 ${dueDateStatus.color}`} />
              <span className={`font-medium ${dueDateStatus.color}`}>
                {dueDateStatus.text}
              </span>
            </div>
          )}

          {/* Created time for tasks without due date */}
          {!dueDateStatus && task.createdAt && (
            <div className="text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3 inline mr-1" />
              <span>{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;