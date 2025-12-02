// frontend/src/context/ProjectContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import projectService from '../services/projectService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
  filters: {
    status: 'all',
    role: 'all',
    search: '',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Action types
const PROJECT_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Projects list
  FETCH_PROJECTS_START: 'FETCH_PROJECTS_START',
  FETCH_PROJECTS_SUCCESS: 'FETCH_PROJECTS_SUCCESS',
  FETCH_PROJECTS_FAILURE: 'FETCH_PROJECTS_FAILURE',
  
  // Single project
  SET_CURRENT_PROJECT: 'SET_CURRENT_PROJECT',
  FETCH_PROJECT_START: 'FETCH_PROJECT_START',
  FETCH_PROJECT_SUCCESS: 'FETCH_PROJECT_SUCCESS',
  FETCH_PROJECT_FAILURE: 'FETCH_PROJECT_FAILURE',
  
  // CRUD operations
  CREATE_PROJECT_SUCCESS: 'CREATE_PROJECT_SUCCESS',
  UPDATE_PROJECT_SUCCESS: 'UPDATE_PROJECT_SUCCESS',
  DELETE_PROJECT_SUCCESS: 'DELETE_PROJECT_SUCCESS',
  
  // Project members
  ADD_MEMBER_SUCCESS: 'ADD_MEMBER_SUCCESS',
  REMOVE_MEMBER_SUCCESS: 'REMOVE_MEMBER_SUCCESS',
  UPDATE_MEMBER_ROLE_SUCCESS: 'UPDATE_MEMBER_ROLE_SUCCESS',
  
  // Filters and pagination
  SET_FILTERS: 'SET_FILTERS',
  SET_PAGINATION: 'SET_PAGINATION',
  RESET_FILTERS: 'RESET_FILTERS',
};

// Reducer function
const projectReducer = (state, action) => {
  switch (action.type) {
    case PROJECT_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case PROJECT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case PROJECT_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case PROJECT_ACTIONS.FETCH_PROJECTS_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case PROJECT_ACTIONS.FETCH_PROJECTS_SUCCESS:
      return {
        ...state,
        projects: action.payload.projects,
        pagination: {
          ...state.pagination,
          ...action.payload.pagination,
        },
        isLoading: false,
        error: null,
      };

    case PROJECT_ACTIONS.FETCH_PROJECTS_FAILURE:
      return {
        ...state,
        projects: [],
        isLoading: false,
        error: action.payload,
      };

    case PROJECT_ACTIONS.SET_CURRENT_PROJECT:
      return {
        ...state,
        currentProject: action.payload,
      };

    case PROJECT_ACTIONS.FETCH_PROJECT_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case PROJECT_ACTIONS.FETCH_PROJECT_SUCCESS:
      return {
        ...state,
        currentProject: action.payload,
        isLoading: false,
        error: null,
      };

    case PROJECT_ACTIONS.FETCH_PROJECT_FAILURE:
      return {
        ...state,
        currentProject: null,
        isLoading: false,
        error: action.payload,
      };

    case PROJECT_ACTIONS.CREATE_PROJECT_SUCCESS:
      return {
        ...state,
        projects: [action.payload, ...state.projects],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
        },
      };

    case PROJECT_ACTIONS.UPDATE_PROJECT_SUCCESS:
      return {
        ...state,
        projects: state.projects.map(project =>
          project._id === action.payload._id ? action.payload : project
        ),
        currentProject: state.currentProject?._id === action.payload._id
          ? action.payload
          : state.currentProject,
      };

    case PROJECT_ACTIONS.DELETE_PROJECT_SUCCESS:
      return {
        ...state,
        projects: state.projects.filter(project => project._id !== action.payload),
        currentProject: state.currentProject?._id === action.payload
          ? null
          : state.currentProject,
        pagination: {
          ...state.pagination,
          total: Math.max(0, state.pagination.total - 1),
        },
      };

    case PROJECT_ACTIONS.ADD_MEMBER_SUCCESS:
      const updatedProjectWithMember = {
        ...state.currentProject,
        members: [...(state.currentProject?.members || []), action.payload],
      };
      return {
        ...state,
        currentProject: updatedProjectWithMember,
        projects: state.projects.map(project =>
          project._id === updatedProjectWithMember._id ? updatedProjectWithMember : project
        ),
      };

    case PROJECT_ACTIONS.REMOVE_MEMBER_SUCCESS:
      const updatedProjectWithoutMember = {
        ...state.currentProject,
        members: state.currentProject?.members?.filter(
          member => member._id !== action.payload
        ) || [],
      };
      return {
        ...state,
        currentProject: updatedProjectWithoutMember,
        projects: state.projects.map(project =>
          project._id === updatedProjectWithoutMember._id ? updatedProjectWithoutMember : project
        ),
      };

    case PROJECT_ACTIONS.UPDATE_MEMBER_ROLE_SUCCESS:
      const { memberId, newRole } = action.payload;
      const updatedProjectWithRole = {
        ...state.currentProject,
        members: state.currentProject?.members?.map(member =>
          member._id === memberId ? { ...member, role: newRole } : member
        ) || [],
      };
      return {
        ...state,
        currentProject: updatedProjectWithRole,
        projects: state.projects.map(project =>
          project._id === updatedProjectWithRole._id ? updatedProjectWithRole : project
        ),
      };

    case PROJECT_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };

    case PROJECT_ACTIONS.SET_PAGINATION:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          ...action.payload,
        },
      };

    case PROJECT_ACTIONS.RESET_FILTERS:
      return {
        ...state,
        filters: initialState.filters,
        pagination: initialState.pagination,
      };

    default:
      return state;
  }
};

// Create context
const ProjectContext = createContext();

// Project Provider component
export const ProjectProvider = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Fetch projects when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProjects();
    }
  }, [isAuthenticated, user, state.filters, state.pagination.page]);

  // Fetch all projects
  const fetchProjects = async (options = {}) => {
    try {
      dispatch({ type: PROJECT_ACTIONS.FETCH_PROJECTS_START });

      const params = {
        page: state.pagination.page,
        limit: state.pagination.limit,
        ...state.filters,
        ...options,
      };

      const response = await projectService.getProjects(params);

      dispatch({
        type: PROJECT_ACTIONS.FETCH_PROJECTS_SUCCESS,
        payload: {
          projects: response.projects,
          pagination: response.pagination,
        },
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch projects';
      dispatch({
        type: PROJECT_ACTIONS.FETCH_PROJECTS_FAILURE,
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Fetch single project
  const fetchProject = async (projectId) => {
    try {
      dispatch({ type: PROJECT_ACTIONS.FETCH_PROJECT_START });

      const project = await projectService.getProject(projectId);

      dispatch({
        type: PROJECT_ACTIONS.FETCH_PROJECT_SUCCESS,
        payload: project,
      });

      return project;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch project';
      dispatch({
        type: PROJECT_ACTIONS.FETCH_PROJECT_FAILURE,
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Create new project
  const createProject = async (projectData) => {
    try {
      const newProject = await projectService.createProject(projectData);

      dispatch({
        type: PROJECT_ACTIONS.CREATE_PROJECT_SUCCESS,
        payload: newProject,
      });

      toast.success('Project created successfully');
      return newProject;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create project';
      dispatch({
        type: PROJECT_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Update project
  const updateProject = async (projectId, updateData) => {
    try {
      const updatedProject = await projectService.updateProject(projectId, updateData);

      dispatch({
        type: PROJECT_ACTIONS.UPDATE_PROJECT_SUCCESS,
        payload: updatedProject,
      });

      toast.success('Project updated successfully');
      return updatedProject;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update project';
      dispatch({
        type: PROJECT_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Delete project
  const deleteProject = async (projectId) => {
    try {
      await projectService.deleteProject(projectId);

      dispatch({
        type: PROJECT_ACTIONS.DELETE_PROJECT_SUCCESS,
        payload: projectId,
      });

      toast.success('Project deleted successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete project';
      dispatch({
        type: PROJECT_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Add project member
  const addMember = async (projectId, memberData) => {
    try {
      const newMember = await projectService.addMember(projectId, memberData);

      dispatch({
        type: PROJECT_ACTIONS.ADD_MEMBER_SUCCESS,
        payload: newMember,
      });

      toast.success(`${newMember.name} added to project`);
      return newMember;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add member';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Remove project member
  const removeMember = async (projectId, memberId) => {
    try {
      await projectService.removeMember(projectId, memberId);

      dispatch({
        type: PROJECT_ACTIONS.REMOVE_MEMBER_SUCCESS,
        payload: memberId,
      });

      toast.success('Member removed from project');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to remove member';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Update member role
  const updateMemberRole = async (projectId, memberId, newRole) => {
    try {
      await projectService.updateMemberRole(projectId, memberId, newRole);

      dispatch({
        type: PROJECT_ACTIONS.UPDATE_MEMBER_ROLE_SUCCESS,
        payload: { memberId, newRole },
      });

      toast.success('Member role updated successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update member role';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Set filters
  const setFilters = (filters) => {
    dispatch({
      type: PROJECT_ACTIONS.SET_FILTERS,
      payload: filters,
    });
  };

  // Set pagination
  const setPagination = (pagination) => {
    dispatch({
      type: PROJECT_ACTIONS.SET_PAGINATION,
      payload: pagination,
    });
  };

  // Reset filters
  const resetFilters = () => {
    dispatch({ type: PROJECT_ACTIONS.RESET_FILTERS });
  };

  // Set current project
  const setCurrentProject = (project) => {
    dispatch({
      type: PROJECT_ACTIONS.SET_CURRENT_PROJECT,
      payload: project,
    });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: PROJECT_ACTIONS.CLEAR_ERROR });
  };

  // Get project by ID
  const getProjectById = (projectId) => {
    return state.projects.find(project => project._id === projectId);
  };

  // Check if user can access project
  const canAccessProject = (project, action = 'read') => {
    if (!user || !project) return false;
    
    // Admin can access everything
    if (user.role === 'admin') return true;
    
    // Owner can access everything
    if (project.createdBy === user._id) return true;
    
    // Check if user is a member
    const member = project.members?.find(m => m.user._id === user._id || m.user === user._id);
    if (!member) return false;
    
    // Check specific permissions based on role and action
    const rolePermissions = {
      owner: ['read', 'write', 'delete', 'manage'],
      manager: ['read', 'write', 'manage'],
      member: ['read', 'write'],
      viewer: ['read'],
    };
    
    return rolePermissions[member.role]?.includes(action) || false;
  };

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
    updateMemberRole,
    
    // Filters and pagination
    setFilters,
    setPagination,
    resetFilters,
    
    // Utilities
    setCurrentProject,
    clearError,
    getProjectById,
    canAccessProject,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

// Custom hook to use project context
export const useProject = () => {
  const context = useContext(ProjectContext);
  
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  
  return context;
};

export default ProjectContext;