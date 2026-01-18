'use client';

import React, { useState, useEffect } from 'react';
import { smartCache, CacheStats } from '@/utils/smartCacheUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, RefreshCw, Database, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const CacheInspector: React.FC = () => {
  const [stats, setStats] = useState<CacheStats>({
    totalEntries: 0,
    totalSize: 0,
    oldestEntry: 0,
    newestEntry: 0,
    averageAccessCount: 0,
  });
  const [topEntries, setTopEntries] = useState<Array<{ key: string; accessCount: number }>>([]);
  const [lastCleanup, setLastCleanup] = useState<number>(0);

  const refreshStats = () => {
    setStats(smartCache.getStats());
    const manager = require('@/utils/smartCacheUtils').getSmartCacheManager();
    setTopEntries(manager.getTopEntries(5));
  };

  useEffect(() => {
    refreshStats();
    
    // Auto refresh mỗi 5 giây
    const interval = setInterval(refreshStats, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleCleanup = () => {
    const removed = smartCache.cleanup();
    setLastCleanup(removed);
    refreshStats();
  };

  const handleClearAll = () => {
    if (confirm('Bạn có chắc muốn xóa toàn bộ cache?')) {
      smartCache.clear();
      refreshStats();
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    if (timestamp === 0) return 'N/A';
    return new Date(timestamp).toLocaleString('vi-VN');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Smart Cache Inspector
          </CardTitle>
          <CardDescription>
            Giám sát và quản lý cache thông minh với LRU strategy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tổng entries</p>
              <p className="text-2xl font-bold">{stats.totalEntries}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Kích thước</p>
              <p className="text-2xl font-bold">{formatBytes(stats.totalSize)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Truy cập TB</p>
              <p className="text-2xl font-bold">{stats.averageAccessCount.toFixed(1)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Entry cũ nhất</p>
              <p className="text-sm font-medium">
                {stats.oldestEntry ? new Date(stats.oldestEntry).toLocaleTimeString('vi-VN') : 'N/A'}
              </p>
            </div>
          </div>

          {/* Top Entries */}
          {topEntries.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <h3 className="font-semibold">Top entries được truy cập nhiều nhất</h3>
              </div>
              <div className="space-y-1">
                {topEntries.map((entry, index) => (
                  <div key={entry.key} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="text-sm font-mono truncate max-w-[300px]">{entry.key}</span>
                    </div>
                    <Badge>{entry.accessCount} lần</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4">
            <Button onClick={refreshStats} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
            <Button onClick={handleCleanup} size="sm" variant="outline">
              <Trash2 className="h-4 w-4 mr-2" />
              Dọn dẹp cache hết hạn
            </Button>
            <Button onClick={handleClearAll} size="sm" variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa toàn bộ
            </Button>
          </div>

          {lastCleanup > 0 && (
            <Alert>
              <AlertDescription>
                Đã dọn dẹp {lastCleanup} cache entries hết hạn
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Cache Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Cấu hình Cache</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Kích thước tối đa</p>
              <p className="font-semibold">10 MB</p>
            </div>
            <div>
              <p className="text-muted-foreground">Số entries tối đa</p>
              <p className="font-semibold">100 entries</p>
            </div>
            <div>
              <p className="text-muted-foreground">TTL mặc định</p>
              <p className="font-semibold">30 phút</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

