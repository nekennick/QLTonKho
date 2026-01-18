'use client';

import React from 'react';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3,
  Building2,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ReportPeriodType } from '../types/warehouseReport';
import { safeNumber, formatNumber, formatCurrency, safePercentage, safeRatio } from '../utils/numberUtils';

interface WarehouseReportSummaryProps {
  stats: {
    totalProducts: number;
    totalBeginningStock: number;
    totalEndingStock: number;
    totalImports: number;
    totalExports: number;
    totalValue: number;
  };
  period: ReportPeriodType;
  startDate: Date;
  endDate: Date;
  selectedWarehouse: string;
  warehouseOptions: { value: string; label: string }[];
}

export const WarehouseReportSummary: React.FC<WarehouseReportSummaryProps> = ({
  stats,
  period,
  startDate,
  endDate,
  selectedWarehouse,
  warehouseOptions
}) => {
  const selectedWarehouseName = warehouseOptions.find(w => w.value === selectedWarehouse)?.label || 'Tất cả kho';
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'week': return 'Tuần này';
      case 'month': return 'Tháng này';
      case 'quarter': return 'Quý này';
      case 'year': return 'Năm này';
      case 'custom': return 'Tùy chọn';
      default: return 'Kỳ báo cáo';
    }
  };

  return (
    <div className="space-y-4">
      {/* Period Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">Kỳ báo cáo</h3>
              <p className="text-sm text-blue-700">
                {getPeriodLabel()}: {formatDate(startDate)} - {formatDate(endDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-blue-600" />
            <div className="text-right">
              <h3 className="font-semibold text-blue-900">Kho</h3>
              <p className="text-sm text-blue-700">{selectedWarehouseName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Products */}
        <Card className="shadow-sm border border-gray-200 bg-white">
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center">
              <Package className="h-4 w-4 text-blue-600 mb-1" />
              <div className="text-lg font-bold text-gray-900">{formatNumber(stats.totalProducts)}</div>
              <div className="text-xs text-gray-600">Tổng HH</div>
            </div>
          </CardContent>
        </Card>

        {/* Beginning Stock */}
        <Card className="shadow-sm border border-gray-200 bg-white">
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center">
              <BarChart3 className="h-4 w-4 text-green-600 mb-1" />
              <div className="text-lg font-bold text-gray-900">
                {formatNumber(stats.totalBeginningStock)}
              </div>
              <div className="text-xs text-gray-600">Tồn đầu kỳ</div>
            </div>
          </CardContent>
        </Card>

        {/* Ending Stock */}
        <Card className="shadow-sm border border-gray-200 bg-white">
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center">
              <BarChart3 className="h-4 w-4 text-blue-600 mb-1" />
              <div className="text-lg font-bold text-gray-900">
                {formatNumber(stats.totalEndingStock)}
              </div>
              <div className="text-xs text-gray-600">Tồn cuối kỳ</div>
            </div>
          </CardContent>
        </Card>

        {/* Total Imports */}
        <Card className="shadow-sm border border-green-200 bg-green-50">
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center">
              <TrendingUp className="h-4 w-4 text-green-600 mb-1" />
              <div className="text-lg font-bold text-green-900">
                {formatNumber(stats.totalImports)}
              </div>
              <div className="text-xs text-green-700">Tổng nhập</div>
            </div>
          </CardContent>
        </Card>

        {/* Total Exports */}
        <Card className="shadow-sm border border-red-200 bg-red-50">
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center">
              <TrendingDown className="h-4 w-4 text-red-600 mb-1" />
              <div className="text-lg font-bold text-red-900">
                {formatNumber(stats.totalExports)}
              </div>
              <div className="text-xs text-red-700">Tổng xuất</div>
            </div>
          </CardContent>
        </Card>

        {/* Total Value */}
        <Card className="shadow-sm border border-purple-200 bg-purple-50">
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center">
              <DollarSign className="h-4 w-4 text-purple-600 mb-1" />
              <div className="text-lg font-bold text-purple-900">
                {formatCurrency(stats.totalValue)}
              </div>
              <div className="text-xs text-purple-700">Giá trị tồn</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stock Movement */}
        <Card className="shadow-sm border border-gray-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Biến động tồn kho
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Tăng/giảm:</span>
                <Badge 
                  variant={safeNumber(stats.totalEndingStock) >= safeNumber(stats.totalBeginningStock) ? "default" : "destructive"}
                  className="text-xs"
                >
                  {safeNumber(stats.totalEndingStock) >= safeNumber(stats.totalBeginningStock) ? '+' : ''}
                  {formatNumber(safeNumber(stats.totalEndingStock) - safeNumber(stats.totalBeginningStock))}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Tỷ lệ:</span>
                <span className="text-xs font-medium">
                  {safePercentage(
                    safeNumber(stats.totalEndingStock) - safeNumber(stats.totalBeginningStock),
                    safeNumber(stats.totalBeginningStock)
                  )}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Turnover Rate */}
        <Card className="shadow-sm border border-gray-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-600" />
              Tỷ lệ luân chuyển
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Xuất/Tồn:</span>
                <span className="text-xs font-medium">
                  {safeRatio(stats.totalExports, stats.totalEndingStock, 2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Nhập/Tồn:</span>
                <span className="text-xs font-medium">
                  {safeRatio(stats.totalImports, stats.totalEndingStock, 2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Values */}
        <Card className="shadow-sm border border-gray-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-purple-600" />
              Giá trị trung bình
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">TB/HH:</span>
                <span className="text-xs font-medium">
                  {safeNumber(stats.totalProducts) > 0 
                    ? formatCurrency(safeNumber(stats.totalValue) / safeNumber(stats.totalProducts))
                    : formatCurrency(0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">TB/Tồn:</span>
                <span className="text-xs font-medium">
                  {safeRatio(stats.totalEndingStock, stats.totalProducts, 1)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
