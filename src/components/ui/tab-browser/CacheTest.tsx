'use client';

import React, { useState } from 'react';
import { usePageData } from '@/hooks/usePageData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock API function với delay
const fetchTestData = async (): Promise<any> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    timestamp: new Date().toLocaleTimeString(),
    data: `Data loaded at ${new Date().toLocaleTimeString()}`,
    random: Math.random().toString(36).substring(7),
  };
};

export const CacheTest: React.FC = () => {
  const { 
    data, 
    loading, 
    error, 
    refreshData, 
    clearCache, 
    hasCachedData 
  } = usePageData('cache-test', fetchTestData);

  const [testCount, setTestCount] = useState(0);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Cache Persistence Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Test Count: <strong>{testCount}</strong>
            </span>
            <span className={`text-xs px-2 py-1 rounded ${
              hasCachedData 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {hasCachedData ? 'Cached' : 'No Cache'}
            </span>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => {
                refreshData();
                setTestCount(prev => prev + 1);
              }}
              disabled={loading}
              size="sm"
            >
              {loading ? 'Loading...' : 'Load Data'}
            </Button>
            <Button 
              onClick={clearCache} 
              variant="outline"
              size="sm"
            >
              Clear Cache
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              size="sm"
            >
              F5 Reload
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-800 rounded">
              Error: {error.message}
            </div>
          )}

          {data && (
            <div className="space-y-2">
              <div className="p-3 bg-gray-100 rounded">
                <strong>Data:</strong> {data.data}
              </div>
              <div className="p-3 bg-gray-100 rounded">
                <strong>Random ID:</strong> {data.random}
              </div>
              <div className="p-3 bg-gray-100 rounded">
                <strong>Timestamp:</strong> {data.timestamp}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 mt-4">
            <p><strong>Test Instructions:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Click "Load Data" để fetch data mới (2s delay)</li>
              <li>Chuyển sang tab khác rồi quay lại - data vẫn còn</li>
              <li>Click "F5 Reload" - data vẫn được giữ nguyên</li>
              <li>Click "Clear Cache" để xóa cache</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
