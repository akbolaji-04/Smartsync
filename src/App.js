import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  MousePointer2, 
  Square, 
  Circle, 
  Type, 
  StickyNote, 
  Users, 
  Save, 
  Undo, 
  Redo,
  Sparkles,
  Share,
  Download,
  Move,
  Trash2,
  Bot,
  Image,
  ArrowRight,
  Palette,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Upload,
  Settings,
  LogOut,
  User,
  Eye,
  Edit3,
  MessageCircle,
  Bell
} from 'lucide-react';

// Firebase configuration (replace with your config)
const firebaseConfig = {
 apiKey: "AIzaSyASLkMgK8YJlSglFK2AXYTtocDRGhn8xhI",
  authDomain: "interactive-whiteboard-fce32.firebaseapp.com",
  projectId: "interactive-whiteboard-fce32",
  storageBucket: "interactive-whiteboard-fce32.firebasestorage.app",
  messagingSenderId: "976692464671",
  appId: "1:976692464671:web:6d2e12aa95e186c56f992a",
  measurementId: "G-480CRN2SN6"
};

// Mock Firebase auth (replace with actual Firebase)
const mockAuth = {
  currentUser: {
    uid: 'user123',
    email: 'user@example.com',
    displayName: 'John Doe',
    photoURL: 'https://via.placeholder.com/40'
  },
  signOut: () => console.log('Sign out'),
  signInWithPopup: () => console.log('Sign in')
};

// Enhanced WebSocket mock (replace with actual Socket.io)
class MockWebSocket {
  constructor() {
    this.listeners = {};
    this.connected = true;
  }
  
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }
  
  emit(event, data) {
    console.log(`Emitting ${event}:`, data);
    // Simulate real-time updates
    setTimeout(() => {
      if (this.listeners[event]) {
        this.listeners[event].forEach(callback => callback(data));
      }
    }, 100);
  }
  
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }
}

// Enhanced AI suggestions with more intelligence
const generateSmartSuggestions = (elements, boardContext) => {
  const suggestions = [];
  const stickyNotes = elements.filter(el => el.type === 'sticky');
  const textElements = elements.filter(el => el.type === 'text');
  const shapes = elements.filter(el => ['rectangle', 'circle'].includes(el.type));
  
  // Content analysis
  if (stickyNotes.length > 3) {
    suggestions.push({
      type: 'organize',
      title: 'Auto-organize sticky notes',
      description: `Group ${stickyNotes.length} sticky notes by similarity`,
      action: 'group-stickies',
      priority: 'high'
    });
  }
  
  if (elements.length > 10) {
    suggestions.push({
      type: 'workflow',
      title: 'Create workflow diagram',
      description: 'Convert elements into a structured workflow',
      action: 'create-workflow',
      priority: 'medium'
    });
  }
  
  if (textElements.some(el => el.content.toLowerCase().includes('todo') || el.content.toLowerCase().includes('task'))) {
    suggestions.push({
      type: 'action',
      title: 'Extract action items',
      description: 'Found potential tasks - create action item list',
      action: 'extract-tasks',
      priority: 'high'
    });
  }
  
  suggestions.push({
    type: 'enhance',
    title: 'Add visual connections',
    description: 'Connect related elements with arrows',
    action: 'add-arrows',
    priority: 'low'
  });
  
  return suggestions;
};

// Virtualization for large canvases
const useCanvasVirtualization = (elements, viewport) => {
  return useMemo(() => {
    const buffer = 100; // Render buffer around viewport
    return elements.filter(element => {
      return element.x + (element.width || 100) >= viewport.x - buffer &&
             element.x <= viewport.x + viewport.width + buffer &&
             element.y + (element.height || 100) >= viewport.y - buffer &&
             element.y <= viewport.y + viewport.height + buffer;
    });
  }, [elements, viewport]);
};

// Enhanced collaborative cursors
const CollaborativeCursors = ({ users, currentUser }) => {
  return (
    <>
      {users.filter(user => user.id !== currentUser?.uid).map(user => (
        <div
          key={user.id}
          className="absolute pointer-events-none z-50 transition-all duration-75"
          style={{
            left: user.cursor.x,
            top: user.cursor.y,
            transform: 'translate(-2px, -2px)'
          }}
        >
          <div className="flex items-center space-x-1">
            <div 
              className="w-4 h-4 border-2 border-white rounded-full shadow-lg"
              style={{ backgroundColor: user.color }}
            />
            <div 
              className="px-2 py-1 rounded text-xs text-white shadow-lg whitespace-nowrap"
              style={{ backgroundColor: user.color }}
            >
              {user.name}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

// Color palette component
const ColorPalette = ({ selectedColor, onColorSelect, show, onClose }) => {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6B7280'
  ];
  
  if (!show) return null;
  
  return (
    <div className="absolute top-12 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
      <div className="grid grid-cols-5 gap-2">
        {colors.map(color => (
          <button
            key={color}
            className={`w-8 h-8 rounded border-2 ${selectedColor === color ? 'border-gray-900' : 'border-gray-300'}`}
            style={{ backgroundColor: color }}
            onClick={() => {
              onColorSelect(color);
              onClose();
            }}
          />
        ))}
      </div>
    </div>
  );
};

const SmartSync = () => {
  // Core state
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [tool, setTool] = useState('select');
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedElements, setSelectedElements] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // UI state
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [currentColor, setCurrentColor] = useState('#3B82F6');
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [viewport, setViewport] = useState({ x: 0, y: 0, width: 1200, height: 800 });
  
  // History and collaboration
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [boardTitle, setBoardTitle] = useState('Untitled Board');
  const [collaborators, setCollaborators] = useState([
    { id: 'user1', name: 'Alice Chen', color: '#3B82F6', cursor: { x: 200, y: 150 }, isActive: true },
    { id: 'user2', name: 'Bob Smith', color: '#EF4444', cursor: { x: 400, y: 300 }, isActive: true },
    { id: 'user3', name: 'Carol Davis', color: '#10B981', cursor: { x: 600, y: 200 }, isActive: false }
  ]);
  
  // Real-time and AI
  const [socket] = useState(() => new MockWebSocket());
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  
  // Authentication
  const [user] = useState(mockAuth.currentUser);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Canvas virtualization
  const visibleElements = useCanvasVirtualization(elements, viewport);
  
  // WebSocket connection effect
  useEffect(() => {
    socket.on('element-updated', (data) => {
      setElements(prev => prev.map(el => 
        el.id === data.id ? { ...el, ...data } : el
      ));
    });
    
    socket.on('cursor-moved', (data) => {
      setCollaborators(prev => prev.map(user => 
        user.id === data.userId ? { ...user, cursor: data.cursor } : user
      ));
    });
    
    socket.on('user-joined', (userData) => {
      setCollaborators(prev => [...prev, userData]);
    });
    
    socket.on('user-left', (userId) => {
      setCollaborators(prev => prev.filter(user => user.id !== userId));
    });
    
    return () => {
      socket.off('element-updated');
      socket.off('cursor-moved');
      socket.off('user-joined');
      socket.off('user-left');
    };
  }, [socket]);
  
  // AI suggestions update
  useEffect(() => {
    const suggestions = generateSmartSuggestions(elements, { boardTitle });
    setAiSuggestions(suggestions);
  }, [elements, boardTitle]);
  
  // Enhanced element creation
  const createElement = useCallback((type, x, y, additionalProps = {}) => {
    const baseElement = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      x,
      y,
      timestamp: Date.now(),
      userId: user?.uid || 'anonymous',
      color: currentColor,
      ...additionalProps
    };
    
    const typeDefaults = {
      rectangle: { width: 120, height: 80, borderColor: currentColor, fill: 'transparent' },
      circle: { width: 100, height: 100, borderColor: currentColor, fill: 'transparent' },
      text: { 
        width: 200, 
        height: 40, 
        content: 'Double-click to edit',
        fontSize: 16,
        fontFamily: 'Inter, sans-serif',
        backgroundColor: 'white',
        borderColor: '#E5E7EB'
      },
      sticky: {
        width: 180,
        height: 120,
        content: 'New sticky note',
        backgroundColor: '#FEF3C7',
        borderColor: '#F59E0B',
        fontSize: 14
      },
      arrow: {
        width: 2,
        height: 100,
        startX: x,
        startY: y,
        endX: x + 100,
        endY: y,
        strokeWidth: 2
      }
    };
    
    return { ...baseElement, ...typeDefaults[type] };
  }, [currentColor, user]);
  
  // Enhanced mouse handlers
  const handleMouseDown = useCallback((e) => {
    if (e.target !== canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - panOffset.x) / zoom;
    const y = (e.clientY - rect.top - panOffset.y) / zoom;
    
    if (tool === 'select') {
      const clickedElement = elements.find(el => 
        x >= el.x && x <= el.x + (el.width || 100) &&
        y >= el.y && y <= el.y + (el.height || 100)
      );
      
      if (clickedElement) {
        setSelectedElement(clickedElement);
        setSelectedElements([clickedElement]);
        setDragOffset({ x: x - clickedElement.x, y: y - clickedElement.y });
      } else {
        setSelectedElement(null);
        setSelectedElements([]);
      }
    } else if (tool !== 'pan') {
      const newElement = createElement(tool, x, y);
      setElements(prev => {
        const newElements = [...prev, newElement];
        socket.emit('element-created', newElement);
        return newElements;
      });
      setTool('select');
    }
    
    setIsDrawing(true);
  }, [tool, elements, panOffset, zoom, createElement, socket]);
  
  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = (e.clientX - rect.left - panOffset.x) / zoom;
    const y = (e.clientY - rect.top - panOffset.y) / zoom;
    
    // Emit cursor position for real-time collaboration
    socket.emit('cursor-move', { 
      userId: user?.uid, 
      cursor: { x: e.clientX - rect.left, y: e.clientY - rect.top }
    });
    
    if (selectedElement && isDrawing && tool === 'select') {
      const newX = x - dragOffset.x;
      const newY = y - dragOffset.y;
      
      setElements(prev => prev.map(el => 
        el.id === selectedElement.id 
          ? { ...el, x: newX, y: newY }
          : el
      ));
      
      socket.emit('element-updated', { 
        id: selectedElement.id, 
        x: newX, 
        y: newY 
      });
    }
  }, [selectedElement, isDrawing, tool, dragOffset, panOffset, zoom, socket, user]);
  
  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, []);
  
  // Zoom and pan controls
  const handleZoom = useCallback((delta) => {
    setZoom(prev => Math.max(0.1, Math.min(3, prev + delta)));
  }, []);
  
  const resetView = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);
  
  // AI-powered actions
  const executeAIAction = useCallback(async (action) => {
    setIsAiProcessing(true);
    
    try {
      switch (action) {
        case 'group-stickies':
          const stickyNotes = elements.filter(el => el.type === 'sticky');
          // Simulate AI grouping logic
          const groups = {};
          stickyNotes.forEach((sticky, index) => {
            const groupId = Math.floor(index / 3);
            if (!groups[groupId]) groups[groupId] = [];
            groups[groupId].push(sticky);
          });
          
          Object.values(groups).forEach((group, groupIndex) => {
            group.forEach((sticky, index) => {
              const newX = 100 + (groupIndex * 250);
              const newY = 100 + (index * 140);
              setElements(prev => prev.map(el => 
                el.id === sticky.id ? { ...el, x: newX, y: newY } : el
              ));
            });
          });
          break;
          
        case 'extract-tasks':
          const taskElements = elements.filter(el => 
            el.content?.toLowerCase().includes('todo') || 
            el.content?.toLowerCase().includes('task')
          );
          
          taskElements.forEach((task, index) => {
            const actionItem = createElement('sticky', 800, 100 + (index * 140), {
              content: `Action: ${task.content}`,
              backgroundColor: '#DCFCE7',
              borderColor: '#16A34A'
            });
            setElements(prev => [...prev, actionItem]);
          });
          break;
          
        default:
          console.log('AI action not implemented:', action);
      }
    } catch (error) {
      console.error('AI action failed:', error);
    } finally {
      setIsAiProcessing(false);
    }
  }, [elements, createElement]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              // Redo
              if (historyIndex < history.length - 1) {
                setHistoryIndex(prev => prev + 1);
                setElements(history[historyIndex + 1]);
              }
            } else {
              // Undo
              if (historyIndex > 0) {
                setHistoryIndex(prev => prev - 1);
                setElements(history[historyIndex - 1]);
              }
            }
            break;
          case 's':
            e.preventDefault();
            console.log('Save board');
            break;
          case 'd':
            e.preventDefault();
            if (selectedElement) {
              setElements(prev => prev.filter(el => el.id !== selectedElement.id));
              setSelectedElement(null);
            }
            break;
        }
      }
      
      // Tool shortcuts
      switch (e.key) {
        case 'v': setTool('select'); break;
        case 'r': setTool('rectangle'); break;
        case 'c': setTool('circle'); break;
        case 't': setTool('text'); break;
        case 's': setTool('sticky'); break;
        case 'Escape': 
          setSelectedElement(null);
          setSelectedElements([]);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, historyIndex, history]);
  
  // Render element with enhanced styling
  const renderElement = useCallback((element) => {
    const isSelected = selectedElement?.id === element.id;
    const selectionStyle = isSelected ? {
      boxShadow: '0 0 0 2px #3B82F6, 0 0 0 4px rgba(59, 130, 246, 0.2)',
      transform: 'scale(1.02)'
    } : {};
    
    const baseStyle = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      cursor: tool === 'select' ? 'move' : 'default',
      transition: 'all 0.1s ease',
      zIndex: isSelected ? 10 : 1,
      ...selectionStyle
    };
    
    switch (element.type) {
      case 'rectangle':
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              width: element.width,
              height: element.height,
              backgroundColor: element.fill || 'transparent',
              border: `2px solid ${element.borderColor}`,
              borderRadius: '8px'
            }}
          />
        );
      
      case 'circle':
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              width: element.width,
              height: element.height,
              backgroundColor: element.fill || 'transparent',
              border: `2px solid ${element.borderColor}`,
              borderRadius: '50%'
            }}
          />
        );
      
      case 'text':
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              minWidth: element.width,
              minHeight: element.height,
              padding: '12px',
              fontSize: element.fontSize,
              fontFamily: element.fontFamily,
              backgroundColor: element.backgroundColor,
              border: `1px solid ${element.borderColor}`,
              borderRadius: '8px',
              outline: 'none',
              resize: 'both',
              overflow: 'auto'
            }}
            contentEditable={isSelected}
            suppressContentEditableWarning={true}
            onBlur={(e) => {
              if (isSelected) {
                const newContent = e.target.textContent;
                setElements(prev => prev.map(el => 
                  el.id === element.id ? { ...el, content: newContent } : el
                ));
                socket.emit('element-updated', { id: element.id, content: newContent });
              }
            }}
          >
            {element.content}
          </div>
        );
      
      case 'sticky':
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              width: element.width,
              height: element.height,
              backgroundColor: element.backgroundColor,
              border: `2px solid ${element.borderColor}`,
              borderRadius: '12px',
              padding: '16px',
              fontSize: element.fontSize,
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              display: 'flex',
              alignItems: 'flex-start',
              wordWrap: 'break-word',
              overflow: 'hidden'
            }}
            contentEditable={isSelected}
            suppressContentEditableWarning={true}
            onBlur={(e) => {
              if (isSelected) {
                const newContent = e.target.textContent;
                setElements(prev => prev.map(el => 
                  el.id === element.id ? { ...el, content: newContent } : el
                ));
                socket.emit('element-updated', { id: element.id, content: newContent });
              }
            }}
          >
            {element.content}
          </div>
        );
      
      default:
        return null;
    }
  }, [selectedElement, tool, socket]);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">SmartSync</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={boardTitle}
              onChange={(e) => setBoardTitle(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Board title"
            />
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Auto-saved</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Zoom controls */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleZoom(-0.1)}
              className="p-1 hover:bg-white rounded transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-sm font-medium min-w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.1)}
              className="p-1 hover:bg-white rounded transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={resetView}
              className="p-1 hover:bg-white rounded transition-colors"
              title="Reset view"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
          
          {/* Collaborators */}
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-500" />
            <div className="flex -space-x-2">
              {collaborators.slice(0, 3).map(collaborator => (
                <div
                  key={collaborator.id}
                  className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium relative ${collaborator.isActive ? 'ring-2 ring-green-400' : ''}`}
                  style={{ backgroundColor: collaborator.color }}
                  title={collaborator.name}
                >
                  {collaborator.name.charAt(0)}
                  {collaborator.isActive && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
              ))}
              {collaborators.length > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-500 flex items-center justify-center text-white text-xs font-medium">
                  +{collaborators.length - 3}
                </div>
              )}
            </div>
          </div>
          
          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <img
                src={user?.photoURL || 'https://via.placeholder.com/32'}
                alt={user?.displayName}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium text-gray-700">{user?.displayName}</span>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-900">{user?.displayName}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Share className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Enhanced Toolbar */}
        <div className="bg-white border-r border-gray-200 flex flex-col w-16 shadow-sm">
          <div className="p-4 space-y-2">
            {/* Selection tools */}
            <button
              onClick={() => setTool('select')}
              className={`p-3 rounded-xl transition-all duration-200 ${tool === 'select' ? 'bg-blue-100 text-blue-600 shadow-sm' : 'hover:bg-gray-100'}`}
              title="Select (V)"
            >
              <MousePointer2 className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setTool('pan')}
              className={`p-3 rounded-xl transition-all duration-200 ${tool === 'pan' ? 'bg-blue-100 text-blue-600 shadow-sm' : 'hover:bg-gray-100'}`}
              title="Pan"
            >
              <Move className="w-5 h-5" />
            </button>
            
            <div className="border-t border-gray-200 my-2"></div>
            
            {/* Shape tools */}
            <button
              onClick={() => setTool('rectangle')}
              className={`p-3 rounded-xl transition-all duration-200 ${tool === 'rectangle' ? 'bg-blue-100 text-blue-600 shadow-sm' : 'hover:bg-gray-100'}`}
              title="Rectangle (R)"
            >
              <Square className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setTool('circle')}
              className={`p-3 rounded-xl transition-all duration-200 ${tool === 'circle' ? 'bg-blue-100 text-blue-600 shadow-sm' : 'hover:bg-gray-100'}`}
              title="Circle (C)"
            >
              <Circle className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setTool('arrow')}
              className={`p-3 rounded-xl transition-all duration-200 ${tool === 'arrow' ? 'bg-blue-100 text-blue-600 shadow-sm' : 'hover:bg-gray-100'}`}
              title="Arrow"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <div className="border-t border-gray-200 my-2"></div>
            
            {/* Content tools */}
            <button
              onClick={() => setTool('text')}
              className={`p-3 rounded-xl transition-all duration-200 ${tool === 'text' ? 'bg-blue-100 text-blue-600 shadow-sm' : 'hover:bg-gray-100'}`}
              title="Text (T)"
            >
              <Type className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setTool('sticky')}
              className={`p-3 rounded-xl transition-all duration-200 ${tool === 'sticky' ? 'bg-blue-100 text-blue-600 shadow-sm' : 'hover:bg-gray-100'}`}
              title="Sticky Note (S)"
            >
              <StickyNote className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setTool('image')}
              className={`p-3 rounded-xl transition-all duration-200 ${tool === 'image' ? 'bg-blue-100 text-blue-600 shadow-sm' : 'hover:bg-gray-100'}`}
              title="Image"
            >
              <Image className="w-5 h-5" />
            </button>
            
            <div className="border-t border-gray-200 my-2"></div>
            
            {/* Color picker */}
            <div className="relative">
              <button
                onClick={() => setShowColorPalette(!showColorPalette)}
                className="p-3 rounded-xl hover:bg-gray-100 transition-all duration-200"
                title="Colors"
              >
                <div className="w-5 h-5 rounded border-2 border-gray-300" style={{ backgroundColor: currentColor }}>
                  <Palette className="w-3 h-3 text-white opacity-0 hover:opacity-100 transition-opacity" />
                </div>
              </button>
              <ColorPalette 
                selectedColor={currentColor}
                onColorSelect={setCurrentColor}
                show={showColorPalette}
                onClose={() => setShowColorPalette(false)}
              />
            </div>
          </div>
          
          <div className="border-t border-gray-200 p-4 space-y-2 mt-auto">
            {/* History controls */}
            <button
              onClick={() => {
                if (historyIndex > 0) {
                  setHistoryIndex(prev => prev - 1);
                  setElements(history[historyIndex - 1]);
                }
              }}
              disabled={historyIndex <= 0}
              className="p-3 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => {
                if (historyIndex < history.length - 1) {
                  setHistoryIndex(prev => prev + 1);
                  setElements(history[historyIndex + 1]);
                }
              }}
              disabled={historyIndex >= history.length - 1}
              className="p-3 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => {
                if (selectedElement) {
                  setElements(prev => prev.filter(el => el.id !== selectedElement.id));
                  setSelectedElement(null);
                  socket.emit('element-deleted', selectedElement.id);
                }
              }}
              disabled={!selectedElement}
              className="p-3 rounded-xl hover:bg-red-100 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              title="Delete (Del)"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            
            <div className="border-t border-gray-200 my-2"></div>
            
            {/* AI Assistant toggle */}
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className={`p-3 rounded-xl transition-all duration-200 ${showAIPanel ? 'bg-purple-100 text-purple-600 shadow-sm' : 'hover:bg-gray-100'}`}
              title="AI Assistant"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Enhanced Canvas Area */}
        <div className="flex-1 relative overflow-hidden bg-white">
          <div
            ref={containerRef}
            className="w-full h-full relative"
            style={{
              transform: `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
              transformOrigin: '0 0'
            }}
          >
            <div
              ref={canvasRef}
              className="w-full h-full relative cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              style={{
                backgroundImage: `
                  radial-gradient(circle, #e5e7eb 1px, transparent 1px),
                  radial-gradient(circle, #f3f4f6 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px, 4px 4px',
                backgroundPosition: '0 0, 10px 10px'
              }}
            >
              {/* Render virtualized elements */}
              {visibleElements.map(renderElement)}
              
              {/* Collaborative cursors */}
              <CollaborativeCursors users={collaborators} currentUser={user} />
              
              {/* Selection info */}
              {selectedElement && (
                <div className="absolute top-4 left-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg backdrop-blur-sm bg-opacity-95">
                  <div className="flex items-center space-x-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded border"
                      style={{ backgroundColor: selectedElement.color || '#3B82F6' }}
                    />
                    <div className="text-sm font-medium text-gray-900 capitalize">
                      {selectedElement.type}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Position: {Math.round(selectedElement.x)}, {Math.round(selectedElement.y)}</div>
                    <div>Size: {selectedElement.width} × {selectedElement.height}</div>
                    {selectedElement.userId && (
                      <div>Created by: {collaborators.find(u => u.id === selectedElement.userId)?.name || 'Unknown'}</div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Multi-select indicator */}
              {selectedElements.length > 1 && (
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium">
                  {selectedElements.length} elements selected
                </div>
              )}
            </div>
          </div>
          
          {/* Floating action button for quick tools */}
          <div className="absolute bottom-6 right-6 flex flex-col space-y-2">
            <button
              onClick={() => {
                const center = { 
                  x: viewport.width / 2, 
                  y: viewport.height / 2 
                };
                const newSticky = createElement('sticky', center.x, center.y, {
                  content: 'Quick note',
                  backgroundColor: '#FEF3C7'
                });
                setElements(prev => [...prev, newSticky]);
              }}
              className="w-12 h-12 bg-yellow-500 text-white rounded-full shadow-lg hover:bg-yellow-600 transition-all duration-200 hover:scale-110 flex items-center justify-center"
              title="Quick sticky note"
            >
              <StickyNote className="w-6 h-6" />
            </button>
            
            <button
              onClick={() => setShowAIPanel(true)}
              className="w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all duration-200 hover:scale-110 flex items-center justify-center"
              title="Ask AI"
            >
              <Bot className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Enhanced AI Panel */}
        {showAIPanel && (
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-lg">
            {/* AI Panel Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                </div>
                <button
                  onClick={() => setShowAIPanel(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Smart suggestions based on your board content
              </p>
            </div>
            
            {/* AI Panel Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Smart Suggestions */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Smart Suggestions</span>
                  {isAiProcessing && (
                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </h4>
                
                <div className="space-y-3">
                  {aiSuggestions.map((suggestion, idx) => (
                    <div key={idx} className="group">
                      <div className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                        suggestion.priority === 'high' ? 'bg-red-50 border-red-200 hover:border-red-300' :
                        suggestion.priority === 'medium' ? 'bg-yellow-50 border-yellow-200 hover:border-yellow-300' :
                        'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 mb-1">
                              {suggestion.title}
                            </h5>
                            <p className="text-sm text-gray-600 mb-3">
                              {suggestion.description}
                            </p>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                            suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {suggestion.priority}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => executeAIAction(suggestion.action)}
                          disabled={isAiProcessing}
                          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50"
                        >
                          Apply Suggestion
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {aiSuggestions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Add some elements to get AI suggestions</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Board Analytics */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                  <span>Board Analytics</span>
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-700">{elements.length}</div>
                    <div className="text-xs text-blue-600">Total Elements</div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="text-2xl font-bold text-yellow-700">
                      {elements.filter(el => el.type === 'sticky').length}
                    </div>
                    <div className="text-xs text-yellow-600">Sticky Notes</div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-700">
                      {elements.filter(el => el.type === 'text').length}
                    </div>
                    <div className="text-xs text-green-600">Text Boxes</div>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-700">
                      {elements.filter(el => ['rectangle', 'circle'].includes(el.type)).length}
                    </div>
                    <div className="text-xs text-purple-600">Shapes</div>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button 
                    onClick={() => executeAIAction('extract-tasks')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 text-sm font-medium"
                  >
                    🎯 Extract Action Items
                  </button>
                  
                  <button 
                    onClick={() => executeAIAction('group-stickies')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 text-sm font-medium"
                  >
                    📋 Auto-organize Notes
                  </button>
                  
                  <button 
                    onClick={() => executeAIAction('add-arrows')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 text-sm font-medium"
                  >
                    🔗 Connect Ideas
                  </button>
                </div>
              </div>
              
              {/* AI Chat Interface */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Ask AI</h4>
                <div className="space-y-3">
                  <textarea
                    placeholder="Ask about your board or request suggestions..."
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="3"
                  />
                  <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Enhanced Status Bar */}
      <div className="bg-gray-100 border-t border-gray-200 px-4 py-2 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Elements:</span>
            <span className="text-gray-900">{elements.length}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="font-medium">Selected:</span>
            <span className="text-gray-900 capitalize">
              {selectedElement ? selectedElement.type : 'None'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="font-medium">Tool:</span>
            <span className="text-gray-900 capitalize">{tool}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="font-medium">Zoom:</span>
            <span className="text-gray-900">{Math.round(zoom * 100)}%</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 font-medium">Connected</span>
            </div>
            <span className="text-gray-400">•</span>
            <span>{collaborators.filter(u => u.isActive).length} active users</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Last sync: just now</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartSync;