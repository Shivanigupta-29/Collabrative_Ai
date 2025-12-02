// frontend/src/pages/Projects.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import ProjectCard from '../components/dashboard/ProjectCard';
import Modal from '../components/common/Modal';
import ProjectForm from '../components/projects/ProjectForm';
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Archive,
  Trash2,
  MoreHorizontal,
  Download,
  Upload,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

const Projects = () => {
  const { user } = useAuth();
  const { 
    projects, 
    isLoading, 
    error, 
    fetchProjects,
    createProject,
    deleteProject,
    archiveProject,
    restoreProject,
    filters,
    setFilters,
    pagination,
    setPagination
  } = useProject();
  const navigate = useNavigate();

  // Local state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'active', 'archived', 'completed'

  // Fetch projects on mount and when filters change
  useEffect(() => {
    fetchProjects().catch(err => {
      console.error('Failed to fetch projects:', err);
    });
  }, [filters, pagination.page, sortBy, sortOrder]);

  // Update search filter with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ ...filters, search: searchTerm });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter projects by tab
  const getFilteredProjects = () => {
    let filtered = [...projects];

    switch (activeTab) {
      case 'active':
        filtered = filtered.filter(p => p.status === 'active');
        break;
      case 'archived':
        filtered = filtered.filter(p => p.status === 'archived');
        break;
      case 'completed':
        filtered = filtered.filter(p => p.status === 'completed');
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    return filtered;
  };

  const filteredProjects = getFilteredProjects();

  // Handle project creation
  const handleCreateProject = async (projectData) => {
    try {
      const newProject = await createProject(projectData);
      setShowCreateModal(false);
      navigate(`/workspace/${newProject._id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  // Handle project deletion
  const handleDeleteProject = async (projectId) => {
    try {
      await deleteProject(projectId);
      setShowDeleteConfirm(null);
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  // Handle project archive/restore
  const handleArchiveProject = async (projectId, archive = true) => {
    try {
      if (archive) {
        await archiveProject(projectId);
        toast.success('Project archived successfully');
      } else {
        await restoreProject(projectId);
        toast.success('Project restored successfully');
      }
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
    } catch (error) {
      console.error(`Failed to ${archive ? 'archive' : 'restore'} project:`, error);
    }
  };

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    if (selectedProjects.length === 0) {
      toast.error('Please select projects first');
      return;
    }

    try {
      switch (action) {
        case 'archive':
          await Promise.all(selectedProjects.map(id => archiveProject(id)));
          toast.success(`Archived ${selectedProjects.length} projects`);
          break;
        case 'restore':
          await Promise.all(selectedProjects.map(id => restoreProject(id)));
          toast.success(`Restored ${selectedProjects.length} projects`);
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedProjects.length} projects?`)) {
            await Promise.all(selectedProjects.map(id => deleteProject(id)));
            toast.success(`Deleted ${selectedProjects.length} projects`);
          }
          break;
        default:
          break;
      }
      setSelectedProjects([]);
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  // Handle project selection
  const handleProjectSelect = (projectId) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedProjects.length === filteredProjects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(filteredProjects.map(p => p._id));
    }
  };

  // **Fix: Handle filter changes**
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Tab configurations
  const tabs = [
    { key: 'all', label: 'All Projects', count: projects.length },
    { key: 'active', label: 'Active', count: projects.filter(p => p.status === 'active').length },
    { key: 'completed', label: 'Completed', count: projects.filter(p => p.status === 'completed').length },
    { key: 'archived', label: 'Archived', count: projects.filter(p => p.status === 'archived').length }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          title="Projects"
          user={user}
        />

        {/* Main Projects Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                <p className="text-gray-600 mt-1">
                  Manage and organize all your collaborative projects
                </p>
              </div>
              
              <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                {/* Bulk Actions */}
                {selectedProjects.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {selectedProjects.length} selected
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleBulkAction('archive')}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Archive selected"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleBulkAction('delete')}
                        className="p-2 text-gray-400 hover:text-red-600"
                        title="Delete selected"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Import/Export */}
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600" title="Import projects">
                    <Upload className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600" title="Export projects">
                    <Download className="h-4 w-4" />
                  </button>
                </div>

                {/* Create Project Button */}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Left side - Search and Filters */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 pr-4 py-2 w-64"
                />
              </div>

              {/* Advanced Filters */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-outline flex items-center ${showFilters ? 'bg-blue-50 text-blue-700' : ''}`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>

            {/* Right side - Sort and View Options */}
            <div className="flex items-center space-x-4">
              {/* Select All */}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Select all</span>
              </label>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="input pr-10"
                >
                  <option value="updatedAt-desc">Recently Updated</option>
                  <option value="createdAt-desc">Recently Created</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="status-asc">Status</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mb-6 card">
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={filters.status || 'all'}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="input"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      My Role
                    </label>
                    <select
                      value={filters.role || 'all'}
                      onChange={(e) => handleFilterChange('role', e.target.value)}
                      className="input"
                    >
                      <option value="all">All Roles</option>
                      <option value="owner">Owner</option>
                      <option value="manager">Manager</option>
                      <option value="member">Member</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Created Date
                    </label>
                    <select className="input">
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="quarter">This Quarter</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setFilters({ search: '', status: 'all', role: 'all' });
                      setSearchTerm('');
                    }}
                    className="btn-outline"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="btn-primary"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-red-700 text-sm">
                {error}
                <button
                  onClick={() => fetchProjects()}
                  className="block mt-2 text-red-600 hover:text-red-500 font-medium"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="spinner h-8 w-8 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading projects...</span>
            </div>
          )}

          {/* Projects Grid/List */}
          {!isLoading && !error && (
            <>
              {filteredProjects.length > 0 ? (
                <div className={
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                    : 'space-y-4'
                }>
                  {filteredProjects.map((project) => (
                    <ProjectCard 
                      key={project._id} 
                      project={project} 
                      viewMode={viewMode}
                      isSelected={selectedProjects.includes(project._id)}
                      onSelect={() => handleProjectSelect(project._id)}
                      onDelete={() => setShowDeleteConfirm(project._id)}
                      onArchive={() => handleArchiveProject(project._id, project.status !== 'archived')}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Grid3X3 className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || activeTab !== 'all' ? 'No projects found' : 'No projects yet'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm 
                      ? `No projects match your search criteria.`

                      : activeTab !== 'all'
                        ? `No ${activeTab} projects found.`

                        : 'Create your first project to start collaborating with your team.'
                    }
                  </p>
                  {!searchTerm && activeTab === 'all' && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn-primary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Project
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {!isLoading && !error && filteredProjects.length > 0 && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} projects
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === pagination.totalPages ||
                    (page >= pagination.page - 1 && page <= pagination.page + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setPagination({ ...pagination, page })}
                        className={`px-3 py-2 text-sm border rounded-md ${
                          page === pagination.page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === pagination.page - 2 ||
                    page === pagination.page + 2
                  ) {
                    return <span key={page} className="px-2 text-gray-500">...</span>;
                  }
                  return null;
                })}
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Project"
      >
        <ProjectForm
          onSubmit={handleCreateProject}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Delete Project"
      >
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Project
              </h3>
              <p className="text-gray-600">
                This action cannot be undone.
              </p>
            </div>
          </div>
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete this project? All associated tasks, 
            documents, and data will be permanently removed.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteConfirm(null)}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDeleteProject(showDeleteConfirm)}
              className="btn-danger"
            >
              Delete Project
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Projects;
