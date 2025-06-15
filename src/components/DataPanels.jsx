// src/components/DataPanels.jsx
import React, { useState, useEffect } from 'react';

const CoordinateTable = ({ points, currentCoord }) => {
  return (
    <div className="bg-background-white border border-border rounded-lg p-4">
      <h3 className="text-sm font-semibold text-text font-vazir mb-3">جدول مختصات</h3>
      
      <div className="max-h-40 overflow-y-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-right p-2 font-vazir">#</th>
              <th className="text-right p-2 font-vazir">X</th>
              <th className="text-right p-2 font-vazir">Y</th>
              <th className="text-right p-2 font-vazir">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point, index) => (
              <tr key={point.id || index} className="border-b border-border hover:bg-background-secondary">
                <td className="p-2 text-text-muted">{index + 1}</td>
                <td className="p-2 text-text font-mono">{Math.round(point.x)}</td>
                <td className="p-2 text-text font-mono">{Math.round(point.y)}</td>
                <td className="p-2">
                  <button className="text-highlight hover:text-highlight-dark text-xs">
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {currentCoord && (
        <div className="mt-3 p-2 bg-background-secondary rounded text-xs">
          <span className="text-text-muted font-vazir">مختصات جاری: </span>
          <span className="text-text font-mono">
            X: {Math.round(currentCoord.x)}, Y: {Math.round(currentCoord.y)}
          </span>
        </div>
      )}
      
      {points.length > 1 && (
        <div className="mt-3 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-text-muted font-vazir">فاصله کل:</span>
            <span className="text-text font-mono">
              {calculateTotalDistance(points).toFixed(2)} px
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted font-vazir">میانگین X:</span>
            <span className="text-text font-mono">
              {(points.reduce((sum, p) => sum + p.x, 0) / points.length).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted font-vazir">میانگین Y:</span>
            <span className="text-text font-mono">
              {(points.reduce((sum, p) => sum + p.y, 0) / points.length).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileChart = ({ profile, line }) => {
  const [chartType, setChartType] = useState('intensity'); // intensity, rgb, histogram
  
  if (!profile || profile.length === 0) {
    return (
      <div className="bg-background-white border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-text font-vazir mb-3">نمودار پروفایل خطی</h3>
        <div className="h-40 flex items-center justify-center text-text-muted font-vazir">
          برای نمایش نمودار یک خط رسم کنید
        </div>
      </div>
    );
  }

  const maxIntensity = Math.max(...profile.map(p => p.intensity));
  const minIntensity = Math.min(...profile.map(p => p.intensity));
  const range = maxIntensity - minIntensity;

  const generatePath = (data, valueKey, height = 120) => {
    if (data.length < 2) return '';
    
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * 300;
      const value = valueKey === 'intensity' ? point.intensity : point.rgb[valueKey];
      const y = height - ((value - minIntensity) / range) * height;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="bg-background-white border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text font-vazir">نمودار پروفایل خطی</h3>
        <select 
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="text-xs border border-border rounded px-2 py-1"
        >
          <option value="intensity">شدت نور</option>
          <option value="rgb">RGB</option>
          <option value="histogram">هیستوگرام</option>
        </select>
      </div>
      
      <div className="relative">
        <svg width="300" height="140" className="border border-border rounded">
          {/* Grid */}
          <defs>
            <pattern id="grid" width="30" height="12" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 12" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {chartType === 'intensity' && (
            <path
              d={generatePath(profile, 'intensity')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />
          )}
          
          {chartType === 'rgb' && (
            <>
              <path
                d={generatePath(profile, 'r')}
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.5"
              />
              <path
                d={generatePath(profile, 'g')}
                fill="none"
                stroke="#10b981"
                strokeWidth="1.5"
              />
              <path
                d={generatePath(profile, 'b')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.5"
              />
            </>
          )}
          
          {/* Labels */}
          <text x="5" y="15" fontSize="10" fill="#6b7280">
            {Math.round(maxIntensity)}
          </text>
          <text x="5" y="125" fontSize="10" fill="#6b7280">
            {Math.round(minIntensity)}
          </text>
          <text x="280" y="135" fontSize="10" fill="#6b7280">
            {profile.length} px
          </text>
        </svg>
        
        {/* Legend for RGB */}
        {chartType === 'rgb' && (
          <div className="flex gap-4 mt-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="font-vazir">قرمز</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="font-vazir">سبز</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="font-vazir">آبی</span>
            </div>
          </div>
        )}
      </div>
      
      {/* آمار پروفایل */}
      <div className="mt-3 space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-text-muted font-vazir">طول خط:</span>
          <span className="text-text font-mono">
            {Math.sqrt(
              Math.pow(line.end.x - line.start.x, 2) + 
              Math.pow(line.end.y - line.start.y, 2)
            ).toFixed(2)} px
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted font-vazir">میانگین شدت:</span>
          <span className="text-text font-mono">
            {(profile.reduce((sum, p) => sum + p.intensity, 0) / profile.length).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted font-vazir">حداکثر:</span>
          <span className="text-text font-mono">{maxIntensity.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted font-vazir">حداقل:</span>
          <span className="text-text font-mono">{minIntensity.toFixed(2)}</span>
        </div>
      </div>
      
      {/* Export options */}
      <div className="mt-3 flex gap-2">
        <button 
          onClick={() => exportProfileData(profile, 'csv')}
          className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary-dark font-vazir"
        >
          Export CSV
        </button>
        <button 
          onClick={() => exportProfileData(profile, 'json')}
          className="text-xs px-2 py-1 bg-background-secondary text-text rounded hover:bg-border font-vazir"
        >
          Export JSON
        </button>
      </div>
    </div>
  );
};

const StatisticsPanel = ({ points, profile }) => {
  const [activeTab, setActiveTab] = useState('points'); // points, profile, image
  
  return (
    <div className="bg-background-white border border-border rounded-lg">
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('points')}
          className={`px-3 py-2 text-xs font-vazir ${
            activeTab === 'points' 
              ? 'bg-primary text-white' 
              : 'text-text-muted hover:text-text'
          }`}
        >
          نقاط ({points.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3 py-2 text-xs font-vazir ${
            activeTab === 'profile' 
              ? 'bg-primary text-white' 
              : 'text-text-muted hover:text-text'
          }`}
        >
          پروفایل
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`px-3 py-2 text-xs font-vazir ${
            activeTab === 'image' 
              ? 'bg-primary text-white' 
              : 'text-text-muted hover:text-text'
          }`}
        >
          تصویر
        </button>
      </div>
      
      <div className="p-4">
        {activeTab === 'points' && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-text font-vazir">آمار نقاط</h4>
            {points.length > 0 ? (
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-text-muted font-vazir">تعداد نقاط:</span>
                    <div className="text-text font-mono text-lg">{points.length}</div>
                  </div>
                  <div>
                    <span className="text-text-muted font-vazir">محدوده X:</span>
                    <div className="text-text font-mono">
                      {Math.min(...points.map(p => p.x)).toFixed(0)} - {Math.max(...points.map(p => p.x)).toFixed(0)}
                    </div>
                  </div>
                  <div>
                    <span className="text-text-muted font-vazir">محدوده Y:</span>
                    <div className="text-text font-mono">
                      {Math.min(...points.map(p => p.y)).toFixed(0)} - {Math.max(...points.map(p => p.y)).toFixed(0)}
                    </div>
                  </div>
                  <div>
                    <span className="text-text-muted font-vazir">مرکز جرم:</span>
                    <div className="text-text font-mono">
                      ({(points.reduce((sum, p) => sum + p.x, 0) / points.length).toFixed(1)}, 
                       {(points.reduce((sum, p) => sum + p.y, 0) / points.length).toFixed(1)})
                    </div>
                  </div>
                </div>
                
                {points.length > 1 && (
                  <div className="mt-4">
                    <span className="text-text-muted font-vazir">فواصل بین نقاط:</span>
                    <div className="mt-2 max-h-20 overflow-y-auto">
                      {points.slice(0, -1).map((point, index) => {
                        const nextPoint = points[index + 1];
                        const distance = Math.sqrt(
                          Math.pow(nextPoint.x - point.x, 2) + 
                          Math.pow(nextPoint.y - point.y, 2)
                        );
                        return (
                          <div key={index} className="text-xs text-text font-mono">
                            نقطه {index + 1} → {index + 2}: {distance.toFixed(2)} px
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-text-muted font-vazir text-center py-4">
                هیچ نقطه‌ای انتخاب نشده
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'profile' && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-text font-vazir">آمار پروفایل</h4>
            {profile && profile.length > 0 ? (
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-text-muted font-vazir">تعداد پیکسل:</span>
                    <div className="text-text font-mono text-lg">{profile.length}</div>
                  </div>
                  <div>
                    <span className="text-text-muted font-vazir">میانگین شدت:</span>
                    <div className="text-text font-mono">
                      {(profile.reduce((sum, p) => sum + p.intensity, 0) / profile.length).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className="text-text-muted font-vazir">انحراف معیار:</span>
                    <div className="text-text font-mono">
                      {calculateStandardDeviation(profile.map(p => p.intensity)).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className="text-text-muted font-vazir">واریانس:</span>
                    <div className="text-text font-mono">
                      {calculateVariance(profile.map(p => p.intensity)).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-text-muted font-vazir text-center py-4">
                پروفایل خطی موجود نیست
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'image' && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-text font-vazir">اطلاعات تصویر</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted font-vazir">فرمت:</span>
                <span className="text-text font-mono">JPEG</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted font-vazir">عمق رنگ:</span>
                <span className="text-text font-mono">24 bit (RGB)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted font-vazir">فضای رنگی:</span>
                <span className="text-text font-mono">sRGB</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
const calculateTotalDistance = (points) => {
  if (points.length < 2) return 0;
  
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
};

const calculateStandardDeviation = (values) => {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
};

const calculateVariance = (values) => {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
};

const exportProfileData = (profile, format) => {
  if (!profile || profile.length === 0) return;
  
  let content, filename, mimeType;
  
  if (format === 'csv') {
    const headers = 'Distance,X,Y,Intensity,Red,Green,Blue\n';
    const rows = profile.map(p => 
      `${p.distance},${p.x},${p.y},${p.intensity},${p.rgb.r},${p.rgb.g},${p.rgb.b}`
    ).join('\n');
    content = headers + rows;
    filename = `profile_${Date.now()}.csv`;
    mimeType = 'text/csv';
  } else if (format === 'json') {
    content = JSON.stringify(profile, null, 2);
    filename = `profile_${Date.now()}.json`;
    mimeType = 'application/json';
  }
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const DataPanels = ({ points, currentCoord, profile, line }) => {
  return (
    <div className="space-y-4">
      <CoordinateTable points={points} currentCoord={currentCoord} />
      <ProfileChart profile={profile} line={line} />
      <StatisticsPanel points={points} profile={profile} />
    </div>
  );
};

export default DataPanels;