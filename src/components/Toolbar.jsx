// src/components/Toolbar.jsx
import React, { useState } from 'react';

const Toolbar = ({ onToolSelect }) => {
  const [activeTool, setActiveTool] = useState(null);

  const tools = [
    {
      id: 'select',
      name: 'انتخاب نقطه',
      icon: '📍',
      description: 'انتخاب نقاط روی تصویر'
    },
    {
      id: 'draw',
      name: 'رسم خط',
      icon: '📏',
      description: 'رسم خط برای پروفایل'
    },
    {
      id: 'crop',
      name: 'کراپ',
      icon: '✂️',
      description: 'برش ناحیه از تصویر'
    },
    {
      id: 'zoom',
      name: 'زوم',
      icon: '🔍',
      description: 'بزرگنمایی تصویر'
    },
    {
      id: 'pan',
      name: 'جابجایی',
      icon: '✋',
      description: 'جابجایی تصویر'
    },
    {
      id: 'measure',
      name: 'اندازه‌گیری',
      icon: '📐',
      description: 'اندازه‌گیری فاصله'
    }
  ];

  const handleToolClick = (tool) => {
    const newActiveTool = activeTool === tool.id ? null : tool.id;
    setActiveTool(newActiveTool);
    
    if (onToolSelect) {
      onToolSelect(newActiveTool, tool);
    }
  };

  return (
    <div className="bg-background-white border border-border rounded-lg shadow-sm">
      {/* هدر نوار ابزار */}
      <div className="border-b border-border p-3">
        <h3 className="text-sm font-semibold text-text font-vazir">نوار ابزار</h3>
      </div>

      {/* ابزارها */}
      <div className="p-2">
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool)}
              className={`
                group relative p-3 rounded-lg border transition-all duration-200
                hover:shadow-md hover:scale-105
                ${activeTool === tool.id 
                  ? 'bg-primary text-white border-primary shadow-md' 
                  : 'bg-background hover:bg-background-secondary border-border text-text'
                }
              `}
              title={tool.description}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg">{tool.icon}</span>
                <span className="text-xs font-vazir font-medium">
                  {tool.name}
                </span>
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 font-vazir">
                {tool.description}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </button>
          ))}
        </div>

        {/* نمایش ابزار فعال */}
        {activeTool && (
          <div className="mt-3 p-3 bg-background-secondary rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-primary font-medium font-vazir">
                ابزار فعال:
              </span>
              <span className="text-text font-vazir">
                {tools.find(t => t.id === activeTool)?.name}
              </span>
            </div>
            
            {/* تنظیمات ابزار بر اساس نوع */}
            {activeTool === 'select' && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-vazir">
                  <input type="checkbox" className="rounded" />
                  نمایش شماره نقاط
                </label>
                <label className="flex items-center gap-2 text-sm font-vazir">
                  <input type="checkbox" className="rounded" />
                  اتصال نقاط با خط
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-vazir">اندازه نقطه:</span>
                  <input 
                    type="range" 
                    min="2" 
                    max="10" 
                    defaultValue="5"
                    className="flex-1"
                  />
                </div>
              </div>
            )}

            {activeTool === 'draw' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-vazir">ضخامت خط:</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    defaultValue="2"
                    className="flex-1"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 bg-red-500 rounded cursor-pointer border-2 border-gray-300"></div>
                  <div className="w-6 h-6 bg-blue-500 rounded cursor-pointer border-2 border-gray-300"></div>
                  <div className="w-6 h-6 bg-green-500 rounded cursor-pointer border-2 border-gray-300"></div>
                  <div className="w-6 h-6 bg-yellow-500 rounded cursor-pointer border-2 border-gray-300"></div>
                </div>
                <label className="flex items-center gap-2 text-sm font-vazir">
                  <input type="checkbox" className="rounded" defaultChecked />
                  محاسبه پروفایل خطی
                </label>
              </div>
            )}

            {activeTool === 'crop' && (
              <div className="space-y-2">
                <div className="text-sm text-text-muted font-vazir">
                  کلیک و کشیدن برای انتخاب ناحیه
                </div>
                <label className="flex items-center gap-2 text-sm font-vazir">
                  <input type="checkbox" className="rounded" />
                  حفظ نسبت ابعاد
                </label>
                <div className="flex gap-2">
                  <button className="flex-1 text-xs p-1 bg-background-secondary rounded font-vazir">
                    مربع
                  </button>
                  <button className="flex-1 text-xs p-1 bg-background-secondary rounded font-vazir">
                    مستطیل
                  </button>
                </div>
              </div>
            )}

            {activeTool === 'zoom' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-vazir">سطح زوم:</span>
                  <select className="flex-1 p-1 border border-border rounded text-sm">
                    <option>25%</option>
                    <option>50%</option>
                    <option>100%</option>
                    <option>150%</option>
                    <option>200%</option>
                    <option>300%</option>
                    <option>500%</option>
                  </select>
                </div>
                <button className="w-full p-2 bg-primary text-white rounded text-sm font-vazir hover:bg-primary-dark">
                  تنظیم به اندازه صفحه
                </button>
                <div className="text-xs text-text-muted font-vazir">
                  Shift + کلیک: زوم اوت
                  <br />
                  Mouse wheel: زوم تدریجی
                </div>
              </div>
            )}

            {activeTool === 'pan' && (
              <div className="space-y-2">
                <div className="text-sm text-text-muted font-vazir">
                  کلیک و کشیدن برای جابجایی تصویر
                </div>
                <button className="w-full p-2 bg-background-secondary text-text rounded text-sm font-vazir hover:bg-border">
                  بازگشت به مرکز
                </button>
                <div className="text-xs text-text-muted font-vazir">
                  فلش‌های کیبورد: جابجایی دقیق
                </div>
              </div>
            )}

            {activeTool === 'measure' && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-vazir">
                  <input type="checkbox" className="rounded" defaultChecked />
                  نمایش فاصله
                </label>
                <label className="flex items-center gap-2 text-sm font-vazir">
                  <input type="checkbox" className="rounded" />
                  نمایش زاویه
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-vazir">واحد:</span>
                  <select className="flex-1 p-1 border border-border rounded text-sm">
                    <option>پیکسل</option>
                    <option>میلی‌متر</option>
                    <option>میکرومتر</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* دکمه‌های کنترل */}
        <div className="mt-3 pt-3 border-t border-border">
          <div className="grid grid-cols-2 gap-2">
            <button className="p-2 bg-background-secondary hover:bg-border rounded text-sm font-vazir transition-colors">
              پاک کردن همه
            </button>
            <button className="p-2 bg-primary hover:bg-primary-dark text-white rounded text-sm font-vazir transition-colors">
              ذخیره تنظیمات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;