'use client';

import { useProducts } from '@/app/(dashboard)/kho/danh-muc-hang-hoa/hooks/useProducts';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Save, Search, Download, Upload, RefreshCw, Package, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { DatePicker } from '@/components/ui/DatePicker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import authUtils from '@/utils/authUtils';
import { calculateThanhTien, parseFormattedNumber, formatNumber } from '../utils/kiemKeUtils';
import { KiemKeItem } from '../types/kiemke';
import { useKiemKeData, useSaveKiemKe } from '../hooks/useKiemKeQueries';
import BangKiemKeMobile from './BangKiemKeMobile';
import ImportPreviewDialog, { PreviewItem } from './ImportPreviewDialog';
import ProductAddSheet from './ProductAddSheet';
import { ProductFormData } from '@/app/(dashboard)/kho/danh-muc-hang-hoa/types/product';

const BangKiemKe = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });
  const [search, setSearch] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [soLuongInputValue, setSoLuongInputValue] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const handleCapture = async () => {
    if (!captureRef.current) return;

    try {
      setIsCapturing(true);

      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      const dateStr = selectedDate.toLocaleDateString('vi-VN').replace(/\//g, '-');
      link.href = image;
      link.download = `KiemKe-${dateStr}-PC.png`;
      link.click();

      toast.success('📸 Đã chụp ảnh bảng kiểm kê!');
    } catch (err) {
      console.error("Lỗi khi chụp ảnh:", err);
      toast.error("❌ Có lỗi khi tạo ảnh.");
    } finally {
      setIsCapturing(false);
    }
  };

  // States for Import Preview
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<PreviewItem[]>([]);

  // Permission states
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isManager, setIsManager] = useState<boolean>(false);
  const hasPricePermission = isAdmin || isManager;

  // TanStack Query hooks
  const { data: kiemKeData = [], isLoading, refetch } = useKiemKeData(selectedDate);
  const [localKiemKeData, setLocalKiemKeData] = useState<KiemKeItem[]>([]);
  const saveKiemKeMutation = useSaveKiemKe();

  // Sync local state với query data
  useEffect(() => {
    if (kiemKeData.length > 0) {
      setLocalKiemKeData(kiemKeData);
    }
  }, [kiemKeData]);

  // Filter data by search
  const filteredData = useMemo(() => {
    const dataToFilter = localKiemKeData.length > 0 ? localKiemKeData : kiemKeData;
    return dataToFilter.filter(item =>
      item.TenVT?.toLowerCase().includes(search.toLowerCase()) ||
      item.MaVT?.toLowerCase().includes(search.toLowerCase()) ||
      item.NhomVT?.toLowerCase().includes(search.toLowerCase()) ||
      item.GhiChu?.toLowerCase().includes(search.toLowerCase())
    );
  }, [localKiemKeData, kiemKeData, search]);

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

  // Check mobile/desktop
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Xử lý thay đổi số lượng
  const handleSoLuongChange = (index: number, value: string): void => {
    const dataToUpdate = localKiemKeData.length > 0 ? localKiemKeData : kiemKeData;
    const updatedData = [...dataToUpdate];
    const inputKey = `${index}`;

    // Lưu giá trị raw khi đang nhập
    setSoLuongInputValue(prev => ({ ...prev, [inputKey]: value }));

    // Parse và cập nhật số lượng
    const numValue = parseFormattedNumber(value);
    updatedData[index].SoLuong = numValue;

    // Tự động tính thành tiền
    const donGia = typeof updatedData[index].DonGia === 'string'
      ? parseFormattedNumber(String(updatedData[index].DonGia))
      : (typeof updatedData[index].DonGia === 'number' ? updatedData[index].DonGia : 0);
    updatedData[index].ThanhTien = calculateThanhTien(donGia, numValue);

    setLocalKiemKeData(updatedData);
  };


  // Xử lý thay đổi ghi chú
  const handleGhiChuChange = (index: number, value: string): void => {
    const dataToUpdate = localKiemKeData.length > 0 ? localKiemKeData : kiemKeData;
    const updatedData = [...dataToUpdate];
    updatedData[index].GhiChu = value;
    setLocalKiemKeData(updatedData);
  };

  // Lưu dữ liệu kiểm kê vào TONKHO
  const handleSaveData = async (): Promise<void> => {
    const dataToSave = localKiemKeData.length > 0 ? localKiemKeData : kiemKeData;

    if (dataToSave.length === 0) {
      toast.warning('⚠️ Không có dữ liệu để lưu!');
      return;
    }

    setIsSaving(true);
    try {
      await saveKiemKeMutation.mutateAsync({
        data: dataToSave,
        selectedDate,
      });
      // Refetch data sau khi lưu thành công
      await refetch();
      // Reset local state về data mới
      setLocalKiemKeData([]);
    } catch (error) {
      // Error đã được xử lý trong mutation
      console.error('Error saving data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Import từ Excel
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.info('⏳ Đang đọc file Excel...');
    console.log('File selected:', file.name, file.size);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        if (!data) {
          toast.error('❌ Không thể đọc dữ liệu từ file!');
          return;
        }

        console.log('File read success, parsing XLSX...');
        const workbook = XLSX.read(data, { type: 'array' });
        console.log('Workbook sheets:', workbook.SheetNames);

        let validSheetFound = false;
        let jsonData: any[][] = [];
        let headerRowIndex = -1;

        let maVTIndex = -1;
        let soLuongIndex = -1;
        // Optional columns
        let tenVTIndex = -1;
        let dvtIndex = -1;
        let noiSXIndex = -1;
        let donGiaIndex = -1;
        let hasLoggedDebug = false;

        // Helper check string
        const isMatch = (val: any, keys: string[]) => {
          if (!val) return false;
          const str = String(val).toLowerCase().trim();
          return keys.some(k => str.includes(k));
        };

        // Duyệt qua từng sheet để tìm dữ liệu
        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          // Use raw: false to get formatted strings (e.g. "8,00")
          const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }) as any[][];
          console.log(`Checking sheet "${sheetName}": ${sheetData.length} rows`);

          if (sheetData.length === 0) continue;

          // Quét 20 dòng đầu tiên của sheet này để tìm header
          for (let i = 0; i < Math.min(sheetData.length, 20); i++) {
            const row = sheetData[i];
            if (!row || !Array.isArray(row)) continue;

            const currentMaVTIndex = row.findIndex((h: any) =>
              isMatch(h, ['mavt', 'mã vt', 'mã vật tư', 'ma vat tu'])
            );

            const currentSoLuongIndex = row.findIndex((h: any) =>
              isMatch(h, ['soluong', 'số lượng', 'so luong', 'thực tế', 'tồn kho'])
            );

            if (currentMaVTIndex !== -1 && currentSoLuongIndex !== -1) {
              headerRowIndex = i;
              maVTIndex = currentMaVTIndex;
              soLuongIndex = currentSoLuongIndex;
              jsonData = sheetData;

              // Detect other columns based on position or name
              tenVTIndex = row.findIndex((h: any) => isMatch(h, ['tên', 'ten', 'sản phẩm', 'vat tu']));
              if (tenVTIndex === -1 && maVTIndex !== -1) tenVTIndex = 2; // Default to col C (0,1,2)

              dvtIndex = row.findIndex((h: any) => isMatch(h, ['đvt', 'dvt', 'đơn vị']));
              if (dvtIndex === -1 && maVTIndex !== -1) dvtIndex = 3; // Default to col D

              noiSXIndex = row.findIndex((h: any) => isMatch(h, ['nơi sx', 'noi sx', 'xuất xứ']));
              if (noiSXIndex === -1 && maVTIndex !== -1) noiSXIndex = 5; // Default to col F

              donGiaIndex = row.findIndex((h: any) => isMatch(h, ['đơn giá', 'don gia', 'giá']));
              if (donGiaIndex === -1 && maVTIndex !== -1) donGiaIndex = 8; // Default to col I

              validSheetFound = true;
              console.log(`✅ Header found in sheet "${sheetName}" at row ${i}`);
              break;
            }
          }

          if (validSheetFound) break;
        }

        if (!validSheetFound) {
          console.warn('Header detection failed in all sheets.');
          toast.error('❌ Không tìm thấy dòng tiêu đề chứa "Mã VT" và "Số lượng" trong bất kỳ sheet nào!');
          return;
        }

        // Chuẩn bị dữ liệu preview
        const currentData = localKiemKeData.length > 0 ? localKiemKeData : kiemKeData;
        const newPreviewData: PreviewItem[] = [];

        for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;

          const maVT = row[maVTIndex]?.toString().trim() || '';
          if (!maVT) continue;

          // Bỏ qua các dòng tổng cộng/ghi chú cuối file (nếu có)
          const lowerMa = maVT.toLowerCase();
          if (lowerMa.includes('tổng') || lowerMa.includes('cộng') || lowerMa.includes('ghi chú')) continue;

          const soLuongRaw = row[soLuongIndex];
          if (soLuongRaw === undefined || soLuongRaw === null || soLuongRaw === '') continue;

          // Xử lý theo yêu cầu mới: Chuyển thành string, bỏ hết dấu chấm/phẩy/khoảng trắng, rồi chia 100
          // VD: "8,00" -> "800" -> 8
          // VD: "600 800,00" -> "60080000" -> 600800
          const cleanStr = String(soLuongRaw).replace(/[.,\s]/g, '');
          const val = parseFloat(cleanStr);
          const soLuongMoi = isNaN(val) ? 0 : val / 100;

          // DEBUG: Hiện thông báo cho dòng đầu tiên tìm thấy để kiểm tra
          if (!hasLoggedDebug) {
            console.log(`Debug Import: Raw="${soLuongRaw}", Clean="${cleanStr}", Val=${val}, Final=${soLuongMoi}`);
            toast.info(`Debug Row 1: Raw="${soLuongRaw}" -> Clean="${cleanStr}" -> Final=${soLuongMoi}`);
            hasLoggedDebug = true;
          }

          // Tìm trong dữ liệu hiện tại
          const existingItem = currentData.find(item => item.MaVT?.toLowerCase() === maVT.toLowerCase());

          // Extract extra data
          // Xử lý Đơn Giá giống Số Lượng: Bỏ dấu, chia 100
          let donGiaMoi = 0;
          if (donGiaIndex !== -1) {
            const rawGia = row[donGiaIndex];
            if (rawGia !== undefined && rawGia !== null && rawGia !== '') {
              const cleanGia = String(rawGia).replace(/[.,\s]/g, '');
              const valGia = parseFloat(cleanGia);
              donGiaMoi = isNaN(valGia) ? 0 : valGia / 100;
            }
          }

          const extraData = {
            TenVT: tenVTIndex !== -1 ? row[tenVTIndex]?.toString().trim() : '',
            ĐVT: dvtIndex !== -1 ? row[dvtIndex]?.toString().trim() : '',
            NoiSX: noiSXIndex !== -1 ? row[noiSXIndex]?.toString().trim() : '',
            DonGia: donGiaMoi ? String(donGiaMoi) : '',
          };

          newPreviewData.push({
            MaVT: maVT,
            TenVT: existingItem ? existingItem.TenVT : extraData.TenVT || '',
            SoLuongCu: existingItem ? (typeof existingItem.SoLuong === 'string' ? parseFormattedNumber(existingItem.SoLuong) : (existingItem.SoLuong || 0)) : 0,
            SoLuongMoi: soLuongMoi,
            isFound: !!existingItem,
            extraData: existingItem ? undefined : extraData
          });
        }

        // Sort: Unfound items first
        newPreviewData.sort((a, b) => {
          if (a.isFound === b.isFound) return 0;
          return a.isFound ? 1 : -1;
        });

        if (newPreviewData.length === 0) {
          toast.warning('⚠️ Không tìm thấy dữ liệu hợp lệ để import!');
          return;
        }

        setPreviewData(newPreviewData);
        setShowPreview(true);
        toast.dismiss(); // Clear loading toast
      } catch (error) {
        console.error('Error parsing Excel:', error);
        toast.error('❌ Lỗi xử lý file: ' + (error as Error).message);
      }
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Xác nhận import sau khi preview
  const handleConfirmImport = (): void => {
    const dataToUpdate = localKiemKeData.length > 0 ? localKiemKeData : kiemKeData;
    let importedCount = 0;

    const importMap = new Map<string, number>();
    previewData.forEach(item => {
      if (item.isFound) {
        importMap.set(item.MaVT.toLowerCase(), item.SoLuongMoi);
      }
    });

    setLocalKiemKeData(dataToUpdate.map(item => {
      const maVTKey = item.MaVT?.toLowerCase() || '';
      const soLuong = importMap.get(maVTKey);

      if (soLuong !== undefined) {
        importedCount++;
        const donGia = typeof item.DonGia === 'string'
          ? parseFormattedNumber(String(item.DonGia))
          : (typeof item.DonGia === 'number' ? item.DonGia : 0);
        return {
          ...item,
          SoLuong: soLuong,
          ThanhTien: calculateThanhTien(donGia, soLuong)
        };
      }
      return item;
    }));

    setShowPreview(false);
    toast.success(`📥 Đã cập nhật ${importedCount} vật tư từ Excel`);
  };

  // States for Add Product
  const [showAddProductSheet, setShowAddProductSheet] = useState<boolean>(false);
  const [addingProductData, setAddingProductData] = useState<Partial<ProductFormData>>({});

  const { bulkImportProducts } = useProducts(false); // Using bulkImport from hook

  // Mở sheet thêm sản phẩm mới từ Import Preview
  const handleAddItem = (item: PreviewItem) => {
    setAddingProductData({
      MaVT: item.MaVT,
      TenVT: item.extraData?.TenVT || '',
      ĐVT: item.extraData?.ĐVT || '',
      NoiSX: item.extraData?.NoiSX || '',
      DonGia: item.extraData?.DonGia || '',
    });
    setShowAddProductSheet(true);
  };

  const handleAddAll = async () => {
    const itemsToAdd = previewData.filter(item => !item.isFound);
    if (itemsToAdd.length === 0) return;

    const productsToCreate: ProductFormData[] = itemsToAdd.map(item => ({
      MaVT: item.MaVT,
      TenVT: item.extraData?.TenVT || `Sản phẩm ${item.MaVT}`, // Fallback name
      NhomVT: '', // Default or user can update later
      ĐVT: item.extraData?.ĐVT || '',
      NoiSX: item.extraData?.NoiSX || '',
      DonGia: item.extraData?.DonGia || '',
      SoLuong: 0,
      HinhAnh: '',
      GhiChu: 'Auto-created from Import',
      ChatLuong: '',
      TrangThai: 'Còn hàng'
    }));

    try {
      await bulkImportProducts(productsToCreate);

      // Update local preview data
      const updatedPreview = previewData.map(item => {
        const addedItem = productsToCreate.find(p => p.MaVT.toLowerCase() === item.MaVT.toLowerCase());
        if (addedItem) {
          return {
            ...item,
            isFound: true,
            TenVT: addedItem.TenVT,
            SoLuongCu: 0
          };
        }
        return item;
      });

      setPreviewData(updatedPreview);
      await refetch();
      toast.success(`Đã thêm thành công ${productsToCreate.length} sản phẩm mới!`);
    } catch (error) {
      console.error("Bulk add failed", error);
      toast.error("Lỗi khi thêm hàng loạt sản phẩm");
    }
  };

  // Xử lý khi thêm sản phẩm thành công
  const handleAddProductSuccess = async (newProduct: ProductFormData) => {
    // 1. Cập nhật preview data
    const updatedPreview = previewData.map(item => {
      // So sánh không phân biệt hoa thường
      if (item.MaVT.toLowerCase() === newProduct.MaVT.toLowerCase()) {
        return {
          ...item,
          isFound: true,
          TenVT: newProduct.TenVT,
          SoLuongCu: 0, // Sản phẩm mới nên tồn cũ là 0
        };
      }
      return item;
    });

    setPreviewData(updatedPreview);

    // 2. Refetch dữ liệu kiểm kê để cập nhật danh sách hàng hóa mới trong cache
    await refetch();

    toast.success(`Đã thêm sản phẩm "${newProduct.TenVT}" vào danh sách!`);
  };

  const existingMaVTList = useMemo(() => {
    const dataToUse = localKiemKeData.length > 0 ? localKiemKeData : kiemKeData;
    return dataToUse.map(item => item.MaVT || '').filter(Boolean);
  }, [localKiemKeData, kiemKeData]);


  // Xuất Excel - File mẫu để import
  const handleExportExcel = (): void => {
    if (filteredData.length === 0) {
      toast.warning('⚠️ Không có dữ liệu để xuất!');
      return;
    }

    // Template với 3 cột: Mã VT, Thông Tin Sản Phẩm, Số Lượng Tồn
    const headers = ['Mã VT', 'Thông Tin Sản Phẩm', 'Số Lượng Tồn'];
    const exportData = [headers];

    filteredData.forEach((item) => {
      const thongTin = `${item.TenVT || ''} | Nhóm: ${item.NhomVT || ''} | ĐVT: ${item.ĐVT || ''} | Nơi SX: ${item.NoiSX || ''}`;
      exportData.push([
        String(item.MaVT || ''),
        thongTin,
        String(item.SoLuong || 0) // Điền số lượng hiện tại để người dùng chỉnh sửa
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kiểm Kê');

    // Đặt độ rộng cột
    ws['!cols'] = [
      { wch: 15 }, // Mã VT
      { wch: 50 }, // Thông Tin Sản Phẩm
      { wch: 15 }  // Số Lượng Tồn
    ];

    const fileName = `Template_KiemKe_${selectedDate.getDate()}_${selectedDate.getMonth() + 1}_${selectedDate.getFullYear()}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success('📤 Đã xuất file mẫu! Vui lòng điền số lượng tồn và import lại.');
  };

  // Render mobile view - tự động chuyển khi là mobile (giống BangTonKho)
  if (isMobile) {
    const dataForMobile = localKiemKeData.length > 0 ? localKiemKeData : kiemKeData;
    return (
      <BangKiemKeMobile
        kiemKeData={dataForMobile}
        setKiemKeData={(updater) => {
          if (typeof updater === 'function') {
            setLocalKiemKeData(updater);
          } else {
            setLocalKiemKeData(updater);
          }
        }}
        onSave={handleSaveData}
        isSaving={isSaving || saveKiemKeMutation.isPending}
        selectedDate={selectedDate}
        search={search}
        setSearch={setSearch}
        onDateChange={(date: Date | undefined) => {
          if (date) {
            setSelectedDate(date);
            setLocalKiemKeData([]); // Reset local state khi đổi ngày
          }
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Package className="w-6 h-6 text-blue-600" />
            Bảng Kiểm Kê Kho
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Top Row - Basic Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  📅 Chọn ngày kiểm kê
                </Label>
                <DatePicker
                  date={selectedDate}
                  onDateChange={(date: Date | undefined) => {
                    if (date) {
                      setSelectedDate(date);
                    }
                  }}
                  placeholder="Chọn ngày kiểm kê"
                  className="w-full"
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
                    placeholder="Tìm kiếm theo mã, tên hàng, nhóm..."
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
                onClick={handleSaveData}
                disabled={isSaving || saveKiemKeMutation.isPending || (localKiemKeData.length > 0 ? localKiemKeData.length === 0 : kiemKeData.length === 0)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {(isSaving || saveKiemKeMutation.isPending) ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Lưu dữ liệu
                  </>
                )}
              </Button>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="bg-gray-100 hover:bg-gray-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Làm mới
              </Button>
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <label className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Excel
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls"
                    className="hidden"
                    onChange={handleImportExcel}
                  />
                </label>
              </Button>
              <Button
                onClick={handleCapture}
                disabled={isCapturing}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isCapturing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Camera className="w-4 h-4 mr-2" />
                )}
                Chụp Ảnh
              </Button>
              <Button
                onClick={handleExportExcel}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Xuất Excel
              </Button>
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
        <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
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
                  Thông Tin Sản Phẩm
                </TableHead>
                <TableHead className="px-3 py-4 text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-br from-blue-500 to-blue-600 sticky top-0 z-30">
                  Số Lượng Tồn
                </TableHead>
                <TableHead className="px-3 py-4 text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-br from-blue-500 to-blue-600 sticky top-0 z-30">
                  Ghi Chú
                </TableHead>
              </TableRow>
            </thead>

            <TableBody>
              {filteredData.length > 0 ? filteredData.map((item, index) => {
                const inputKey = `${index}`;
                const dataToUse = localKiemKeData.length > 0 ? localKiemKeData : kiemKeData;
                const itemIndex = dataToUse.findIndex(d => d.MaVT === item.MaVT);
                const actualItem = itemIndex >= 0 ? dataToUse[itemIndex] : item;
                const soLuongValue = soLuongInputValue[inputKey] !== undefined
                  ? soLuongInputValue[inputKey]
                  : (actualItem.SoLuong ? formatNumber(typeof actualItem.SoLuong === 'string' ? parseFormattedNumber(String(actualItem.SoLuong)) : actualItem.SoLuong) : '');

                return (
                  <TableRow
                    key={index}
                    className={`transition-all duration-200 hover:bg-blue-50 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      }`}
                    style={{ height: '50px' }}
                  >
                    {/* STT */}
                    <TableCell className="border border-gray-300 px-3 py-2 text-center">
                      <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </Badge>
                    </TableCell>

                    {/* Mã VT */}
                    <TableCell className="border border-gray-300 px-2 py-2">
                      {item.MaVT || ''}
                    </TableCell>

                    {/* Thông Tin Sản Phẩm - Gộp Tên VT, Nhóm VT, ĐVT, Nơi SX */}
                    <TableCell className="border border-gray-300 px-2 py-2">
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900">{item.TenVT || ''}</div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Nhóm:</span> {item.NhomVT || ''} |
                          <span className="font-medium"> ĐVT:</span> {item.ĐVT || ''} |
                          <span className="font-medium"> Nơi SX:</span> {item.NoiSX || ''}
                        </div>
                      </div>
                    </TableCell>

                    {/* Số Lượng Tồn */}
                    <TableCell className="border border-gray-300 px-2 py-2">
                      <Input
                        type="text"
                        value={soLuongValue}
                        onChange={(e) => {
                          const dataToUpdate = localKiemKeData.length > 0 ? localKiemKeData : kiemKeData;
                          const itemIndex = dataToUpdate.findIndex(d => d.MaVT === item.MaVT);
                          if (itemIndex >= 0) {
                            handleSoLuongChange(itemIndex, e.target.value);
                          }
                        }}
                        onFocus={(e) => {
                          const numValue = typeof actualItem.SoLuong === 'string'
                            ? parseFormattedNumber(String(actualItem.SoLuong))
                            : (typeof actualItem.SoLuong === 'number' ? actualItem.SoLuong : 0);
                          e.target.value = numValue > 0 ? String(numValue) : '';
                          e.target.select();
                        }}
                        onBlur={() => {
                          // Xóa giá trị raw khi blur để format lại
                          setSoLuongInputValue(prev => {
                            const newState = { ...prev };
                            delete newState[inputKey];
                            return newState;
                          });
                        }}
                        className="w-full h-10 text-right"
                        placeholder="Nhập số lượng tồn"
                      />
                    </TableCell>

                    {/* Ghi Chú */}
                    <TableCell className="border border-gray-300 px-2 py-2">
                      <Input
                        type="text"
                        value={actualItem.GhiChu || ''}
                        onChange={(e) => {
                          const dataToUpdate = localKiemKeData.length > 0 ? localKiemKeData : kiemKeData;
                          const itemIndex = dataToUpdate.findIndex(d => d.MaVT === item.MaVT);
                          if (itemIndex >= 0) {
                            handleGhiChuChange(itemIndex, e.target.value);
                          }
                        }}
                        className="w-full h-10"
                        placeholder="Ghi chú"
                      />
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="border border-gray-300 px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <RefreshCw className="h-12 w-12 text-gray-400" />
                      </div>
                      {search ? (
                        <>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Không tìm thấy kết quả</h3>
                          <p className="text-gray-600 mb-4">Không có hàng nào phù hợp với từ khóa "{search}"</p>
                          <Button
                            onClick={() => setSearch('')}
                            variant="default"
                          >
                            Xóa bộ lọc
                          </Button>
                        </>
                      ) : (
                        <>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có dữ liệu</h3>
                          <p className="text-gray-600">Chưa có sản phẩm trong danh mục hàng hóa</p>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </table>
        </div>
      )}
      {/* Import Preview Dialog */}
      <ImportPreviewDialog
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={handleConfirmImport}
        data={previewData}
        onAddItem={handleAddItem}
        onAddAll={handleAddAll}
      />

      <ProductAddSheet
        isOpen={showAddProductSheet}
        onClose={() => setShowAddProductSheet(false)}
        onSuccess={handleAddProductSuccess}
        initialData={addingProductData}
        isAdmin={isAdmin}
        isManager={isManager}
        existingMaVTList={existingMaVTList}
      />

      {/* Hidden container for Desktop Capture */}
      <div
        ref={captureRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          width: '1200px', // Fixed width for desktop capture
          backgroundColor: 'white',
          zIndex: -1,
          padding: '20px'
        }}
      >
        <div className="mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold uppercase text-blue-800">Bảng Kiểm Kê Kho - {selectedDate.toLocaleDateString('vi-VN')}</h1>
          <div className="flex justify-between mt-2 text-gray-600">
            <p>Tổng số mặt hàng: {filteredData.length}</p>
            {search && <p>Lọc theo: "{search}"</p>}
          </div>
        </div>

        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="border border-gray-300 p-2 w-16">STT</th>
              <th className="border border-gray-300 p-2 w-32">Mã VT</th>
              <th className="border border-gray-300 p-2">Thông Tin Sản Phẩm</th>
              <th className="border border-gray-300 p-2 w-32">Số Lượng</th>
              <th className="border border-gray-300 p-2 w-48">Ghi Chú</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => {
              const dataToUse = localKiemKeData.length > 0 ? localKiemKeData : kiemKeData;
              const itemIndex = dataToUse.findIndex(d => d.MaVT === item.MaVT);
              const actualItem = itemIndex >= 0 ? dataToUse[itemIndex] : item;
              return (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                  <td className="border border-gray-300 p-2 font-medium">{item.MaVT}</td>
                  <td className="border border-gray-300 p-2">
                    <div className="font-bold">{item.TenVT}</div>
                    <div className="text-gray-500 text-xs">
                      {item.NhomVT} | {item.ĐVT} | {item.NoiSX}
                    </div>
                  </td>
                  <td className="border border-gray-300 p-2 text-right font-bold text-blue-700">
                    {formatNumber(typeof actualItem.SoLuong === 'string' ? parseFormattedNumber(actualItem.SoLuong) : (actualItem.SoLuong || 0))}
                  </td>
                  <td className="border border-gray-300 p-2">{actualItem.GhiChu}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-4 text-center text-gray-400 text-xs italic">
          Được xuất từ hệ thống quản lý kho vào lúc {new Date().toLocaleString('vi-VN')}
        </div>
      </div>
    </div>
  );
};

export default BangKiemKe;
