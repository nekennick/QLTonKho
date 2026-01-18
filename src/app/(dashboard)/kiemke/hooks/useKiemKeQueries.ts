'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import authUtils from '@/utils/authUtils';
import { queryKeys } from '@/lib/queryKeys';
import { KiemKeItem } from '../types/kiemke';

/**
 * Hook để fetch dữ liệu kiểm kê theo ngày
 */
export const useKiemKeData = (selectedDate: Date | null) => {
  return useQuery({
    queryKey: selectedDate
      ? queryKeys.kiemke.dataByDate(selectedDate)
      : queryKeys.kiemke.data(),
    queryFn: async (): Promise<KiemKeItem[]> => {
      if (!selectedDate) return [];

      const day = selectedDate.getDate();
      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();

      // Lấy dữ liệu từ bảng DMHH (danh mục hàng hóa)
      const productsResponse = await authUtils.apiRequest('DMHH', 'Find', {}) || [];

      // Lấy dữ liệu từ bảng TONKHO cho ngày/tháng/năm đã chọn
      let tonKhoResponse: any[] = [];
      try {
        tonKhoResponse = await authUtils.apiRequest('TONKHO', 'Find', {
          "Properties": {
            "Selector": `Filter(TONKHO, AND([Ngay] = ${day}, [Thang] = ${month}, [Nam] = ${year}))`
          }
        }) || [];
      } catch (error) {
        // Nếu filter theo Ngay bị lỗi, thử filter theo Thang, Nam
        console.warn('Filter theo Ngay không thành công, thử filter theo Thang, Nam:', error);
        try {
          const allTonKhoResponse = await authUtils.apiRequest('TONKHO', 'Find', {
            "Properties": {
              "Selector": `Filter(TONKHO, AND([Thang] = ${month}, [Nam] = ${year}))`
            }
          }) || [];

          // Filter thủ công theo ngày bằng cách parse IDTONKHO
          tonKhoResponse = allTonKhoResponse.filter((item: any) => {
            const idTonKho = item['IDTONKHO']?.toString() || '';
            if (idTonKho.length >= 8) {
              const ngayFromId = parseInt(idTonKho.substring(0, 2));
              return ngayFromId === day;
            }
            return false;
          });
        } catch (fallbackError) {
          console.error('Error fetching TONKHO data:', fallbackError);
          tonKhoResponse = [];
        }
      }

      // Tạo map để tra cứu số lượng tồn từ TONKHO theo MaVT
      const tonKhoMap = new Map<string, any>();
      if (tonKhoResponse && tonKhoResponse.length > 0) {
        tonKhoResponse.forEach((item: any) => {
          const idTonKho = item['IDTONKHO']?.toString() || '';
          if (idTonKho.length > 8) {
            const maVT = idTonKho.substring(8);
            if (maVT) {
              tonKhoMap.set(maVT.toLowerCase(), item);
            }
          }
          const maVTFromTonKho = item['MaVT']?.trim() || '';
          if (maVTFromTonKho && !tonKhoMap.has(maVTFromTonKho.toLowerCase())) {
            tonKhoMap.set(maVTFromTonKho.toLowerCase(), item);
          }
          const tenVTFromTonKho = item['TenVT']?.trim() || '';
          if (tenVTFromTonKho && !tonKhoMap.has(tenVTFromTonKho.toLowerCase())) {
            tonKhoMap.set(tenVTFromTonKho.toLowerCase(), item);
          }
        });
      }

      // Tạo danh sách kiểm kê từ danh sách sản phẩm
      if (productsResponse && productsResponse.length > 0) {
        const mappedData = productsResponse.map((product: any) => {
          const tenVT = product['TenVT']?.trim() || '';
          const maVT = product['MaVT']?.trim() || '';

          let tonKhoItem = maVT ? tonKhoMap.get(maVT.toLowerCase()) : null;
          if (!tonKhoItem && tenVT) {
            tonKhoItem = tonKhoMap.get(tenVT.toLowerCase());
          }

          const ngayFromTonKho = tonKhoItem?.['Ngay'];
          const finalNgay = ngayFromTonKho !== undefined ? ngayFromTonKho : day;

          return {
            IDTONKHO: tonKhoItem?.['IDTONKHO'] || '',
            Ngay: finalNgay,
            Thang: month,
            Nam: year,
            MaVT: tonKhoItem?.['MaVT'] || maVT,
            TenVT: tonKhoItem?.['TenVT'] || tenVT,
            NhomVT: tonKhoItem?.['NhomVT'] || product['NhomVT'] || '',
            ĐVT: tonKhoItem?.['ĐVT'] || product['ĐVT'] || '',
            NoiSX: tonKhoItem?.['NoiSX'] || product['NoiSX'] || '',
            DonGia: tonKhoItem?.['DonGia'] || product['DonGia'] || 0,
            SoLuong: tonKhoItem?.['SoLuong'] || 0,
            ThanhTien: tonKhoItem?.['ThanhTien'] || 0,
            GhiChu: tonKhoItem?.['GhiChu'] || ''
          };
        });

        return mappedData;
      }

      return [];
    },
    enabled: !!selectedDate,
    staleTime: 2 * 60 * 1000, // 2 phút
    gcTime: 10 * 60 * 1000, // 10 phút
  });
};

/**
 * Hook để fetch lịch sử kiểm kê với filters
 */
export const useKiemKeHistory = (filters?: {
  date?: Date;
  month?: Date;
  year?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.kiemke.historyByFilters(filters),
    queryFn: async (): Promise<KiemKeItem[]> => {
      let selector = '';
      if (filters?.date) {
        const day = filters.date.getDate();
        const month = filters.date.getMonth() + 1;
        const year = filters.date.getFullYear();
        selector = `Filter(TONKHO, AND([Ngay] = ${day}, [Thang] = ${month}, [Nam] = ${year}))`;
      } else if (filters?.month) {
        const month = filters.month.getMonth() + 1;
        const year = filters.month.getFullYear();
        selector = `Filter(TONKHO, AND([Thang] = ${month}, [Nam] = ${year}))`;
      } else if (filters?.year) {
        selector = `Filter(TONKHO, [Nam] = ${filters.year})`;
      }

      // Lấy dữ liệu từ bảng TONKHO
      let tonKhoResponse: any[] = [];
      try {
        tonKhoResponse = await authUtils.apiRequest('TONKHO', 'Find',
          selector ? {
            "Properties": {
              "Selector": selector
            }
          } : {}
        ) || [];
      } catch (error) {
        // Nếu filter theo Ngay bị lỗi, thử filter theo Thang, Nam
        if (filters?.date) {
          const month = filters.date.getMonth() + 1;
          const year = filters.date.getFullYear();
          const fallbackSelector = `Filter(TONKHO, AND([Thang] = ${month}, [Nam] = ${year}))`;
          try {
            const allResponse = await authUtils.apiRequest('TONKHO', 'Find', {
              "Properties": {
                "Selector": fallbackSelector
              }
            }) || [];

            const day = filters.date.getDate();
            tonKhoResponse = allResponse.filter((item: any) => {
              if (item['Ngay'] !== undefined) {
                return item['Ngay'] === day;
              }
              const idTonKho = item['IDTONKHO']?.toString() || '';
              if (idTonKho.length >= 8) {
                const ngayFromId = parseInt(idTonKho.substring(0, 2));
                return ngayFromId === day;
              }
              return false;
            });
          } catch (fallbackError) {
            console.error('Error fetching TONKHO data with fallback:', fallbackError);
            tonKhoResponse = [];
          }
        } else {
          console.error('Error fetching TONKHO data:', error);
          tonKhoResponse = [];
        }
      }

      // Lấy dữ liệu từ bảng DMHH
      const productsResponse = await authUtils.apiRequest('DMHH', 'Find', {}) || [];

      // Tạo map để tra cứu thông tin sản phẩm
      const productMap = new Map<string, any>();
      if (productsResponse && productsResponse.length > 0) {
        productsResponse.forEach((product: any) => {
          const maVT = product['MaVT']?.trim() || '';
          if (maVT) {
            productMap.set(maVT.toLowerCase(), product);
          }
        });
      }

      if (tonKhoResponse && tonKhoResponse.length > 0) {
        const mappedData = tonKhoResponse.map((item: any) => {
          const maVT = item['MaVT']?.trim() || '';
          const tenVT = item['TenVT']?.trim() || '';
          const nhomVT = item['NhomVT']?.trim() || '';
          const dvt = item['ĐVT']?.trim() || '';
          const noiSX = item['NoiSX']?.trim() || '';
          const ngay = item['Ngay'] || (filters?.date ? filters.date.getDate() : new Date().getDate());

          const product = maVT ? productMap.get(maVT.toLowerCase()) : null;

          return {
            IDTONKHO: item['IDTONKHO'] || '',
            Ngay: ngay,
            Thang: item['Thang'] || 0,
            Nam: item['Nam'] || 0,
            MaVT: maVT || product?.['MaVT'] || '',
            TenVT: tenVT || product?.['TenVT'] || '',
            NhomVT: nhomVT || product?.['NhomVT'] || '',
            ĐVT: dvt || product?.['ĐVT'] || '',
            NoiSX: noiSX || product?.['NoiSX'] || '',
            DonGia: item['DonGia'] || 0,
            SoLuong: item['SoLuong'] || 0,
            ThanhTien: item['ThanhTien'] || 0,
            GhiChu: item['GhiChu'] || ''
          };
        });

        // Sắp xếp theo ngày giảm dần
        mappedData.sort((a: KiemKeItem, b: KiemKeItem) => {
          if (b.Nam !== a.Nam) return b.Nam - a.Nam;
          if (b.Thang !== a.Thang) return b.Thang - a.Thang;
          return b.Ngay - a.Ngay;
        });

        return mappedData;
      }

      return [];
    },
    staleTime: 2 * 60 * 1000, // 2 phút
    gcTime: 10 * 60 * 1000, // 10 phút
  });
};

/**
 * Hook để lưu dữ liệu kiểm kê
 */
export const useSaveKiemKe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      selectedDate,
    }: {
      data: KiemKeItem[];
      selectedDate: Date;
    }): Promise<void> => {
      const day = selectedDate.getDate();
      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();

      const dataToSave = data
        .filter(item => {
          const soLuong = typeof item.SoLuong === 'string'
            ? parseFloat(String(item.SoLuong).replace(/[.,]/g, '')) || 0
            : (item.SoLuong || 0);
          return soLuong > 0;
        })
        .map(item => {
          const donGia = typeof item.DonGia === 'string'
            ? parseFloat(String(item.DonGia).replace(/[.,]/g, '')) || 0
            : (typeof item.DonGia === 'number' ? item.DonGia : 0);
          const soLuong = typeof item.SoLuong === 'string'
            ? parseFloat(String(item.SoLuong).replace(/[.,]/g, '')) || 0
            : (item.SoLuong || 0);
          const thanhTien = donGia * soLuong;

          const maVT = item.MaVT || '';
          const idTonKho = `${String(day).padStart(2, '0')}${String(month).padStart(2, '0')}${year}${maVT}`;

          return {
            'IDTONKHO': idTonKho,
            'Ngay': day,
            'Thang': month,
            'Nam': year,
            'MaVT': maVT,
            'TenVT': item.TenVT || '',
            'NhomVT': item.NhomVT || '',
            'ĐVT': item.ĐVT || '',
            'NoiSX': item.NoiSX || '',
            'DonGia': donGia,
            'SoLuong': soLuong,
            'ThanhTien': thanhTien,
            'GhiChu': item.GhiChu || ''
          };
        });

      if (dataToSave.length === 0) {
        throw new Error('Vui lòng nhập số lượng tồn cho ít nhất một sản phẩm!');
      }

      // Kiểm tra các IDTONKHO đã tồn tại
      let existingIdsResponse: any[] = [];
      try {
        existingIdsResponse = await authUtils.apiRequest('TONKHO', 'Find', {
          "Properties": {
            "Selector": `Filter(TONKHO, AND([Ngay] = ${day}, [Thang] = ${month}, [Nam] = ${year}))`
          }
        }) || [];
      } catch (error) {
        console.warn('Filter theo Ngay không thành công, thử filter theo Thang, Nam:', error);
        try {
          const allResponse = await authUtils.apiRequest('TONKHO', 'Find', {
            "Properties": {
              "Selector": `Filter(TONKHO, AND([Thang] = ${month}, [Nam] = ${year}))`
            }
          }) || [];

          existingIdsResponse = allResponse.filter((item: any) => {
            const idTonKho = item['IDTONKHO']?.toString() || '';
            if (idTonKho.length >= 8) {
              const ngayFromId = parseInt(idTonKho.substring(0, 2));
              return ngayFromId === day;
            }
            return false;
          });
        } catch (fallbackError) {
          console.error('Error fetching existing IDs:', fallbackError);
          existingIdsResponse = [];
        }
      }

      const existingIds = new Set<string>();
      if (existingIdsResponse && existingIdsResponse.length > 0) {
        existingIdsResponse.forEach((item: any) => {
          const id = item['IDTONKHO']?.toString() || '';
          if (id) {
            existingIds.add(id);
          }
        });
      }

      const existingItems = dataToSave.filter(item => existingIds.has(item['IDTONKHO']));
      const newItems = dataToSave.filter(item => !existingIds.has(item['IDTONKHO']));

      // Edit các items đã tồn tại
      if (existingItems.length > 0) {
        await authUtils.apiRequest('TONKHO', 'Edit', {
          "Rows": existingItems
        });
      }

      // Add các items mới
      if (newItems.length > 0) {
        await authUtils.apiRequest('TONKHO', 'Add', {
          "Rows": newItems
        });
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate và refetch queries liên quan
      queryClient.invalidateQueries({
        queryKey: queryKeys.kiemke.dataByDate(variables.selectedDate)
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.kiemke.history()
      });
      toast.success('💾 Lưu dữ liệu kiểm kê thành công!');
    },
    onError: (error: Error) => {
      console.error('Error saving data:', error);
      toast.error('❌ Lỗi khi lưu dữ liệu: ' + error.message);
    },
  });
};

