// frontend/src/components/whiteboard/Whiteboard.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Canvas from './Canvas';
import Toolbar from './Toolbar';
import ParticipantsList from './ParticipantsList';
import Button from '../common/Button';
import Modal from '../common/Modal';
import {
  Save,
  Download,
  Upload,
  Share2,
  Undo,
  Redo,
  Trash2,
  ZoomIn,
  ZoomOut,
  Move,
  RotateCcw,
  Maximize,
  Minimize,
  Users,
  Eye,
  EyeOff,
  Settings,
  Grid,
  Image as ImageIcon,
  Copy,
  Lock,
  Unlock
} from 'lucide-react';
import toast from 'react-hot-toast';

const Whiteboard = ({ projectId }) => {
  const { user } = useAuth();
  const { socket, emit, on, off, joinRoom, leaveRoom } = useSocket();
  
  // Canvas state
  const [canvasElements, setCanvasElements] = useState([]);
  const [selectedElements, setSelectedElements] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [canvasSettings, setCanvasSettings] = useState({
    width: 1920,
    height: 1080,
    backgroundColor: '#ffffff',
    gridEnabled: true,
    snapToGrid: false,
    gridSize: 20
  });

  // Tool state
  const [activeTool, setActiveTool] = useState('pen');
  const [toolSettings, setToolSettings] = useState({
    strokeColor: '#000000',
    fillColor: '#ffffff',
    strokeWidth: 2,
    fontSize: 16,
    fontFamily: 'Arial',
    opacity: 1
  });

  // UI state
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [showParticipants, setShowParticipants] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [collaborators, setCollaborators] = useState([]);

  // Refs
  const whiteboardRef = useRef(null);
  const canvasRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Real-time collaboration state
  const [cursors, setCursors] = useState(new Map());
  const [activePaths, setActivePaths] = useState(new Map());

  // Initialize whiteboard
  useEffect(() => {
    if (projectId) {
      loadWhiteboard();
      joinWhiteboardRoom();
    }

    return () => {
      if (projectId) {
        leaveWhiteboardRoom();
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [projectId]);

  // Set up real-time listeners
  useEffect(() => {
    if (!socket) return;

    const handleDrawingUpdate = (data) => {
      if (data.userId !== user._id) {
        updateRemoteDrawing(data);
      }
    };

    const handleElementAdded = (data) => {
      if (data.userId !== user._id) {
        addRemoteElement(data.element);
      }
    };

    const handleElementUpdated = (data) => {
      if (data.userId !== user._id) {
        updateRemoteElement(data.element);
      }
    };

    const handleElementDeleted = (data) => {
      if (data.userId !== user._id) {
        removeRemoteElement(data.elementId);
      }
    };

    const handleCursorUpdate = (data) => {
      if (data.userId !== user._id) {
        setCursors(prev => new Map(prev.set(data.userId, {
          x: data.x,
          y: data.y,
          user: data.user
        })));
      }
    };

    const handleParticipantJoined = (data) => {
      setCollaborators(prev => [...prev.filter(c => c._id !== data.user._id), data.user]);
      toast.success(`${data.user.name} joined the whiteboard`);
    };

    const handleParticipantLeft = (data) => {
      setCollaborators(prev => prev.filter(c => c._id !== data.userId));
      setCursors(prev => {
        const newCursors = new Map(prev);
        newCursors.delete(data.userId);
        return newCursors;
      });
    };

    // Subscribe to events
    on('whiteboard:drawing', handleDrawingUpdate);
    on('whiteboard:element_added', handleElementAdded);
    on('whiteboard:element_updated', handleElementUpdated);
    on('whiteboard:element_deleted', handleElementDeleted);
    on('whiteboard:cursor', handleCursorUpdate);
    on('whiteboard:participant_joined', handleParticipantJoined);
    on('whiteboard:participant_left', handleParticipantLeft);

    return () => {
      off('whiteboard:drawing', handleDrawingUpdate);
      off('whiteboard:element_added', handleElementAdded);
      off('whiteboard:element_updated', handleElementUpdated);
      off('whiteboard:element_deleted', handleElementDeleted);
      off('whiteboard:cursor', handleCursorUpdate);
      off('whiteboard:participant_joined', handleParticipantJoined);
      off('whiteboard:participant_left', handleParticipantLeft);
    };
  }, [socket, user._id, on, off]);

  // Auto-save functionality
  useEffect(() => {
    if (canvasElements.length > 0) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        saveWhiteboard();
      }, 2000); // Auto-save after 2 seconds of inactivity
    }
  }, [canvasElements]);

  // Join whiteboard room
  const joinWhiteboardRoom = () => {
    joinRoom(projectId, 'whiteboard');
  };

  // Leave whiteboard room
  const leaveWhiteboardRoom = () => {
    leaveRoom(projectId, 'whiteboard');
  };

  // Load whiteboard data
  const loadWhiteboard = async () => {
    try {
      // Mock loading - replace with actual API call
      // const whiteboardData = await whiteboardService.getWhiteboard(projectId);
      const mockData = {
        elements: [],
        settings: canvasSettings,
        collaborators: []
      };
      
      setCanvasElements(mockData.elements);
      setCanvasSettings(mockData.settings);
      setCollaborators(mockData.collaborators);
      
      // Initialize history
      setHistory([mockData.elements]);
      setHistoryIndex(0);
    } catch (error) {
      console.error('Failed to load whiteboard:', error);
      toast.error('Failed to load whiteboard');
    }
  };

  // Save whiteboard data
  const saveWhiteboard = async () => {
    try {
      // Mock saving - replace with actual API call
      // await whiteboardService.saveWhiteboard(projectId, {
      //   elements: canvasElements,
      //   settings: canvasSettings
      // });
      
      // Emit save event for real-time sync
      emit('whiteboard:save', {
        projectId,
        elements: canvasElements,
        settings: canvasSettings,
        userId: user._id
      });
    } catch (error) {
      console.error('Failed to save whiteboard:', error);
      toast.error('Failed to save whiteboard');
    }
  };

  // Add element to canvas
  const addElement = useCallback((element) => {
    const newElement = {
      ...element,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdBy: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setCanvasElements(prev => {
      const newElements = [...prev, newElement];
      // Update history
      setHistory(prevHistory => [...prevHistory.slice(0, historyIndex + 1), newElements]);
      setHistoryIndex(prev => prev + 1);
      return newElements;
    });

    // Emit to collaborators
    emit('whiteboard:element_added', {
      projectId,
      element: newElement,
      userId: user._id,
      user
    });
  }, [user._id, user, historyIndex, emit, projectId]);

  // Update element
  const updateElement = useCallback((elementId, updates) => {
    setCanvasElements(prev => {
      const newElements = prev.map(el => 
        el.id === elementId 
          ? { ...el, ...updates, updatedAt: Date.now() }
          : el
      );
      
      // Update history for significant changes
      if (updates.x !== undefined || updates.y !== undefined || updates.width !== undefined) {
        setHistory(prevHistory => [...prevHistory.slice(0, historyIndex + 1), newElements]);
        setHistoryIndex(prev => prev + 1);
      }
      
      return newElements;
    });

    // Emit to collaborators
    emit('whiteboard:element_updated', {
      projectId,
      element: { id: elementId, ...updates },
      userId: user._id,
      user
    });
  }, [user._id, user, historyIndex, emit, projectId]);

  // Delete element
  const deleteElement = useCallback((elementId) => {
    setCanvasElements(prev => {
      const newElements = prev.filter(el => el.id !== elementId);
      setHistory(prevHistory => [...prevHistory.slice(0, historyIndex + 1), newElements]);
      setHistoryIndex(prev => prev + 1);
      return newElements;
    });

    // Emit to collaborators
    emit('whiteboard:element_deleted', {
      projectId,
      elementId,
      userId: user._id,
      user
    });
  }, [user._id, user, historyIndex, emit, projectId]);

  // Handle remote drawing updates
  const updateRemoteDrawing = (data) => {
    if (data.type === 'start') {
      setActivePaths(prev => new Map(prev.set(data.userId, {
        points: [data.point],
        tool: data.tool,
        settings: data.settings,
        user: data.user
      })));
    } else if (data.type === 'continue') {
      setActivePaths(prev => {
        const newPaths = new Map(prev);
        const existingPath = newPaths.get(data.userId);
        if (existingPath) {
          newPaths.set(data.userId, {
            ...existingPath,
            points: [...existingPath.points, data.point]
          });
        }
        return newPaths;
      });
    } else if (data.type === 'end') {
      setActivePaths(prev => {
        const newPaths = new Map(prev);
        newPaths.delete(data.userId);
        return newPaths;
      });
    }
  };

  // Add remote element
  const addRemoteElement = (element) => {
    setCanvasElements(prev => [...prev, element]);
  };

  // Update remote element
  const updateRemoteElement = (elementUpdate) => {
    setCanvasElements(prev => 
      prev.map(el => 
        el.id === elementUpdate.id 
          ? { ...el, ...elementUpdate }
          : el
      )
    );
  };

  // Remove remote element
  const removeRemoteElement = (elementId) => {
    setCanvasElements(prev => prev.filter(el => el.id !== elementId));
  };

  // Undo action
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCanvasElements(history[newIndex]);
      
      emit('whiteboard:undo', {
        projectId,
        elements: history[newIndex],
        userId: user._id,
        user
      });
    }
  }, [historyIndex, history, user._id, user, emit, projectId]);

  // Redo action
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCanvasElements(history[newIndex]);
      
      emit('whiteboard:redo', {
        projectId,
        elements: history[newIndex],
        userId: user._id,
        user
      });
    }
  }, [historyIndex, history, user._id, user, emit, projectId]);

  // Clear canvas
  const clearCanvas = () => {
    if (window.confirm('Are you sure you want to clear the entire canvas? This action cannot be undone.')) {
      setCanvasElements([]);
      setHistory([[]]);
      setHistoryIndex(0);
      
      emit('whiteboard:clear', {
        projectId,
        userId: user._id,
        user
      });
      
      toast.success('Canvas cleared');
    }
  };

  // Export canvas
  const exportCanvas = async (format = 'png') => {
    try {
      if (canvasRef.current) {
        const canvas = canvasRef.current.getCanvas();
        const link = document.createElement('a');
        link.download = `whiteboard-${projectId}-${Date.now()}.${format}`;
        link.href = canvas.toDataURL(`image/${format}`);
        link.click();
        
        toast.success('Whiteboard exported successfully');
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export whiteboard');
    }
  };

  // Import image
  const importImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const element = {
          type: 'image',
          x: 50,
          y: 50,
          width: Math.min(img.width, 500),
          height: Math.min(img.height, 500),
          src: e.target.result,
          opacity: 1
        };
        addElement(element);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Zoom functions
  const zoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  };

  const resetZoom = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Handle cursor movement
  const handleMouseMove = useCallback((e) => {
    if (!socket || !whiteboardRef.current) return;

    const rect = whiteboardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - panOffset.x;
    const y = (e.clientY - rect.top) / zoom - panOffset.y;

    // Throttle cursor updates
    clearTimeout(handleMouseMove.throttleTimer);
    handleMouseMove.throttleTimer = setTimeout(() => {
      emit('whiteboard:cursor', {
        projectId,
        x,
        y,
        userId: user._id,
        user
      });
    }, 50);
  }, [socket, zoom, panOffset, emit, projectId, user._id, user]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      whiteboardRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      ref={whiteboardRef}
      className="h-full flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          {/* Left side - Tools */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={undo}
              disabled={historyIndex <= 0 || isReadOnly}
              variant="outline"
              size="small"
              leftIcon={<Undo className="h-4 w-4" />}
              title="Undo (Ctrl+Z)"
            >
              Undo
            </Button>
            
            <Button
              onClick={redo}
              disabled={historyIndex >= history.length - 1 || isReadOnly}
              variant="outline"
              size="small"
              leftIcon={<Redo className="h-4 w-4" />}
              title="Redo (Ctrl+Y)"
            >
              Redo
            </Button>
            
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
            
            <Button
              onClick={zoomOut}
              variant="outline"
              size="small"
              leftIcon={<ZoomOut className="h-4 w-4" />}
              title="Zoom Out"
            />
            
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-16 text-center">
              {Math.round(zoom * 100)}%
            </span>
            
            <Button
              onClick={zoomIn}
              variant="outline"
              size="small"
              leftIcon={<ZoomIn className="h-4 w-4" />}
              title="Zoom In"
            />
            
            <Button
              onClick={resetZoom}
              variant="outline"
              size="small"
              leftIcon={<Move className="h-4 w-4" />}
              title="Reset View"
            />
          </div>

          {/* Center - Canvas info */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {canvasElements.length} elements
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                socket ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {collaborators.length + 1} online
              </span>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowGrid(!showGrid)}
              variant={showGrid ? 'primary' : 'outline'}
              size="small"
              leftIcon={<Grid className="h-4 w-4" />}
              title="Toggle Grid"
            />
            
            <Button
              onClick={() => setShowParticipants(!showParticipants)}
              variant={showParticipants ? 'primary' : 'outline'}
              size="small"
              leftIcon={<Users className="h-4 w-4" />}
              title="Toggle Participants"
            />
            
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
            
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files[0] && importImage(e.target.files[0])}
              className="hidden"
              id="import-image"
            />
            <Button
              onClick={() => document.getElementById('import-image')?.click()}
              variant="outline"
              size="small"
              leftIcon={<Upload className="h-4 w-4" />}
              title="Import Image"
            />
            
            <Button
              onClick={() => exportCanvas('png')}
              variant="outline"
              size="small"
              leftIcon={<Download className="h-4 w-4" />}
              title="Export as PNG"
            />
            
            <Button
              onClick={toggleFullscreen}
              variant="outline"
              size="small"
              leftIcon={isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              title="Toggle Fullscreen"
            />
            
            <Button
              onClick={clearCanvas}
              disabled={isReadOnly}
              variant="outline"
              size="small"
              leftIcon={<Trash2 className="h-4 w-4" />}
              className="text-red-600 hover:text-red-700"
              title="Clear Canvas"
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar */}
        <div className="flex-shrink-0">
          <Toolbar
            activeTool={activeTool}
            onToolChange={setActiveTool}
            toolSettings={toolSettings}
            onToolSettingsChange={setToolSettings}
            disabled={isReadOnly}
          />
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <Canvas
            ref={canvasRef}
            elements={canvasElements}
            selectedElements={selectedElements}
            onElementsChange={setCanvasElements}
            onSelectionChange={setSelectedElements}
            activeTool={activeTool}
            toolSettings={toolSettings}
            zoom={zoom}
            panOffset={panOffset}
            onPanOffsetChange={setPanOffset}
            showGrid={showGrid}
            gridSize={canvasSettings.gridSize}
            canvasSettings={canvasSettings}
            onAddElement={addElement}
            onUpdateElement={updateElement}
            onDeleteElement={deleteElement}
            cursors={cursors}
            activePaths={activePaths}
            disabled={isReadOnly}
            className="w-full h-full"
          />
        </div>

        {/* Participants panel */}
        {showParticipants && (
          <div className="flex-shrink-0 w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
            <ParticipantsList
              participants={collaborators}
              currentUser={user}
              cursors={cursors}
              onUserClick={(userId) => {
                // Focus on user's cursor
                const cursor = cursors.get(userId);
                if (cursor) {
                  setPanOffset({ x: -cursor.x + 200, y: -cursor.y + 200 });
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Template Modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="Choose Template"
        size="large"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6">
          {/* Template options would go here */}
          <div className="text-center text-gray-500 dark:text-gray-400">
            Templates coming soon...
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Whiteboard;