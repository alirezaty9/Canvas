import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';

const SimpleToolbar = ({ tools, onToolSelect }) => {
  const { activeTool, toolManager } = useAppStore();
  const [showToolUI, setShowToolUI] = useState(false);
  const scrollRef = useRef(null);
  const scrollPosition = useRef(0);

  const handleToolClick = (tool) => {
    if (activeTool === tool.id) {
      onToolSelect(null);
      setShowToolUI(false);
    } else {
      onToolSelect(tool.id);
      setShowToolUI(true);
    }
  };

  const activeToolObj = tools.find((t) => t.id === activeTool);

  // Preserve scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        scrollPosition.current = scrollRef.current.scrollTop;
      }
    };

    if (scrollRef.current) {
      scrollRef.current.addEventListener('scroll', handleScroll);
      scrollRef.current.scrollTop = scrollPosition.current;
    }

    return () => {
      if (scrollRef.current) {
        scrollRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [activeToolObj]);

  // Render SelectTool UI
  const renderSelectToolUI = () => {
    if (!activeToolObj || activeToolObj.id !== 'select') return null;
    const { points, settings } = activeToolObj.getUIData();

    return (
      <div className="p-4">
        <h3 className="font-bold mb-2">نقاط انتخاب شده: {points.length}</h3>
        <div ref={scrollRef} className="max-h-32 overflow-y-auto border border-gray-200 rounded">
          {points.map((point, index) => (
            <div key={point.id} className="flex justify-between items-center p-1 border-b">
              <span>
                پیکسل: {point.pixelIndex !== null ? point.pixelIndex : 'نامشخص'}
                <br />
                مختصات: ({Math.round(point.x)}, {Math.round(point.y)})
                <br />
                {settings.showPixelData
                  ? `RGB: (${point.pixelData.r}, ${point.pixelData.g}, ${point.pixelData.b})`
                  : ''}
              </span>
              <button
                onClick={() => {
                  activeToolObj.removePoint(index);
                  toolManager.renderAllOverlays();
                }}
                className="text-red-500"
              >
                حذف
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => {
              activeToolObj.clearAllPoints();
              toolManager.renderAllOverlays();
            }}
            className="px-3 py-1 bg-red-500 text-white rounded"
          >
            پاک کردن همه
          </button>
          <button
            onClick={() => {
              activeToolObj.undoLastPoint();
              toolManager.renderAllOverlays();
            }}
            className="px-3 py-1 bg-gray-500 text-white rounded"
          >
            لغو آخرین
          </button>
        </div>
      </div>
    );
  };

  // Render DrawTool UI
  const renderDrawToolUI = () => {
    if (!activeToolObj || activeToolObj.id !== 'draw') return null;
    const { lines, points, settings } = activeToolObj.getUIData();

    return (
      <div className="p-4">
        <h3 className="font-bold mb-2">خطوط رسم شده: {lines.length} (نقاط: {points.length})</h3>
        <div className="mb-4">
          <label className="block text-sm mb-1">رنگ پیش‌فرض (خطوط جدید):</label>
          <input
            type="color"
            value={settings.lineColor}
            onChange={(e) => {
              activeToolObj.updateGlobalLineColor(e.target.value);
              toolManager.renderAllOverlays();
            }}
            className="w-full h-8 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-1">ضخامت خط (همه خطوط): {settings.lineWidth}px</label>
          <input
            type="range"
            min="1"
            max="10"
            value={settings.lineWidth}
            onChange={(e) => {
              activeToolObj.updateLineWidth(e.target.value);
              toolManager.renderAllOverlays();
            }}
            className="w-full"
          />
        </div>
        <div ref={scrollRef} className="max-h-32 overflow-y-auto border border-gray-200 rounded">
          {lines.map((line, index) => (
            <div key={line.id} className="flex justify-between items-center p-1 border-b">
              <div>
                <span>
                  خط {index + 1}: طول={Math.round(line.length)}px
                  <br />
                  پیکسل شروع: {line.start.pixelIndex !== null ? line.start.pixelIndex : 'نامشخص'}
                  <br />
                  RGB شروع: ({line.start.pixelData.r}, {line.start.pixelData.g}, {line.start.pixelData.b})
                </span>
                <div className="mt-1">
                  <label className="text-sm">رنگ خط:</label>
                  <input
                    type="color"
                    value={line.color || settings.lineColor}
                    onChange={(e) => {
                      activeToolObj.updateLineColor(index, e.target.value);
                      toolManager.renderAllOverlays();
                    }}
                    className="ml-2 h-6 w-10 rounded"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  activeToolObj.removeLine(index);
                  toolManager.renderAllOverlays();
                }}
                className="text-red-500"
              >
                حذف
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => {
              activeToolObj.clearAllLines();
              toolManager.renderAllOverlays();
            }}
            className="px-3 py-1 bg-red-500 text-white rounded"
          >
            پاک کردن همه
          </button>
          <button
            onClick={() => {
              activeToolObj.undoLastLine();
              toolManager.renderAllOverlays();
            }}
            className="px-3 py-1 bg-gray-500 text-white rounded"
          >
            لغو آخرین
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      {/* هدر */}
      <div className="p-3 border-b">
        <h3 className="font-semibold">ابزارها</h3>
      </div>

      {/* لیست ابزارها */}
      <div className="p-2 space-y-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
              activeTool === tool.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span className="text-2xl">{tool.icon}</span>
            <div className="text-left">
              <div className="font-medium">{tool.name}</div>
              <div className="text-sm text-gray-500">{tool.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* UI ابزار فعال */}
      {showToolUI && activeToolObj && (
        <div className="border-t">
          {activeToolObj.id === 'select' ? (
            renderSelectToolUI()
          ) : activeToolObj.id === 'draw' ? (
            renderDrawToolUI()
          ) : (
            <div dangerouslySetInnerHTML={{ __html: activeToolObj.renderUI() }} />
          )}
        </div>
      )}

      {/* دکمه‌های کنترل */}
      <div className="p-3 border-t space-y-2">
        <button
          onClick={() => {
            tools.forEach((tool) => tool.clearData());
            window.location.reload();
          }}
          className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          پاک کردن همه
        </button>
        <button
          onClick={() => {
            const data = {};
            tools.forEach((tool) => {
              if (Object.keys(tool.data).length > 0) {
                data[tool.id] = tool.data;
              }
            });
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tools_data_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          دانلود داده‌ها
        </button>
      </div>
    </div>
  );
};

export default SimpleToolbar;