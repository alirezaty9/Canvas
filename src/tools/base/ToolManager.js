export class ToolManager {
  constructor() {
    this.tools = new Map();
    this.activeTool = null;
    this.canvas = null;
    this.overlayCanvas = null;
    this.renderAllOverlays = null; // Will be set by ModularCanvas
  }

  setCanvas(canvas, overlayCanvas) {
    this.canvas = canvas;
    this.overlayCanvas = overlayCanvas;
  }

  registerTool(tool) {
    this.tools.set(tool.id, tool);
  }

  activateTool(toolId) {
    // Deactivate current tool
    if (this.activeTool) {
      this.activeTool.deactivate();
    }

    // Activate new tool
    const tool = this.tools.get(toolId);
    if (tool) {
      tool.activate();
      this.activeTool = tool;
      // Render overlay after activation
      if (this.renderAllOverlays) {
        this.renderAllOverlays();
      }
      return true;
    }
    return false;
  }

  deactivateAll() {
    if (this.activeTool) {
      this.activeTool.deactivate();
      this.activeTool = null;
      // Render overlay after deactivation
      if (this.renderAllOverlays) {
        this.renderAllOverlays();
      }
    }
  }

  /**
   * Handle mouse events and pass canvas state
   */
  handleMouseEvent(eventType, event, coords) {
    if (this.activeTool && this.activeTool[eventType]) {
      const canvasState = {
        width: this.canvas?.width || 0,
        height: this.canvas?.height || 0,
      };
      this.activeTool[eventType](event, coords, canvasState);
    }
  }

  getAllTools() {
    return Array.from(this.tools.values());
  }

  exportAllData() {
    const data = {};
    this.tools.forEach((tool) => {
      if (Object.keys(tool.data).length > 0) {
        data[tool.id] = tool.data;
      }
    });
    return data;
  }

  clearAllData() {
    this.tools.forEach((tool) => {
      tool.clearData();
    });
    if (this.renderAllOverlays) {
      this.renderAllOverlays();
    }
  }
}