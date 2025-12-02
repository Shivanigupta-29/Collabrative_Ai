// frontend/src/components/dashboard/Overview.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import aiService from '../../services/aiService';
import Button from '../common/Button';
import Loading from '../common/Loading';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Target,
  Activity,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Zap,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Eye,
  ChevronRight,
  Award,
  FileText,
  MessageCircle,
  Lightbulb
} from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

const Overview = () => {
  const { user } = useAuth();
  const { projects } = useProject();
  
  // State management
  const [overviewData, setOverviewData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [activeChart, setActiveChart] = useState('productivity');

  // Period options
  const periods = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' }
  ];

  // Load overview data
  useEffect(() => {
    loadOverviewData();
  }, [selectedPeriod, projects]);

  const loadOverviewData = async () => {
    try {
      setIsLoading(true);
      
      // Calculate basic metrics from projects
      const basicMetrics = calculateBasicMetrics();
      
      // Get AI insights for active projects
      let aiInsights = null;
      const activeProjects = projects.filter(p => p.status === 'active');
      
      if (activeProjects.length > 0) {
        try {
          // Get insights for the first active project (or aggregate later)
          aiInsights = await aiService.getProjectInsights(
            activeProjects[0]._id, 
            selectedPeriod
          );
        } catch (error) {
          console.error('Failed to load AI insights:', error);
        }
      }
      
      setOverviewData({
        ...basicMetrics,
        aiInsights: aiInsights?.insights || null,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Failed to load overview data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate basic metrics from projects data
  const calculateBasicMetrics = () => {
    const now = new Date();
    const periodStart = subDays(now, parseInt(selectedPeriod));
    
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    
    // Calculate tasks metrics
    const allTasks = projects.flatMap(p => p.tasks || []);
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'done').length;
    const inProgressTasks = allTasks.filter(t => t.status === 'inprogress').length;
    const overdueTasks = allTasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    ).length;
    
    // Calculate team metrics
    const allMembers = new Set();
    projects.forEach(project => {
      project.members?.forEach(member => {
        allMembers.add(member.user._id || member.user);
      });
    });
    const totalTeamMembers = allMembers.size;
    
    // Calculate activity metrics (mock data - replace with real activity tracking)
    const recentActivity = projects.filter(p => 
      p.updatedAt && isWithinInterval(new Date(p.updatedAt), {
        start: periodStart,
        end: now
      })
    ).length;
    
    // Calculate productivity score
    const productivityScore = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;
    
    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      totalTeamMembers,
      recentActivity,
      productivityScore,
      // Mock trend data - replace with historical data
      trends: {
        projects: Math.random() > 0.5 ? 'up' : 'down',
        productivity: Math.random() > 0.5 ? 'up' : 'down',
        activity: Math.random() > 0.5 ? 'up' : 'down'
      }
    };
  };

  // Get trend display
  const getTrendDisplay = (trend, value = 0) => {
    const configs = {
      up: {
        icon: ArrowUp,
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: `+${Math.abs(value)}%`
      },
      down: {
        icon: ArrowDown,
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: `-${Math.abs(value)}%`
      },
      stable: {
        icon: Minus,
        color: 'text-gray-600 dark:text-gray-400',
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: '0%'
      }
    };
    return configs[trend] || configs.stable;
  };

  // Render metric card
  const renderMetricCard = (title, value, subtitle, Icon, trend = 'stable', trendValue = 0) => {
    const trendConfig = getTrendDisplay(trend, trendValue);
    const TrendIcon = trendConfig.icon;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
              <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
          </div>
          
          <div className={`flex items-center px-2 py-1 rounded-full ${trendConfig.bg}`}>
            <TrendIcon className={`h-4 w-4 ${trendConfig.color}`} />
            <span className={`ml-1 text-xs font-medium ${trendConfig.color}`}>
              {trendConfig.text}
            </span>
          </div>
        </div>
        
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
    );
  };

  // Render recent activity
  const renderRecentActivity = () => {
    // Mock activity data - replace with real activity feed
    const activities = [
      {
        id: 1,
        type: 'task_completed',
        user: 'Sarah Johnson',
        description: 'completed task "Design homepage wireframes"',
        project: 'Website Redesign',
        timestamp: '2 minutes ago',
        icon: CheckCircle2,
        color: 'text-green-600'
      },
      {
        id: 2,
        type: 'project_created',
        user: 'Mike Chen',
        description: 'created new project "Mobile App Development"',
        project: null,
        timestamp: '1 hour ago',
        icon: Target,
        color: 'text-blue-600'
      },
      {
        id: 3,
        type: 'comment_added',
        user: 'Emma Wilson',
        description: 'commented on "API Integration" task',
        project: 'Backend Services',
        timestamp: '3 hours ago',
        icon: MessageCircle,
        color: 'text-purple-600'
      },
      {
        id: 4,
        type: 'deadline_approaching',
        user: 'System',
        description: 'deadline approaching for "Q4 Reports"',
        project: 'Analytics Dashboard',
        timestamp: '5 hours ago',
        icon: AlertTriangle,
        color: 'text-orange-600'
      }
    ];

    return (
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              activity.color === 'text-green-600' ? 'bg-green-100 dark:bg-green-900/30' :
              activity.color === 'text-blue-600' ? 'bg-blue-100 dark:bg-blue-900/30' :
              activity.color === 'text-purple-600' ? 'bg-purple-100 dark:bg-purple-900/30' :
              'bg-orange-100 dark:bg-orange-900/30'
            }`}>
              <activity.icon className={`h-4 w-4 ${activity.color} dark:opacity-80`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-white">
                <span className="font-medium">{activity.user}</span>{' '}
                {activity.description}
                {activity.project && (
                  <span className="text-blue-600 dark:text-blue-400"> in {activity.project}</span>
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {activity.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Overview</h2>
          <Loading type="spinner" size="small" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg mr-3" />
                <div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-2" />
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!overviewData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Overview</h2>
        
        <div className="flex items-center space-x-3">
          {/* Period selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>{period.label}</option>
            ))}
          </select>
          
          {/* Refresh button */}
          <Button
            onClick={loadOverviewData}
            variant="outline"
            size="small"
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderMetricCard(
          'Active Projects',
          overviewData.activeProjects,
          `${overviewData.totalProjects} total projects`,
          Target,
          overviewData.trends.projects,
          12
        )}
        
        {renderMetricCard(
          'Productivity Score',
          `${overviewData.productivityScore}%`,
          `${overviewData.completedTasks}/${overviewData.totalTasks} tasks completed`,
          TrendingUp,
          overviewData.trends.productivity,
          8
        )}
        
        {renderMetricCard(
          'Team Members',
          overviewData.totalTeamMembers,
          'Across all projects',
          Users,
          'stable',
          0
        )}
        
        {renderMetricCard(
          'Recent Activity',
          overviewData.recentActivity,
          'Projects updated this period',
          Activity,
          overviewData.trends.activity,
          15
        )}
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Status Overview */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Task Overview</h3>
              <Button
                variant="outline"
                size="small"
                leftIcon={<Eye className="h-4 w-4" />}
                onClick={() => window.location.href = '/tasks'}
              >
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {overviewData.inProgressTasks}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {overviewData.completedTasks}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {overviewData.overdueTasks}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Overdue</div>
              </div>
            </div>
            
            {/* Progress visualization */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {overviewData.productivityScore}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${overviewData.productivityScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            <Button
              variant="ghost"
              size="small"
              rightIcon={<ChevronRight className="h-4 w-4" />}
              onClick={() => window.location.href = '/activity'}
            >
              View All
            </Button>
          </div>
          
          {renderRecentActivity()}
        </div>
      </div>

      {/* AI Insights Section */}
      {overviewData.aiInsights && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
              AI Insights
            </h3>
            <Button
              variant="outline"
              size="small"
              leftIcon={<Lightbulb className="h-4 w-4" />}
              onClick={() => window.location.href = '/ai/insights'}
            >
              View Details
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Productivity insight */}
            {overviewData.aiInsights.productivity && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">Productivity</h4>
                  <span className={`text-lg font-bold ${
                    overviewData.aiInsights.productivity.score >= 0.8 ? 'text-green-600 dark:text-green-400' :
                    overviewData.aiInsights.productivity.score >= 0.6 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {Math.round(overviewData.aiInsights.productivity.score * 100)}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {overviewData.aiInsights.productivity.recommendations?.[0] || 
                   `Team productivity is ${overviewData.aiInsights.productivity.trend} this period`}
                </p>
              </div>
            )}
            
            {/* Collaboration insight */}
            {overviewData.aiInsights.collaboration && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">Collaboration</h4>
                  <span className={`text-lg font-bold ${
                    overviewData.aiInsights.collaboration.score >= 0.8 ? 'text-green-600 dark:text-green-400' :
                    overviewData.aiInsights.collaboration.score >= 0.6 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {Math.round(overviewData.aiInsights.collaboration.score * 100)}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {overviewData.aiInsights.collaboration.suggestions?.[0] || 
                   `${overviewData.aiInsights.collaboration.activeMembers} active team members`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="flex flex-col items-center p-4 h-auto"
            onClick={() => window.location.href = '/projects/new'}
          >
            <Target className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
            <span className="text-sm font-medium">New Project</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center p-4 h-auto"
            onClick={() => window.location.href = '/ai/ideas'}
          >
            <Lightbulb className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
            <span className="text-sm font-medium">AI Ideas</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center p-4 h-auto"
            onClick={() => window.location.href = '/analytics'}
          >
            <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" />
            <span className="text-sm font-medium">Analytics</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center p-4 h-auto"
            onClick={() => window.location.href = '/team'}
          >
            <Users className="h-8 w-8 text-orange-600 dark:text-orange-400 mb-2" />
            <span className="text-sm font-medium">Team</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Overview;