// frontend/src/components/tasks/KanbanBoard.js
import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import taskService from '../../services/taskService';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { SearchInput } from '../common/Input';
import Loading from '../common/Loading';
import {
  Plus,
  Search,
  Filter,
  SortAsc,
  Users,
  Calendar,
  Tag,
  MoreHorizontal,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

const KanbanBoard = ({ projectId }) => {
  const { user } = useAuth();
  const { emit, on, off } = useSocket();

  // State management
  const [columns, setColumns] = useState({
    todo: { id: 'todo', title: 'To Do', tasks: [], color: 'bg-gray-100', limit: null },
    inprogress: { id: 'inprogress', title: 'In Progress', tasks: [], color: 'bg-blue-100', limit: 3 },
    review: { id: 'review', title: 'Review', tasks: [], color: 'bg-yellow-100', limit: null },
    done: { id: 'done', title: 'Done', tasks: [], color: 'bg-green-100', limit: null },
  });

  const [activeTask, setActiveTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    assignee: 'all',
    priority: 'all',
    tags: [],
    dueDate: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewSettings, setViewSettings] = useState({
    showEmpty: true,
    showCompleted: true,
    groupBy: 'status', // 'status', 'assignee', 'priority'
    sortBy: 'created', // 'created', 'updated', 'priority', 'dueDate'
    sortOrder: 'desc'
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch tasks on component mount
  useEffect(() => {
    if (projectId) {
      fetchTasks();
    }
  }, [projectId]);

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!projectId) return;

    const handleTaskCreated = (data) => {
      if (data.projectId === projectId) {
        addTaskToColumn(data.task);
        toast.success(`New task: ${data.task.title}`);
      }
    };

    const handleTaskUpdated = (data) => {
      if (data.projectId === projectId) {
        updateTaskInColumns(data.task);
      }
    };

    const handleTaskDeleted = (data) => {
      if (data.projectId === projectId) {
        removeTaskFromColumns(data.taskId);
      }
    };

    const handleTaskMoved = (data) => {
      if (data.projectId === projectId && data.userId !== user._id) {
        moveTaskBetweenColumns(data.taskId, data.fromStatus, data.toStatus, data.position);
        toast.success(`${data.user.name} moved "${data.task.title}"`);
      }
    };

    // Subscribe to real-time events
    on('task:created', handleTaskCreated);
    on('task:updated', handleTaskUpdated);
    on('task:deleted', handleTaskDeleted);
    on('task:moved', handleTaskMoved);

    return () => {
      off('task:created', handleTaskCreated);
      off('task:updated', handleTaskUpdated);
      off('task:deleted', handleTaskDeleted);
      off('task:moved', handleTaskMoved);
    };
  }, [projectId, user._id, on, off]);

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await taskService.getTasks(projectId, {
        search: searchTerm,
        ...selectedFilters,
        sortBy: viewSettings.sortBy,
        sortOrder: viewSettings.sortOrder
      });
      
      // Group tasks by status
      const groupedTasks = response.tasks.reduce((acc, task) => {
        const status = task.status || 'todo';
        if (acc[status]) {
          acc[status].tasks.push(task);
        }
        return acc;
      }, {
        todo: { ...columns.todo, tasks: [] },
        inprogress: { ...columns.inprogress, tasks: [] },
        review: { ...columns.review, tasks: [] },
        done: { ...columns.done, tasks: [] },
      });

      setColumns(groupedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again.');
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  // Add task to specific column
  const addTaskToColumn = (task) => {
    const status = task.status || 'todo';
    setColumns(prev => ({
      ...prev,
      [status]: {
        ...prev[status],
        tasks: [...prev[status].tasks, task]
      }
    }));
  };

  // Update task in columns
  const updateTaskInColumns = (updatedTask) => {
    setColumns(prev => {
      const newColumns = { ...prev };
      
      // Find and update the task in any column
      Object.keys(newColumns).forEach(columnId => {
        const taskIndex = newColumns[columnId].tasks.findIndex(t => t._id === updatedTask._id);
        if (taskIndex !== -1) {
          // If task status changed, move it to the correct column
          if (updatedTask.status && updatedTask.status !== columnId) {
            // Remove from current column
            newColumns[columnId].tasks.splice(taskIndex, 1);
            // Add to new column
            if (newColumns[updatedTask.status]) {
              newColumns[updatedTask.status].tasks.push(updatedTask);
            }
          } else {
            // Update in place
            newColumns[columnId].tasks[taskIndex] = updatedTask;
          }
        }
      });
      
      return newColumns;
    });
  };

  // Remove task from columns
  const removeTaskFromColumns = (taskId) => {
    setColumns(prev => {
      const newColumns = { ...prev };
      
      Object.keys(newColumns).forEach(columnId => {
        newColumns[columnId].tasks = newColumns[columnId].tasks.filter(t => t._id !== taskId);
      });
      
      return newColumns;
    });
  };

  // Move task between columns
  const moveTaskBetweenColumns = (taskId, fromStatus, toStatus, position = null) => {
    setColumns(prev => {
      const newColumns = { ...prev };
      
      // Find the task
      const task = newColumns[fromStatus]?.tasks.find(t => t._id === taskId);
      if (!task) return prev;
      
      // Remove from source column
      newColumns[fromStatus].tasks = newColumns[fromStatus].tasks.filter(t => t._id !== taskId);
      
      // Add to destination column
      const updatedTask = { ...task, status: toStatus };
      if (position !== null) {
        newColumns[toStatus].tasks.splice(position, 0, updatedTask);
      } else {
        newColumns[toStatus].tasks.push(updatedTask);
      }
      
      return newColumns;
    });
  };

  // Handle drag start
  const handleDragStart = (event) => {
    const { active } = event;
    const task = findTaskById(active.id);
    setActiveTask(task);
  };

  // Handle drag end
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    setActiveTask(null);
    
    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;

    // Find the task being moved
    const task = findTaskById(taskId);
    if (!task) return;

    const oldStatus = task.status || 'todo';

    // Check if status actually changed
    if (oldStatus === newStatus) return;

    // Check column limits
    const targetColumn = columns[newStatus];
    if (targetColumn.limit && targetColumn.tasks.length >= targetColumn.limit) {
      toast.error(`${targetColumn.title} column is full (max ${targetColumn.limit} tasks)`);
      return;
    }

    try {
      // Optimistic update
      moveTaskBetweenColumns(taskId, oldStatus, newStatus);

      // Update backend
      await taskService.updateTask(taskId, { status: newStatus });

      // Emit real-time update
      emit('task:moved', {
        taskId,
        task,
        fromStatus: oldStatus,
        toStatus: newStatus,
        projectId,
        user,
        userId: user._id
      });

      toast.success(`Task moved to ${columns[newStatus].title}`);
    } catch (error) {
      console.error('Error moving task:', error);
      // Revert optimistic update
      moveTaskBetweenColumns(taskId, newStatus, oldStatus);
      toast.error('Failed to move task');
    }
  };

  // Find task by ID across all columns
  const findTaskById = (id) => {
    for (const column of Object.values(columns)) {
      const task = column.tasks.find(task => task._id === id);
      if (task) return task;
    }
    return null;
  };

  // Handle task update
  const handleUpdateTask = async (taskId, taskData) => {
    try {
      const updatedTask = await taskService.updateTask(taskId, taskData);
      
      updateTaskInColumns(updatedTask);
      setEditingTask(null);
      
      // Emit real-time update
      emit('task:updated', {
        task: updatedTask,
        projectId,
        user
      });

      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      
      removeTaskFromColumns(taskId);
      
      // Emit real-time update
      emit('task:deleted', {
        taskId,
        projectId,
        user
      });

      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  

  // Handle task creation
const handleCreateTask = async (taskData) => {
  try {
    const newTask = await taskService.createTask({
      ...taskData,
      projectId
    });

    addTaskToColumn(newTask);
    setShowTaskForm(false);

    // Emit real-time event
    emit('task:created', {
      task: newTask,
      projectId,
      user
    });

    toast.success('Task created successfully');
  } catch (error) {
    console.error('Error creating task:', error);
    toast.error('Failed to create task');
  }
};


  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    // Debounced search will trigger in useEffect
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (projectId) {
        fetchTasks();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedFilters, viewSettings.sortBy, viewSettings.sortOrder]);

  // Filter tasks based on current filters
  const getFilteredTasks = (tasks) => {
    return tasks.filter(task => {
      // Search filter
      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !task.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Assignee filter
      if (selectedFilters.assignee !== 'all' && 
          task.assignee?._id !== selectedFilters.assignee) {
        return false;
      }

      // Priority filter
      if (selectedFilters.priority !== 'all' && 
          task.priority !== selectedFilters.priority) {
        return false;
      }

      // Tags filter
      if (selectedFilters.tags.length > 0 && 
          !selectedFilters.tags.some(tag => task.tags?.includes(tag))) {
        return false;
      }

      // Due date filter
      if (selectedFilters.dueDate !== 'all') {
        const now = new Date();
        const taskDueDate = new Date(task.dueDate);
        
        switch (selectedFilters.dueDate) {
          case 'overdue':
            if (!task.dueDate || taskDueDate >= now) return false;
            break;
          case 'today':
            if (!task.dueDate || taskDueDate.toDateString() !== now.toDateString()) return false;
            break;
          case 'week':
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            if (!task.dueDate || taskDueDate > weekFromNow) return false;
            break;
          case 'none':
            if (task.dueDate) return false;
            break;
        }
      }

      return true;
    });
  };

  // Apply filters to all columns
  const filteredColumns = Object.keys(columns).reduce((acc, columnId) => {
    const column = columns[columnId];
    acc[columnId] = {
      ...column,
      tasks: getFilteredTasks(column.tasks)
    };
    return acc;
  }, {});

  // Get task statistics
  const getTaskStats = () => {
    const allTasks = Object.values(columns).flatMap(col => col.tasks);
    return {
      total: allTasks.length,
      completed: columns.done.tasks.length,
      inProgress: columns.inprogress.tasks.length,
      overdue: allTasks.filter(task => 
        task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
      ).length
    };
  };

  const stats = getTaskStats();

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loading type="spinner" size="large" message="Loading tasks..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Tasks
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={fetchTasks} variant="primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        {/* Top Row - Title and Actions */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Task Board
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage and track project tasks
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowTaskForm(true)}
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Task
            </Button>
            
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant={showFilters ? 'primary' : 'outline'}
              leftIcon={<Filter className="h-4 w-4" />}
            >
              Filters
            </Button>
            
            <Button
              variant="ghost"
              leftIcon={<Settings className="h-4 w-4" />}
              title="Board settings"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Overdue</div>
          </div>
        </div>

        {/* Search and Filters Row */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search tasks..."
              clearable
            />
          </div>
          
          {showFilters && (
            <div className="flex items-center space-x-4">
              <select
                value={selectedFilters.assignee}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, assignee: e.target.value }))}
                className="input"
              >
                <option value="all">All Assignees</option>
                <option value="me">Assigned to Me</option>
                <option value="unassigned">Unassigned</option>
                {/* Add more options based on project members */}
              </select>
              
              <select
                value={selectedFilters.priority}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="input"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              
              <select
                value={selectedFilters.dueDate}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, dueDate: e.target.value }))}
                className="input"
              >
                <option value="all">All Dates</option>
                <option value="overdue">Overdue</option>
                <option value="today">Due Today</option>
                <option value="week">Due This Week</option>
                <option value="none">No Due Date</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto bg-gray-50 dark:bg-gray-900">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
        >
          <div className="flex gap-6 p-6 min-h-full min-w-max">
            {Object.values(filteredColumns).map(column => (
              <KanbanColumn
                key={column.id}
                column={column}
                onEditTask={(task) => setEditingTask(task)}
                onDeleteTask={handleDeleteTask}
                onCreateTask={() => setShowTaskForm(true)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="rotate-2 opacity-95">
                <TaskCard 
                  task={activeTask} 
                  isDragging 
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task Form Modal */}
      <Modal
        isOpen={showTaskForm || !!editingTask}
        onClose={() => {
          setShowTaskForm(false);
          setEditingTask(null);
        }}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
        size="large"
      >
        <TaskForm
          task={editingTask}
          projectId={projectId}
          onSubmit={editingTask ? 
            (data) => handleUpdateTask(editingTask._id, data) : 
            handleCreateTask
          }
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default KanbanBoard;