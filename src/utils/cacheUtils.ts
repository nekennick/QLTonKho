// Cache utility functions for localStorage
export interface CacheData {
  data: any;
  timestamp: number;
  expiresIn: number; // milliseconds
}

export const CACHE_KEYS = {
  PRODUCTS: 'tonkho_products',
  WAREHOUSES: 'tonkho_warehouses', 
  EMPLOYEES: 'tonkho_employees',
  INVENTORIES: 'tonkho_inventories'
} as const;

export const CACHE_DURATION = {
  PRODUCTS: 30 * 60 * 1000, // 30 minutes
  WAREHOUSES: 60 * 60 * 1000, // 1 hour
  EMPLOYEES: 60 * 60 * 1000, // 1 hour
  INVENTORIES: 10 * 60 * 1000 // 10 minutes
} as const;

// Save data to localStorage with timestamp
export const saveToCache = (key: string, data: any, expiresIn: number = 30 * 60 * 1000): void => {
  try {
    const cacheData: CacheData = {
      data,
      timestamp: Date.now(),
      expiresIn
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to save to cache:', error);
  }
};

// Get data from localStorage with expiration check
export const getFromCache = (key: string): any | null => {
  try {
    const cached = localStorage.getItem(key);
    
    if (!cached) {
      return null;
    }

    const cacheData: CacheData = JSON.parse(cached);
    const now = Date.now();
    const isExpired = (now - cacheData.timestamp) > cacheData.expiresIn;
    
    // Check if cache is expired
    if (isExpired) {
      localStorage.removeItem(key);
      return null;
    }

    return cacheData.data;
  } catch (error) {
    console.warn('Failed to get from cache:', error);
    localStorage.removeItem(key);
    return null;
  }
};

// Clear specific cache
export const clearCache = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
};

// Clear all app cache
export const clearAllCache = (): void => {
  try {
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Failed to clear all cache:', error);
  }
};

// Clear all cache including tab data and other app data
export const clearAllAppCache = (): void => {
  try {
    // Clear main cache keys
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Clear tab data cache
    localStorage.removeItem('tab-data-cache');
    
    // Clear any other app-related cache
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('tonkho_') || 
        key.startsWith('tab-') ||
        key.includes('cache') ||
        key.includes('Cache')
      )) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log(`All app cache cleared successfully. Removed ${keysToRemove.length + Object.keys(CACHE_KEYS).length + 1} cache entries`);
  } catch (error) {
    console.warn('Failed to clear all app cache:', error);
  }
};

// Check if cache exists and is valid
export const isCacheValid = (key: string): boolean => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return false;

    const cacheData: CacheData = JSON.parse(cached);
    const now = Date.now();
    
    return (now - cacheData.timestamp) <= cacheData.expiresIn;
  } catch (error) {
    return false;
  }
};

// Get cache age in minutes
export const getCacheAge = (key: string): number => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return -1;

    const cacheData: CacheData = JSON.parse(cached);
    const now = Date.now();
    
    return Math.floor((now - cacheData.timestamp) / (1000 * 60));
  } catch (error) {
    return -1;
  }
};

// Auto cleanup expired cache
export const cleanupExpiredCache = (): void => {
  try {
    const keysToRemove: string[] = [];
    
    // Check main cache keys
    Object.values(CACHE_KEYS).forEach(key => {
      if (!isCacheValid(key)) {
        keysToRemove.push(key);
      }
    });
    
    // Check tab data cache
    const tabDataCache = localStorage.getItem('tab-data-cache');
    if (tabDataCache) {
      try {
        const tabData = JSON.parse(tabDataCache);
        const now = Date.now();
        let hasExpiredData = false;
        
        Object.entries(tabData).forEach(([key, value]: [string, any]) => {
          if (now - value.timestamp > 24 * 60 * 60 * 1000) {
            hasExpiredData = true;
          }
        });
        
        if (hasExpiredData) {
          keysToRemove.push('tab-data-cache');
        }
      } catch (error) {
        keysToRemove.push('tab-data-cache');
      }
    }
    
    // Remove expired cache
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    if (keysToRemove.length > 0) {
      console.log(`Cleaned up ${keysToRemove.length} expired cache entries`);
    }
  } catch (error) {
    console.warn('Failed to cleanup expired cache:', error);
  }
};
