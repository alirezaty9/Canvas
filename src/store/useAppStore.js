import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  // Canvas state
  imageData: null,
  currentCoords: null,
  
  // Tool state
  activeTool: null,
  toolManager: null,
  
  // Actions
  setImageData: (data) => set({ imageData: data }),
  setCurrentCoords: (coords) => set({ currentCoords: coords }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setToolManager: (manager) => set({ toolManager: manager }),
}));