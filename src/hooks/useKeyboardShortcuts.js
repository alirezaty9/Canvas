// src/hooks/useKeyboardShortcuts.js
import { useEffect } from 'react';

const useKeyboardShortcuts = ({ 
  onUndo, 
  onRedo, 
  onClearAll, 
  onZoomIn, 
  onZoomOut, 
  onFitToScreen, 
  onResetZoom,
  onToolSelect 
}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key, ctrlKey, shiftKey, altKey } = event;
      
      // جلوگیری از اجرای میانبرهای پیش‌فرض مرورگر
      if (ctrlKey || altKey) {
        event.preventDefault();
      }

      // Ctrl + Z: Undo
      if (ctrlKey && key === 'z' && !shiftKey) {
        event.preventDefault();
        onUndo?.();
        return;
      }

      // Ctrl + Y یا Ctrl + Shift + Z: Redo
      if ((ctrlKey && key === 'y') || (ctrlKey && shiftKey && key === 'z')) {
        event.preventDefault();
        onRedo?.();
        return;
      }

      // Delete یا Backspace: Clear All
      if (key === 'Delete' || (ctrlKey && key === 'Backspace')) {
        event.preventDefault();
        onClearAll?.();
        return;
      }

      // Ctrl + Plus: Zoom In
      if (ctrlKey && (key === '+' || key === '=')) {
        event.preventDefault();
        onZoomIn?.();
        return;
      }

      // Ctrl + Minus: Zoom Out
      if (ctrlKey && key === '-') {
        event.preventDefault();
        onZoomOut?.();
        return;
      }

      // Ctrl + 0: Reset Zoom
      if (ctrlKey && key === '0') {
        event.preventDefault();
        onResetZoom?.();
        return;
      }

      // Ctrl + F: Fit to Screen
      if (ctrlKey && key === 'f') {
        event.preventDefault();
        onFitToScreen?.();
        return;
      }

      // Tool shortcuts
      const toolShortcuts = {
        '1': 'select',
        '2': 'draw', 
        '3': 'crop',
        '4': 'zoom',
        '5': 'pan',
        '6': 'measure',
        'Escape': null // Clear tool selection
      };

      if (toolShortcuts.hasOwnProperty(key)) {
        event.preventDefault();
        onToolSelect?.(toolShortcuts[key]);
        return;
      }

      // Arrow keys for pan (only when no input is focused)
      if (!event.target.matches('input, textarea, select')) {
        const panAmount = shiftKey ? 50 : 10;
        switch (key) {
          case 'ArrowUp':
            event.preventDefault();
            // Pan up logic would go here
            break;
          case 'ArrowDown':
            event.preventDefault();
            // Pan down logic would go here
            break;
          case 'ArrowLeft':
            event.preventDefault();
            // Pan left logic would go here
            break;
          case 'ArrowRight':
            event.preventDefault();
            // Pan right logic would go here
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onUndo, onRedo, onClearAll, onZoomIn, onZoomOut, onFitToScreen, onResetZoom, onToolSelect]);
};

export default useKeyboardShortcuts;