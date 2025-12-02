// frontend/src/components/ai/AIInsights.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import aiService from '../../services/aiService';
import Button from '../common/Button';
import Loading from '../common/Loading';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Activity,
  Brain,
  Zap,
  RefreshCw,
  Calendar,
  PieChart,
  LineChart,
  Award,
  ArrowUp,
  ArrowDown,
  Minus,
  Info,
  Lightbulb,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

const AIInsights = ({ projectId }) => {
  const { user } = useAuth();
  const { currentProject } = useProject();
  
  // State management
  const [insights, setInsights] = useState(null);
  const [taskInsights, setTaskInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('productivity');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Timeframe options
  const timeframes = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' }
  ];

  // Metric options
  const metrics = [
    { 
      id: 'productivity', 
      label: 'Productivity', 
      icon: TrendingUp,
      description: 'Overall team productivity and velocity trends'
    },
    { 
      id: 'collaboration', 
      label: 'Collaboration', 
      icon: Users,
      description: 'Team communication and collaboration patterns'
    },
    { 
      id: 'timeline', 
      label: 'Timeline', 
      icon: Clock,
      description: 'Project timeline and deadline predictions'
    },
    { 
      id: 'quality', 
      label: 'Quality', 
      icon: Target,
      description: 'Code quality and task completion metrics'
    }
  ];

  // Load insights on component mount and when timeframe changes
  useEffect(() => {
    if (projectId) {
      loadInsights();
    }
  }, [projectId, timeframe]);

  // Load project insights
  const loadInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [projectInsights, taskInsightsData] = await Promise.all([
        aiService.getProjectInsights(projectId, timeframe),
        aiService.getTaskInsights(projectId)
      ]);

      setInsights(projectInsights.insights);
      setTaskInsights(taskInsightsData.insights);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading insights:', error);
      setError('Failed to load AI insights. Please try again.');
      toast.error('Failed to load insights');
    } finally {
      setIsLoading(false);
    }
  };

  // Get trend icon and color
  const getTrendDisplay = (trend, value) => {
    if (trend === 'increasing') {
      return {
        icon: ArrowUp,
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-100 dark:bg-green-900/30'
      };
    } else if (trend === 'decreasing') {
      return {
        icon: ArrowDown,
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-100 dark:bg-red-900/30'
      };
    }
    return {
      icon: Minus,
      color: 'text-gray-600 dark:text-gray-400',
      bg: 'bg-gray-100 dark:bg-gray-700'
    };
  };

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600 dark:text-green-400';
    if (score >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Render metric card
  const renderMetricCard = (title, value, trend, Icon, recommendations = []) => {
  const trendDisplay = getTrendDisplay(trend);
  const TrendIcon = trendDisplay.icon;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
            <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {typeof value === 'number' ? (value * 100).toFixed(0) + '%' : value}
            </p>
          </div>
        </div>

        <div className={`flex items-center px-2 py-1 rounded-full ${trendDisplay.bg}`}>
          <TrendIcon className={`h-4 w-4 ${trendDisplay.color}`} />
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
            <Lightbulb className="h-4 w-4 mr-1" />
            AI Recommendations
          </h4>
          <div className="space-y-1">
            {recommendations.slice(0, 2).map((rec, index) => (
              <p key={index} className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded p-2">
                {rec}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


  // Render team insights
  const renderTeamInsights = () => {
    if (!insights?.collaboration) return null;

    const { collaboration } = insights;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Team Collaboration
          </h3>
          <div className={`text-2xl font-bold ${getScoreColor(collaboration.score)}`}>
            {(collaboration.score * 100).toFixed(0)}%
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {collaboration.activeMembers}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Members</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {collaboration.communicationFrequency || 'N/A'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Daily Messages</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {collaboration.responseTime || 'N/A'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</div>
          </div>
        </div>

        {collaboration.suggestions && collaboration.suggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Improvement Suggestions
            </h4>
            {collaboration.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">{suggestion}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render task distribution
  const renderTaskDistribution = () => {
    if (!insights?.taskDistribution) return null;

    const { taskDistribution } = insights;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <PieChart className="h-5 w-5 mr-2" />
          Task Distribution Analysis
        </h3>

        <div className="space-y-4">
          {/* Balanced indicator */}
          <div className={`flex items-center p-3 rounded-lg ${
            taskDistribution.balanced 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
              : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
          }`}>
            {taskDistribution.balanced ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertTriangle className="h-5 w-5 mr-2" />
            )}
            <span className="font-medium">
              {taskDistribution.balanced ? 'Well Balanced' : 'Needs Attention'}
            </span>
          </div>

          {/* Overloaded members */}
          {taskDistribution.overloaded && taskDistribution.overloaded.length > 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                Overloaded Team Members
              </div>
              <div className="space-y-1">
                {taskDistribution.overloaded.map((member, index) => (
                  <div key={index} className="text-sm text-red-600 dark:text-red-400">
                    {member.name || member} - {member.taskCount || 0} active tasks
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Underutilized members */}
          {taskDistribution.underutilized && taskDistribution.underutilized.length > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                Available Capacity
              </div>
              <div className="space-y-1">
                {taskDistribution.underutilized.map((member, index) => (
                  <div key={index} className="text-sm text-blue-600 dark:text-blue-400">
                    {member.name || member} - Available for more tasks
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render timeline insights
  const renderTimelineInsights = () => {
    if (!insights?.timeline) return null;

    const { timeline } = insights;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Timeline Analysis
        </h3>

        <div className="space-y-4">
          {/* On track indicator */}
          <div className={`flex items-center justify-between p-4 rounded-lg ${
            timeline.onTrack 
              ? 'bg-green-50 dark:bg-green-900/20'
              : 'bg-yellow-50 dark:bg-yellow-900/20'
          }`}>
            <div className="flex items-center">
              {timeline.onTrack ? (
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
              )}
              <div>
                <div className={`font-medium ${
                  timeline.onTrack 
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-yellow-700 dark:text-yellow-300'
                }`}>
                  {timeline.onTrack ? 'Project On Track' : 'Timeline Risk Detected'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Delay Risk: {timeline.delayRisk || 'Low'}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-lg font-bold ${
                timeline.onTrack 
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-yellow-600 dark:text-yellow-400'
              }`}>
                {timeline.completionPrediction || 'N/A'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Predicted completion
              </div>
            </div>
          </div>

          {/* Timeline suggestions */}
          {timeline.suggestions && timeline.suggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Timeline Optimization
              </h4>
              {timeline.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Target className="h-4 w-4 text-gray-600 dark:text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <Loading type="dots" className="mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            AI is analyzing your project data...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Insights
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={loadInsights} variant="primary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // No insights available
  if (!insights) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Insights Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Not enough project data to generate meaningful insights. Continue working on your project to see AI-powered analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Insights
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered analytics for project optimization
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Timeframe selector */}
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeframes.map(tf => (
                <option key={tf.value} value={tf.value}>{tf.label}</option>
              ))}
            </select>

            {/* Refresh button */}
            <Button
              onClick={loadInsights}
              variant="outline"
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Metric tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          {metrics.map((metric) => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedMetric === metric.id
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title={metric.description}
            >
              <metric.icon className="h-4 w-4 mr-2" />
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {insights.productivity && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Productivity</p>
                    <p className={`text-2xl font-bold ${getScoreColor(insights.productivity.score)}`}>
                      {(insights.productivity.score * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  {getTrendDisplay(insights.productivity.trend).icon && (
                    <div className={`flex items-center text-sm ${getTrendDisplay(insights.productivity.trend).color}`}>
                      {React.createElement(getTrendDisplay(insights.productivity.trend).icon, { className: 'h-4 w-4 mr-1' })}
                      {insights.productivity.trend}
                    </div>
                  )}
                </div>
              </div>
            )}

            {insights.collaboration && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Collaboration</p>
                    <p className={`text-2xl font-bold ${getScoreColor(insights.collaboration.score)}`}>
                      {(insights.collaboration.score * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {insights.collaboration.activeMembers} active members
                  </p>
                </div>
              </div>
            )}

            {insights.quality && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quality</p>
                    <p className={`text-2xl font-bold ${getScoreColor(insights.quality.score)}`}>
                      {(insights.quality.score * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {insights.quality.issues || 0} issues detected
                  </p>
                </div>
              </div>
            )}

            {insights.timeline && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Timeline</p>
                    <p className={`text-lg font-bold ${
                      insights.timeline.onTrack 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {insights.timeline.onTrack ? 'On Track' : 'At Risk'}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    insights.timeline.onTrack
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-yellow-100 dark:bg-yellow-900/30'
                  }`}>
                    <Clock className={`h-6 w-6 ${
                      insights.timeline.onTrack
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`} />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Risk: {insights.timeline.delayRisk}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Collaboration */}
            {renderTeamInsights()}

            {/* Task Distribution */}
            {renderTaskDistribution()}

            {/* Timeline Insights */}
            {renderTimelineInsights()}

            {/* Quality Insights */}
            {insights.quality && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Quality Analysis
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        Quality Score
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Based on completion rates and task quality
                      </div>
                    </div>
                    <div className={`text-3xl font-bold ${getScoreColor(insights.quality.score)}`}>
                      {(insights.quality.score * 100).toFixed(0)}%
                    </div>
                  </div>

                  {insights.quality.improvements && insights.quality.improvements.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Quality Improvements
                      </h4>
                      {insights.quality.improvements.map((improvement, index) => (
                        <div key={index} className="flex items-start p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <Award className="h-4 w-4 text-purple-600 dark:text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-purple-700 dark:text-purple-300">{improvement}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      {lastUpdated && (
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Activity className="h-4 w-4 mr-1" />
              <span>Last updated: {lastUpdated.toLocaleString()}</span>
            </div>
            <div className="flex items-center">
              <Zap className="h-4 w-4 mr-1" />
              <span>Powered by AI</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsights;

