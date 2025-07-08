import { BaseTool } from '../base/BaseTool.js';

export class SelectTool extends BaseTool {
  constructor() {
    super({
      id: 'select',
      name: 'انتخاب نقطه',
      icon: '📍',
      description: 'کلیک کنید تا نقطه انتخاب کنید',
      defaultSettings: {
        pointSize: 5,
        pointColor: '#ff0000',
        showNumbers: true
      }
    });
  }

  onActivate() {
    document.body.style.cursor = 'crosshair';
  }

  onDeactivate() {
    document.body.style.cursor = 'default';
  }

  onMouseDown(event, coords) {
    if (!coords) return;

    if (!this.data.points) {
      this.data.points = [];
    }

    const newPoint = {
      x: coords.x,
      y: coords.y,
      id: Date.now()
    };

    this.data.points.push(newPoint);
  }

  renderOverlay(ctx, canvasState) {
    if (!this.data.points) return;

    this.data.points.forEach((point, index) => {
      // رسم نقطه
      ctx.fillStyle = this.settings.pointColor;
      ctx.beginPath();
      ctx.arc(point.x, point.y, this.settings.pointSize, 0, 2 * Math.PI);
      ctx.fill();

      // رسم شماره
      if (this.settings.showNumbers) {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.lineWidth = 2;
        ctx.strokeText(`${index + 1}`, point.x + 8, point.y - 8);
        ctx.fillText(`${index + 1}`, point.x + 8, point.y - 8);
      }
    });
  }

  renderUI() {
    const points = this.data.points || [];
    
    return `
      <div class="p-4">
        <h3 class="font-bold mb-2">نقاط انتخاب شده: ${points.length}</h3>
        <div class="max-h-32 overflow-y-auto">
          ${points.map((point, index) => `
            <div class="flex justify-between items-center p-1 border-b">
              <span>${index + 1}: (${Math.round(point.x)}, ${Math.round(point.y)})</span>
              <button onclick="window.removePoint(${index})" class="text-red-500">حذف</button>
            </div>
          `).join('')}
        </div>
        <button onclick="window.clearAllPoints()" class="mt-2 px-3 py-1 bg-red-500 text-white rounded">
          پاک کردن همه
        </button>
      </div>
    `;
  }

  removePoint(index) {
    if (this.data.points && this.data.points[index]) {
      this.data.points.splice(index, 1);
    }
  }

  clearAllPoints() {
    this.data.points = [];
  }
}