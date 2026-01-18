'use client';

import { useEffect, useRef } from 'react';
import { useTabContext } from '@/context/TabContext';
import { usePathname } from 'next/navigation';

/**
 * Hook để set page title cho tab browser
 * Tự động cập nhật document.title và tab title
 */
export const usePageTitle = (title: string) => {
  const { updateTab, tabs } = useTabContext();
  const pathname = usePathname();
  const titleRef = useRef(title);

  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  useEffect(() => {
    // Update document title
    document.title = `${titleRef.current} | GoalKho`;

    // Update tab title nếu tab đang tồn tại
    const currentTab = tabs.find(tab => tab.path === pathname);
    if (currentTab && currentTab.title !== titleRef.current) {
      updateTab(currentTab.id, { title: titleRef.current });
    }
    // Chỉ chạy khi pathname thay đổi, không phụ thuộc vào tabs và updateTab
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return title;
};

