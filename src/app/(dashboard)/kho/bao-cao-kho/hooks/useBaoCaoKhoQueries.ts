'use client';

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import authUtils from '@/utils/authUtils';
import { queryKeys } from '@/lib/queryKeys';
import { WarehouseReportData } from '../types/warehouseReport';

interface BaoCaoKhoFilters {
  warehouseId?: string;
  startDate?: Date;
  endDate?: Date;
  month?: Date;
  year?: number;
}

/**
 * Hook để fetch dữ liệu báo cáo tồn kho từ TONKHO
 */
export const useBaoCaoKho = (filters?: BaoCaoKhoFilters) => {
  return useQuery({
    queryKey: queryKeys.baoCaoKho.reportByFilters(filters),
    queryFn: async (): Promise<WarehouseReportData[]> => {
      try {
        // Lấy dữ liệu từ bảng TONKHO
        let tonKhoResponse: any[] = [];
        let selector = '';

        // Xây dựng selector dựa trên filters
        if (filters?.startDate && filters?.endDate) {
          const startDay = filters.startDate.getDate();
          const startMonth = filters.startDate.getMonth() + 1;
          const startYear = filters.startDate.getFullYear();
          const endDay = filters.endDate.getDate();
          const endMonth = filters.endDate.getMonth() + 1;
          const endYear = filters.endDate.getFullYear();
          
          // Filter theo khoảng thời gian
          selector = `Filter(TONKHO, AND([Nam] >= ${startYear}, [Nam] <= ${endYear}))`;
        } else if (filters?.month) {
          const month = filters.month.getMonth() + 1;
          const year = filters.month.getFullYear();
          selector = `Filter(TONKHO, AND([Thang] = ${month}, [Nam] = ${year}))`;
        } else if (filters?.year) {
          selector = `Filter(TONKHO, [Nam] = ${filters.year})`;
        }

        try {
          tonKhoResponse = await authUtils.apiRequest('TONKHO', 'Find', 
            selector ? {
              "Properties": {
                "Selector": selector
              }
            } : {}
          ) || [];
        } catch (error) {
          console.warn('Error fetching TONKHO with selector, trying without:', error);
          tonKhoResponse = await authUtils.apiRequest('TONKHO', 'Find', {}) || [];
        }

        // Lấy dữ liệu từ bảng DMHH (danh mục hàng hóa)
        const productsResponse = await authUtils.apiRequest('DMHH', 'Find', {}) || [];

        // Lấy dữ liệu từ bảng NXKHO (xuất nhập kho) để tính nhập/xuất
        let nxKhoResponse: any[] = [];
        try {
          if (filters?.startDate && filters?.endDate) {
            // Filter NXKHO theo khoảng thời gian
            const startDateStr = filters.startDate.toISOString().split('T')[0];
            const endDateStr = filters.endDate.toISOString().split('T')[0];
            nxKhoResponse = await authUtils.apiRequest('NXKHO', 'Find', {
              "Properties": {
                "Selector": `Filter(NXKHO, AND([Ngay] >= "${startDateStr}", [Ngay] <= "${endDateStr}", [TrangThai] = "Đã duyệt"))`
              }
            }) || [];
          } else {
            nxKhoResponse = await authUtils.apiRequest('NXKHO', 'Find', {
              "Properties": {
                "Selector": `Filter(NXKHO, [TrangThai] = "Đã duyệt")`
              }
            }) || [];
          }
        } catch (error) {
          console.warn('Error fetching NXKHO:', error);
          nxKhoResponse = [];
        }

        // Lấy chi tiết NXKHODE
        let nxKhoDetailResponse: any[] = [];
        try {
          if (nxKhoResponse.length > 0) {
            const maPhieuList = nxKhoResponse.map((item: any) => item['MaPhieu']).filter(Boolean);
            if (maPhieuList.length > 0) {
              // Fetch chi tiết cho các phiếu đã duyệt
              nxKhoDetailResponse = await authUtils.apiRequest('NXKHODE', 'Find', {}) || [];
              // Filter theo MaPhieu
              nxKhoDetailResponse = nxKhoDetailResponse.filter((detail: any) => 
                maPhieuList.includes(detail['MaPhieu'])
              );
            }
          }
        } catch (error) {
          console.warn('Error fetching NXKHODE:', error);
          nxKhoDetailResponse = [];
        }

        // Tạo map để tính tổng nhập/xuất theo MaVT
        const importMap = new Map<string, number>();
        const exportMap = new Map<string, number>();

        nxKhoResponse.forEach((nxKho: any) => {
          const loaiPhieu = nxKho['LoaiPhieu'] || '';
          const maPhieu = nxKho['MaPhieu'] || '';
          
          // Lấy chi tiết của phiếu này
          const details = nxKhoDetailResponse.filter((d: any) => d['MaPhieu'] === maPhieu);
          
          details.forEach((detail: any) => {
            const maVT = detail['MaVT']?.trim() || '';
            const soLuong = parseFloat(String(detail['SoLuong'] || 0));
            
            if (maVT) {
              if (loaiPhieu === 'Nhập kho') {
                const current = importMap.get(maVT.toLowerCase()) || 0;
                importMap.set(maVT.toLowerCase(), current + soLuong);
              } else if (loaiPhieu === 'Xuất kho') {
                const current = exportMap.get(maVT.toLowerCase()) || 0;
                exportMap.set(maVT.toLowerCase(), current + soLuong);
              }
            }
          });
        });

        // Tạo map TONKHO theo MaVT để lấy tồn kho
        const tonKhoMap = new Map<string, any[]>();
        tonKhoResponse.forEach((item: any) => {
          const maVT = item['MaVT']?.trim() || '';
          if (maVT) {
            const key = maVT.toLowerCase();
            if (!tonKhoMap.has(key)) {
              tonKhoMap.set(key, []);
            }
            tonKhoMap.get(key)!.push(item);
          }
        });

        // Tính tồn đầu kỳ và cuối kỳ
        const calculateStock = (items: any[], isStart: boolean) => {
          if (items.length === 0) return 0;
          
          // Sắp xếp theo ngày
          const sorted = items.sort((a, b) => {
            if (b.Nam !== a.Nam) return b.Nam - a.Nam;
            if (b.Thang !== a.Thang) return b.Thang - a.Thang;
            return b.Ngay - a.Ngay;
          });
          
          if (isStart) {
            // Tồn đầu kỳ: lấy bản ghi cũ nhất
            return parseFloat(String(sorted[sorted.length - 1]?.['SoLuong'] || 0));
          } else {
            // Tồn cuối kỳ: lấy bản ghi mới nhất
            return parseFloat(String(sorted[0]?.['SoLuong'] || 0));
          }
        };

        // Tạo báo cáo từ danh sách sản phẩm
        const reportData: WarehouseReportData[] = [];

        productsResponse.forEach((product: any) => {
          const maVT = product['MaVT']?.trim() || '';
          if (!maVT) return;

          const tonKhoItems = tonKhoMap.get(maVT.toLowerCase()) || [];
          
          // Tính tồn đầu kỳ và cuối kỳ
          let beginningStock = 0;
          let endingStock = 0;

          if (filters?.startDate && filters?.endDate) {
            // Filter TONKHO theo khoảng thời gian
            const startDay = filters.startDate.getDate();
            const startMonth = filters.startDate.getMonth() + 1;
            const startYear = filters.startDate.getFullYear();
            const endDay = filters.endDate.getDate();
            const endMonth = filters.endDate.getMonth() + 1;
            const endYear = filters.endDate.getFullYear();

            // Tồn đầu kỳ: lấy tồn trước startDate
            const beforeStart = tonKhoItems.filter((item: any) => {
              const itemYear = item['Nam'] || 0;
              const itemMonth = item['Thang'] || 0;
              const itemDay = item['Ngay'] || 0;
              
              if (itemYear < startYear) return true;
              if (itemYear === startYear && itemMonth < startMonth) return true;
              if (itemYear === startYear && itemMonth === startMonth && itemDay < startDay) return true;
              return false;
            });
            beginningStock = calculateStock(beforeStart, true);

            // Tồn cuối kỳ: lấy tồn trong khoảng thời gian (mới nhất)
            const inRange = tonKhoItems.filter((item: any) => {
              const itemYear = item['Nam'] || 0;
              const itemMonth = item['Thang'] || 0;
              const itemDay = item['Ngay'] || 0;
              
              if (itemYear < startYear || itemYear > endYear) return false;
              if (itemYear === startYear && itemMonth < startMonth) return false;
              if (itemYear === endYear && itemMonth > endMonth) return false;
              if (itemYear === startYear && itemMonth === startMonth && itemDay < startDay) return false;
              if (itemYear === endYear && itemMonth === endMonth && itemDay > endDay) return false;
              return true;
            });
            endingStock = calculateStock(inRange, false);
          } else {
            // Không có filter thời gian, lấy tồn mới nhất
            beginningStock = calculateStock(tonKhoItems, true);
            endingStock = calculateStock(tonKhoItems, false);
          }

          // Lấy tổng nhập/xuất
          const totalImports = importMap.get(maVT.toLowerCase()) || 0;
          const totalExports = exportMap.get(maVT.toLowerCase()) || 0;

          // Lấy thông tin kho (mặc định)
          const warehouse = { MaKho: 'ALL', TenKho: 'Tất cả kho' };

          // Lấy đơn giá từ TONKHO hoặc DMHH
          const latestTonKho = tonKhoItems.length > 0 ? tonKhoItems[0] : null;
          const donGia = parseFloat(String(
            latestTonKho?.['DonGia'] || product['DonGia'] || 0
          ));

          reportData.push({
            MaVT: maVT,
            TenVT: product['TenVT'] || '',
            NhomVT: product['NhomVT'] || '',
            ĐVT: product['ĐVT'] || '',
            DonGia: donGia,
            unitPrice: donGia,
            MaKho: warehouse.MaKho,
            TenKho: warehouse.TenKho,
            beginningStock,
            endingStock,
            totalImports,
            totalExports,
            importDetails: [],
            exportDetails: [],
            lastInventoryDate: latestTonKho 
              ? `${String(latestTonKho['Ngay'] || '').padStart(2, '0')}/${String(latestTonKho['Thang'] || '').padStart(2, '0')}/${latestTonKho['Nam'] || ''}`
              : undefined,
            notes: product['GhiChu'] || ''
          });
        });

        return reportData;
      } catch (error) {
        console.error('Error fetching bao cao kho:', error);
        toast.error('Lỗi khi tải dữ liệu báo cáo: ' + (error as Error).message);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 phút
    gcTime: 10 * 60 * 1000, // 10 phút
  });
};


