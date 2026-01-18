'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface Tab {
  id: string;
  title: string;
  path: string;
  icon?: React.ElementType;
  closable?: boolean;
  data?: any; // Dữ liệu bổ sung cho tab
}

interface TabContextType {
  tabs: Tab[];
  activeTabId: string | null;
  addTab: (tab: Omit<Tab, 'id'>) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  closeTab: (tabId: string) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (keepTabId: string) => void;
  updateTab: (tabId: string, updates: Partial<Tab>) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export const useTabContext = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTabContext must be used within a TabProvider');
  }
  return context;
};

interface TabProviderProps {
  children: ReactNode;
}

export const TabProvider: React.FC<TabProviderProps> = ({ children }) => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const router = useRouter();
  
  // Giới hạn số lượng tab tối đa để tối ưu hiệu năng
  const MAX_TABS = 15;

  const generateTabId = useCallback((path: string, title: string) => {
    return `${path}-${title}`.replace(/[^a-zA-Z0-9-]/g, '-');
  }, []);

  const addTab = useCallback((tabData: Omit<Tab, 'id'>) => {
    const id = generateTabId(tabData.path, tabData.title);
    let isExistingTab = false;
    
    setTabs(prevTabs => {
      // Kiểm tra xem tab đã tồn tại chưa
      const existingTab = prevTabs.find(tab => tab.id === id);
      if (existingTab) {
        // Nếu tab đã tồn tại, chỉ cần set active (sẽ set sau khi return)
        isExistingTab = true;
        return prevTabs;
      }

      // Kiểm tra giới hạn số lượng tab
      let tabsToKeep = prevTabs;
      if (prevTabs.length >= MAX_TABS) {
        // Tìm tab cũ nhất (không phải active) để đóng
        const inactiveTabs = prevTabs.filter(tab => tab.id !== activeTabId);
        if (inactiveTabs.length > 0) {
          const oldestTab = inactiveTabs[0];
          tabsToKeep = prevTabs.filter(tab => tab.id !== oldestTab.id);
          console.log(`Đã đóng tab cũ nhất "${oldestTab.title}" do đạt giới hạn ${MAX_TABS} tabs`);
        }
      }

      // Thêm tab mới
      const newTab: Tab = {
        ...tabData,
        id,
        closable: tabData.closable !== false, // Mặc định là true
      };

      const newTabs = [...tabsToKeep, newTab];
      
      // Lưu vào localStorage với debounce
      try {
        localStorage.setItem('browser-tabs', JSON.stringify(newTabs));
      } catch (error) {
        console.error('Error saving tabs to localStorage:', error);
        // Nếu lỗi, thử xóa tab cũ và lưu lại
        if (newTabs.length > 5) {
          const reducedTabs = newTabs.slice(-5);
          localStorage.setItem('browser-tabs', JSON.stringify(reducedTabs));
          return reducedTabs;
        }
      }
      
      return newTabs;
    });

    // Set active tab (setActiveTabId không gây navigation nên không cần setTimeout)
    setActiveTabId(id);
  }, [generateTabId, activeTabId, MAX_TABS]);

  const removeTab = useCallback((tabId: string) => {
    let shouldNavigate = false;
    let navigatePath: string | null = null;
    
    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.id !== tabId);
      
      // Lưu vào localStorage
      localStorage.setItem('browser-tabs', JSON.stringify(newTabs));
      
      // Nếu tab bị xóa là tab đang active, chuyển sang tab khác
      if (activeTabId === tabId) {
        if (newTabs.length > 0) {
          const newActiveTab = newTabs[newTabs.length - 1];
          setActiveTabId(newActiveTab.id);
          shouldNavigate = true;
          navigatePath = newActiveTab.path;
        } else {
          // Nếu không còn tab nào, tự động về dashboard
          setActiveTabId(null);
          shouldNavigate = true;
          navigatePath = '/dashboard';
        }
      }
      
      return newTabs;
    });

    // Thực hiện navigation sau khi state đã được cập nhật (tránh lỗi render)
    if (shouldNavigate && navigatePath) {
      // Sử dụng setTimeout để đảm bảo navigation xảy ra sau render cycle
      setTimeout(() => {
        router.push(navigatePath!);
      }, 0);
    }
  }, [activeTabId, router]);

  const setActiveTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const closeTab = useCallback((tabId: string) => {
    removeTab(tabId);
  }, [removeTab]);

  const closeAllTabs = useCallback(() => {
    setTabs([]);
    setActiveTabId(null);
    localStorage.removeItem('browser-tabs');
    // Tự động về dashboard khi đóng hết tab
    router.push('/dashboard');
  }, [router]);

  const closeOtherTabs = useCallback((keepTabId: string) => {
    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.id === keepTabId);
      localStorage.setItem('browser-tabs', JSON.stringify(newTabs));
      return newTabs;
    });
    setActiveTabId(keepTabId);
  }, []);

  const updateTab = useCallback((tabId: string, updates: Partial<Tab>) => {
    setTabs(prevTabs => {
      const newTabs = prevTabs.map(tab => 
        tab.id === tabId ? { ...tab, ...updates } : tab
      );
      localStorage.setItem('browser-tabs', JSON.stringify(newTabs));
      return newTabs;
    });
  }, []);

  // Khôi phục tabs từ localStorage khi component mount
  React.useEffect(() => {
    const savedTabs = localStorage.getItem('browser-tabs');
    if (savedTabs) {
      try {
        const parsedTabs = JSON.parse(savedTabs);
        setTabs(parsedTabs);
        if (parsedTabs.length > 0) {
          setActiveTabId(parsedTabs[parsedTabs.length - 1].id);
        }
      } catch (error) {
        console.error('Error parsing saved tabs:', error);
      }
    }
  }, []);

  // Tự động tạo tab cho trang hiện tại nếu chưa có tab nào
  React.useEffect(() => {
    if (typeof window !== 'undefined' && tabs.length === 0) {
      const currentPath = window.location.pathname;
      const currentTitle = document.title || 'Trang hiện tại';
      
      // Chỉ tạo tab cho các trang dashboard, không tạo cho trang chủ
      if (currentPath !== '/dashboard' && currentPath.startsWith('/')) {
        const newTab: Tab = {
          id: generateTabId(currentPath, currentTitle),
          title: currentTitle,
          path: currentPath,
          closable: true,
        };
        
        setTabs([newTab]);
        setActiveTabId(newTab.id);
        localStorage.setItem('browser-tabs', JSON.stringify([newTab]));
      }
    }
  }, [tabs.length, generateTabId]);

  const value: TabContextType = {
    tabs,
    activeTabId,
    addTab,
    removeTab,
    setActiveTab,
    closeTab,
    closeAllTabs,
    closeOtherTabs,
    updateTab,
  };

  return (
    <TabContext.Provider value={value}>
      {children}
    </TabContext.Provider>
  );
};
