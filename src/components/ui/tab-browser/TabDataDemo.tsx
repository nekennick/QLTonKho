'use client';

import React, { useState } from 'react';
import { usePageData } from '@/hooks/usePageData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock API function
const fetchMockData = async (page: string): Promise<any> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    page,
    data: `Data for ${page} - ${new Date().toLocaleTimeString()}`,
    items: Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1} from ${page}`,
      timestamp: new Date().toISOString(),
    })),
  };
};

export const TabDataDemo: React.FC = () => {
  const [page, setPage] = useState('demo');
  
  const { 
    data, 
    loading, 
    error, 
    refreshData, 
    clearCache, 
    hasCachedData 
  } = usePageData(
    `demo-data-${page}`, 
    () => fetchMockData(page)
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Tab Data Cache Demo</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setPage('demo')}
          >
            Demo Page
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setPage('test')}
          >
            Test Page
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Current Page: <strong>{page}</strong>
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
              onClick={refreshData} 
              disabled={loading}
              size="sm"
            >
              {loading ? 'Loading...' : 'Refresh Data'}
            </Button>
            <Button 
              onClick={clearCache} 
              variant="outline"
              size="sm"
            >
              Clear Cache
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
              <div>
                <strong>Items:</strong>
                <ul className="mt-2 space-y-1">
                  {data.items.map((item: any) => (
                    <li key={item.id} className="text-sm">
                      {item.name} - {new Date(item.timestamp).toLocaleTimeString()}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 mt-4">
            <p><strong>Hướng dẫn:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Chuyển đổi giữa các tab để test cache</li>
              <li>Data sẽ được cache và không reload khi quay lại tab cũ</li>
              <li>Click "Refresh Data" để force reload</li>
              <li>Click "Clear Cache" để xóa cache</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
