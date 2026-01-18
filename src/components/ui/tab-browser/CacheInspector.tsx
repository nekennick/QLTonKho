'use client';

import React, { useState, useEffect } from 'react';
import { useTabDataContext } from '@/context/TabDataContext';
import { useTabContext } from '@/context/TabContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, RefreshCw, Eye, EyeOff } from 'lucide-react';

export const CacheInspector: React.FC = () => {
  const { tabData, clearTabData, clearAllTabData } = useTabDataContext();
  const { tabs } = useTabContext();
  const [showDetails, setShowDetails] = useState(false);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN');
  };

  const getCacheAge = (timestamp: number) => {
    const now = Date.now();
    const age = now - timestamp;
    const minutes = Math.floor(age / (1000 * 60));
    const hours = Math.floor(age / (1000 * 60 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const isExpired = (timestamp: number) => {
    const now = Date.now();
    const age = now - timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    return age > maxAge;
  };

  const getCacheSize = () => {
    try {
      const data = JSON.stringify(tabData);
      return new Blob([data]).size;
    } catch {
      return 0;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Cache Inspector - Kiểm tra Cache
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showDetails ? 'Ẩn chi tiết' : 'Hiện chi tiết'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllTabData}
            >
              <Trash2 className="h-4 w-4" />
              Xóa tất cả
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tổng quan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(tabData).length}
              </div>
              <div className="text-sm text-blue-800">Cache Entries</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {tabs.length}
              </div>
              <div className="text-sm text-green-800">Active Tabs</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatSize(getCacheSize())}
              </div>
              <div className="text-sm text-purple-800">Cache Size</div>
            </div>
          </div>

          {/* Danh sách cache */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Cache Entries:</h3>
            {Object.keys(tabData).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Chưa có cache nào</p>
                <p className="text-sm">Cache sẽ được tạo khi bạn sử dụng các trang</p>
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(tabData).map(([key, value]) => (
                  <div
                    key={key}
                    className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {key}
                          </code>
                          {isExpired(value.timestamp) && (
                            <Badge variant="destructive" className="text-xs">
                              Expired
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>Path: <code>{value.path}</code></div>
                          <div>Age: {getCacheAge(value.timestamp)}</div>
                          <div>Created: {formatTimestamp(value.timestamp)}</div>
                        </div>
                        {showDetails && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                            <pre className="whitespace-pre-wrap overflow-auto max-h-32">
                              {JSON.stringify(value.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => clearTabData(key)}
                        className="ml-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Thông tin về chức năng */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">📋 Tên chức năng:</h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Tab Browser System</strong> - Hệ thống trình duyệt tab
              </div>
              <div>
                <strong>Page Data Cache</strong> - Cache dữ liệu trang
              </div>
              <div>
                <strong>Smart Navigation</strong> - Điều hướng thông minh
              </div>
            </div>
            
            <h4 className="font-semibold mb-2 mt-4">🔧 Các tính năng chính:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li><strong>Multi-tab browsing</strong> - Duyệt nhiều tab cùng lúc</li>
              <li><strong>Data persistence</strong> - Lưu trữ dữ liệu không bị mất</li>
              <li><strong>Smart caching</strong> - Cache thông minh theo trang</li>
              <li><strong>Mobile optimization</strong> - Tối ưu cho mobile</li>
              <li><strong>Auto-expire cache</strong> - Tự động hết hạn cache (24h)</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
