import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

const SimpleToolbar = ({ tools, onToolSelect }) => {
  const { activeTool } = useAppStore();
  const [showToolUI, setShowToolUI] = useState(false);

  const handleToolClick = (tool) => {
    if (activeTool === tool.id) {
      onToolSelect(null);
      setShowToolUI(false);
    } else {
      onToolSelect(tool.id);
      setShowToolUI(true);
    }
  };

  const activeToolObj = tools.find(t => t.id === activeTool);

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
          <div 
            dangerouslySetInnerHTML={{ 
              __html: activeToolObj.renderUI() 
            }} 
          />
        </div>
      )}

      {/* دکمه‌های کنترل */}
      <div className="p-3 border-t space-y-2">
        <button 
          onClick={() => {
            tools.forEach(tool => tool.clearData());
            window.location.reload(); // ساده‌ترین راه برای رفرش
          }}
          className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          پاک کردن همه
        </button>
        
        <button 
          onClick={() => {
            const data = {};
            tools.forEach(tool => {
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