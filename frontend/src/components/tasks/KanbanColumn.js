// frontend/src/components/tasks/KanbanColumn.js
import React, { useState } from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';
import Button from '../common/Button';
import {
  Plus,
  MoreHorizontal,
  Settings,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';

const KanbanColumn = ({ 
  column, 
  onEditTask, 
  onDeleteTask, 
  onCreateTask 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // Droppable setup for the column
  const {
    isOver,
    setNodeRef,
  } = useDroppable({
    id: column.id,
  });

  // Column styling based on state and content
  const getColumnStyle = () => {
    let baseStyle = "flex flex-col w-80 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200";
    
    if (isOver) {
      baseStyle += " ring-2 ring-blue-500 ring-opacity-50 bg-blue-50 dark:bg-blue-900/20";
    }
    
    return baseStyle;
  };

  // Get column header color based on column type
  const getHeaderColor = () => {
    const colors = {
      todo: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
      inprogress: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
      review: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
      done: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
    };
    return colors[column.id] || colors.todo;
  };

  // Get status icon
  const getStatusIcon = () => {
    const icons = {
      todo: <AlertCircle className="h-4 w-4" />,
      inprogress: <Clock className="h-4 w-4" />,
      review: <Eye className="h-4 w-4" />,
      done: <CheckCircle className="h-4 w-4" />
    };
    return icons[column.id] || icons.todo;
  };

  // Check if column is at capacity
  const isAtCapacity = () => {
    return column.limit && column.tasks.length >= column.limit;
  };

  // Get task count display
  const getTaskCountDisplay = () => {
    if (column.limit) {
      return `${column.tasks.length}/${column.limit}`;
    }
    return column.tasks.length;
  };

  // Handle column menu actions
  const handleColumnAction = (action) => {
    setShowColumnMenu(false);
    
    switch (action) {
      case 'collapse':
        setIsCollapsed(!isCollapsed);
        break;
      case 'settings':
        // Handle column settings
        console.log('Column settings for:', column.id);
        break;
      case 'clear':
        // Handle clearing completed tasks (for done column)
        console.log('Clear completed tasks');
        break;
      default:
        break;
    }
  };

  // Get assignee avatars for tasks in this column
  const getColumnAssignees = () => {
    const assignees = new Map();
    
    column.tasks.forEach(task => {
      if (task.assignee) {
        assignees.set(task.assignee._id, task.assignee);
      }
    });
    
    return Array.from(assignees.values()).slice(0, 3); // Show max 3 avatars
  };

  const columnAssignees = getColumnAssignees();

  return (
    <div className={getColumnStyle()}>
      {/* Column Header */}
      <div className={`p-4 rounded-t-lg ${getHeaderColor()} border-b border-gray-200 dark:border-gray-600`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <h3 className="font-semibold text-sm">
              {column.title}
            </h3>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              isAtCapacity() ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 
              'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}>
              {getTaskCountDisplay()}
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Column assignees */}
            {columnAssignees.length > 0 && (
              <div className="flex -space-x-1 mr-2">
                {columnAssignees.map((assignee, index) => (
                  <div
                    key={assignee._id}
                    className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden"
                    title={assignee.name}
                  >
                    {assignee.avatar ? (
                      <img 
                        src={assignee.avatar} 
                        alt={assignee.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                        {assignee.name.charAt(0)}
                      </div>
                    )}
                  </div>
                ))}
                {column.tasks.filter(t => t.assignee).length > 3 && (
                  <div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                    +{column.tasks.filter(t => t.assignee).length - 3}
                  </div>
                )}
              </div>
            )}
            
            {/* Collapse/Expand Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              title={isCollapsed ? 'Expand column' : 'Collapse column'}
            >
              {isCollapsed ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            
            {/* Column Menu */}
            <div className="relative">
              <button
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                title="Column options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              
              {showColumnMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  <button
                    onClick={() => handleColumnAction('settings')}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Column Settings
                  </button>
                  
                  {column.id === 'done' && column.tasks.length > 0 && (
                    <button
                      onClick={() => handleColumnAction('clear')}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Clear Completed
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Capacity Warning */}
        {isAtCapacity() && (
          <div className="mt-2 flex items-center text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="h-3 w-3 mr-1" />
            Column at capacity
          </div>
        )}
      </div>

      {/* Column Content */}
      {!isCollapsed && (
        <>
          {/* Tasks List */}
          <div
            ref={setNodeRef}
            className="flex-1 p-4 min-h-32 overflow-y-auto custom-scrollbar"
          >
            <SortableContext
              items={column.tasks.map(task => task._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {column.tasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={() => onEditTask(task)}
                    onDelete={() => onDeleteTask(task._id)}
                  />
                ))}
              </div>
            </SortableContext>
            
            {/* Empty State */}
            {column.tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                  {getStatusIcon()}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  No tasks in {column.title.toLowerCase()}
                </p>
                {column.id === 'todo' && (
                  <Button
                    onClick={onCreateTask}
                    variant="outline"
                    size="small"
                    leftIcon={<Plus className="h-3 w-3" />}
                  >
                    Add First Task
                  </Button>
                )}
              </div>
            )}
            
            {/* Drop Zone Indicator */}
            {isOver && column.tasks.length > 0 && (
              <div className="mt-3 p-3 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-sm text-blue-600 dark:text-blue-400 text-center">
                  Drop task here
                </p>
              </div>
            )}
          </div>

          {/* Add Task Button */}
          {column.id === 'todo' && !isAtCapacity() && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={onCreateTask}
                variant="ghost"
                fullWidth
                leftIcon={<Plus className="h-4 w-4" />}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Add Task
              </Button>
            </div>
          )}
        </>
      )}
      
      {/* Collapsed State */}
      {isCollapsed && (
        <div className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400 dark:text-gray-500 mb-1">
              {column.tasks.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {column.tasks.length === 1 ? 'task' : 'tasks'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanColumn;