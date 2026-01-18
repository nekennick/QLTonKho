'use client';

import React from 'react';
import { useTabContext } from '@/context/TabContext';
import { useTabDataContext } from '@/context/TabDataContext';
import { usePathname } from 'next/navigation';

export const TabDebug: React.FC = () => {
  const pathname = usePathname();

  // Chỉ hiển thị ở trang chủ (/) và trong development mode
  if (process.env.NODE_ENV !== 'development' || pathname !== '/') {
    return null;
  }

  // Kiểm tra xem có TabProvider không
  let tabs, activeTabId, tabData;
  try {
    const tabContext = useTabContext();
    const tabDataContext = useTabDataContext();
    tabs = tabContext.tabs;
    activeTabId = tabContext.activeTabId;
    tabData = tabDataContext.tabData;
  } catch (error) {
    // Nếu không có TabProvider, không hiển thị debug
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs max-w-sm z-50">
      <div className="font-bold mb-2">Tab Debug Info</div>
      <div>Current Path: {pathname}</div>
      <div>Active Tab ID: {activeTabId || 'None'}</div>
      <div>Total Tabs: {tabs.length}</div>
      <div>Cached Data Keys: {Object.keys(tabData).length}</div>
      <div className="mt-2">
        <div className="font-semibold">Tabs:</div>
        {tabs.map((tab) => (
          <div key={tab.id} className="ml-2">
            • {tab.title} ({tab.path}) {tab.id === activeTabId ? '← ACTIVE' : ''}
          </div>
        ))}
      </div>
      <div className="mt-2">
        <div className="font-semibold">Cache:</div>
        {Object.keys(tabData).map((key) => (
          <div key={key} className="ml-2 text-xs">
            • {key}: {new Date(tabData[key].timestamp).toLocaleTimeString()}
          </div>
        ))}
      </div>
    </div>
  );
};
