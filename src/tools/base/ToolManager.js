export class ToolManager {
  constructor() {
    this.tools = new Map();
    this.activeTool = null;
    this.canvas = null;
    this.overlayCanvas = null;
  }

  setCanvas(canvas, overlayCanvas) {
    this.canvas = canvas;
    this.overlayCanvas = overlayCanvas;
  }

  registerTool(tool) {
    this.tools.set(tool.id, tool);
  }

  activateTool(toolId) {
    // غیرفعال کردن ابزار قبلی
    if (this.activeTool) {
      this.activeTool.deactivate();
    }

    // فعال کردن ابزار جدید
    const tool = this.tools.get(toolId);
    if (tool) {
      tool.activate();
      this.activeTool = tool;
      return true;
    }
    return false;
  }

  deactivateAll() {
    if (this.activeTool) {
      this.activeTool.deactivate();
      this.activeTool = null;
    }
  }

  handleMouseEvent(eventType, event, coords) {
    if (this.activeTool && this.activeTool[eventType]) {
      this.activeTool[eventType](event, coords);
    }
  }

  renderAllOverlays() {
    if (!this.overlayCanvas) return;
    
    const ctx = this.overlayCanvas.getContext('2d');
    ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
    
    // رندر همه ابزارهایی که داده دارن
    this.tools.forEach(tool => {
      if (Object.keys(tool.data).length > 0 || tool.isActive) {
        tool.renderOverlay(ctx, {});
      }
    });
  }

  getAllTools() {
    return Array.from(this.tools.values());
  }

  exportAllData() {
    const data = {};
    this.tools.forEach(tool => {
      if (Object.keys(tool.data).length > 0) {
        data[tool.id] = tool.data;
      }
    });
    return data;
  }
}