'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTabDataContext } from '@/context/TabDataContext';
import { useTabContext } from '@/context/TabContext';

export const useTabData = <T = any>(dataKey: string, fetchData?: () => Promise<T> | T) => {
  const { getTabData, setTabData, hasTabData } = useTabDataContext();
  const { activeTabId } = useTabContext();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Sử dụng pathname thay vì activeTabId để cache được chia sẻ
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const cacheKey = `${currentPath}-${dataKey}`;

  const loadData = useCallback(async () => {
    if (!fetchData) return;

    // Kiểm tra cache trước
    const cachedData = getTabData(cacheKey);
    if (cachedData) {
      setData(cachedData);
      return;
    }

    // Nếu không có cache, fetch data mới
    setLoading(true);
    setError(null);

    try {
      const newData = await fetchData();
      setData(newData);
      
      // Lưu vào cache
      setTabData(cacheKey, newData, currentPath);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [dataKey, fetchData, getTabData, setTabData, cacheKey, currentPath]);

  const refreshData = useCallback(async () => {
    if (!fetchData) return;

    setLoading(true);
    setError(null);

    try {
      const newData = await fetchData();
      setData(newData);
      
      // Cập nhật cache
      setTabData(cacheKey, newData, currentPath);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [dataKey, fetchData, setTabData, cacheKey, currentPath]);

  const clearCache = useCallback(() => {
    setData(null);
    // Note: clearTabData sẽ được gọi từ context
  }, []);

  // Tự động load data khi pathname thay đổi
  useEffect(() => {
    loadData();
  }, [currentPath, loadData]);

  return {
    data,
    loading,
    error,
    refreshData,
    clearCache,
    hasCachedData: hasTabData(cacheKey),
  };
};
