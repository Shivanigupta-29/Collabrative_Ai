// frontend/src/services/projectService.js
import { apiHelpers } from './api';

const projectService = {
  // Get all projects for current user
  getProjects: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add filters
      if (params.status && params.status !== 'all') {
        queryParams.append('status', params.status);
      }
      if (params.role && params.role !== 'all') {
        queryParams.append('role', params.role);
      }
      if (params.search) {
        queryParams.append('search', params.search);
      }
      
      // Add sorting
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const queryString = queryParams.toString();
      const url = queryString ? `/projects?${queryString}` : '/projects';
      
      const response = await apiHelpers.get(url);

      // Expected response structure:
      // {
      //   success: true,
      //   projects: [...],
      //   pagination: {
      //     page: 1,
      //     limit: 10,
      //     total: 25,
      //     totalPages: 3
      //   }
      // }

      return {
        projects: response.projects || [],
        pagination: response.pagination || {},
      };
    } catch (error) {
      console.error('Get projects error:', error);
      throw error;
    }
  },

  // Get single project by ID
  getProject: async (projectId) => {
    try {
      const response = await apiHelpers.get(`/projects/${projectId}`);

      // Expected response structure:
      // {
      //   success: true,
      //   project: {
      //     _id: "project_id",
      //     name: "Project Name",
      //     description: "Project description",
      //     status: "active|inactive|completed",
      //     createdBy: "user_id",
      //     members: [...],
      //     tasks: [...],
      //     createdAt: "date",
      //     updatedAt: "date"
      //   }
      // }

      return response.project;
    } catch (error) {
      console.error('Get project error:', error);
      throw error;
    }
  },

  // Create new project
  createProject: async (projectData) => {
    try {
      const {
        name,
        description,
        status = 'active',
        tags = [],
        members = [],
        dueDate,
        priority = 'medium',
        isPrivate = false,
      } = projectData;

      const response = await apiHelpers.post('/projects', {
        name: name.trim(),
        description: description?.trim(),
        status,
        tags,
        members,
        dueDate,
        priority,
        isPrivate,
      });

      // Expected response structure:
      // {
      //   success: true,
      //   message: "Project created successfully",
      //   project: { ... }
      // }

      return response.project;
    } catch (error) {
      console.error('Create project error:', error);
      throw error;
    }
  },

  // Update project
  updateProject: async (projectId, updateData) => {
    try {
      const response = await apiHelpers.put(`/projects/${projectId}`, updateData);

      // Expected response structure:
      // {
      //   success: true,
      //   message: "Project updated successfully",
      //   project: { ... }
      // }

      return response.project;
    } catch (error) {
      console.error('Update project error:', error);
      throw error;
    }
  },

  // Delete project
  deleteProject: async (projectId) => {
    try {
      const response = await apiHelpers.delete(`/projects/${projectId}`);

      // Expected response structure:
      // {
      //   success: true,
      //   message: "Project deleted successfully"
      // }

      return response;
    } catch (error) {
      console.error('Delete project error:', error);
      throw error;
    }
  },

  // Add member to project
  addMember: async (projectId, memberData) => {
    try {
      const { userId, email, role = 'member' } = memberData;
      
      const response = await apiHelpers.post(`/projects/${projectId}/members`, {
        userId,
        email: email?.toLowerCase().trim(),
        role,
      });

      // Expected response structure:
      // {
      //   success: true,
      //   message: "Member added successfully",
      //   member: {
      //     _id: "member_id",
      //     user: { user_data },
      //     role: "role",
      //     joinedAt: "date"
      //   }
      // }

      return response.member;
    } catch (error) {
      console.error('Add member error:', error);
      throw error;
    }
  },

  // Remove member from project
  removeMember: async (projectId, memberId) => {
    try {
      const response = await apiHelpers.delete(`/projects/${projectId}/members/${memberId}`);

      // Expected response structure:
      // {
      //   success: true,
      //   message: "Member removed successfully"
      // }

      return response;
    } catch (error) {
      console.error('Remove member error:', error);
      throw error;
    }
  },

  // Update member role
  updateMemberRole: async (projectId, memberId, newRole) => {
    try {
      const response = await apiHelpers.put(`/projects/${projectId}/members/${memberId}`, {
        role: newRole,
      });

      // Expected response structure:
      // {
      //   success: true,
      //   message: "Member role updated successfully",
      //   member: { updated_member_data }
      // }

      return response.member;
    } catch (error) {
      console.error('Update member role error:', error);
      throw error;
    }
  },

  // Get project statistics
  getProjectStats: async (projectId) => {
    try {
      const response = await apiHelpers.get(`/projects/${projectId}/stats`);

      // Expected response structure:
      // {
      //   success: true,
      //   stats: {
      //     totalTasks: 25,
      //     completedTasks: 15,
      //     inProgressTasks: 8,
      //     todoTasks: 2,
      //     totalMembers: 5,
      //     activeMembers: 4,
      //     completionRate: 60,
      //     lastActivity: "date"
      //   }
      // }

      return response.stats;
    } catch (error) {
      console.error('Get project stats error:', error);
      throw error;
    }
  },

  // Get project activity feed
  getProjectActivity: async (projectId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.type) queryParams.append('type', params.type);

      const queryString = queryParams.toString();
      const url = queryString 
        ? `/projects/${projectId}/activity?${queryString}` 
        : `/projects/${projectId}/activity`;

      const response = await apiHelpers.get(url);

      // Expected response structure:
      // {
      //   success: true,
      //   activities: [
      //     {
      //       _id: "activity_id",
      //       type: "task_created|task_updated|member_added|...",
      //       user: { user_data },
      //       description: "Activity description",
      //       metadata: { ... },
      //       createdAt: "date"
      //     }
      //   ],
      //   pagination: { ... }
      // }

      return {
        activities: response.activities || [],
        pagination: response.pagination || {},
      };
    } catch (error) {
      console.error('Get project activity error:', error);
      throw error;
    }
  },

  // Archive project
  archiveProject: async (projectId) => {
    try {
      const response = await apiHelpers.patch(`/projects/${projectId}/archive`);

      // Expected response structure:
      // {
      //   success: true,
      //   message: "Project archived successfully",
      //   project: { updated_project }
      // }

      return response.project;
    } catch (error) {
      console.error('Archive project error:', error);
      throw error;
    }
  },

  // Restore project
  restoreProject: async (projectId) => {
    try {
      const response = await apiHelpers.patch(`/projects/${projectId}/restore`);

      // Expected response structure:
      // {
      //   success: true,
      //   message: "Project restored successfully",
      //   project: { updated_project }
      // }

      return response.project;
    } catch (error) {
      console.error('Restore project error:', error);
      throw error;
    }
  },

  // Duplicate project
  duplicateProject: async (projectId, newName) => {
    try {
      const response = await apiHelpers.post(`/projects/${projectId}/duplicate`, {
        name: newName.trim(),
      });

      // Expected response structure:
      // {
      //   success: true,
      //   message: "Project duplicated successfully",
      //   project: { new_project }
      // }

      return response.project;
    } catch (error) {
      console.error('Duplicate project error:', error);
      throw error;
    }
  },

  // Export project data
  exportProject: async (projectId, format = 'json') => {
    try {
      const response = await apiHelpers.get(`/projects/${projectId}/export?format=${format}`);

      // Expected response structure:
      // {
      //   success: true,
      //   exportUrl: "download_url",
      //   expiresAt: "date"
      // }

      return response;
    } catch (error) {
      console.error('Export project error:', error);
      throw error;
    }
  },

  // Get project templates
  getTemplates: async () => {
    try {
      const response = await apiHelpers.get('/projects/templates');

      // Expected response structure:
      // {
      //   success: true,
      //   templates: [
      //     {
      //       _id: "template_id",
      //       name: "Template Name",
      //       description: "Template description",
      //       category: "category",
      //       tasks: [...],
      //       isPublic: true
      //     }
      //   ]
      // }

      return response.templates || [];
    } catch (error) {
      console.error('Get templates error:', error);
      throw error;
    }
  },

  // Create project from template
  createFromTemplate: async (templateId, projectData) => {
    try {
      const response = await apiHelpers.post(`/projects/templates/${templateId}`, projectData);

      // Expected response structure:
      // {
      //   success: true,
      //   message: "Project created from template successfully",
      //   project: { new_project }
      // }

      return response.project;
    } catch (error) {
      console.error('Create from template error:', error);
      throw error;
    }
  },

  // Search projects
  searchProjects: async (query, filters = {}) => {
    try {
      const params = {
        q: query,
        ...filters,
      };

      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key]) queryParams.append(key, params[key]);
      });

      const response = await apiHelpers.get(`/projects/search?${queryParams.toString()}`);

      // Expected response structure:
      // {
      //   success: true,
      //   results: [...],
      //   pagination: { ... }
      // }

      return {
        projects: response.results || [],
        pagination: response.pagination || {},
      };
    } catch (error) {
      console.error('Search projects error:', error);
      throw error;
    }
  },
};

export default projectService;