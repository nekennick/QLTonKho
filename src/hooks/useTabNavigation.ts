'use client';

import { useTabContext } from '@/context/TabContext';
import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { NavigationItem } from '@/lib/navigation';

export const useTabNavigation = () => {
  const { addTab, setActiveTab, tabs } = useTabContext();
  const router = useRouter();
  const pathname = usePathname();

  const openInTab = useCallback((navItem: NavigationItem) => {
    if (!navItem.href) return;

    // Kiểm tra xem tab đã tồn tại chưa
    const existingTab = tabs.find(tab => tab.path === navItem.href);
    
    if (existingTab) {
      // Nếu tab đã tồn tại, chuyển sang tab đó và điều hướng
      setActiveTab(existingTab.id);
      router.push(navItem.href);
    } else {
      // Tạo tab mới và điều hướng
      addTab({
        title: navItem.name,
        path: navItem.href,
        icon: navItem.icon,
        closable: true,
      });
      router.push(navItem.href);
    }
  }, [addTab, setActiveTab, tabs, router]);

  const openInNewTab = useCallback((navItem: NavigationItem) => {
    if (!navItem.href) return;

    // Luôn tạo tab mới
    addTab({
      title: navItem.name,
      path: navItem.href,
      icon: navItem.icon,
      closable: true,
    });
  }, [addTab]);

  const navigateToPath = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  return {
    openInTab,
    openInNewTab,
    navigateToPath,
    currentPath: pathname,
  };
};
