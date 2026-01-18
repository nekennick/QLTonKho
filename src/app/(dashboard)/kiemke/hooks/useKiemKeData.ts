import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import authUtils from '@/utils/authUtils';
import { KiemKeItem } from '../types/kiemke';

export const useKiemKeData = (selectedDate: Date, search: string) => {
  const [kiemKeData, setKiemKeData] = useState<KiemKeItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);

  // Lấy danh sách sản phẩm từ DMHH và tạo danh sách kiểm kê
  const fetchKiemKeData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const day = selectedDate.getDate();
      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();

      // Lấy dữ liệu từ bảng DMHH (danh mục hàng hóa)
      const productsResponse = await authUtils.apiRequest('DMHH', 'Find', {});
      setProducts(productsResponse || []);

      // Lấy dữ liệu từ bảng TONKHO cho ngày/tháng/năm đã chọn (nếu có)
      // Filter theo Ngay, Thang, Nam để lấy dữ liệu đúng ngày
      // Nếu bảng chưa có trường Ngay, sẽ filter theo Thang, Nam và parse IDTONKHO
      let tonKhoResponse: any[] = [];
      try {
        tonKhoResponse = await authUtils.apiRequest('TONKHO', 'Find', {
          "Properties": {
            "Selector": `Filter(TONKHO, AND([Ngay] = ${day}, [Thang] = ${month}, [Nam] = ${year}))`
          }
        }) || [];
      } catch (error) {
        // Nếu filter theo Ngay bị lỗi (có thể bảng chưa có trường Ngay), thử filter theo Thang, Nam
        console.warn('Filter theo Ngay không thành công, thử filter theo Thang, Nam:', error);
        try {
          const allTonKhoResponse = await authUtils.apiRequest('TONKHO', 'Find', {
            "Properties": {
              "Selector": `Filter(TONKHO, AND([Thang] = ${month}, [Nam] = ${year}))`
            }
          }) || [];
          
          // Filter thủ công theo ngày bằng cách parse IDTONKHO
          // IDTONKHO format: DDMMYYYYMaVT
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

      // Tạo map để tra cứu số lượng tồn từ TONKHO theo MaVT (vì IDTONKHO = Ngay + Thang + Nam + MaVT)
      // Lấy MaVT từ DMHH để map chính xác
      const tonKhoMap = new Map<string, any>();
      if (tonKhoResponse && tonKhoResponse.length > 0) {
        tonKhoResponse.forEach((item: any) => {
          // Parse IDTONKHO để lấy MaVT: IDTONKHO = Ngay + Thang + Nam + MaVT
          // Format: DDMMYYYYMaVT (ví dụ: 01012024ABC)
          const idTonKho = item['IDTONKHO']?.toString() || '';
          if (idTonKho.length > 8) {
            // Lấy MaVT từ cuối IDTONKHO (sau 8 ký tự đầu là DDMMYYYY)
            const maVT = idTonKho.substring(8);
            if (maVT) {
              tonKhoMap.set(maVT.toLowerCase(), item);
            }
          }
          // Fallback: nếu không parse được từ IDTONKHO, thử map theo MaVT hoặc TenVT
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
          
          // Ưu tiên tìm theo MaVT, nếu không có thì tìm theo TenVT
          let tonKhoItem = maVT ? tonKhoMap.get(maVT.toLowerCase()) : null;
          if (!tonKhoItem && tenVT) {
            tonKhoItem = tonKhoMap.get(tenVT.toLowerCase());
          }

          // Lấy Ngay từ TONKHO nếu có, nếu không thì dùng selectedDate
          const ngayFromTonKho = tonKhoItem?.['Ngay'];
          const finalNgay = ngayFromTonKho !== undefined ? ngayFromTonKho : day;

          return {
            IDTONKHO: tonKhoItem?.['IDTONKHO'] || '',
            Ngay: finalNgay,
            Thang: month,
            Nam: year,
            MaVT: tonKhoItem?.['MaVT'] || maVT, // Ưu tiên lấy từ TONKHO, nếu không có thì từ DMHH
            TenVT: tonKhoItem?.['TenVT'] || tenVT, // Ưu tiên lấy từ TONKHO, nếu không có thì từ DMHH
            NhomVT: tonKhoItem?.['NhomVT'] || product['NhomVT'] || '', // Ưu tiên lấy từ TONKHO
            ĐVT: tonKhoItem?.['ĐVT'] || product['ĐVT'] || '', // Ưu tiên lấy từ TONKHO
            NoiSX: tonKhoItem?.['NoiSX'] || product['NoiSX'] || '', // Ưu tiên lấy từ TONKHO
            DonGia: tonKhoItem?.['DonGia'] || product['DonGia'] || 0,
            SoLuong: tonKhoItem?.['SoLuong'] || 0,
            ThanhTien: tonKhoItem?.['ThanhTien'] || 0,
            GhiChu: tonKhoItem?.['GhiChu'] || ''
          };
        });

        setKiemKeData(mappedData);
      } else {
        setKiemKeData([]);
      }
    } catch (error) {
      console.error('Error fetching kiem ke data:', error);
      toast.error('Lỗi khi tải dữ liệu kiểm kê: ' + (error as Error).message);
      setKiemKeData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data by search
  const filteredData = useMemo(() => {
    return kiemKeData.filter(item =>
      item.TenVT?.toLowerCase().includes(search.toLowerCase()) ||
      item.MaVT?.toLowerCase().includes(search.toLowerCase()) ||
      item.NhomVT?.toLowerCase().includes(search.toLowerCase()) ||
      item.GhiChu?.toLowerCase().includes(search.toLowerCase())
    );
  }, [kiemKeData, search]);

  return {
    kiemKeData,
    setKiemKeData,
    isLoading,
    products,
    filteredData,
    fetchKiemKeData,
  };
};

