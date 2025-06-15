// src/components/CameraViewer.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import DataPanels from './DataPanels';

const CameraViewer = ({ selectedTool }) => {
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('در حال اتصال...');
  const [frameCount, setFrameCount] = useState(0);
  const [currentImageData, setCurrentImageData] = useState(null);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [currentCoord, setCurrentCoord] = useState(null);
  const [lineProfile, setLineProfile] = useState(null);
  const [currentLine, setCurrentLine] = useState(null);
  const wsRef = useRef(null);
  const canvasRef = useRef(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.matches('input, textarea, select')) return;

      switch (e.key.toLowerCase()) {
        case 'z':
          if (e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            canvasRef.current?.undo();
          } else if (e.ctrlKey && e.shiftKey) {
            e.preventDefault();
            canvasRef.current?.redo();
          }
          break;
        case 'y':
          if (e.ctrlKey) {
            e.preventDefault();
            canvasRef.current?.redo();
          }
          break;
        case 'delete':
        case 'backspace':
          if (e.ctrlKey) {
            e.preventDefault();
            canvasRef.current?.clearAll();
          }
          break;
        case '=':
        case '+':
          if (e.ctrlKey) {
            e.preventDefault();
            canvasRef.current?.zoomIn();
          }
          break;
        case '-':
          if (e.ctrlKey) {
            e.preventDefault();
            canvasRef.current?.zoomOut();
          }
          break;
        case '0':
          if (e.ctrlKey) {
            e.preventDefault();
            canvasRef.current?.resetZoom();
          }
          break;
        case 'f':
          if (e.ctrlKey) {
            e.preventDefault();
            canvasRef.current?.fitToScreen();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      wsRef.current = new WebSocket('ws://localhost:12345');
      
      wsRef.current.onopen = () => {
        setConnected(true);
        setConnectionStatus('متصل');
      };

      wsRef.current.onmessage = (event) => {
        const message = event.data;
        if (message.startsWith('basler:')) {
          const base64Data = message.substring(7);
          setCurrentImageData(base64Data);
          setFrameCount(prev => prev + 1);
        }
      };

      wsRef.current.onclose = () => {
        setConnected(false);
        setConnectionStatus('قطع شده');
        setTimeout(() => {
          setConnectionStatus('در حال اتصال مجدد...');
          connectWebSocket();
        }, 3000);
      };

      wsRef.current.onerror = () => {
        setConnectionStatus('خطا در اتصال');
      };

    } catch (error) {
      setConnectionStatus('خطا');
    }
  };

  const handleCoordinateUpdate = (points, current) => {
    if (points) setSelectedPoints(points);
    if (current) setCurrentCoord(current);
  };

  const handleProfileUpdate = (profile, line) => {
    setLineProfile(profile);
    setCurrentLine(line);
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'متصل': return 'text-green-500';
      case 'قطع شده':
      case 'خطا در اتصال':
      case 'خطا': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  return (
    <div className="flex h-full gap-4">
      {/* بخش اصلی Canvas */}
      <div className="flex-1 flex flex-col">
        {/* هدر */}
        <div className="bg-background-white border border-border rounded-lg p-3 mb-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-text font-vazir">
                دوربین Basler - Canvas پیشرفته
              </h2>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm font-vazir ${getStatusColor()}`}>
                  {connectionStatus}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <span className="font-vazir">فریم: {frameCount}</span>
              <span className="font-vazir">نقاط: {selectedPoints.length}</span>
              <span className="font-vazir">ابزار: {selectedTool || 'هیچ'}</span>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-background-white border border-border rounded-lg overflow-hidden shadow-sm">
          {connected && currentImageData ? (
            <EnhancedCanvas 
              ref={canvasRef}
              imageData={currentImageData} 
              selectedTool={selectedTool}
              onCoordinateUpdate={handleCoordinateUpdate}
              onProfileUpdate={handleProfileUpdate}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-text-muted font-vazir">در انتظار اتصال به دوربین...</p>
                <p className="text-sm text-text-muted mt-2 font-vazir">
                  مطمئن شوید backend در حال اجرا است
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* پنل‌های داده */}
      <div className="w-80">
        <DataPanels
          points={selectedPoints}
          currentCoord={currentCoord}
          profile={lineProfile}
          line={currentLine}
        />
      </div>
    </div>
  );
};

// کامپوننت Canvas پیشرفته
const EnhancedCanvas = React.forwardRef(({ imageData, selectedTool, onCoordinateUpdate, onProfileUpdate }, ref) => {
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const containerRef = useRef(null);
  
  // State تصویر
  const [imageObj, setImageObj] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  
  // State ابزارها
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [drawnLines, setDrawnLines] = useState([]);
  const [cropArea, setCropArea] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [currentLine, setCurrentLine] = useState(null);
  
  // History
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // تبدیل مختصات
  const screenToImageCoords = useCallback((screenX, screenY) => {
    if (!imageObj) return null;
    
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const canvasX = screenX - rect.left;
    const canvasY = screenY - rect.top;
    
    const imageX = (canvasX - imagePosition.x - panOffset.x) / (imageScale * zoomLevel);
    const imageY = (canvasY - imagePosition.y - panOffset.y) / (imageScale * zoomLevel);
    
    return {
      x: Math.max(0, Math.min(imageObj.width, imageX)),
      y: Math.max(0, Math.min(imageObj.height, imageY))
    };
  }, [imageObj, imageScale, zoomLevel, imagePosition, panOffset]);

  // بارگذاری تصویر
  useEffect(() => {
    if (!imageData) return;

    const img = new Image();
    img.onload = () => {
      setImageObj(img);
      
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        const containerRect = container.getBoundingClientRect();
        canvas.width = containerRect.width;
        canvas.height = containerRect.height;
        
        if (overlayCanvasRef.current) {
          overlayCanvasRef.current.width = containerRect.width;
          overlayCanvasRef.current.height = containerRect.height;
        }
        
        const scaleX = canvas.width / img.width;
        const scaleY = canvas.height / img.height;
        const scale = Math.min(scaleX, scaleY) * 0.9;
        
        setImageScale(scale);
        setImagePosition({
          x: (canvas.width - img.width * scale) / 2,
          y: (canvas.height - img.height * scale) / 2
        });
      }
    };

    if (imageData.startsWith('data:')) {
      img.src = imageData;
    } else {
      img.src = `data:image/jpeg;base64,${imageData}`;
    }
  }, [imageData]);

  // رسم تصویر
  useEffect(() => {
    if (!imageObj) return;

    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!canvas || !overlayCanvas) return;

    const ctx = canvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');

    // پاک کردن
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // رسم تصویر
    ctx.save();
    ctx.translate(imagePosition.x + panOffset.x, imagePosition.y + panOffset.y);
    ctx.scale(imageScale * zoomLevel, imageScale * zoomLevel);
    ctx.drawImage(imageObj, 0, 0);
    ctx.restore();

    // رسم overlay
    overlayCtx.save();
    overlayCtx.translate(imagePosition.x + panOffset.x, imagePosition.y + panOffset.y);
    overlayCtx.scale(imageScale * zoomLevel, imageScale * zoomLevel);

    // نقاط
    selectedPoints.forEach((point, index) => {
      overlayCtx.fillStyle = '#ff0000';
      overlayCtx.beginPath();
      overlayCtx.arc(point.x, point.y, 5 / (imageScale * zoomLevel), 0, 2 * Math.PI);
      overlayCtx.fill();
      
      overlayCtx.fillStyle = '#ffffff';
      overlayCtx.strokeStyle = '#000000';
      overlayCtx.font = `${12 / (imageScale * zoomLevel)}px Arial`;
      overlayCtx.lineWidth = 2 / (imageScale * zoomLevel);
      overlayCtx.strokeText(`${index + 1}`, point.x + 8 / (imageScale * zoomLevel), point.y - 8 / (imageScale * zoomLevel));
      overlayCtx.fillText(`${index + 1}`, point.x + 8 / (imageScale * zoomLevel), point.y - 8 / (imageScale * zoomLevel));
    });

    // خطوط
    drawnLines.forEach(line => {
      overlayCtx.strokeStyle = line.color || '#00ff00';
      overlayCtx.lineWidth = (line.width || 2) / (imageScale * zoomLevel);
      overlayCtx.beginPath();
      overlayCtx.moveTo(line.start.x, line.start.y);
      overlayCtx.lineTo(line.end.x, line.end.y);
      overlayCtx.stroke();
    });

    // خط جاری
    if (currentLine) {
      overlayCtx.strokeStyle = '#ffff00';
      overlayCtx.lineWidth = 2 / (imageScale * zoomLevel);
      overlayCtx.setLineDash([5 / (imageScale * zoomLevel), 5 / (imageScale * zoomLevel)]);
      overlayCtx.beginPath();
      overlayCtx.moveTo(currentLine.start.x, currentLine.start.y);
      overlayCtx.lineTo(currentLine.end.x, currentLine.end.y);
      overlayCtx.stroke();
      overlayCtx.setLineDash([]);
    }

    // کراپ
    if (cropArea) {
      overlayCtx.strokeStyle = '#0099ff';
      overlayCtx.lineWidth = 2 / (imageScale * zoomLevel);
      overlayCtx.setLineDash([10 / (imageScale * zoomLevel), 5 / (imageScale * zoomLevel)]);
      overlayCtx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
      overlayCtx.setLineDash([]);
      
      overlayCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      overlayCtx.fillRect(0, 0, imageObj.width, cropArea.y);
      overlayCtx.fillRect(0, cropArea.y + cropArea.height, imageObj.width, imageObj.height);
      overlayCtx.fillRect(0, cropArea.y, cropArea.x, cropArea.height);
      overlayCtx.fillRect(cropArea.x + cropArea.width, cropArea.y, imageObj.width, cropArea.height);
    }

    overlayCtx.restore();
  }, [imageObj, imageScale, zoomLevel, imagePosition, panOffset, selectedPoints, drawnLines, currentLine, cropArea]);

  // Mouse handlers
  const handleMouseDown = useCallback((e) => {
    const coords = screenToImageCoords(e.clientX, e.clientY);
    if (!coords) return;

    setLastMousePos({ x: e.clientX, y: e.clientY });

    switch (selectedTool) {
      case 'select':
        const newPoint = { x: coords.x, y: coords.y, id: Date.now() };
        setSelectedPoints(prev => {
          const updated = [...prev, newPoint];
          if (onCoordinateUpdate) onCoordinateUpdate(updated, coords);
          return updated;
        });
        break;

      case 'draw':
        setIsDrawing(true);
        setCurrentLine({ start: coords, end: coords, color: '#00ff00', width: 2 });
        break;

      case 'crop':
        setIsCropping(true);
        setCropArea({ x: coords.x, y: coords.y, width: 0, height: 0 });
        break;

      case 'pan':
      default:
        setIsPanning(true);
        break;
    }
  }, [selectedTool, screenToImageCoords, onCoordinateUpdate]);

  const handleMouseMove = useCallback((e) => {
    const coords = screenToImageCoords(e.clientX, e.clientY);
    if (!coords) return;

    if (onCoordinateUpdate) {
      onCoordinateUpdate(selectedPoints, coords);
    }

    if (isDrawing && currentLine) {
      setCurrentLine(prev => ({ ...prev, end: coords }));
    } else if (isCropping && cropArea) {
      setCropArea(prev => ({
        ...prev,
        width: coords.x - prev.x,
        height: coords.y - prev.y
      }));
    } else if (isPanning) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  }, [isDrawing, isCropping, isPanning, currentLine, cropArea, screenToImageCoords, selectedPoints, onCoordinateUpdate, lastMousePos]);

  const handleMouseUp = useCallback(() => {
    if (isDrawing && currentLine) {
      setDrawnLines(prev => [...prev, currentLine]);
      setCurrentLine(null);
      
      if (onProfileUpdate) {
        onProfileUpdate([], currentLine);
      }
    }

    setIsDrawing(false);
    setIsCropping(false);
    setIsPanning(false);
  }, [isDrawing, currentLine, onProfileUpdate]);

  // Zoom functions
  const zoomIn = () => setZoomLevel(prev => Math.min(5, prev * 1.2));
  const zoomOut = () => setZoomLevel(prev => Math.max(0.1, prev / 1.2));
  const resetZoom = () => setZoomLevel(1);
  const fitToScreen = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // History functions
  const saveToHistory = () => {
    const state = { selectedPoints, drawnLines, cropArea };
    setHistory(prev => [...prev.slice(0, historyIndex + 1), state]);
    setHistoryIndex(prev => prev + 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setSelectedPoints(prevState.selectedPoints);
      setDrawnLines(prevState.drawnLines);
      setCropArea(prevState.cropArea);
      setHistoryIndex(prev => prev - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setSelectedPoints(nextState.selectedPoints);
      setDrawnLines(nextState.drawnLines);
      setCropArea(nextState.cropArea);
      setHistoryIndex(prev => prev + 1);
    }
  };

  const clearAll = () => {
    setSelectedPoints([]);
    setDrawnLines([]);
    setCropArea(null);
    saveToHistory();
  };

  // Expose functions
  React.useImperativeHandle(ref, () => ({
    undo, redo, clearAll, zoomIn, zoomOut, resetZoom, fitToScreen
  }));

  // Event listeners
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;

    const handleWheel = (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      <canvas ref={overlayCanvasRef} className="absolute top-0 left-0 w-full h-full cursor-crosshair" />
      
      {/* کنترل‌های زوم */}
      <div className="absolute top-4 right-4 bg-background-white rounded-lg shadow-lg p-2 space-y-2">
        <div className="text-xs text-text-muted font-vazir text-center">
          {Math.round(zoomLevel * 100)}%
        </div>
        <button onClick={zoomIn} className="w-8 h-8 bg-primary text-white rounded hover:bg-primary-dark">+</button>
        <button onClick={zoomOut} className="w-8 h-8 bg-primary text-white rounded hover:bg-primary-dark">-</button>
        <button onClick={resetZoom} className="w-8 h-8 bg-background-secondary text-text rounded hover:bg-border text-xs">1:1</button>
        <button onClick={fitToScreen} className="w-8 h-8 bg-background-secondary text-text rounded hover:bg-border text-xs">📱</button>
      </div>
      
      {/* کنترل‌های عملیات */}
      <div className="absolute top-4 left-4 bg-background-white rounded-lg shadow-lg p-2 space-y-2">
        <button onClick={undo} className="w-8 h-8 bg-background-secondary text-text rounded hover:bg-border" title="Undo">↶</button>
        <button onClick={redo} className="w-8 h-8 bg-background-secondary text-text rounded hover:bg-border" title="Redo">↷</button>
        <button onClick={clearAll} className="w-8 h-8 bg-highlight text-white rounded hover:bg-highlight-dark" title="Clear">🗑️</button>
      </div>
      
      {/* اطلاعات */}
      {imageObj && (
        <div className="absolute bottom-4 left-4 bg-background-white rounded-lg shadow-lg p-2 text-xs text-text-muted font-vazir">
          <div>ابعاد: {imageObj.width} × {imageObj.height}</div>
          <div>زوم: {Math.round(zoomLevel * 100)}%</div>
          <div>نقاط: {selectedPoints.length} | خطوط: {drawnLines.length}</div>
        </div>
      )}
    </div>
  );
});

export default CameraViewer;