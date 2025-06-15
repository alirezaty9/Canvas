// src/components/AdvancedCanvas.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';

const AdvancedCanvas = ({ imageData, selectedTool, onCoordinateUpdate, onProfileUpdate }) => {
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const containerRef = useRef(null);
  
  // State برای مدیریت تصویر و زوم
  const [imageObj, setImageObj] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [lastImageData, setLastImageData] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // State برای ابزارها
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [cropSelection, setCropSelection] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isDrawingLine, setIsDrawingLine] = useState(false);
  const [lines, setLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(null);
  
  // History برای Undo/Redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // محاسبه مختصات واقعی تصویر
  const getImageCoordinates = useCallback((canvasX, canvasY) => {
    if (!imageObj) return null;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // تبدیل مختصات mouse به مختصات canvas
    const x = (canvasX - rect.left) / zoomLevel - pan.x;
    const y = (canvasY - rect.top) / zoomLevel - pan.y;
    
    // محدود کردن به مرزهای تصویر
    const imageX = Math.max(0, Math.min(imageObj.width, x));
    const imageY = Math.max(0, Math.min(imageObj.height, y));
    
    return { x: imageX, y: imageY };
  }, [imageObj, zoomLevel, pan]);

  // ذخیره state در history
  const saveToHistory = useCallback(() => {
    const state = {
      selectedPoints: [...selectedPoints],
      lines: [...lines],
      cropSelection: cropSelection ? { ...cropSelection } : null,
      timestamp: Date.now()
    };
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [selectedPoints, lines, cropSelection, history, historyIndex]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setSelectedPoints(prevState.selectedPoints);
      setLines(prevState.lines);
      setCropSelection(prevState.cropSelection);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setSelectedPoints(nextState.selectedPoints);
      setLines(nextState.lines);
      setCropSelection(nextState.cropSelection);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  // رسم تصویر
  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!canvas || !overlayCanvas || !imageObj || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');

    // فقط overlay را پاک کنیم، تصویر اصلی را نه
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // رسم تصویر فقط اگر تغییر کرده باشد
    if (lastImageData !== imageData) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // بهینه‌سازی رندرینگ
      ctx.imageSmoothingEnabled = false; // برای تصاویر پیکسلی
      ctx.save();
      ctx.scale(zoomLevel, zoomLevel);
      ctx.translate(pan.x, pan.y);
      ctx.drawImage(imageObj, 0, 0);
      ctx.restore();
      
      setLastImageData(imageData);
    }

    // رسم المان‌های overlay
    overlayCtx.save();
    overlayCtx.scale(zoomLevel, zoomLevel);
    overlayCtx.translate(pan.x, pan.y);

    // رسم نقاط انتخاب شده با بهینه‌سازی
    if (selectedPoints.length > 0) {
      selectedPoints.forEach((point, index) => {
        overlayCtx.fillStyle = '#ff0000';
        overlayCtx.beginPath();
        overlayCtx.arc(point.x, point.y, 5 / zoomLevel, 0, 2 * Math.PI);
        overlayCtx.fill();
        
        // شماره نقطه
        overlayCtx.fillStyle = '#ffffff';
        overlayCtx.font = `${12 / zoomLevel}px Arial`;
        overlayCtx.strokeStyle = '#000000';
        overlayCtx.lineWidth = 2 / zoomLevel;
        overlayCtx.strokeText(`${index + 1}`, point.x + 8 / zoomLevel, point.y - 8 / zoomLevel);
        overlayCtx.fillText(`${index + 1}`, point.x + 8 / zoomLevel, point.y - 8 / zoomLevel);
      });
    }

    // رسم خطوط
    if (lines.length > 0) {
      lines.forEach(line => {
        overlayCtx.strokeStyle = line.color || '#00ff00';
        overlayCtx.lineWidth = (line.width || 2) / zoomLevel;
        overlayCtx.beginPath();
        overlayCtx.moveTo(line.start.x, line.start.y);
        overlayCtx.lineTo(line.end.x, line.end.y);
        overlayCtx.stroke();
      });
    }

    // رسم خط جاری در حال کشیدن
    if (currentLine) {
      overlayCtx.strokeStyle = '#ffff00';
      overlayCtx.lineWidth = 2 / zoomLevel;
      overlayCtx.setLineDash([5 / zoomLevel, 5 / zoomLevel]);
      overlayCtx.beginPath();
      overlayCtx.moveTo(currentLine.start.x, currentLine.start.y);
      overlayCtx.lineTo(currentLine.end.x, currentLine.end.y);
      overlayCtx.stroke();
      overlayCtx.setLineDash([]);
    }

    // رسم محدوده crop
    if (cropSelection) {
      overlayCtx.strokeStyle = '#0099ff';
      overlayCtx.lineWidth = 2 / zoomLevel;
      overlayCtx.setLineDash([10 / zoomLevel, 5 / zoomLevel]);
      overlayCtx.strokeRect(
        cropSelection.x,
        cropSelection.y,
        cropSelection.width,
        cropSelection.height
      );
      overlayCtx.setLineDash([]);
      
      // پس‌زمینه تیره برای نواحی خارج از crop
      overlayCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      overlayCtx.fillRect(0, 0, imageObj.width, cropSelection.y);
      overlayCtx.fillRect(0, cropSelection.y + cropSelection.height, imageObj.width, imageObj.height);
      overlayCtx.fillRect(0, cropSelection.y, cropSelection.x, cropSelection.height);
      overlayCtx.fillRect(cropSelection.x + cropSelection.width, cropSelection.y, imageObj.width, cropSelection.height);
    }

    overlayCtx.restore();
  }, [imageObj, imageLoaded, lastImageData, imageData, zoomLevel, pan, selectedPoints, lines, currentLine, cropSelection]);

  // مدیریت کلیک Mouse
  const handleMouseDown = useCallback((e) => {
    const coords = getImageCoordinates(e.clientX, e.clientY);
    if (!coords) return;

    switch (selectedTool) {
      case 'select':
        // انتخاب نقطه
        const newPoint = { x: coords.x, y: coords.y, id: Date.now() };
        setSelectedPoints(prev => [...prev, newPoint]);
        saveToHistory();
        
        // ارسال مختصات
        if (onCoordinateUpdate) {
          onCoordinateUpdate([...selectedPoints, newPoint]);
        }
        break;

      case 'draw':
        // شروع رسم خط
        setIsDrawingLine(true);
        setCurrentLine({
          start: coords,
          end: coords,
          color: '#00ff00',
          width: 2
        });
        break;

      case 'crop':
        // شروع انتخاب ناحیه crop
        setIsCropping(true);
        setCropSelection({
          x: coords.x,
          y: coords.y,
          width: 0,
          height: 0
        });
        break;

      case 'zoom':
        // زوم با کلیک
        if (e.shiftKey) {
          setZoomLevel(prev => Math.max(0.1, prev - 0.2));
        } else {
          setZoomLevel(prev => Math.min(5, prev + 0.2));
        }
        break;

      default:
        // Pan mode
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [selectedTool, getImageCoordinates, selectedPoints, pan, saveToHistory, onCoordinateUpdate]);

  const handleMouseMove = useCallback((e) => {
    const coords = getImageCoordinates(e.clientX, e.clientY);
    if (!coords) return;

    // نمایش مختصات جاری
    if (onCoordinateUpdate) {
      onCoordinateUpdate(selectedPoints, coords);
    }

    if (isDragging && selectedTool !== 'crop' && selectedTool !== 'draw') {
      // Pan کردن تصویر
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (isDrawingLine && currentLine) {
      // به‌روزرسانی خط در حال رسم
      setCurrentLine(prev => ({
        ...prev,
        end: coords
      }));
    } else if (isCropping && cropSelection) {
      // به‌روزرسانی محدوده crop
      setCropSelection(prev => ({
        ...prev,
        width: coords.x - prev.x,
        height: coords.y - prev.y
      }));
    }
  }, [isDragging, isDrawingLine, isCropping, currentLine, cropSelection, dragStart, selectedTool, getImageCoordinates, selectedPoints, onCoordinateUpdate]);

  const handleMouseUp = useCallback(() => {
    if (isDrawingLine && currentLine) {
      // اتمام رسم خط
      setLines(prev => [...prev, currentLine]);
      setCurrentLine(null);
      setIsDrawingLine(false);
      saveToHistory();
    }

    if (isCropping) {
      setIsCropping(false);
      saveToHistory();
    }

    setIsDragging(false);
  }, [isDrawingLine, isCropping, currentLine, saveToHistory]);

  // مدیریت wheel برای زوم
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel(prev => Math.max(0.1, Math.min(5, prev + delta)));
  }, []);

  // تنظیم event listeners
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;

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
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleWheel]);

  // بارگذاری تصویر جدید
  useEffect(() => {
    if (!imageData) return;

    // اگر تصویر همان قبلی است، skip کن
    if (imageData === lastImageData) return;

    const img = new Image();
    img.onload = () => {
      // تنظیم سایز canvas فقط در اولین بار
      const canvas = canvasRef.current;
      const overlayCanvas = overlayCanvasRef.current;
      const container = containerRef.current;
      
      if (canvas && overlayCanvas && container) {
        const containerRect = container.getBoundingClientRect();
        
        // تنظیم سایز canvas فقط اگر تغییر کرده باشد
        if (canvas.width !== containerRect.width || canvas.height !== containerRect.height) {
          canvas.width = containerRect.width;
          canvas.height = containerRect.height;
          overlayCanvas.width = containerRect.width;
          overlayCanvas.height = containerRect.height;
        }
        
        // مرکز کردن تصویر فقط در اولین بار یا تغییر سایز
        if (!imageObj || imageObj.width !== img.width || imageObj.height !== img.height) {
          setPan({
            x: (containerRect.width / 2 - img.width / 2) / zoomLevel,
            y: (containerRect.height / 2 - img.height / 2) / zoomLevel
          });
        }
      }
      
      setImageObj(img);
      setImageLoaded(true);
    };
    
    img.onerror = () => {
      console.error('خطا در بارگذاری تصویر');
      setImageLoaded(false);
    };
    
    if (imageData.startsWith('data:')) {
      img.src = imageData;
    } else {
      img.src = `data:image/jpeg;base64,${imageData}`;
    }
  }, [imageData, lastImageData, zoomLevel, imageObj]);

  // رسم مجدد با throttling
  useEffect(() => {
    let animationFrameId;
    
    const render = () => {
      drawImage();
    };
    
    // استفاده از requestAnimationFrame برای smooth rendering
    animationFrameId = requestAnimationFrame(render);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [drawImage]);

  // توابع کنترلی
  const resetZoom = () => {
    setZoomLevel(1);
    if (imageObj) {
      const container = containerRef.current;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        setPan({
          x: (containerRect.width / 2 - imageObj.width / 2),
          y: (containerRect.height / 2 - imageObj.height / 2)
        });
      }
    }
  };

  const fitToScreen = () => {
    if (!imageObj) return;
    
    const container = containerRef.current;
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const scaleX = containerRect.width / imageObj.width;
      const scaleY = containerRect.height / imageObj.height;
      const scale = Math.min(scaleX, scaleY) * 0.9;
      
      setZoomLevel(scale);
      setPan({
        x: (containerRect.width / 2 - imageObj.width / 2) / scale,
        y: (containerRect.height / 2 - imageObj.height / 2) / scale
      });
    }
  };

  const clearAll = () => {
    setSelectedPoints([]);
    setLines([]);
    setCropSelection(null);
    setCurrentProfile(null);
    saveToHistory();
  };

  const applyCrop = () => {
    if (!cropSelection || !imageObj) return;
    
    // ایجاد canvas موقت برای crop
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = Math.abs(cropSelection.width);
    tempCanvas.height = Math.abs(cropSelection.height);
    
    tempCtx.drawImage(
      imageObj,
      cropSelection.x,
      cropSelection.y,
      cropSelection.width,
      cropSelection.height,
      0,
      0,
      tempCanvas.width,
      tempCanvas.height
    );
    
    // ایجاد تصویر جدید از crop
    const croppedDataUrl = tempCanvas.toDataURL('image/jpeg', 0.9);
    
    // بارگذاری تصویر crop شده
    const newImg = new Image();
    newImg.onload = () => {
      setImageObj(newImg);
      setCropSelection(null);
      resetZoom();
      saveToHistory();
    };
    newImg.src = croppedDataUrl;
  };

  // محاسبه پروفایل خطی
  const calculateLineProfile = useCallback((line) => {
    if (!imageObj || !line) return null;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imageObj.width;
    canvas.height = imageObj.height;
    ctx.drawImage(imageObj, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const dx = line.end.x - line.start.x;
    const dy = line.end.y - line.start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(distance);
    
    const profile = [];
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = Math.round(line.start.x + t * dx);
      const y = Math.round(line.start.y + t * dy);
      
      if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
        const index = (y * canvas.width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        
        profile.push({
          distance: i,
          x: x,
          y: y,
          intensity: gray,
          rgb: { r, g, b }
        });
      }
    }
    
    return profile;
  }, [imageObj]);

  // محاسبه پروفایل هنگام انتخاب خط
  useEffect(() => {
    if (lines.length > 0) {
      const lastLine = lines[lines.length - 1];
      const profile = calculateLineProfile(lastLine);
      setCurrentProfile(profile);
      
      if (onProfileUpdate && profile) {
        onProfileUpdate(profile, lastLine);
      }
    }
  }, [lines, calculateLineProfile, onProfileUpdate]);

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      {/* Canvas اصلی برای تصویر */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {/* Canvas overlay برای ابزارها */}
      <canvas
        ref={overlayCanvasRef}
        className="absolute top-0 left-0 w-full h-full cursor-crosshair"
      />
      
      {/* کنترل‌های زوم */}
      <div className="absolute top-4 right-4 bg-background-white rounded-lg shadow-lg p-2 space-y-2">
        <div className="text-xs text-text-muted font-vazir text-center">
          زوم: {Math.round(zoomLevel * 100)}%
        </div>
        <button
          onClick={() => setZoomLevel(prev => Math.min(5, prev + 0.2))}
          className="w-8 h-8 bg-primary text-white rounded hover:bg-primary-dark"
        >
          +
        </button>
        <button
          onClick={() => setZoomLevel(prev => Math.max(0.1, prev - 0.2))}
          className="w-8 h-8 bg-primary text-white rounded hover:bg-primary-dark"
        >
          -
        </button>
        <button
          onClick={resetZoom}
          className="w-8 h-8 bg-background-secondary text-text rounded hover:bg-border text-xs"
        >
          1:1
        </button>
        <button
          onClick={fitToScreen}
          className="w-8 h-8 bg-background-secondary text-text rounded hover:bg-border text-xs"
        >
          📱
        </button>
      </div>
      
      {/* کنترل‌های عملیات */}
      <div className="absolute top-4 left-4 bg-background-white rounded-lg shadow-lg p-2 space-y-2">
        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          className="w-8 h-8 bg-background-secondary text-text rounded hover:bg-border disabled:opacity-50"
          title="Undo"
        >
          ↶
        </button>
        <button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          className="w-8 h-8 bg-background-secondary text-text rounded hover:bg-border disabled:opacity-50"
          title="Redo"
        >
          ↷
        </button>
        <button
          onClick={clearAll}
          className="w-8 h-8 bg-highlight text-white rounded hover:bg-highlight-dark"
          title="Clear All"
        >
          🗑️
        </button>
        {cropSelection && (
          <button
            onClick={applyCrop}
            className="w-8 h-8 bg-green-500 text-white rounded hover:bg-green-600"
            title="Apply Crop"
          >
            ✂️
          </button>
        )}
      </div>
      
      {/* نمایش مختصات */}
      {imageObj && (
        <div className="absolute bottom-4 left-4 bg-background-white rounded-lg shadow-lg p-2 text-xs text-text-muted font-vazir">
          <div>ابعاد تصویر: {imageObj.width} × {imageObj.height}</div>
          <div>نقاط انتخاب شده: {selectedPoints.length}</div>
          <div>خطوط رسم شده: {lines.length}</div>
        </div>
      )}
    </div>
  );
};

export default AdvancedCanvas;