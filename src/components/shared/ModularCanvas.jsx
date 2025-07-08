import React, { useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';

const ModularCanvas = ({ toolManager }) => {
    const canvasRef = useRef(null);
    const overlayCanvasRef = useRef(null);
    const containerRef = useRef(null);

    const { imageData, setCurrentCoords } = useAppStore();

    // تبدیل مختصات
    const getImageCoords = useCallback((clientX, clientY) => {
        if (!canvasRef.current) return null;
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }, []);

    // مدیریت رویدادهای ماوس
    const handleMouseDown = useCallback((e) => {
        const coords = getImageCoords(e.clientX, e.clientY);
        toolManager?.handleMouseEvent('onMouseDown', e, coords);
        toolManager?.renderAllOverlays();
    }, [toolManager, getImageCoords]);

    const handleMouseMove = useCallback((e) => {
        const coords = getImageCoords(e.clientX, e.clientY);
        setCurrentCoords(coords);
        toolManager?.handleMouseEvent('onMouseMove', e, coords);
        toolManager?.renderAllOverlays();
    }, [toolManager, getImageCoords, setCurrentCoords]);

    const handleMouseUp = useCallback((e) => {
        const coords = getImageCoords(e.clientX, e.clientY);
        toolManager?.handleMouseEvent('onMouseUp', e, coords);
        toolManager?.renderAllOverlays();
    }, [toolManager, getImageCoords]);

    // بارگذاری تصویر
    useEffect(() => {
        console.log('Image data updated:', imageData ? `Received (length: ${imageData.length})` : 'Empty');
        if (!imageData || !canvasRef.current) {
            console.warn('No image data or canvas reference available');
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            console.log('Image loaded successfully, size:', img.width, 'x', img.height);
            canvas.width = img.width;
            canvas.height = img.height;
            overlayCanvasRef.current.width = img.width;
            overlayCanvasRef.current.height = img.height;

            ctx.clearRect(0, 0, canvas.width, canvas.height); // پاک کردن canvas قبل از رسم
            ctx.drawImage(img, 0, 0);
            console.log('Image drawn on canvas');

            toolManager?.setCanvas(canvas, overlayCanvasRef.current);
        };

        img.onerror = () => {
            console.error('Failed to load image from data. Possible corrupt or invalid Base64 data.');
        };

        console.log('Setting image source...');
        if (imageData.startsWith('data:')) {
            console.log('Image data is already a data URL');
            img.src = imageData;
        } else {
            console.log('Converting Base64 to data URL');
            img.src = `data:image/jpeg;base64,${imageData}`;
        }
    }, [imageData, toolManager]);

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-auto">
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0"
            />
            <canvas
                ref={overlayCanvasRef}
                className="absolute top-0 left-0 cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            />
        </div>
    );
};

export default ModularCanvas;