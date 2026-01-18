'use client';

import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWarehouseReport } from '../hooks/useWarehouseReport';
import type { WarehouseReportData, ReportPeriodType } from '../types/warehouseReport';

interface WarehouseReportChartsProps {
  data: WarehouseReportData[];
  period: ReportPeriodType;
  startDate: Date;
  endDate: Date;
  isMobile: boolean;
}

export const WarehouseReportCharts: React.FC<WarehouseReportChartsProps> = ({
  data,
  period,
  startDate,
  endDate,
  isMobile
}) => {
  const { getChartData } = useWarehouseReport();

  // Tạo dữ liệu cho các biểu đồ
  const stockChartData = useMemo(() => getChartData(data, 'stock'), [data, getChartData]);
  const importChartData = useMemo(() => getChartData(data, 'import'), [data, getChartData]);
  const exportChartData = useMemo(() => getChartData(data, 'export'), [data, getChartData]);
  const valueChartData = useMemo(() => getChartData(data, 'value'), [data, getChartData]);

  // Component biểu đồ đơn giản (thay thế cho Chart.js)
  const SimpleBarChart: React.FC<{
    data: { labels: string[]; datasets: any[] };
    title: string;
    color: string;
  }> = ({ data, title, color }) => {
    if (!data.labels.length) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Không có dữ liệu để hiển thị</p>
          </div>
        </div>
      );
    }

    const maxValue = Math.max(...data.datasets[0].data);
    
    return (
      <div className="space-y-4">
        <h4 className="font-medium text-sm text-gray-700">{title}</h4>
        <div className="space-y-2">
          {data.labels.map((label, index) => {
            const value = data.datasets[0].data[index];
            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="truncate max-w-[200px]" title={label}>
                    {label}
                  </span>
                  <span className="font-medium">{value.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Chart Tabs */}
      <Tabs defaultValue="stock" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="stock" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Tồn kho</span>
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Nhập kho</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            <span className="hidden sm:inline">Xuất kho</span>
          </TabsTrigger>
          <TabsTrigger value="value" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Giá trị</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-blue-600" />
                Biểu đồ tồn kho cuối kỳ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={stockChartData}
                title="Top 10 sản phẩm có tồn kho cao nhất"
                color="rgba(59, 130, 246, 0.8)"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Biểu đồ nhập kho trong kỳ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={importChartData}
                title="Top 10 sản phẩm nhập kho nhiều nhất"
                color="rgba(34, 197, 94, 0.8)"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Biểu đồ xuất kho trong kỳ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={exportChartData}
                title="Top 10 sản phẩm xuất kho nhiều nhất"
                color="rgba(239, 68, 68, 0.8)"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="value" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Biểu đồ giá trị tồn kho
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={valueChartData}
                title="Top 10 sản phẩm có giá trị tồn kho cao nhất"
                color="rgba(168, 85, 247, 0.8)"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Movement Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Biến động tồn kho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.slice(0, 5).map((item, index) => {
                const movement = item.endingStock - item.beginningStock;
                const isPositive = movement >= 0;
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.TenVT}</p>
                      <p className="text-xs text-gray-500">{item.MaVT}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{movement.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.beginningStock.toLocaleString()} → {item.endingStock.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Products by Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Sản phẩm hoạt động mạnh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data
                .sort((a, b) => (b.totalImports + b.totalExports) - (a.totalImports + a.totalExports))
                .slice(0, 5)
                .map((item, index) => {
                  const totalActivity = item.totalImports + item.totalExports;
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.TenVT}</p>
                        <p className="text-xs text-gray-500">{item.MaVT}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-600">
                          {totalActivity.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          +{item.totalImports.toLocaleString()} / -{item.totalExports.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
