// Smart Cache Utilities with LRU Strategy
// Hệ thống cache thông minh với giới hạn kích thước và tự động dọn dẹp

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  size: number; // Kích thước ước tính (bytes)
  key: string;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  oldestEntry: number;
  newestEntry: number;
  averageAccessCount: number;
}

// Cấu hình cache
export const CACHE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_ENTRIES: 100,
  DEFAULT_TTL: 30 * 60 * 1000, // 30 phút
  CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 phút
} as const;

// Ước tính kích thước object (bytes)
export const estimateSize = (obj: any): number => {
  const str = JSON.stringify(obj);
  return new Blob([str]).size;
};

// LRU Cache Manager
export class SmartCacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number;
  private maxEntries: number;

  constructor(maxSize = CACHE_CONFIG.MAX_SIZE, maxEntries = CACHE_CONFIG.MAX_ENTRIES) {
    this.maxSize = maxSize;
    this.maxEntries = maxEntries;
  }

  // Lấy dữ liệu từ cache
  get<T = any>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Kiểm tra expiration
    const now = Date.now();
    const age = now - entry.timestamp;
    
    if (age > CACHE_CONFIG.DEFAULT_TTL) {
      this.cache.delete(key);
      return null;
    }

    // Update access stats (LRU)
    entry.lastAccessed = now;
    entry.accessCount++;
    
    // Di chuyển lên đầu (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.data as T;
  }

  // Lưu dữ liệu vào cache
  set<T = any>(key: string, data: T, ttl?: number): boolean {
    try {
      const size = estimateSize(data);
      const now = Date.now();

      // Kiểm tra nếu data quá lớn
      if (size > this.maxSize * 0.5) {
        console.warn(`Data too large to cache: ${size} bytes (max ${this.maxSize * 0.5})`);
        return false;
      }

      // Tạo entry mới
      const entry: CacheEntry<T> = {
        data,
        timestamp: now,
        lastAccessed: now,
        accessCount: 0,
        size,
        key,
      };

      // Kiểm tra và dọn dẹp nếu cần
      this.evictIfNeeded(size);

      // Thêm vào cache
      this.cache.set(key, entry);

      return true;
    } catch (error) {
      console.error('Error setting cache:', error);
      return false;
    }
  }

  // Xóa entry cũ nếu cần (LRU)
  private evictIfNeeded(newEntrySize: number): void {
    const currentSize = this.getTotalSize();
    const currentEntries = this.cache.size;

    // Xóa cho đến khi đủ chỗ
    while (
      (currentSize + newEntrySize > this.maxSize || currentEntries >= this.maxEntries) &&
      this.cache.size > 0
    ) {
      // Tìm entry ít được sử dụng nhất (LRU)
      let lruKey: string | null = null;
      let lruTime = Infinity;

      for (const [key, entry] of this.cache.entries()) {
        if (entry.lastAccessed < lruTime) {
          lruTime = entry.lastAccessed;
          lruKey = key;
        }
      }

      if (lruKey) {
        this.cache.delete(lruKey);
        console.log(`Evicted cache entry: ${lruKey}`);
      }
    }
  }

  // Xóa cache theo key
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Xóa tất cả cache
  clear(): void {
    this.cache.clear();
  }

  // Lấy kích thước tổng
  private getTotalSize(): number {
    let total = 0;
    for (const entry of this.cache.values()) {
      total += entry.size;
    }
    return total;
  }

  // Lấy thống kê cache
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        totalSize: 0,
        oldestEntry: 0,
        newestEntry: 0,
        averageAccessCount: 0,
      };
    }

    const totalSize = this.getTotalSize();
    const timestamps = entries.map(e => e.timestamp);
    const accessCounts = entries.map(e => e.accessCount);

    return {
      totalEntries: entries.length,
      totalSize,
      oldestEntry: Math.min(...timestamps),
      newestEntry: Math.max(...timestamps),
      averageAccessCount: accessCounts.reduce((a, b) => a + b, 0) / entries.length,
    };
  }

  // Dọn dẹp cache hết hạn
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > CACHE_CONFIG.DEFAULT_TTL) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`Cleaned up ${removed} expired cache entries`);
    }

    return removed;
  }

  // Lấy top entries được truy cập nhiều nhất
  getTopEntries(limit = 10): Array<{ key: string; accessCount: number }> {
    return Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, accessCount: entry.accessCount }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit);
  }
}

// Singleton instance
let cacheManagerInstance: SmartCacheManager | null = null;

export const getSmartCacheManager = (): SmartCacheManager => {
  if (!cacheManagerInstance) {
    cacheManagerInstance = new SmartCacheManager();
    
    // Auto cleanup mỗi 5 phút
    if (typeof window !== 'undefined') {
      setInterval(() => {
        cacheManagerInstance?.cleanup();
      }, CACHE_CONFIG.CLEANUP_INTERVAL);
    }
  }
  
  return cacheManagerInstance;
};

// Helper functions
export const smartCache = {
  get: <T = any>(key: string): T | null => {
    return getSmartCacheManager().get<T>(key);
  },
  
  set: <T = any>(key: string, data: T): boolean => {
    return getSmartCacheManager().set(key, data);
  },
  
  delete: (key: string): boolean => {
    return getSmartCacheManager().delete(key);
  },
  
  clear: (): void => {
    getSmartCacheManager().clear();
  },
  
  getStats: (): CacheStats => {
    return getSmartCacheManager().getStats();
  },
  
  cleanup: (): number => {
    return getSmartCacheManager().cleanup();
  },
};

