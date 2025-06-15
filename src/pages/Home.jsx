// src/pages/Home.jsx
import React, { useState } from "react";
import CameraViewer from "../components/CameraViewer";
import Toolbar from "../components/Toolbar";
import HelpPanel from "../components/HelpPanel";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";

export default function Home() {
  const [selectedTool, setSelectedTool] = useState(null);

  const handleToolSelect = (toolId, toolData) => {
    setSelectedTool(toolId);
    console.log('ابزار انتخاب شده:', toolId, toolData);
    
    // اینجا می‌تونید منطق مربوط به هر ابزار را اضافه کنید
    if (toolId) {
      console.log(`ابزار ${toolData.name} فعال شد`);
    } else {
      console.log('همه ابزارها غیرفعال شدند');
    }
  };

  // تنظیم میانبرهای کیبورد
  useKeyboardShortcuts({
    onToolSelect: (toolId) => setSelectedTool(toolId),
    onUndo: () => console.log('Undo triggered'),
    onRedo: () => console.log('Redo triggered'),
    onClearAll: () => console.log('Clear all triggered'),
    onZoomIn: () => console.log('Zoom in triggered'),
    onZoomOut: () => console.log('Zoom out triggered'),
    onFitToScreen: () => console.log('Fit to screen triggered'),
    onResetZoom: () => console.log('Reset zoom triggered')
  });

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* هدر */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text font-vazir mb-2">
            سیستم تحلیل و پردازش تصویر دوربین Basler
          </h1>
          <p className="text-text-muted font-vazir">
            ابزارهای پیشرفته برای تحلیل تصویر، اندازه‌گیری، و استخراج داده
          </p>
        </div>

        {/* محتوای اصلی */}
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* نوار ابزار - 2 ستون */}
          <div className="col-span-2">
            <Toolbar onToolSelect={handleToolSelect} />
          </div>

          {/* نمایش دوربین + پنل‌های داده - 10 ستون */}
          <div className="col-span-10">
            <CameraViewer selectedTool={selectedTool} />
          </div>
        </div>

        {/* نوار وضعیت پایین */}
        <div className="mt-4 bg-background-white border border-border rounded-lg p-3">
          <div className="flex items-center justify-between text-sm text-text-muted">
            <div className="flex items-center gap-4 font-vazir">
              <span>وضعیت سیستم: فعال</span>
              <span>آخرین به‌روزرسانی: {new Date().toLocaleTimeString('fa-IR')}</span>
              <span>نسخه: 2.0.0</span>
            </div>
            
            <div className="flex items-center gap-4 font-vazir">
              {selectedTool && (
                <span className="text-primary">
                  ابزار فعال: {selectedTool}
                </span>
              )}
              <span>Qt Backend: متصل</span>
              <span>میانبرها: فعال</span>
            </div>
          </div>
        </div>
      </div>

      {/* پنل راهنما */}
      <HelpPanel />
    </div>
  );
}