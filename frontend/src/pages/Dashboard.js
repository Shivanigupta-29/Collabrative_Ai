// frontend/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { useSocket } from '../context/SocketContext';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import ProjectCard from '../components/dashboard/ProjectCard';
import Overview from '../components/dashboard/Overview';
import QuickActions from '../components/dashboard/QuickActions';
import RecentActivity from '../components/dashboard/RecentActivity';
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Bell,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    projects, 
    isLoading, 
    error, 
    fetchProjects, 
    filters, 
    setFilters 
  } = useProject();
  const { isConnected, onlineUsers } = useSocket();
  const navigate = useNavigate();

  // Local state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedTasks: 0,
    teamMembers: 0,
  });

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects().catch(err => {
      console.error('Failed to fetch projects:', err);
    });
  }, []);

  // Update search filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ ...filters, search: searchTerm });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Calculate dashboard stats
  useEffect(() => {
    if (projects.length > 0) {
      const activeProjects = projects.filter(p => p.status === 'active').length;
      const completedTasks = projects.reduce((acc, project) => {
        return acc + (project.tasks?.filter(task => task.status === 'completed').length || 0);
      }, 0);
      const teamMembers = new Set(
        projects.flatMap(project => 
          project.members?.map(member => member.user._id || member.user) || []
        )
      ).size;

      setStats({
        totalProjects: projects.length,
        activeProjects,
        completedTasks,
        teamMembers,
      });
    }
  }, [projects]);

  // Handle project creation
  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  // Get filtered projects
  const getFilteredProjects = () => {
    let filtered = [...projects];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredProjects = getFilteredProjects();

  // Quick stats data
  const quickStats = [
    {
      label: 'Total Projects',
      value: stats.totalProjects,
      icon: Grid3X3,
      color: 'text-blue-600 bg-blue-100',
      trend: '+12%',
      trendUp: true
    },
    {
      label: 'Active Projects',
      value: stats.activeProjects,
      icon: TrendingUp,
      color: 'text-green-600 bg-green-100',
      trend: '+8%',
      trendUp: true
    },
    {
      label: 'Completed Tasks',
      value: stats.completedTasks,
      icon: CheckCircle2,
      color: 'text-purple-600 bg-purple-100',
      trend: '+23%',
      trendUp: true
    },
    {
      label: 'Team Members',
      value: stats.teamMembers,
      icon: Users,
      color: 'text-orange-600 bg-orange-100',
      trend: '+5%',
      trendUp: true
    }
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
          title="Dashboard"
          user={user}
        />

        {/* Main Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {user?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-gray-600 mt-1">
                  Here's what's happening with your projects today.
                </p>
              </div>
              
              {/* Connection Status */}
              <div className="flex items-center space-x-4">
                <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
                  isConnected 
                    ? 'text-green-700 bg-green-100' 
                    : 'text-red-700 bg-red-100'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  {isConnected ? 'Connected' : 'Disconnected'}
                </div>
                {onlineUsers.length > 0 && (
                  <div className="text-sm text-gray-600">
                    {onlineUsers.length} users online
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickStats.map((stat, index) => (
              <div key={index} className="card">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className={`text-sm font-medium ${
                      stat.trendUp ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">vs last month</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Projects Section */}
            <div className="xl:col-span-2 space-y-6">
              {/* Projects Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
                  <p className="text-gray-600">Manage and track your active projects</p>
                </div>
                
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

                  {/* Create Project Button */}
                  <button
                    onClick={handleCreateProject}
                    className="btn-primary flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </button>
                </div>
              </div>

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
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
                        ? 'grid grid-cols-1 md:grid-cols-2 gap-6' 
                        : 'space-y-4'
                    }>
                      {filteredProjects.slice(0, 6).map((project) => (
                        <ProjectCard 
                          key={project._id} 
                          project={project} 
                          viewMode={viewMode}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Grid3X3 className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? 'No projects found' : 'No projects yet'}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {searchTerm 
                          ? `No projects match "${searchTerm}". Try a different search term.`
                          : 'Create your first project to start collaborating with your team.'
                        }
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={handleCreateProject}
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

              {/* Show All Projects Link */}
              {filteredProjects.length > 6 && (
                <div className="text-center pt-6">
                  <Link 
                    to="/projects" 
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    View all {projects.length} projects →
                  </Link>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                </div>
                <div className="card-body">
                  <QuickActions />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card">
                <div className="card-header flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
                <div className="card-body">
                  <RecentActivity />
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Upcoming Deadlines
                  </h3>
                </div>
                <div className="card-body">
                  <div className="space-y-3">
                    {/* Mock upcoming deadlines - replace with real data */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Website Redesign</p>
                        <p className="text-xs text-gray-600">Final review phase</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-orange-600">2 days</p>
                        <p className="text-xs text-gray-500">Dec 15</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Mobile App Launch</p>
                        <p className="text-xs text-gray-600">Testing complete</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">5 days</p>
                        <p className="text-xs text-gray-500">Dec 18</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Q4 Reports</p>
                        <p className="text-xs text-gray-600">Data collection</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">1 week</p>
                        <p className="text-xs text-gray-500">Dec 22</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Link 
                      to="/calendar" 
                      className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                    >
                      View full calendar →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Team Activity */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Team Activity
                  </h3>
                </div>
                <div className="card-body">
                  <div className="space-y-3">
                    {/* Mock team activity - replace with real data */}
                    <div className="flex items-center">
                      <img 
                        src="/api/placeholder/32/32" 
                        alt="User" 
                        className="h-8 w-8 rounded-full mr-3"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Sarah</span> completed a task in{' '}
                          <span className="font-medium text-blue-600">Website Redesign</span>
                        </p>
                        <p className="text-xs text-gray-500">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <img 
                        src="/api/placeholder/32/32" 
                        alt="User" 
                        className="h-8 w-8 rounded-full mr-3"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Mike</span> added a comment to{' '}
                          <span className="font-medium text-blue-600">Mobile App</span>
                        </p>
                        <p className="text-xs text-gray-500">1 hour ago</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <img 
                        src="/api/placeholder/32/32" 
                        alt="User" 
                        className="h-8 w-8 rounded-full mr-3"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Emma</span> created a new project{' '}
                          <span className="font-medium text-blue-600">Q1 Planning</span>
                        </p>
                        <p className="text-xs text-gray-500">3 hours ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Link 
                      to="/activity" 
                      className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                    >
                      View all activity →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Overview Section */}
          <div className="mt-8">
            <Overview />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;