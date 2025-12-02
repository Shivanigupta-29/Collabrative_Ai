// frontend/src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [roomParticipants, setRoomParticipants] = useState(new Map());
  const [currentRoom, setCurrentRoom] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Socket server URL
  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user && !socket) {
      initializeSocket();
    } else if (!isAuthenticated && socket) {
      disconnectSocket();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isAuthenticated, user]);

  const initializeSocket = () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.error('No auth token found for socket connection');
      return;
    }

    try {
      // Create socket connection with authentication
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
        setIsConnected(true);
        setConnectionError(null);
        
        toast.success('Connected to real-time services');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        setIsConnected(false);
        
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, try to reconnect
          toast.error('Connection lost. Attempting to reconnect...');
          scheduleReconnect();
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        setConnectionError(error.message);
        setIsConnected(false);
        
        if (error.message.includes('Authentication')) {
          toast.error('Authentication failed. Please login again.');
        } else {
          toast.error('Connection failed. Retrying...');
          scheduleReconnect();
        }
      });

      // User presence events
      newSocket.on('user:online', (data) => {
        setOnlineUsers(prev => new Set([...prev, data.userId]));
      });

      newSocket.on('user:offline', (data) => {
        setOnlineUsers(prev => {
          const updated = new Set(prev);
          updated.delete(data.userId);
          return updated;
        });
      });

      // Room events
      newSocket.on('room:user_joined', (data) => {
        setRoomParticipants(prev => {
          const updated = new Map(prev);
          const roomParticipants = updated.get(data.roomId) || [];
          const exists = roomParticipants.find(p => p._id === data.user._id);
          
          if (!exists) {
            updated.set(data.roomId, [...roomParticipants, data.user]);
          }
          
          return updated;
        });
        
        toast.success(`${data.user.name} joined the session`);
      });

      newSocket.on('room:user_left', (data) => {
        setRoomParticipants(prev => {
          const updated = new Map(prev);
          const roomParticipants = updated.get(data.roomId) || [];
          const filtered = roomParticipants.filter(p => p._id !== data.userId);
          updated.set(data.roomId, filtered);
          return updated;
        });
      });

      newSocket.on('room:participants', (data) => {
        setRoomParticipants(prev => {
          const updated = new Map(prev);
          updated.set(data.roomId, data.participants);
          return updated;
        });
      });

      // Error handling
      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        toast.error(error.message || 'Real-time service error');
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

    } catch (error) {
      console.error('Failed to initialize socket:', error);
      setConnectionError(error.message);
      toast.error('Failed to connect to real-time services');
    }
  };

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setOnlineUsers(new Set());
      setRoomParticipants(new Map());
      setCurrentRoom(null);
      setConnectionError(null);
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    reconnectTimeoutRef.current = setTimeout(() => {
      if (isAuthenticated && user && !isConnected) {
        console.log('🔄 Attempting to reconnect socket...');
        disconnectSocket();
        initializeSocket();
      }
    }, 3000);
  };

  // Socket utility functions
  const joinRoom = (roomId, roomType = 'project') => {
    if (!socket || !isConnected) {
      toast.error('Not connected to real-time services');
      return false;
    }

    const fullRoomId = `${roomType}:${roomId}`;
    
    socket.emit('room:join', { roomId, roomType }, (response) => {
      if (response?.status === 'joined') {
        setCurrentRoom(fullRoomId);
        console.log(`✅ Joined room: ${fullRoomId}`);
      } else {
        toast.error('Failed to join room');
      }
    });

    return true;
  };

  const leaveRoom = (roomId, roomType = 'project') => {
    if (!socket || !isConnected) return;

    const fullRoomId = `${roomType}:${roomId}`;
    
    socket.emit('room:leave', { roomId, roomType });
    
    if (currentRoom === fullRoomId) {
      setCurrentRoom(null);
    }
    
    // Clear room participants
    setRoomParticipants(prev => {
      const updated = new Map(prev);
      updated.delete(fullRoomId);
      return updated;
    });

    console.log(`👋 Left room: ${fullRoomId}`);
  };

  const emitToRoom = (event, data) => {
    if (!socket || !isConnected) {
      toast.error('Not connected to real-time services');
      return false;
    }

    if (!currentRoom) {
      toast.error('Not in any room');
      return false;
    }

    socket.emit(event, { ...data, roomId: currentRoom });
    return true;
  };

  const startTyping = () => {
    if (socket && isConnected && currentRoom) {
      socket.emit('typing:start', { roomId: currentRoom });
    }
  };

  const stopTyping = () => {
    if (socket && isConnected && currentRoom) {
      socket.emit('typing:stop', { roomId: currentRoom });
    }
  };

  const updateActivity = (activity) => {
    if (socket && isConnected) {
      socket.emit('activity:update', { activity });
    }
  };

  // Event subscription helpers
  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
      return () => socket.off(event, callback);
    }
    return () => {};
  };

  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const emit = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
      return true;
    }
    return false;
  };

  // Get room participants
  const getRoomParticipants = (roomId) => {
    return roomParticipants.get(roomId) || [];
  };

  // Check if user is online
  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  // Force reconnect
  const reconnect = () => {
    disconnectSocket();
    setTimeout(() => {
      if (isAuthenticated && user) {
        initializeSocket();
      }
    }, 1000);
  };

  const value = {
    // Connection state
    socket,
    isConnected,
    connectionError,
    
    // User presence
    onlineUsers: Array.from(onlineUsers),
    roomParticipants,
    currentRoom,
    
    // Room management
    joinRoom,
    leaveRoom,
    getRoomParticipants,
    
    // Communication
    emitToRoom,
    startTyping,
    stopTyping,
    updateActivity,
    
    // Event management
    on,
    off,
    emit,
    
    // Utilities
    isUserOnline,
    reconnect,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  
  return context;
};

export default SocketContext;