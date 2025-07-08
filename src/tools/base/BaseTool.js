export class BaseTool {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.icon = config.icon;
    this.description = config.description;
    this.isActive = false;
    this.data = {};
    this.settings = { ...config.defaultSettings };
  }

  activate() {
    this.isActive = true;
    this.onActivate();
  }

  deactivate() {
    this.isActive = false;
    this.onDeactivate();
  }

  // متدهایی که هر ابزار باید پیاده‌سازی کنه
  onActivate() {}
  onDeactivate() {}
  onMouseDown(event, coords) {}
  onMouseMove(event, coords) {}
  onMouseUp(event, coords) {}
  renderOverlay(ctx, canvasState) {}
  renderUI() { return null; }

  // مدیریت داده
  setData(data) {
    this.data = { ...this.data, ...data };
  }

  getData() {
    return this.data;
  }

  clearData() {
    this.data = {};
  }

  // export
  export() {
    return JSON.stringify(this.data);
  }
}