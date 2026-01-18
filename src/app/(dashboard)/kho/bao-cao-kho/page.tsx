'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  Package, 
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/DatePicker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as XLSX from 'xlsx';
import authUtils from '@/utils/authUtils';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useBaoCaoKho } from './hooks/useBaoCaoKhoQueries';
import { WarehouseReportData } from './types/warehouseReport';
import { formatNumber } from '@/app/(dashboard)/kiemke/utils/kiemKeUtils';

export default function BaoCaoKhoPage() {
  usePageTitle('Báo cáo tồn kho');
  
  const [search, setSearch] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Permission states
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isManager, setIsManager] = useState<boolean>(false);
  const hasPricePermission = isAdmin || isManager;

  // TanStack Query hook
  const { data: reportData = [], isLoading, refetch } = useBaoCaoKho({
    startDate: startDate || (selectedMonth ? new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1) : undefined),
    endDate: endDate || (selectedMonth ? new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0) : undefined),
    month: selectedMonth,
    year: selectedYear,
  });

  // Check user permissions
  useEffect(() => {
    const userData = authUtils.getUserData();
    if (userData) {
      const isAdminUser = userData['Phân quyền'] === 'Admin';
      const isManagerUser = userData['Phân quyền'] === 'Quản lý';
      setIsAdmin(isAdminUser);
      setIsManager(isManagerUser);
    }
  }, []);

  // Filter data by search
  const filteredData = useMemo(() => {
    return reportData.filter(item =>
      item.TenVT?.toLowerCase().includes(search.toLowerCase()) ||
      item.MaVT?.toLowerCase().includes(search.toLowerCase()) ||
      item.NhomVT?.toLowerCase().includes(search.toLowerCase())
    );
  }, [reportData, search]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return {
        totalProducts: 0,
        totalBeginningStock: 0,
        totalEndingStock: 0,
        totalImports: 0,
        totalExports: 0,
        totalValue: 0
      };
    }

    return filteredData.reduce((acc, item) => {
      acc.totalProducts += 1;
      acc.totalBeginningStock += item.beginningStock || 0;
      acc.totalEndingStock += item.endingStock || 0;
      acc.totalImports += item.totalImports || 0;
      acc.totalExports += item.totalExports || 0;
      acc.totalValue += (item.endingStock || 0) * (item.unitPrice || 0);
      return acc;
    }, {
      totalProducts: 0,
      totalBeginningStock: 0,
      totalEndingStock: 0,
      totalImports: 0,
      totalExports: 0,
      totalValue: 0
    });
  }, [filteredData]);

  // Xuất Excel
  const handleExportExcel = (): void => {
    if (filteredData.length === 0) {
      toast.warning('⚠️ Không có dữ liệu để xuất!');
      return;
    }

    const headers = ['Mã VT', 'Tên VT', 'Nhóm VT', 'ĐVT', 'Đơn Giá', 'Tồn Đầu Kỳ', 'Tồn Cuối Kỳ', 'Tổng Nhập', 'Tổng Xuất', 'Giá Trị Tồn', 'Ghi Chú'];
    const exportData = [headers];

    filteredData.forEach((item) => {
      exportData.push([
        String(item.MaVT || ''),
        String(item.TenVT || ''),
        String(item.NhomVT || ''),
        String(item.ĐVT || ''),
        String(item.unitPrice || 0),
        String(item.beginningStock || 0),
        String(item.endingStock || 0),
        String(item.totalImports || 0),
        String(item.totalExports || 0),
        String((item.endingStock || 0) * (item.unitPrice || 0)),
        String(item.notes || '')
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo tồn kho');

    const fileName = `BaoCaoTonKho_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success('📤 Đã xuất báo cáo tồn kho!');
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Báo cáo tồn kho
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  📅 Từ ngày
                </Label>
                <DatePicker
                  date={startDate}
                  onDateChange={(date: Date | undefined) => {
                    setStartDate(date);
                    setSelectedMonth(undefined);
                    setSelectedYear(undefined);
                    setSelectedDate(undefined);
                  }}
                  placeholder="Chọn ngày bắt đầu"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  📅 Đến ngày
                </Label>
                <DatePicker
                  date={endDate}
                  onDateChange={(date: Date | undefined) => {
                    setEndDate(date);
                    setSelectedMonth(undefined);
                    setSelectedYear(undefined);
                    setSelectedDate(undefined);
                  }}
                  placeholder="Chọn ngày kết thúc"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  📅 Chọn tháng
                </Label>
                <DatePicker
                  date={selectedMonth}
                  onDateChange={(date: Date | undefined) => {
                    if (date) {
                      const newDate = new Date(date.getFullYear(), date.getMonth(), 1);
                      setSelectedMonth(newDate);
                      setStartDate(undefined);
                      setEndDate(undefined);
                      setSelectedYear(undefined);
                      setSelectedDate(undefined);
                    } else {
                      setSelectedMonth(undefined);
                    }
                  }}
                  placeholder="Chọn tháng/năm"
                  showMonthYearPicker={true}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  📅 Chọn năm
                </Label>
                <Input
                  type="number"
                  placeholder="Nhập năm (VD: 2024)"
                  className="w-full"
                  value={selectedYear || ''}
                  onChange={(e) => {
                    const year = e.target.value ? parseInt(e.target.value) : undefined;
                    if (year && year >= 2000 && year <= 2100) {
                      setSelectedYear(year);
                      setStartDate(undefined);
                      setEndDate(undefined);
                      setSelectedMonth(undefined);
                      setSelectedDate(undefined);
                    } else if (!e.target.value) {
                      setSelectedYear(undefined);
                    }
                  }}
                  min="2000"
                  max="2100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  🔍 Tìm kiếm
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm theo mã, tên hàng..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => refetch()}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
              <Button
                onClick={handleExportExcel}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Xuất Excel
              </Button>
              <Button
                onClick={() => {
                  setStartDate(undefined);
                  setEndDate(undefined);
                  setSelectedMonth(undefined);
                  setSelectedYear(undefined);
                  setSelectedDate(undefined);
                  setSearch('');
                }}
                variant="outline"
              >
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tồn đầu kỳ</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatNumber(summaryStats.totalBeginningStock)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tồn cuối kỳ</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatNumber(summaryStats.totalEndingStock)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng nhập</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatNumber(summaryStats.totalImports)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng xuất</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatNumber(summaryStats.totalExports)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng giá trị tồn</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatNumber(summaryStats.totalValue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <Card className="shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Đang tải dữ liệu...</h3>
            <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Package className="w-6 h-6 text-blue-600" />
              Chi tiết báo cáo tồn kho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-600 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="px-3 py-4 text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-br from-blue-500 to-blue-600 sticky top-0 z-30">
                      STT
                    </TableHead>
                    <TableHead className="px-3 py-4 text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-br from-blue-500 to-blue-600 sticky top-0 z-30">
                      Mã VT
                    </TableHead>
                    <TableHead className="px-3 py-4 text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-br from-blue-500 to-blue-600 sticky top-0 z-30">
                      Tên VT
                    </TableHead>
                    <TableHead className="px-3 py-4 text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-br from-blue-500 to-blue-600 sticky top-0 z-30">
                      Nhóm VT
                    </TableHead>
                    <TableHead className="px-3 py-4 text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-br from-blue-500 to-blue-600 sticky top-0 z-30">
                      ĐVT
                    </TableHead>
                    {hasPricePermission && (
                      <TableHead className="px-3 py-4 text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-br from-blue-500 to-blue-600 sticky top-0 z-30">
                        Đơn Giá
                      </TableHead>
                    )}
                    <TableHead className="px-3 py-4 text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-br from-blue-500 to-blue-600 sticky top-0 z-30">
                      Tồn Đầu Kỳ
                    </TableHead>
                    <TableHead className="px-3 py-4 text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-br from-blue-500 to-blue-600 sticky top-0 z-30">
                      Tồn Cuối Kỳ
                    </TableHead>
                    <TableHead className="px-3 py-4 text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-br from-blue-500 to-blue-600 sticky top-0 z-30">
                      Tổng Nhập
                    </TableHead>
                    <TableHead className="px-3 py-4 text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-br from-blue-500 to-blue-600 sticky top-0 z-30">
                      Tổng Xuất
                    </TableHead>
                    {hasPricePermission && (
                      <TableHead className="px-3 py-4 text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-br from-blue-500 to-blue-600 sticky top-0 z-30">
                        Giá Trị Tồn
                      </TableHead>
                    )}
                    <TableHead className="px-3 py-4 text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-br from-blue-500 to-blue-600 sticky top-0 z-30">
                      Ghi Chú
                    </TableHead>
                  </TableRow>
                </thead>
                <TableBody>
                  {filteredData.length > 0 ? filteredData.map((item, index) => (
                    <TableRow
                      key={index}
                      className={`transition-all duration-200 hover:bg-blue-50 ${
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      }`}
                    >
                      <TableCell className="border border-gray-300 px-3 py-2 text-center">
                        <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </Badge>
                      </TableCell>
                      <TableCell className="border border-gray-300 px-2 py-2 text-sm">
                        {item.MaVT || ''}
                      </TableCell>
                      <TableCell className="border border-gray-300 px-2 py-2 text-sm">
                        {item.TenVT || ''}
                      </TableCell>
                      <TableCell className="border border-gray-300 px-2 py-2 text-sm">
                        {item.NhomVT || ''}
                      </TableCell>
                      <TableCell className="border border-gray-300 px-2 py-2 text-center text-sm">
                        {item.ĐVT || ''}
                      </TableCell>
                      {hasPricePermission && (
                        <TableCell className="border border-gray-300 px-2 py-2 text-right text-sm">
                          {formatNumber(item.unitPrice || 0)}
                        </TableCell>
                      )}
                      <TableCell className="border border-gray-300 px-2 py-2 text-center text-sm">
                        {formatNumber(item.beginningStock || 0)}
                      </TableCell>
                      <TableCell className="border border-gray-300 px-2 py-2 text-center text-sm">
                        {formatNumber(item.endingStock || 0)}
                      </TableCell>
                      <TableCell className="border border-gray-300 px-2 py-2 text-center text-sm">
                        {formatNumber(item.totalImports || 0)}
                      </TableCell>
                      <TableCell className="border border-gray-300 px-2 py-2 text-center text-sm">
                        {formatNumber(item.totalExports || 0)}
                      </TableCell>
                      {hasPricePermission && (
                        <TableCell className="border border-gray-300 px-2 py-2 text-right text-sm">
                          {formatNumber((item.endingStock || 0) * (item.unitPrice || 0))}
                        </TableCell>
                      )}
                      <TableCell className="border border-gray-300 px-2 py-2 text-sm">
                        {item.notes || ''}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell
                        colSpan={hasPricePermission ? 12 : 9}
                        className="border border-gray-300 px-6 py-12 text-center"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <RefreshCw className="h-12 w-12 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có dữ liệu</h3>
                          <p className="text-gray-600 mb-4">
                            {search || startDate || endDate || selectedMonth || selectedYear
                              ? 'Không tìm thấy dữ liệu phù hợp với bộ lọc'
                              : 'Chưa có dữ liệu báo cáo tồn kho'}
                          </p>
                          {(search || startDate || endDate || selectedMonth || selectedYear) && (
                            <Button
                              onClick={() => {
                                setStartDate(undefined);
                                setEndDate(undefined);
                                setSelectedMonth(undefined);
                                setSelectedYear(undefined);
                                setSearch('');
                              }}
                              variant="default"
                            >
                              Xóa bộ lọc
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
