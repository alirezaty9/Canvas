import { BaseTool } from '../base/BaseTool.js';

export class CropTool extends BaseTool {
  constructor() {
    super({
      id: 'crop',
      name: 'برش تصویر',
      icon: '✂️',
      description: 'کلیک و کشیدن برای انتخاب ناحیه برش'
    });
    this.isCropping = false;
    this.cropStart = null;
  }

  onMouseDown(event, coords) {
    if (!coords) return;
    
    this.isCropping = true;
    this.cropStart = { x: coords.x, y: coords.y };
    this.data.cropArea = {
      x: coords.x,
      y: coords.y,
      width: 0,
      height: 0
    };
  }

  onMouseMove(event, coords) {
    if (!this.isCropping || !coords || !this.cropStart) return;
    
    this.data.cropArea = {
      x: Math.min(this.cropStart.x, coords.x),
      y: Math.min(this.cropStart.y, coords.y),
      width: Math.abs(coords.x - this.cropStart.x),
      height: Math.abs(coords.y - this.cropStart.y)
    };
  }

  onMouseUp(event, coords) {
    this.isCropping = false;
  }

  renderOverlay(ctx, canvasState) {
    if (!this.data.cropArea) return;
    
    const crop = this.data.cropArea;
    
    // رسم مستطیل برش
    ctx.strokeStyle = '#0099ff';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);
    ctx.setLineDash([]);
    
    // سایه برای نواحی خارج از برش
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    // بالا
    ctx.fillRect(0, 0, ctx.canvas.width, crop.y);
    // پایین
    ctx.fillRect(0, crop.y + crop.height, ctx.canvas.width, ctx.canvas.height);
    // چپ
    ctx.fillRect(0, crop.y, crop.x, crop.height);
    // راست
    ctx.fillRect(crop.x + crop.width, crop.y, ctx.canvas.width, crop.height);
  }

  renderUI() {
    const crop = this.data.cropArea;
    
    return `
      <div class="p-4">
        <h3 class="font-bold mb-2">ناحیه برش</h3>
        ${crop ? `
          <div class="text-sm mb-2">
            <div>X: ${Math.round(crop.x)}</div>
            <div>Y: ${Math.round(crop.y)}</div>
            <div>عرض: ${Math.round(crop.width)}</div>
            <div>ارتفاع: ${Math.round(crop.height)}</div>
          </div>
          <button onclick="window.applyCrop()" class="px-3 py-1 bg-green-500 text-white rounded mr-2">
            اعمال برش
          </button>
        ` : '<div class="text-gray-500">ناحیه‌ای انتخاب نشده</div>'}
        <button onclick="window.clearCrop()" class="px-3 py-1 bg-red-500 text-white rounded">
          پاک کردن
        </button>
      </div>
    `;
  }

  clearCrop() {
    this.data.cropArea = null;
  }
}