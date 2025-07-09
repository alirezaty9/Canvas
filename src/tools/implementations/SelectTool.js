import { BaseTool } from '../base/BaseTool.js';

/**
 * SelectTool for selecting and analyzing pixels on the canvas
 */
export class SelectTool extends BaseTool {
  constructor() {
    super({
      id: 'select',
      name: 'انتخاب نقطه',
      icon: '📍',
      description: 'کلیک کنید تا نقطه انتخاب کنید و اطلاعات پیکسل را ببینید',
      defaultSettings: {
        pointSize: 5,
        pointColor: '#ff0000',
        showNumbers: true,
        showPixelData: true,
      },
    });
    this.history = []; // For undo functionality
  }

  onActivate() {
    document.body.style.cursor = 'crosshair';
  }

  onDeactivate() {
    document.body.style.cursor = 'default';
  }

  /**
   * Calculate pixel index from coordinates
   * @param {Object} coords - Coordinates {x, y}
   * @param {Object} canvasState - Canvas state containing image dimensions
   * @returns {number | null} Pixel index or null if dimensions unavailable
   */
  calculatePixelIndex(coords, canvasState) {
    const { width } = canvasState;
    if (!width) {
      console.warn('Image width not available for pixel index calculation');
      return null;
    }
    return coords.y * width + coords.x;
  }

  /**
   * Handle mouse down event to add a point
   * @param {MouseEvent} event - Mouse event
   * @param {Object} coords - Canvas coordinates and pixel data
   * @param {Object} canvasState - Canvas state with dimensions
   */
  onMouseDown(event, coords, canvasState = {}) {
    if (!coords) {
      console.warn('No coordinates provided for onMouseDown');
      return;
    }

    if (!this.data.points) {
      this.data.points = [];
    }

    const pixelIndex = this.calculatePixelIndex(coords, canvasState);

    const newPoint = {
      x: coords.x,
      y: coords.y,
      id: Date.now(),
      pixelData: coords.pixelData || { r: 0, g: 0, b: 0, a: 255 },
      pixelIndex,
    };

    this.data.points.push(newPoint);
    this.history.push({ action: 'add', point: newPoint });
    console.log('Point added:', newPoint);
  }

  /**
   * Render overlay for points
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} canvasState - Current canvas state
   */
  renderOverlay(ctx, canvasState) {
    if (!this.data.points) return;

    this.data.points.forEach((point) => {
      // Draw point
      ctx.fillStyle = this.settings.pointColor;
      ctx.beginPath();
      ctx.arc(point.x, point.y, this.settings.pointSize, 0, 2 * Math.PI);
      ctx.fill();

      // Draw number (pixel index or sequence)
      if (this.settings.showNumbers) {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.lineWidth = 2;
        const displayText = point.pixelIndex !== null ? `${point.pixelIndex}` : `${point.id}`;
        ctx.strokeText(displayText, point.x + 8, point.y - 8);
        ctx.fillText(displayText, point.x + 8, point.y - 8);
      }
    });
  }

  /**
   * Get UI data for rendering in SimpleToolbar
   * @returns {Object} Data for UI rendering
   */
  getUIData() {
    return {
      points: this.data.points || [],
      settings: this.settings,
    };
  }

  /**
   * Remove a point by index
   * @param {number} index - Index of point to remove
   */
  removePoint(index) {
    if (this.data.points && this.data.points[index]) {
      const removedPoint = this.data.points.splice(index, 1)[0];
      this.history.push({ action: 'remove', point: removedPoint, index });
    }
  }

  /**
   * Clear all points
   */
  clearAllPoints() {
    if (this.data.points?.length) {
      this.history.push({ action: 'clear', points: [...this.data.points] });
      this.data.points = [];
    }
  }

  /**
   * Undo last action
   */
  undoLastPoint() {
    const lastAction = this.history.pop();
    if (!lastAction) return;

    if (lastAction.action === 'add') {
      this.data.points = this.data.points.filter((p) => p.id !== lastAction.point.id);
    } else if (lastAction.action === 'remove') {
      this.data.points.splice(lastAction.index, 0, lastAction.point);
    } else if (lastAction.action === 'clear') {
      this.data.points = [...lastAction.points];
    }
  }
}