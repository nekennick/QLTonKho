/**
 * Cache Helper Utilities
 * Các tiện ích hỗ trợ cho việc quản lý cache
 */

import { smartCache } from './smartCacheUtils';

/**
 * Prefetch dữ liệu vào cache
 */
export const prefetchCache = async <T = any>(
  key: string,
  fetcher: () => Promise<T>
): Promise<void> => {
  try {
    const data = await fetcher();
    smartCache.set(key, data);
  } catch (error) {
    console.error(`Prefetch cache failed for key: ${key}`, error);
  }
};

/**
 * Batch prefetch nhiều keys
 */
export const batchPrefetch = async (
  items: Array<{ key: string; fetcher: () => Promise<any> }>
): Promise<void> => {
  await Promise.all(items.map(item => prefetchCache(item.key, item.fetcher)));
};

/**
 * Invalidate cache theo pattern
 */
export const invalidatePattern = (pattern: string | RegExp): number => {
  const manager = require('./smartCacheUtils').getSmartCacheManager();
  const stats = manager.getStats();
  let removed = 0;

  // Get all entries và filter theo pattern
  const entries = manager.getTopEntries(stats.totalEntries);
  entries.forEach((entry: { key: string }) => {
    const shouldRemove = typeof pattern === 'string' 
      ? entry.key.includes(pattern)
      : pattern.test(entry.key);
    
    if (shouldRemove) {
      smartCache.delete(entry.key);
      removed++;
    }
  });

  return removed;
};

/**
 * Tạo cache key từ object params
 */
export const createCacheKey = (
  base: string,
  params?: Record<string, any>
): string => {
  if (!params || Object.keys(params).length === 0) {
    return base;
  }

  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join('&');

  return `${base}?${sortedParams}`;
};

/**
 * Lấy cache age (tuổi của cache)
 */
export const getCacheAge = (key: string): number | null => {
  const manager = require('./smartCacheUtils').getSmartCacheManager();
  const entry = manager.cache?.get(key);
  
  if (!entry) return null;
  
  return Date.now() - entry.timestamp;
};

/**
 * Check xem cache có tồn tại và còn valid không
 */
export const isCacheValid = (key: string, maxAge?: number): boolean => {
  const manager = require('./smartCacheUtils').getSmartCacheManager();
  const entry = manager.cache?.get(key);
  
  if (!entry) return false;
  
  if (maxAge) {
    const age = Date.now() - entry.timestamp;
    return age < maxAge;
  }
  
  return true;
};

/**
 * Cache decorator cho async functions
 */
export const withCache = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  getKey: (...args: Parameters<T>) => string,
  ttl?: number
): T => {
  return (async (...args: Parameters<T>) => {
    const key = getKey(...args);
    
    // Kiểm tra cache
    const cached = smartCache.get(key);
    if (cached) {
      return cached;
    }
    
    // Fetch và cache
    const result = await fn(...args);
    smartCache.set(key, result);
    
    return result;
  }) as T;
};

