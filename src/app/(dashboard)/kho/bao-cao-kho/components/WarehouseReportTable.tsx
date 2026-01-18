'use client';

import React, { useState, useMemo } from 'react';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  Eye,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { WarehouseReportData } from '../types/warehouseReport';

interface WarehouseReportTableProps {
  data: WarehouseReportData[];
  loading: boolean;
  isMobile: boolean;
  selectedWarehouse: string;
  warehouseOptions: { value: string; label: string }[];
}

type SortField = 'TenVT' | 'MaVT' | 'endingStock' | 'totalImports' | 'totalExports' | 'unitPrice';
type SortDirection = 'asc' | 'desc';

export const WarehouseReportTable: React.FC<WarehouseReportTableProps> = ({
  data,
  loading,
  isMobile,
  selectedWarehouse,
  warehouseOptions
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('TenVT');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item => {
      const matchesSearch = !searchTerm || 
        item.TenVT.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.MaVT.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.NhomVT.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [data, searchTerm, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredAndSortedData.slice(startIndex, endIndex);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort icon
  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) {
      return <div className="w-4 h-4" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  // Mobile card component
  const MobileCard: React.FC<{ item: WarehouseReportData }> = ({ item }) => {
    const movement = item.endingStock - item.beginningStock;
    const isPositive = movement >= 0;
    const totalValue = item.endingStock * item.unitPrice;

    return (
      <Card className="mb-3">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900 truncate">
                  {item.TenVT}
                </h4>
                <p className="text-xs text-blue-600 font-mono">{item.MaVT}</p>
                <Badge variant="outline" className="text-xs mt-1">
                  {item.NhomVT}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600">
                  ₫{totalValue.toLocaleString('vi-VN')}
                </p>
                <p className="text-xs text-gray-500">Giá trị tồn</p>
              </div>
            </div>

            {/* Stock Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-600">Tồn đầu kỳ</p>
                <p className="font-medium text-sm">{item.beginningStock.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-600">Tồn cuối kỳ</p>
                <p className="font-medium text-sm">{item.endingStock.toLocaleString()}</p>
              </div>
            </div>

            {/* Movement */}
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-xs text-gray-600">Biến động:</span>
              <Badge 
                variant={isPositive ? "default" : "destructive"}
                className="text-xs"
              >
                {isPositive ? '+' : ''}{movement.toLocaleString()}
              </Badge>
            </div>

            {/* Import/Export */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-gray-600">Nhập</p>
                  <p className="font-medium text-sm text-green-600">
                    {item.totalImports.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-xs text-gray-600">Xuất</p>
                  <p className="font-medium text-sm text-red-600">
                    {item.totalExports.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>ĐVT:</strong> {item.ĐVT}</p>
              <p><strong>Đơn giá:</strong> ₫{item.unitPrice.toLocaleString('vi-VN')}</p>
              <p><strong>Kho:</strong> {item.TenKho}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Không có dữ liệu</h3>
          <p className="text-sm text-gray-500">
            Không tìm thấy dữ liệu báo cáo trong khoảng thời gian đã chọn.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm hàng hóa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10/trang</SelectItem>
              <SelectItem value="20">20/trang</SelectItem>
              <SelectItem value="50">50/trang</SelectItem>
              <SelectItem value="100">100/trang</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-gray-500">
          Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredAndSortedData.length)} / {filteredAndSortedData.length} kết quả
        </div>
      </div>

      {/* Mobile View */}
      {isMobile ? (
        <div className="space-y-3">
          {paginatedData.map((item, index) => (
            <MobileCard key={index} item={item} />
          ))}
        </div>
      ) : (
        /* Desktop Table */
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('TenVT')}
                  >
                    <div className="flex items-center gap-2">
                      Tên hàng hóa
                      <SortIcon field="TenVT" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('MaVT')}
                  >
                    <div className="flex items-center gap-2">
                      Mã VT
                      <SortIcon field="MaVT" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nhóm
                  </th>
                  <th 
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('endingStock')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Tồn cuối kỳ
                      <SortIcon field="endingStock" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('totalImports')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Nhập
                      <SortIcon field="totalImports" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('totalExports')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Xuất
                      <SortIcon field="totalExports" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('unitPrice')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Đơn giá
                      <SortIcon field="unitPrice" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá trị tồn
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((item, index) => {
                  const movement = item.endingStock - item.beginningStock;
                  const isPositive = movement >= 0;
                  const totalValue = item.endingStock * item.unitPrice;

                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                              {item.TenVT}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.ĐVT}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {item.MaVT}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">
                          {item.NhomVT}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.endingStock.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            Đầu: {item.beginningStock.toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="text-sm font-medium text-green-600">
                            {item.totalImports.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TrendingDown className="h-3 w-3 text-red-600" />
                          <span className="text-sm font-medium text-red-600">
                            {item.totalExports.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm text-gray-900">
                          ₫{item.unitPrice.toLocaleString('vi-VN')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div>
                          <div className="text-sm font-bold text-green-600">
                            ₫{totalValue.toLocaleString('vi-VN')}
                          </div>
                          <Badge 
                            variant={isPositive ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {isPositive ? '+' : ''}{movement.toLocaleString()}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Trang {currentPage} / {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
