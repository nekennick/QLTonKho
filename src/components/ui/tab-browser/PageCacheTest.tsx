'use client';

import React, { useState } from 'react';
import { usePageData } from '@/hooks/usePageData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePathname } from 'next/navigation';

// Mock API functions cho các trang khác nhau
const fetchKhoData = async () => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    khoList: [
      { id: 1, name: 'Kho A', location: 'Hà Nội' },
      { id: 2, name: 'Kho B', location: 'TP.HCM' },
    ],
    timestamp: new Date().toLocaleTimeString(),
  };
};

const fetchProductData = async () => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return {
    products: [
      { id: 1, name: 'Sản phẩm A', price: 100000 },
      { id: 2, name: 'Sản phẩm B', price: 200000 },
    ],
    timestamp: new Date().toLocaleTimeString(),
  };
};

const fetchEmployeeData = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    employees: [
      { id: 1, name: 'Nguyễn Văn A', position: 'Nhân viên' },
      { id: 2, name: 'Trần Thị B', position: 'Quản lý' },
    ],
    timestamp: new Date().toLocaleTimeString(),
  };
};

export const PageCacheTest: React.FC = () => {
  const pathname = usePathname();
  const [testType, setTestType] = useState<'kho' | 'product' | 'employee'>('kho');

  const getFetchFunction = () => {
    switch (testType) {
      case 'kho':
        return fetchKhoData;
      case 'product':
        return fetchProductData;
      case 'employee':
        return fetchEmployeeData;
      default:
        return fetchKhoData;
    }
  };

  const { 
    data, 
    loading, 
    error, 
    refreshData, 
    clearCache, 
    hasCachedData 
  } = usePageData(`page-test-${testType}`, getFetchFunction());

  const getTestTitle = () => {
    switch (testType) {
      case 'kho':
        return 'Quản lý kho';
      case 'product':
        return 'Danh mục hàng hóa';
      case 'employee':
        return 'Quản lý nhân viên';
      default:
        return 'Test';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Page Cache Test - {getTestTitle()}</CardTitle>
        <div className="flex gap-2">
          <Button
            variant={testType === 'kho' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTestType('kho')}
          >
            Kho
          </Button>
          <Button
            variant={testType === 'product' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTestType('product')}
          >
            Sản phẩm
          </Button>
          <Button
            variant={testType === 'employee' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTestType('employee')}
          >
            Nhân viên
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Current Path: <code>{pathname}</code>
            </span>
            <Badge variant={hasCachedData ? 'default' : 'secondary'}>
              {hasCachedData ? 'Cached' : 'No Cache'}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={refreshData} 
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
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-800 rounded">
              Error: {error.message}
            </div>
          )}

          {data && (
            <div className="space-y-2">
              <div className="p-3 bg-gray-100 rounded">
                <strong>Data loaded at:</strong> {data.timestamp}
              </div>
              <div className="p-3 bg-gray-100 rounded">
                <strong>Data:</strong>
                <pre className="mt-2 text-sm overflow-auto max-h-32">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 mt-4">
            <p><strong>Test Instructions:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Chọn loại data khác nhau (Kho/Sản phẩm/Nhân viên)</li>
              <li>Click "Load Data" để fetch data mới</li>
              <li>Chuyển sang tab khác rồi quay lại - data vẫn còn</li>
              <li>F5 trang - data vẫn được giữ nguyên</li>
              <li>Cache được lưu theo pathname + dataKey</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
