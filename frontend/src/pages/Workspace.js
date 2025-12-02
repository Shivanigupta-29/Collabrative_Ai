// frontend/src/pages/Workspace.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { useSocket } from '../context/SocketContext';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import KanbanBoard from '../components/tasks/KanbanBoard';
import Whiteboard from '../components/whiteboard/Whiteboard';
import ChatContainer from '../components/chat/ChatContainer';
import DocumentEditor from '../components/documents/DocumentEditor';
import IdeaGenerator from '../components/ai/IdeaGenerator';
import AIInsights from '../components/ai/AIInsights';
import ParticipantsList from '../components/whiteboard/ParticipantsList';
import {
  Kanban,
  PenTool,
  MessageCircle,
  FileText,
  Lightbulb,
  BarChart3,
  Users,
  Settings,
  Share2,
  Star,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff
} from 'lucide-react';
import toast from 'react-hot-toast';

const Workspace = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentProject, fetchProject, isLoading } = useProject();
  const { 
    joinRoom, 
    leaveRoom, 
    isConnected, 
    getRoomParticipants,
    currentRoom 
  } = useSocket();

  // Local state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('kanban');
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [participants, setParticipants] = useState([]);

  // Workspace tabs configuration
  const tabs = [
    {
      id: 'kanban',
      label: 'Tasks',
      icon: Kanban,
      component: KanbanBoard,
      description: 'Manage project tasks with Kanban boards'
    },
    {
      id: 'whiteboard',
      label: 'Whiteboard',
      icon: PenTool,
      component: Whiteboard,
      description: 'Collaborate on visual brainstorming'
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      component: DocumentEditor,
      description: 'Create and edit shared documents'
    },
    {
      id: 'ideas',
      label: 'AI Ideas',
      icon: Lightbulb,
      component: IdeaGenerator,
      description: 'Generate ideas with AI assistance'
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: BarChart3,
      component: AIInsights,
      description: 'View AI-powered analytics'
    }
  ];

  // Fetch project data on mount
  useEffect(() => {
    if (projectId) {
      fetchProject(projectId).catch(err => {
        console.error('Failed to fetch project:', err);
        navigate('/projects');
      });
    }
  }, [projectId]);

  // Join project room when project loads
  useEffect(() => {
    if (currentProject && isConnected) {
      joinRoom(currentProject._id, 'project');
      
      return () => {
        leaveRoom(currentProject._id, 'project');
      };
    }
  }, [currentProject, isConnected, joinRoom, leaveRoom]);

  // Update participants list
  useEffect(() => {
    if (currentRoom) {
      const roomParticipants = getRoomParticipants(currentRoom);
      setParticipants(roomParticipants);
    }
  }, [currentRoom, getRoomParticipants]);

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Join specific room for the tab if needed
    if (currentProject) {
      const tabRoomType = tabId === 'whiteboard' ? 'whiteboard' : 'project';
      joinRoom(currentProject._id, tabRoomType);
    }
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Handle share project
  const handleShareProject = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: currentProject.name,
          text: currentProject.description,
          url: window.location.href,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Project link copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing project:', error);
      toast.error('Failed to share project');
    }
  };

  // Get active tab component
  const getActiveTabComponent = () => {
    const activeTabConfig = tabs.find(tab => tab.id === activeTab);
    if (!activeTabConfig || !currentProject) return null;

    const Component = activeTabConfig.component;
    return <Component projectId={currentProject._id} />;
  };

  // Loading state
  if (isLoading || !currentProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-8 w-8 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workspace...</p>
        </div>
      </div>
    );
  }

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
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Back button */}
              <button
                onClick={() => navigate('/projects')}
                className="p-2 text-gray-400 hover:text-gray-600 mr-3"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Project info */}
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {currentProject.name}
                </h1>
                <p className="text-sm text-gray-600">
                  {currentProject.description}
                </p>
              </div>

              {/* Project status badge */}
              <div className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                currentProject.status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : currentProject.status === 'completed'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
              }`}>
                {currentProject.status}
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center space-x-3">
              {/* Connection status */}
              <div className={`flex items-center px-2 py-1 rounded-full text-xs ${
                isConnected 
                  ? 'text-green-700 bg-green-100' 
                  : 'text-red-700 bg-red-100'
              }`}>
                {isConnected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>

              {/* Participants toggle */}
              <button
                onClick={() => setParticipantsOpen(!participantsOpen)}
                className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <Users className="h-4 w-4 mr-1" />
                {participants.length}
              </button>

              {/* Settings */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-lg ${soundEnabled ? 'text-gray-600' : 'text-gray-400'}`}
                  title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>

                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`p-2 rounded-lg ${notificationsEnabled ? 'text-gray-600' : 'text-gray-400'}`}
                  title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
                >
                  {notificationsEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 text-gray-600 hover:text-gray-900"
                  title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </button>
              </div>

              {/* Share button */}
              <button
                onClick={handleShareProject}
                className="btn-outline flex items-center"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>

              {/* More actions */}
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Workspace Tabs */}
        <div className="bg-white border-b border-gray-200">
          <nav className="px-6 flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                title={tab.description}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Workspace Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main content area */}
          <div className={`flex-1 ${chatOpen ? 'mr-80' : ''} ${participantsOpen ? 'ml-64' : ''}`}>
            <div className="h-full bg-white">
              {getActiveTabComponent()}
            </div>
          </div>

          {/* Participants Sidebar */}
          {participantsOpen && (
            <div className="w-64 bg-white border-r border-gray-200 fixed left-0 top-0 h-full z-40 pt-20">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Participants</h3>
                  <button
                    onClick={() => setParticipantsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>
                <ParticipantsList 
                  participants={participants}
                  currentUser={user}
                />
              </div>
            </div>
          )}

          {/* Chat Sidebar */}
          {chatOpen && (
            <div className="w-80 bg-white border-l border-gray-200 fixed right-0 top-0 h-full z-40 pt-20">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Project Chat</h3>
                    <button
                      onClick={() => setChatOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <ChatContainer 
                    projectId={currentProject._id}
                    compact={true}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Chat Toggle */}
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center z-30"
            title="Open chat"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        )}

        {/* Floating Participants Toggle */}
        {!participantsOpen && (
          <button
            onClick={() => setParticipantsOpen(true)}
            className="fixed bottom-6 left-6 w-12 h-12 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700 flex items-center justify-center z-30"
            title="Show participants"
          >
            <Users className="h-6 w-6" />
            {participants.length > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {participants.length}
              </span>
            )}
          </button>
        )}

        {/* Workspace Status Bar */}
        <div className="bg-gray-100 border-t border-gray-200 px-6 py-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Project: {currentProject.name}</span>
              <span>•</span>
              <span>Active tab: {tabs.find(t => t.id === activeTab)?.label}</span>
              <span>•</span>
              <span>{participants.length} participants online</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Last saved: just now</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workspace;