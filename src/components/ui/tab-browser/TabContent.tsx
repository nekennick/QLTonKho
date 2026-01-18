'use client';

import React from 'react';
import { useTabContext } from '@/context/TabContext';
import { cn } from '@/lib/utils';

interface TabContentProps {
  children: React.ReactNode;
  className?: string;
}

export const TabContent: React.FC<TabContentProps> = ({ 
  children, 
  className 
}) => {
  const { tabs, activeTabId } = useTabContext();

  // Tìm tab đang active
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  // Nếu không có tab nào active, hiển thị children bình thường
  if (!activeTab) {
    return (
      <div className={cn("h-full", className)}>
        {children}
      </div>
    );
  }

  // Nếu có tab active, hiển thị thông tin tab và children
  return (
    <div className={cn("h-full", className)}>
      {/* Hiển thị thông tin tab đang active (có thể ẩn đi nếu không cần) */}
      <div className="hidden">
        Active Tab: {activeTab.title} - {activeTab.path}
      </div>
      {children}
    </div>
  );
};
