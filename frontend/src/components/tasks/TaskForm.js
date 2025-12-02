// frontend/src/components/tasks/TaskForm.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import Button from '../common/Button';
import Input, { Textarea, Select, FileInput } from '../common/Input';
import {
  Calendar,
  User,
  Flag,
  Tag,
  Paperclip,
  Plus,
  X,
  Clock,
  AlertCircle,
  CheckSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

const TaskForm = ({ 
  task = null, 
  projectId, 
  onSubmit, 
  onCancel,
  isLoading = false 
}) => {
  const { user } = useAuth();
  const { currentProject } = useProject();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee: '',
    dueDate: '',
    estimatedHours: '',
    tags: [],
    subtasks: [],
    attachments: [],
    blocked: false,
    blockedReason: ''
  });

  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');
  const [newSubtask, setNewSubtask] = useState('');

  // Initialize form with task data if editing
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        assignee: task.assignee?._id || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        estimatedHours: task.estimatedHours || '',
        tags: task.tags || [],
        subtasks: task.subtasks || [],
        attachments: task.attachments || [],
        blocked: task.blocked || false,
        blockedReason: task.blockedReason || ''
      });
    }
  }, [task]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }
    
    if (formData.dueDate && new Date(formData.dueDate) < new Date().setHours(0, 0, 0, 0)) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }
    
    if (formData.estimatedHours && (isNaN(formData.estimatedHours) || formData.estimatedHours < 0)) {
      newErrors.estimatedHours = 'Please enter a valid number of hours';
    }

    if (formData.blocked && !formData.blockedReason.trim()) {
      newErrors.blockedReason = 'Please specify why this task is blocked';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Prepare submission data
    const submitData = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
      dueDate: formData.dueDate || null,
      assignee: formData.assignee || null,
      blockedReason: formData.blocked ? formData.blockedReason.trim() : null
    };
    
    onSubmit(submitData);
  };

  // Handle tag management
  const addTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Handle subtask management
  const addSubtask = () => {
    const trimmedSubtask = newSubtask.trim();
    if (trimmedSubtask) {
      setFormData(prev => ({
        ...prev,
        subtasks: [...prev.subtasks, { 
          id: Date.now().toString(),
          title: trimmedSubtask, 
          completed: false 
        }]
      }));
      setNewSubtask('');
    }
  };

  const removeSubtask = (subtaskId) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(subtask => subtask.id !== subtaskId)
    }));
  };

  const toggleSubtask = (subtaskId) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(subtask =>
        subtask.id === subtaskId 
          ? { ...subtask, completed: !subtask.completed }
          : subtask
      )
    }));
  };

  const handleSubtaskKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubtask();
    }
  };

  // Handle file attachments
  const handleFileChange = (files) => {
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...Array.from(files)]
    }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Get project members for assignee dropdown
  const projectMembers = currentProject?.members || [];
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <Input
        label="Task Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        required
        placeholder="Enter a descriptive task title"
        autoFocus
      />

      {/* Description */}
      <Textarea
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        placeholder="Provide details about what needs to be done"
        rows={3}
        maxLength={1000}
      />

      {/* Status and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={[
            { value: 'todo', label: 'To Do' },
            { value: 'inprogress', label: 'In Progress' },
            { value: 'review', label: 'Review' },
            { value: 'done', label: 'Done' }
          ]}
        />

        <Select
          label="Priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'urgent', label: 'Urgent' }
          ]}
        />
      </div>

      {/* Assignee and Due Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Assignee"
          name="assignee"
          value={formData.assignee}
          onChange={handleChange}
          placeholder="Select assignee"
          options={[
            { value: '', label: 'Unassigned' },
            ...projectMembers.map(member => ({
              value: member.user._id || member.user,
              label: member.user.name || member.user
            }))
          ]}
        />

        <Input
          type="date"
          label="Due Date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          error={errors.dueDate}
          leftIcon={<Calendar className="h-4 w-4" />}
        />
      </div>

      {/* Estimated Hours */}
      <Input
        type="number"
        label="Estimated Hours"
        name="estimatedHours"
        value={formData.estimatedHours}
        onChange={handleChange}
        error={errors.estimatedHours}
        placeholder="0"
        min="0"
        step="0.5"
        leftIcon={<Clock className="h-4 w-4" />}
        helperText="Optional: Estimate how many hours this task will take"
      />

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags
        </label>
        
        {/* Existing tags */}
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 hover:text-blue-600 dark:hover:text-blue-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        
        {/* Add new tag */}
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleTagKeyPress}
            placeholder="Add tag..."
            className="flex-1"
          />
          <Button
            type="button"
            onClick={addTag}
            variant="outline"
            disabled={!newTag.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Subtasks */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Subtasks
        </label>
        
        {/* Existing subtasks */}
        {formData.subtasks.length > 0 && (
          <div className="space-y-2 mb-3">
            {formData.subtasks.map((subtask, index) => (
              <div key={subtask.id || index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <button
                  type="button"
                  onClick={() => toggleSubtask(subtask.id)}
                  className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center ${
                    subtask.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {subtask.completed && <CheckSquare className="h-3 w-3" />}
                </button>
                <span className={`flex-1 text-sm ${
                  subtask.completed 
                    ? 'line-through text-gray-500 dark:text-gray-400' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {subtask.title}
                </span>
                <button
                  type="button"
                  onClick={() => removeSubtask(subtask.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Add new subtask */}
        <div className="flex gap-2">
          <Input
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyPress={handleSubtaskKeyPress}
            placeholder="Add subtask..."
            className="flex-1"
          />
          <Button
            type="button"
            onClick={addSubtask}
            variant="outline"
            disabled={!newSubtask.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Blocked Status */}
      <div className="space-y-3">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="blocked"
            checked={formData.blocked}
            onChange={handleChange}
            className="h-4 w-4 text-red-600 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500"
          />
          <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            This task is blocked
          </span>
        </label>
        
        {formData.blocked && (
          <Textarea
            name="blockedReason"
            value={formData.blockedReason}
            onChange={handleChange}
            error={errors.blockedReason}
            placeholder="Explain why this task is blocked and what needs to be resolved..."
            rows={2}
            leftIcon={<AlertCircle className="h-4 w-4 text-red-500" />}
          />
        )}
      </div>

      {/* Attachments */}
      <div>
        <FileInput
          label="Attachments"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.txt,.zip"
          multiple
          onChange={({ target }) => handleFileChange(target.files)}
          helperText="Upload files related to this task (PDF, DOC, images, etc.)"
        />
        
        {/* Show existing attachments */}
        {formData.attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {formData.attachments.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <Paperclip className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          loadingText={task ? 'Updating...' : 'Creating...'}
        >
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;