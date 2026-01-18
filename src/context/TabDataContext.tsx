'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { smartCache } from '@/utils/smartCacheUtils';

export interface TabData {
  [tabId: string]: {
    data: any;
    timestamp: number;
    path: string;
  };
}

interface TabDataContextType {
  tabData: TabData;
  setTabData: (tabId: string, data: any, path: string) => void;
  getTabData: (tabId: string) => any;
  clearTabData: (tabId: string) => void;
  clearAllTabData: () => void;
  hasTabData: (tabId: string) => boolean;
}

const TabDataContext = createContext<TabDataContextType | undefined>(undefined);

export const useTabDataContext = () => {
  const context = useContext(TabDataContext);
  if (!context) {
    throw new Error('useTabDataContext must be used within a TabDataProvider');
  }
  return context;
};

interface TabDataProviderProps {
  children: ReactNode;
}

export const TabDataProvider: React.FC<TabDataProviderProps> = ({ children }) => {
  const [tabData, setTabDataState] = useState<TabData>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const tabDataRef = useRef<TabData>({});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Khôi phục data từ localStorage sau khi component mount
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      try {
        const saved = localStorage.getItem('tab-data-cache');
        if (saved) {
          const parsedData = JSON.parse(saved);
          // Lọc bỏ data đã hết hạn khi khởi tạo
          const now = Date.now();
          const filteredData: TabData = {};
          Object.entries(parsedData).forEach(([key, value]) => {
            if (now - value.timestamp <= 24 * 60 * 60 * 1000) {
              filteredData[key] = value;
            }
          });
          setTabDataState(filteredData);
          tabDataRef.current = filteredData;
        }
      } catch (error) {
        console.error('Error loading tab data from localStorage:', error);
      } finally {
        setIsInitialized(true);
      }
    }
  }, [isInitialized]);

  // Cleanup timeout khi component unmount
  React.useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Debounced save function để tránh ghi localStorage quá nhiều
  const debouncedSave = useCallback((data: TabData) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('tab-data-cache', JSON.stringify(data));
        } catch (error) {
          console.error('Error saving tab data to localStorage:', error);
        }
      }
    }, 500); // Debounce 500ms
  }, []);

  const setTabData = useCallback((tabId: string, data: any, path: string) => {
    // Lưu vào smart cache (memory) để truy cập nhanh
    smartCache.set(tabId, data);

    setTabDataState(prev => {
      const newData = {
        ...prev,
        [tabId]: {
          data,
          timestamp: Date.now(),
          path,
        }
      };
      
      // Cập nhật ref
      tabDataRef.current = newData;
      
      // Debounced save
      debouncedSave(newData);
      
      return newData;
    });
  }, [debouncedSave]);

  const getTabData = useCallback((tabId: string) => {
    // Ưu tiên lấy từ smart cache (memory)
    const cachedData = smartCache.get(tabId);
    if (cachedData) {
      return cachedData;
    }

    // Fallback sang localStorage
    const tab = tabDataRef.current[tabId];
    if (!tab) return null;
    
    // Kiểm tra xem data có quá cũ không (24 giờ)
    const isExpired = Date.now() - tab.timestamp > 24 * 60 * 60 * 1000;
    if (isExpired) {
      // Xóa data expired trực tiếp thay vì gọi clearTabData
      setTabDataState(prev => {
        const newData = { ...prev };
        delete newData[tabId];
        
        // Cập nhật ref
        tabDataRef.current = newData;
        
        // Debounced save
        debouncedSave(newData);
        
        return newData;
      });
      return null;
    }
    
    // Lưu vào smart cache để truy cập nhanh hơn lần sau
    smartCache.set(tabId, tab.data);
    
    return tab.data;
  }, [debouncedSave]);

  const clearTabData = useCallback((tabId: string) => {
    // Xóa khỏi smart cache
    smartCache.delete(tabId);

    setTabDataState(prev => {
      const newData = { ...prev };
      delete newData[tabId];
      
      // Cập nhật ref
      tabDataRef.current = newData;
      
      // Debounced save
      debouncedSave(newData);
      
      return newData;
    });
  }, [debouncedSave]);

  const clearAllTabData = useCallback(() => {
    // Xóa smart cache
    smartCache.clear();

    setTabDataState({});
    tabDataRef.current = {};
    
    // Clear timeout nếu có
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('tab-data-cache');
      } catch (error) {
        console.error('Error clearing all tab data from localStorage:', error);
      }
    }
  }, []);

  const hasTabData = useCallback((tabId: string) => {
    return tabId in tabDataRef.current;
  }, []);

  const value: TabDataContextType = {
    tabData,
    setTabData,
    getTabData,
    clearTabData,
    clearAllTabData,
    hasTabData,
  };

  return (
    <TabDataContext.Provider value={value}>
      {children}
    </TabDataContext.Provider>
  );
};
