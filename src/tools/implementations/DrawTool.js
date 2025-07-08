import { BaseTool } from '../base/BaseTool.js';

export class DrawTool extends BaseTool {
  constructor() {
    super({
      id: 'draw',
      name: 'رسم خط',
      icon: '📏',
      description: 'کلیک و کشیدن برای رسم خط',
      defaultSettings: {
        lineWidth: 2,
        lineColor: '#00ff00'
      }
    });
    this.isDrawing = false;
    this.currentLine = null;
  }

  onMouseDown(event, coords) {
    if (!coords) return;
    
    this.isDrawing = true;
    this.currentLine = {
      start: { x: coords.x, y: coords.y },
      end: { x: coords.x, y: coords.y }
    };
  }

  onMouseMove(event, coords) {
    if (!this.isDrawing || !coords || !this.currentLine) return;
    
    this.currentLine.end = { x: coords.x, y: coords.y };
  }

  onMouseUp(event, coords) {
    if (!this.isDrawing || !this.currentLine) return;
    
    if (!this.data.lines) {
      this.data.lines = [];
    }
    
    this.data.lines.push({
      ...this.currentLine,
      id: Date.now()
    });
    
    this.isDrawing = false;
    this.currentLine = null;
  }

  renderOverlay(ctx, canvasState) {
    // رسم خطوط ذخیره شده
    if (this.data.lines) {
      ctx.strokeStyle = this.settings.lineColor;
      ctx.lineWidth = this.settings.lineWidth;
      
      this.data.lines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.stroke();
      });
    }

    // رسم خط جاری
    if (this.currentLine) {
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = this.settings.lineWidth;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(this.currentLine.start.x, this.currentLine.start.y);
      ctx.lineTo(this.currentLine.end.x, this.currentLine.end.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  renderUI() {
    const lines = this.data.lines || [];
    
    return `
      <div class="p-4">
        <h3 class="font-bold mb-2">خطوط رسم شده: ${lines.length}</h3>
        <button onclick="window.clearAllLines()" class="px-3 py-1 bg-red-500 text-white rounded">
          پاک کردن همه خطوط
        </button>
      </div>
    `;
  }

  clearAllLines() {
    this.data.lines = [];
  }
}