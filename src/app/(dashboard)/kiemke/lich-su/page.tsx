'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { History, Search, Download, Calendar, RefreshCw, Eye, GitCompare } from 'lucide-react';
import { toast } from 'sonner';
import { DatePicker } from '@/components/ui/DatePicker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as XLSX from 'xlsx';
import authUtils from '@/utils/authUtils';
import { formatNumber } from '../utils/kiemKeUtils';
import { KiemKeItem } from '../types/kiemke';
import { InventorySession } from '../types/compare';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useKiemKeHistory } from '../hooks/useKiemKeQueries';
import { CompareInventoryDialog } from '../components/CompareInventoryDialog';

export default function LichSuKiemKePage() {
  usePageTitle('Lịch sử kiểm kê');

  const [search, setSearch] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);

  // Permission states
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isManager, setIsManager] = useState<boolean>(false);
  const hasPricePermission = isAdmin || isManager;

  // Compare states
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);

  // TanStack Query hook
  const { data: kiemKeHistory = [], isLoading, refetch } = useKiemKeHistory({
    date: selectedDate,
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
    return kiemKeHistory.filter(item =>
      item.TenVT?.toLowerCase().includes(search.toLowerCase()) ||
      item.MaVT?.toLowerCase().includes(search.toLowerCase()) ||
      item.NhomVT?.toLowerCase().includes(search.toLowerCase()) ||
      item.IDTONKHO?.toLowerCase().includes(search.toLowerCase())
    );
  }, [kiemKeHistory, search]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: { [key: string]: KiemKeItem[] } = {};
    filteredData.forEach(item => {
      // Format ngày với padding số 0 để đảm bảo format đẹp (DD/MM/YYYY)
      const day = String(item.Ngay || 0).padStart(2, '0');
      const month = String(item.Thang || 0).padStart(2, '0');
      const year = item.Nam || 0;
      const key = `${day}/${month}/${year}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });
    return groups;
  }, [filteredData]);

  // Get sorted date keys
  const sortedDateKeys = useMemo(() => {
    return Object.keys(groupedByDate).sort((dateA, dateB) => {
      const [dayA, monthA, yearA] = dateA.split('/').map(Number);
      const [dayB, monthB, yearB] = dateB.split('/').map(Number);
      if (yearB !== yearA) return yearB - yearA;
      if (monthB !== monthA) return monthB - monthA;
      return dayB - dayA;
    });
  }, [groupedByDate]);

  // Handle date selection for compare
  const handleDateSelect = (date: string, checked: boolean) => {
    if (checked) {
      if (selectedDates.length >= 2) {
        toast.warning('Chỉ được chọn tối đa 2 ngày để so sánh!');
        return;
      }
      setSelectedDates([...selectedDates, date]);
    } else {
      setSelectedDates(selectedDates.filter(d => d !== date));
    }
  };

  // Get selected sessions for compare
  const getCompareSessions = (): { session1: InventorySession | null; session2: InventorySession | null } => {
    if (selectedDates.length !== 2) return { session1: null, session2: null };

    // Sắp xếp để session1 là ngày cũ hơn
    const sortedDates = [...selectedDates].sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('/').map(Number);
      const [dayB, monthB, yearB] = b.split('/').map(Number);
      if (yearA !== yearB) return yearA - yearB;
      if (monthA !== monthB) return monthA - monthB;
      return dayA - dayB;
    });

    return {
      session1: {
        date: sortedDates[0],
        items: groupedByDate[sortedDates[0]] || [],
        totalItems: (groupedByDate[sortedDates[0]] || []).length,
      },
      session2: {
        date: sortedDates[1],
        items: groupedByDate[sortedDates[1]] || [],
        totalItems: (groupedByDate[sortedDates[1]] || []).length,
      },
    };
  };

  const { session1, session2 } = getCompareSessions();

  // Cập nhật số lượng tồn kho về 0 cho các món hết
  const handleUpdateOutOfStock = async (maVTList: string[]): Promise<void> => {
    try {
      const today = new Date();
      const ngay = today.getDate();
      const thang = today.getMonth() + 1;
      const nam = today.getFullYear();

      // Tạo bản ghi kiểm kê mới với SoLuong = 0 cho các mặt hàng đã hết
      const newKiemKeRows = maVTList.map(maVT => {
        // Tìm thông tin sản phẩm từ session cũ
        const oldItem = session1?.items.find(item => item.MaVT === maVT);
        return {
          IDTONKHO: `${String(ngay).padStart(2, '0')}${String(thang).padStart(2, '0')}${nam}${maVT}`,
          Ngay: ngay,
          Thang: thang,
          Nam: nam,
          MaVT: maVT,
          TenVT: oldItem?.TenVT || '',
          NhomVT: oldItem?.NhomVT || '',
          ĐVT: oldItem?.ĐVT || '',
          NoiSX: oldItem?.NoiSX || '',
          DonGia: oldItem?.DonGia || 0,
          SoLuong: 0,
          ThanhTien: 0,
          GhiChu: 'Cập nhật tự động - Hết hàng'
        };
      });

      await authUtils.apiRequest('TONKHO', 'Add', {
        Rows: newKiemKeRows
      });

      toast.success(`Đã cập nhật ${maVTList.length} mặt hàng về SL = 0`);

      // Refresh data
      refetch();
    } catch (error) {
      console.error('Error updating out of stock items:', error);
      toast.error('Có lỗi khi cập nhật!');
      throw error;
    }
  };

  // Xuất Excel
  const handleExportExcel = (): void => {
    if (filteredData.length === 0) {
      toast.warning('⚠️ Không có dữ liệu để xuất!');
      return;
    }

    const headers = ['IDTONKHO', 'Ngay', 'Thang', 'Nam', 'MaVT', 'TenVT', 'NhomVT', 'ĐVT', 'NoiSX', 'DonGia', 'SoLuong', 'ThanhTien', 'GhiChu'];
    const exportData = [headers];

    filteredData.forEach((item) => {
      exportData.push([
        String(item.IDTONKHO || ''),
        String(item.Ngay || ''),
        String(item.Thang || ''),
        String(item.Nam || ''),
        String(item.MaVT || ''),
        String(item.TenVT || ''),
        String(item.NhomVT || ''),
        String(item.ĐVT || ''),
        String(item.NoiSX || ''),
        String(item.DonGia || 0),
        String(item.SoLuong || 0),
        String(item.ThanhTien || 0),
        String(item.GhiChu || '')
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lịch sử kiểm kê');

    const fileName = `LichSuKiemKe_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success('📤 Đã xuất lịch sử kiểm kê!');
  };

  return (
    <>
      <div className="space-y-6">
        {/* Control Panel */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <History className="w-6 h-6 text-blue-600" />
              Lịch sử kiểm kê
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold">
                    📅 Chọn ngày
                  </Label>
                  <DatePicker
                    date={selectedDate}

                    onDateChange={(date: Date | undefined) => {
                      setSelectedDate(date);
                      setSelectedMonth(undefined);
                      setSelectedYear(undefined);
                    }}
                    placeholder="Chọn ngày"
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
                        setSelectedDate(undefined);
                        setSelectedYear(undefined);
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
                        setSelectedDate(undefined);
                        setSelectedMonth(undefined);
                      } else if (!e.target.value) {
                        setSelectedYear(undefined);
                      }
                    }}
                    min="2000"
                    max="2100"
                  />
                </div>

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
                    setSelectedDate(undefined);
                    setSelectedMonth(undefined);
                    setSelectedYear(undefined);
                    setSearch('');
                    setSelectedDates([]);
                  }}
                  variant="outline"
                >
                  Xóa bộ lọc
                </Button>

                {/* Compare Button */}
                {selectedDates.length === 2 && (
                  <Button
                    onClick={() => setCompareDialogOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <GitCompare className="w-4 h-4 mr-2" />
                    So sánh ({selectedDates.length})
                  </Button>
                )}
                {selectedDates.length > 0 && selectedDates.length < 2 && (
                  <Badge variant="secondary" className="py-2 px-3">
                    Đã chọn {selectedDates.length}/2 ngày
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

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
          <div className="space-y-4">
            {Object.keys(groupedByDate).length > 0 ? (
              Object.entries(groupedByDate)
                .sort(([dateA], [dateB]) => {
                  // Parse ngày từ format DD/MM/YYYY
                  const [dayA, monthA, yearA] = dateA.split('/').map(Number);
                  const [dayB, monthB, yearB] = dateB.split('/').map(Number);
                  // Sắp xếp giảm dần: năm mới nhất trước, sau đó tháng, sau đó ngày
                  if (yearB !== yearA) return yearB - yearA;
                  if (monthB !== monthA) return monthB - monthA;
                  return dayB - dayA;
                })
                .map(([date, items]) => (
                  <Card key={date} className={`shadow-lg ${selectedDates.includes(date) ? 'ring-2 ring-purple-500' : ''}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedDates.includes(date)}
                            onCheckedChange={(checked) => handleDateSelect(date, !!checked)}
                            className="h-5 w-5"
                          />
                          <Calendar className="w-5 h-5 text-blue-600" />
                          Ngày kiểm kê: {date}
                        </span>
                        <Badge variant="secondary" className="text-sm">
                          {items.length} hàng
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto" style={{ maxHeight: '700px', overflowY: 'auto' }}>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-blue-600 sticky top-0 z-10">
                            <TableRow>
                              <TableHead className="px-3 py-4 text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-br from-blue-500 to-blue-600 sticky top-0 z-30">
                                STT
                              </TableHead>
                              <TableHead className="px-3 py-4 text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-br from-blue-500 to-blue-600 sticky top-0 z-30">
                                IDTONKHO
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
                              <TableHead className="px-3 py-4 text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-br from-blue-500 to-blue-600 sticky top-0 z-30">
                                Nơi SX
                              </TableHead>
                              {hasPricePermission && (
                                <TableHead className="px-3 py-4 text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-br from-blue-500 to-blue-600 sticky top-0 z-30">
                                  Đơn Giá
                                </TableHead>
                              )}
                              <TableHead className="px-3 py-4 text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-br from-blue-500 to-blue-600 sticky top-0 z-30">
                                Số Lượng
                              </TableHead>
                              {hasPricePermission && (
                                <TableHead className="px-3 py-4 text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-br from-blue-500 to-blue-600 sticky top-0 z-30">
                                  Thành Tiền
                                </TableHead>
                              )}
                              <TableHead className="px-3 py-4 text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-br from-blue-500 to-blue-600 sticky top-0 z-30">
                                Ghi Chú
                              </TableHead>
                            </TableRow>
                          </thead>
                          <TableBody>
                            {items.map((item, index) => (
                              <TableRow
                                key={index}
                                className={`transition-all duration-200 hover:bg-blue-50 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                  }`}
                              >
                                <TableCell className="border border-gray-300 px-3 py-2 text-center">
                                  <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold">
                                    {index + 1}
                                  </Badge>
                                </TableCell>
                                <TableCell className="border border-gray-300 px-2 py-2 text-center text-sm">
                                  {item.IDTONKHO || ''}
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
                                <TableCell className="border border-gray-300 px-2 py-2 text-sm">
                                  {item.NoiSX || ''}
                                </TableCell>
                                {hasPricePermission && (
                                  <TableCell className="border border-gray-300 px-2 py-2 text-right text-sm">
                                    {formatNumber(item.DonGia || 0)}
                                  </TableCell>
                                )}
                                <TableCell className="border border-gray-300 px-2 py-2 text-center text-sm">
                                  {formatNumber(item.SoLuong || 0)}
                                </TableCell>
                                {hasPricePermission && (
                                  <TableCell className="border border-gray-300 px-2 py-2 text-right text-sm">
                                    {formatNumber(item.ThanhTien || 0)}
                                  </TableCell>
                                )}
                                <TableCell className="border border-gray-300 px-2 py-2 text-sm">
                                  {item.GhiChu || ''}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <RefreshCw className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có dữ liệu</h3>
                  <p className="text-gray-600 mb-4">
                    {search || selectedDate || selectedMonth || selectedYear
                      ? 'Không tìm thấy dữ liệu phù hợp với bộ lọc'
                      : 'Chưa có lịch sử kiểm kê'}
                  </p>
                  {(search || selectedDate || selectedMonth || selectedYear) && (
                    <Button
                      onClick={() => {
                        setSelectedDate(undefined);
                        setSelectedMonth(undefined);
                        setSelectedYear(undefined);
                        setSearch('');
                      }}
                      variant="default"
                    >
                      Xóa bộ lọc
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Compare Dialog */}
      <CompareInventoryDialog
        open={compareDialogOpen}
        onOpenChange={setCompareDialogOpen}
        session1={session1}
        session2={session2}
        onUpdateOutOfStock={handleUpdateOutOfStock}
        hasPricePermission={hasPricePermission}
      />
    </>
  );
}
