import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ToolManager } from '../tools/base/ToolManager';
import { SelectTool } from '../tools/implementations/SelectTool';
import { DrawTool } from '../tools/implementations/DrawTool';
import { CropTool } from '../tools/implementations/CropTool';
import ModularCanvas from '../components/shared/ModularCanvas';
import SimpleToolbar from '../components/shared/SimpleToolbar';

const SimpleHome = () => {
  const { imageData, setImageData, setImageDimensions, activeTool, setActiveTool, setToolManager } = useAppStore();
  const toolManagerRef = useRef(null);
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [frameCount, setFrameCount] = useState(0);

  // Create tool manager and register tools
  useEffect(() => {
    const manager = new ToolManager();

    const selectTool = new SelectTool();
    const drawTool = new DrawTool();
    const cropTool = new CropTool();

    manager.registerTool(selectTool);
    manager.registerTool(drawTool);
    manager.registerTool(cropTool);

    toolManagerRef.current = manager;
    setToolManager(manager);

    // SelectTool functions
    window.removePoint = (index) => {
      selectTool.removePoint(index);
      manager.renderAllOverlays();
    };

    window.clearAllPoints = () => {
      selectTool.clearAllPoints();
      manager.renderAllOverlays();
    };

    window.undoLastPoint = () => {
      selectTool.undoLastPoint();
      manager.renderAllOverlays();
    };

    // DrawTool functions
    window.removeLine = (index) => {
      drawTool.removeLine(index);
      manager.renderAllOverlays();
    };

    window.clearAllLines = () => {
      drawTool.clearAllLines();
      manager.renderAllOverlays();
    };

    window.undoLastLine = () => {
      drawTool.undoLastLine();
      manager.renderAllOverlays();
    };

    window.updateLineColor = (color) => {
      drawTool.updateLineColor(color);
      manager.renderAllOverlays();
    };

    window.updateLineWidth = (width) => {
      drawTool.updateLineWidth(width);
      manager.renderAllOverlays();
    };

    // CropTool functions
    window.clearCrop = () => {
      cropTool.clearCrop();
      manager.renderAllOverlays();
    };

    window.applyCrop = () => {
      console.log('Apply crop:', cropTool.getData());
    };

    // Process pixel via WebSocket
    window.processPixel = (pixelIndex) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const message = JSON.stringify({
          action: 'process_pixel',
          pixelIndex,
        });
        console.log('Sending pixel to backend:', message);
        wsRef.current.send(message);
      } else {
        console.error('WebSocket is not connected');
      }
    };

    // Listen for canvas update events
    const handleCanvasUpdate = () => {
      manager.renderAllOverlays();
    };
    window.addEventListener('updateCanvas', handleCanvasUpdate);

    return () => {
      window.removeEventListener('updateCanvas', handleCanvasUpdate);
    };
  }, [setToolManager]);

  // WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        console.log('Attempting to connect to WebSocket at ws://localhost:12345');
        wsRef.current = new WebSocket('ws://localhost:12345');

        wsRef.current.onopen = () => {
          console.log('WebSocket connection established');
          setConnected(true);
        };

        wsRef.current.onmessage = (event) => {
          console.log('WebSocket message received, data length:', event.data.length);
          if (event.data.startsWith('basler:')) {
            const base64Data = event.data.substring(7);
            console.log('Basler frame received, Base64 length:', base64Data.length);
            setImageData(base64Data);
            setFrameCount((prev) => prev + 1);
          } else {
            try {
              const message = JSON.parse(event.data);
              if (message.action === 'processed_pixel') {
                console.log('Received processed pixel data:', message);
                setImageData(message.imageData);
              }
            } catch (error) {
              console.warn('Unexpected WebSocket message format:', event.data);
            }
          }
        };

        wsRef.current.onclose = () => {
          console.log('WebSocket connection closed');
          setConnected(false);
          setTimeout(connectWebSocket, 3000);
        };

        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
      } catch (error) {
        console.error('WebSocket connection failed:', error);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        console.log('Closing WebSocket connection');
        wsRef.current.close();
      }
    };
  }, [setImageData]);

  const handleToolSelect = (toolId) => {
    if (toolManagerRef.current) {
      if (toolId) {
        toolManagerRef.current.activateTool(toolId);
      } else {
        toolManagerRef.current.deactivateAll();
      }
      setActiveTool(toolId);
    }
  };

  const tools = toolManagerRef.current?.getAllTools() || [];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 class="text-xl font-bold">سیستم تحلیل تصویر Basler - ساده</h1>
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">{connected ? 'متصل' : 'قطع شده'}</span>
            <span className="text-sm">فریم: {frameCount}</span>
            <span className="text-sm">ابزار: {activeTool || 'هیچ'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-140px)]">
        <div className="col-span-3">
          <SimpleToolbar tools={tools} onToolSelect={handleToolSelect} />
        </div>

        <div className="col-span-9 bg-white rounded-lg shadow-sm overflow-hidden">
          {imageData ? (
            <ModularCanvas toolManager={toolManagerRef.current} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              در انتظار اتصال به دوربین...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleHome;