'use client';

import { useState, useEffect, useCallback } from 'react';
import { smartCache } from '@/utils/smartCacheUtils';

/**
 * Hook để sử dụng Smart Cache với auto-refresh
 * Tối ưu cho việc cache dữ liệu theo trang/component
 */
export const useSmartCache = <T = any>(
  key: string,
  fetcher?: () => Promise<T> | T,
  options?: {
    ttl?: number;
    autoRefresh?: boolean;
    refreshInterval?: number;
  }
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async (forceRefresh = false) => {
    if (!fetcher) return;

    // Kiểm tra cache trước
    if (!forceRefresh) {
      const cached = smartCache.get<T>(key);
      if (cached) {
        setData(cached);
        return;
      }
    }

    // Fetch data mới
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      smartCache.set(key, result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [key, fetcher]);

  const refresh = useCallback(() => {
    return loadData(true);
  }, [loadData]);

  const clear = useCallback(() => {
    smartCache.delete(key);
    setData(null);
  }, [key]);

  // Auto load on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto refresh nếu được bật
  useEffect(() => {
    if (options?.autoRefresh && options?.refreshInterval) {
      const interval = setInterval(() => {
        loadData(true);
      }, options.refreshInterval);

      return () => clearInterval(interval);
    }
  }, [options?.autoRefresh, options?.refreshInterval, loadData]);

  return {
    data,
    loading,
    error,
    refresh,
    clear,
  };
};

