import React, { useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';

/**
 * Utility function to extract pixel data from canvas context
 */
const getPixelData = (ctx, x, y) => {
  try {
    return ctx.getImageData(x, y, 1, 1).data;
  } catch (error) {
    console.error('Error getting pixel data:', error);
    return null;
  }
};

/**
 * Utility function to convert client coordinates to canvas coordinates
 */
const getCanvasCoords = (canvas, clientX, clientY) => {
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.round(clientX - rect.left),
    y: Math.round(clientY - rect.top),
  };
};

/**
 * ModularCanvas component for rendering Basler camera images and handling tool interactions
 */
const ModularCanvas = ({ toolManager }) => {
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const isRenderingRef = useRef(false);
  const { imageData, setCurrentCoords } = useAppStore();

  // Convert client coordinates to image coordinates
  const getImageCoords = useCallback(
    (clientX, clientY) => {
      return getCanvasCoords(canvasRef.current, clientX, clientY);
    },
    [],
  );

  // Single render function for overlay
  const renderOverlay = useCallback(() => {
    if (!overlayCanvasRef.current || !toolManager || isRenderingRef.current) {
      return;
    }

    isRenderingRef.current = true;

    try {
      const overlayCanvas = overlayCanvasRef.current;
      const ctx = overlayCanvas.getContext('2d');
      
      // Clear overlay
      ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      
      // Render all tools
      const canvasState = {
        width: overlayCanvas.width,
        height: overlayCanvas.height,
      };

      toolManager.tools.forEach((tool) => {
        if (Object.keys(tool.data).length > 0 || tool.isActive) {
          tool.renderOverlay(ctx, canvasState);
        }
      });
    } catch (error) {
      console.error('Error rendering overlay:', error);
    } finally {
      isRenderingRef.current = false;
    }
  }, [toolManager]);

  // Handle mouse events
  const handleMouseDown = useCallback(
    (e) => {
      const coords = getImageCoords(e.clientX, e.clientY);
      if (coords && toolManager) {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          const pixelData = getPixelData(ctx, coords.x, coords.y);
          if (pixelData) {
            coords.pixelData = {
              r: pixelData[0],
              g: pixelData[1],
              b: pixelData[2],
              a: pixelData[3],
            };
            // Calculate pixel index if needed
            const canvas = canvasRef.current;
            if (canvas) {
              coords.pixelIndex = coords.y * canvas.width + coords.x;
            }
          }
        }
        toolManager.handleMouseEvent('onMouseDown', e, coords);
        renderOverlay();
      }
    },
    [toolManager, getImageCoords, renderOverlay],
  );

  const handleMouseMove = useCallback(
    (e) => {
      const coords = getImageCoords(e.clientX, e.clientY);
      if (coords) {
        setCurrentCoords(coords);
        if (toolManager) {
          toolManager.handleMouseEvent('onMouseMove', e, coords);
          renderOverlay();
        }
      }
    },
    [toolManager, getImageCoords, setCurrentCoords, renderOverlay],
  );

  const handleMouseUp = useCallback(
    (e) => {
      const coords = getImageCoords(e.clientX, e.clientY);
      if (coords && toolManager) {
        toolManager.handleMouseEvent('onMouseUp', e, coords);
        renderOverlay();
      }
    },
    [toolManager, getImageCoords, renderOverlay],
  );

  // Load and render image
  useEffect(() => {
    if (!imageData || !canvasRef.current || !overlayCanvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        overlayCanvas.width = img.width;
        overlayCanvas.height = img.height;

        // Clear and draw image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        // Initialize tool manager
        if (toolManager) {
          toolManager.setCanvas(canvas, overlayCanvas);
          // Render overlay after image is loaded
          setTimeout(() => renderOverlay(), 0);
        }
      } catch (error) {
        console.error('Error rendering image:', error);
      }
    };

    img.onerror = () => {
      console.error('Failed to load image');
    };

    // Set image source
    const src = imageData.startsWith('data:') ? imageData : `data:image/jpeg;base64,${imageData}`;
    img.src = src;
  }, [imageData, toolManager, renderOverlay]);

  // Update ToolManager's renderAllOverlays method
  useEffect(() => {
    if (toolManager) {
      toolManager.renderAllOverlays = renderOverlay;
    }
  }, [toolManager, renderOverlay]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-auto">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0"
        style={{ imageRendering: 'pixelated' }}
      />
      <canvas
        ref={overlayCanvasRef}
        className="absolute top-0 left-0 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ pointerEvents: 'auto' }}
      />
    </div>
  );
};

export default ModularCanvas;