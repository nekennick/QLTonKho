import { useState, useCallback } from 'react';
import { WarehouseReportData, ReportFilters, ExportOptions, ReportSummary } from '../types/warehouseReport';
import { useInventory } from '../../kiem-ton/hooks/useInventory';
import { useProducts } from '../../danh-muc-hang-hoa/hooks/useProducts';
import { useWarehouses } from '../../hooks/useWarehouses';
import { formatDateTimeForAPI } from '../../xuat-nhap-kho/lib/formatters';
import { safeNumber } from '../utils/numberUtils';
import toast from 'react-hot-toast';

export const useWarehouseReport = () => {
  const [reportData, setReportData] = useState<WarehouseReportData[]>([]);
  const [loading, setLoading] = useState(false);

  // Sử dụng các hooks hiện có để lấy dữ liệu
  const { inventoryItems } = useInventory();
  const { products } = useProducts();
  const { warehouses } = useWarehouses();

  // Hàm tính toán dữ liệu báo cáo
  const calculateReportData = useCallback(async (filters: ReportFilters): Promise<WarehouseReportData[]> => {
    try {
      setLoading(true);

      // Lấy dữ liệu từ API hoặc cache
      const startDateStr = formatDateTimeForAPI(filters.startDate);
      const endDateStr = formatDateTimeForAPI(filters.endDate);

      // Tạo dữ liệu báo cáo giả lập dựa trên dữ liệu hiện có
      const reportData: WarehouseReportData[] = [];

      // Lọc sản phẩm theo kho nếu được chọn
      const filteredProducts = filters.warehouseId === 'all' 
        ? products 
        : products.filter(p => {
            // Giả sử có thông tin kho trong sản phẩm hoặc từ inventory
            return true; // Tạm thời lấy tất cả
          });

      // Xử lý từng sản phẩm
      for (const product of filteredProducts) {
        // Lấy thông tin kho (giả lập)
        const warehouse = warehouses[0] || { MaKho: 'KHO01', TenKho: 'Kho chính' };
        
        // Tính toán số liệu tồn kho - đảm bảo chuyển đổi sang number
        const beginningStock = safeNumber(product.TonApp);
        const endingStock = safeNumber(product.TonApp);
        
        // Tính toán nhập xuất trong kỳ - đảm bảo chuyển đổi sang number
        const totalImports = safeNumber(product.TongNhap);
        const totalExports = safeNumber(product.TongXuat);

        // Tạo chi tiết nhập xuất (giả lập)
        const importDetails = [];
        const exportDetails = [];

        // Thêm dữ liệu báo cáo
        reportData.push({
          MaVT: product.MaVT,
          TenVT: product.TenVT,
          NhomVT: product.NhomVT || 'Khác',
          ĐVT: product.ĐVT || 'Cái',
          DonGia: safeNumber(product.DonGia),
          unitPrice: safeNumber(product.DonGia),
          MaKho: warehouse.MaKho,
          TenKho: warehouse.TenKho,
          beginningStock,
          endingStock,
          totalImports,
          totalExports,
          importDetails: [],
          exportDetails: [],
          lastInventoryDate: new Date().toISOString().split('T')[0],
          notes: product.GhiChu || ''
        });
      }

      return reportData;
    } catch (error) {
      console.error('Error calculating report data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [products, warehouses, inventoryItems]);

  // Hàm lấy dữ liệu báo cáo
  const fetchReportData = useCallback(async (filters: ReportFilters) => {
    try {
      const data = await calculateReportData(filters);
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu báo cáo!');
    }
  }, [calculateReportData]);

  // Hàm xuất báo cáo
  const exportReport = useCallback(async (options: ExportOptions) => {
    try {
      setLoading(true);

      // Tạo dữ liệu xuất - đảm bảo chuyển đổi sang number
      const exportData = reportData.map(item => ({
        'Mã vật tư': item.MaVT,
        'Tên vật tư': item.TenVT,
        'Nhóm vật tư': item.NhomVT,
        'Đơn vị tính': item.ĐVT,
        'Đơn giá': safeNumber(item.unitPrice),
        'Kho': item.TenKho,
        'Tồn đầu kỳ': safeNumber(item.beginningStock),
        'Tồn cuối kỳ': safeNumber(item.endingStock),
        'Tổng nhập': safeNumber(item.totalImports),
        'Tổng xuất': safeNumber(item.totalExports),
        'Giá trị tồn': safeNumber(item.endingStock) * safeNumber(item.unitPrice),
        'Ghi chú': item.notes || ''
      }));

      // Xuất file Excel
      if (options.format === 'excel') {
        const XLSX = await import('xlsx');
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Báo cáo kho');
        
        // Tạo tên file
        const now = new Date();
        const fileName = `BaoCaoKho_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}.xlsx`;
        
        // Tải file
        XLSX.writeFile(workbook, fileName);
        toast.success('Xuất báo cáo Excel thành công!');
      }

    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Có lỗi xảy ra khi xuất báo cáo!');
    } finally {
      setLoading(false);
    }
  }, [reportData]);

  // Hàm tính toán thống kê tổng quan
  const calculateSummaryStats = useCallback((data: WarehouseReportData[]): ReportSummary => {
    if (!data || data.length === 0) {
      return {
        totalProducts: 0,
        totalBeginningStock: 0,
        totalEndingStock: 0,
        totalImports: 0,
        totalExports: 0,
        totalValue: 0,
        averageStock: 0,
        stockTurnover: 0
      };
    }

    const stats = data.reduce((acc, item) => {
      acc.totalProducts += 1;
      acc.totalBeginningStock += safeNumber(item.beginningStock);
      acc.totalEndingStock += safeNumber(item.endingStock);
      acc.totalImports += safeNumber(item.totalImports);
      acc.totalExports += safeNumber(item.totalExports);
      acc.totalValue += safeNumber(item.endingStock) * safeNumber(item.unitPrice);
      return acc;
    }, {
      totalProducts: 0,
      totalBeginningStock: 0,
      totalEndingStock: 0,
      totalImports: 0,
      totalExports: 0,
      totalValue: 0,
      averageStock: 0,
      stockTurnover: 0
    });

    // Tính toán các chỉ số bổ sung
    stats.averageStock = stats.totalEndingStock / stats.totalProducts;
    stats.stockTurnover = stats.totalExports > 0 ? stats.totalExports / stats.totalEndingStock : 0;

    return stats; 
  }, []);

  // Hàm lấy dữ liệu biểu đồ
  const getChartData = useCallback((data: WarehouseReportData[], chartType: 'stock' | 'import' | 'export' | 'value') => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    const labels = data.map(item => item.TenVT);
    let dataValues: number[] = [];
    let label = '';
    let backgroundColor = '';

    switch (chartType) {
      case 'stock':
        dataValues = data.map(item => safeNumber(item.endingStock));
        label = 'Tồn kho';
        backgroundColor = 'rgba(59, 130, 246, 0.5)';
        break;
      case 'import':
        dataValues = data.map(item => safeNumber(item.totalImports));
        label = 'Nhập kho';
        backgroundColor = 'rgba(34, 197, 94, 0.5)';
        break;
      case 'export':
        dataValues = data.map(item => safeNumber(item.totalExports));
        label = 'Xuất kho';
        backgroundColor = 'rgba(239, 68, 68, 0.5)';
        break;
      case 'value':
        dataValues = data.map(item => safeNumber(item.endingStock) * safeNumber(item.unitPrice));
        label = 'Giá trị tồn';
        backgroundColor = 'rgba(168, 85, 247, 0.5)';
        break;
    }

    return {
      labels: labels.slice(0, 10), // Chỉ hiển thị 10 sản phẩm đầu tiên
      datasets: [{
        label,
        data: dataValues.slice(0, 10),
        backgroundColor,
        borderColor: backgroundColor.replace('0.5', '1'),
        borderWidth: 1
      }]
    };
  }, []);

  return {
    reportData,
    loading,
    fetchReportData,
    exportReport,
    calculateSummaryStats,
    getChartData
  };
};
