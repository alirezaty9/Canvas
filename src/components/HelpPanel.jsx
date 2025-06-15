// src/components/HelpPanel.jsx
import React, { useState } from 'react';

const HelpPanel = () => {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    {
      category: 'عملیات کلی',
      items: [
        { key: 'Ctrl + Z', action: 'بازگردانی (Undo)' },
        { key: 'Ctrl + Y', action: 'تکرار (Redo)' },
        { key: 'Delete', action: 'پاک کردن همه' },
        { key: 'Esc', action: 'لغو انتخاب ابزار' }
      ]
    },
    {
      category: 'زوم و نمایش',
      items: [
        { key: 'Ctrl + +', action: 'بزرگنمایی' },
        { key: 'Ctrl + -', action: 'کوچکنمایی' },
        { key: 'Ctrl + 0', action: 'بازگشت به 100%' },
        { key: 'Ctrl + F', action: 'تنظیم به اندازه صفحه' },
        { key: 'Mouse Wheel', action: 'زوم تدریجی' }
      ]
    },
    {
      category: 'ابزارها',
      items: [
        { key: '1', action: 'انتخاب نقطه' },
        { key: '2', action: 'رسم خط' },
        { key: '3', action: 'کراپ' },
        { key: '4', action: 'زوم' },
        { key: '5', action: 'جابجایی' },
        { key: '6', action: 'اندازه‌گیری' }
      ]
    },
    {
      category: 'ناوبری',
      items: [
        { key: '← ↑ ↓ →', action: 'جابجایی تصویر' },
        { key: 'Shift + Arrow', action: 'جابجایی سریع' },
        { key: 'Shift + Click', action: 'زوم اوت (در حالت زوم)' },
        { key: 'Ctrl + Click', action: 'زوم دقیق' }
      ]
    }
  ];

  const mouseActions = [
    {
      category: 'عملیات ماوس',
      items: [
        { action: 'کلیک چپ', description: 'انتخاب نقطه یا شروع عملیات' },
        { action: 'کلیک و کشیدن', description: 'رسم خط یا انتخاب ناحیه' },
        { action: 'کلیک راست', description: 'منوی محتوایی (در نسخه آینده)' },
        { action: 'دبل کلیک', description: 'تکمیل عملیات یا زوم سریع' }
      ]
    }
  ];

  return (
    <>
      {/* دکمه راهنما */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-colors z-50 flex items-center justify-center"
        title="راهنمای میانبرها"
      >
        ❓
      </button>

      {/* Modal راهنما */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-text font-vazir">
                راهنمای میانبرهای کیبورد و ماوس
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text rounded-full hover:bg-background-secondary"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Keyboard Shortcuts */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-text font-vazir border-b border-border pb-2">
                    میانبرهای کیبورد
                  </h3>
                  
                  {shortcuts.map((section, index) => (
                    <div key={index} className="space-y-3">
                      <h4 className="text-md font-medium text-primary font-vazir">
                        {section.category}
                      </h4>
                      
                      <div className="space-y-2">
                        {section.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center justify-between p-2 bg-background-secondary rounded">
                            <span className="text-sm text-text font-vazir">
                              {item.action}
                            </span>
                            <kbd className="px-2 py-1 bg-background-white border border-border rounded text-xs font-mono text-text-muted">
                              {item.key}
                            </kbd>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mouse Actions */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-text font-vazir border-b border-border pb-2">
                    عملیات ماوس
                  </h3>
                  
                  {mouseActions.map((section, index) => (
                    <div key={index} className="space-y-3">
                      <h4 className="text-md font-medium text-primary font-vazir">
                        {section.category}
                      </h4>
                      
                      <div className="space-y-3">
                        {section.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="p-3 bg-background-secondary rounded">
                            <div className="font-medium text-text font-vazir text-sm mb-1">
                              {item.action}
                            </div>
                            <div className="text-xs text-text-muted font-vazir">
                              {item.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Tips */}
                  <div className="space-y-3">
                    <h4 className="text-md font-medium text-primary font-vazir">
                      نکات کاربردی
                    </h4>
                    
                    <div className="space-y-2 text-sm text-text-muted font-vazir">
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <strong className="text-yellow-800">💡 نکته:</strong> برای دقت بیشتر در انتخاب نقاط، از زوم استفاده کنید
                      </div>
                      
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <strong className="text-blue-800">ℹ️ اطلاعات:</strong> تمام عملیات قابل بازگردانی هستند (Undo/Redo)
                      </div>
                      
                      <div className="p-3 bg-green-50 border border-green-200 rounded">
                        <strong className="text-green-800">✅ توصیه:</strong> برای کار با دقت بالا، از کیبورد به همراه ماوس استفاده کنید
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-border text-center">
                <p className="text-sm text-text-muted font-vazir">
                  برای بستن این پنجره، کلید <kbd className="px-1 bg-background-secondary rounded">Esc</kbd> را فشار دهید یا روی ✕ کلیک کنید
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpPanel;