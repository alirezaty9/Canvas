import { BaseTool } from '../base/BaseTool.js';

/**
 * DrawTool for drawing lines between selected points on the canvas
 */
export class DrawTool extends BaseTool {
  constructor() {
    super({
      id: 'draw',
      name: 'رسم خط',
      icon: '📏',
      description: 'کلیک کنید تا نقاط را انتخاب کنید، خط بین نقاط متوالی رسم می‌شود',
      defaultSettings: {
        lineWidth: 2,
        lineColor: '#00ff00',
        showLength: true,
      },
    });
    this.points = []; // Store selected points
    this.lines = []; // Store drawn lines
    this.history = []; // For undo/redo functionality
  }

  onActivate() {
    document.body.style.cursor = 'crosshair';
  }

  onDeactivate() {
    document.body.style.cursor = 'default';
  }

  /**
   * Calculate line length
   * @param {Object} line - Line object with start and end points
   * @returns {number} Length in pixels
   */
  calculateLineLength(line) {
    const dx = line.end.x - line.start.x;
    const dy = line.end.y - line.start.y;
    return Math.sqrt(dx * dx + dy * dy);
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
   * Handle mouse down event to add a point and draw line
   * @param {MouseEvent} event - Mouse event
   * @param {Object} coords - Canvas coordinates and pixel data
   * @param {Object} canvasState - Canvas state with dimensions
   */
  onMouseDown(event, coords, canvasState = {}) {
    if (!coords) {
      console.warn('No coordinates provided for onMouseDown');
      return;
    }

    const newPoint = {
      x: coords.x,
      y: coords.y,
      id: Date.now(),
      pixelData: coords.pixelData || { r: 0, g: 0, b: 0, a: 255 },
      pixelIndex: this.calculatePixelIndex(coords, canvasState),
    };

    this.points.push(newPoint);
    this.history.push({ action: 'add_point', point: newPoint });

    // If we have at least two points, draw a line between the last two
    if (this.points.length >= 2) {
      const lastPoint = this.points[this.points.length - 2];
      const newLine = {
        start: { ...lastPoint },
        end: { ...newPoint },
        id: Date.now(),
        length: this.calculateLineLength({
          start: lastPoint,
          end: newPoint,
        }),
        color: this.settings.lineColor, // Use global color for new lines
      };
      this.lines.push(newLine);
      this.history.push({ action: 'add_line', line: newLine });
    }

    console.log('Point added:', newPoint, 'Total points:', this.points.length, 'Total lines:', this.lines.length);
  }

  /**
   * Render overlay for points and lines
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} canvasState - Current canvas state
   */
  renderOverlay(ctx, canvasState) {
    // Draw points
    this.points.forEach((point) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw lines
    if (this.lines) {
      this.lines.forEach((line) => {
        ctx.strokeStyle = line.color || this.settings.lineColor;
        ctx.lineWidth = this.settings.lineWidth;
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.stroke();

        // Show length if enabled
        if (this.settings.showLength) {
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#000000';
          ctx.font = '12px Arial';
          ctx.lineWidth = 2;
          const midX = (line.start.x + line.end.x) / 2;
          const midY = (line.start.y + line.end.y) / 2;
          ctx.strokeText(`${Math.round(line.length)}px`, midX, midY - 8);
          ctx.fillText(`${Math.round(line.length)}px`, midX, midY - 8);
        }
      });
    }
  }

  /**
   * Get UI data for rendering in SimpleToolbar
   * @returns {Object} Data for UI rendering
   */
  getUIData() {
    return {
      lines: this.lines || [],
      points: this.points || [],
      settings: this.settings,
    };
  }

  /**
   * Remove a line by index
   * @param {number} index - Index of line to remove
   */
  removeLine(index) {
    if (this.lines && this.lines[index]) {
      const removedLine = this.lines.splice(index, 1)[0];
      this.history.push({ action: 'remove_line', line: removedLine, index });
    }
  }

  /**
   * Clear all lines and points
   */
  clearAllLines() {
    if (this.lines?.length || this.points?.length) {
      this.history.push({ 
        action: 'clear', 
        lines: [...this.lines], 
        points: [...this.points] 
      });
      this.lines = [];
      this.points = [];
    }
  }

  /**
   * Undo last action
   */
  undoLastLine() {
    const lastAction = this.history.pop();
    if (!lastAction) return;

    if (lastAction.action === 'add_point') {
      this.points.pop();
    } else if (lastAction.action === 'add_line') {
      this.lines = this.lines.filter((l) => l.id !== lastAction.line.id);
    } else if (lastAction.action === 'remove_line') {
      this.lines.splice(lastAction.index, 0, lastAction.line);
    } else if (lastAction.action === 'clear') {
      this.lines = [...lastAction.lines];
      this.points = [...lastAction.points];
    }
  }

  /**
   * Update line color for a specific line
   * @param {number} index - Index of the line
   * @param {string} color - New color value
   */
  updateLineColor(index, color) {
    console.log('Updating line color for line', index, 'to:', color);
    if (this.lines[index]) {
      this.lines[index].color = color;
    }
  }

  /**
   * Update global line color for new lines
   * @param {string} color - New global color value
   */
  updateGlobalLineColor(color) {
    console.log('Updating global line color to:', color);
    this.settings.lineColor = color;
  }

  /**
   * Update line width (global setting)
   * @param {number} width - New width value
   */
  updateLineWidth(width) {
    console.log('Updating line width to:', width);
    this.settings.lineWidth = parseInt(width, 10);
  }
}