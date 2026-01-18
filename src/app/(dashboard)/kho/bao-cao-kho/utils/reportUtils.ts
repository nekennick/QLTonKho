import { WarehouseReportData, ReportSummary, ChartData } from '../types/warehouseReport';

/**
 * Tính toán thống kê tổng quan từ dữ liệu báo cáo
 */
export const calculateReportSummary = (data: WarehouseReportData[]): ReportSummary => {
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
    acc.totalBeginningStock += item.beginningStock;
    acc.totalEndingStock += item.endingStock;
    acc.totalImports += item.totalImports;
    acc.totalExports += item.totalExports;
    acc.totalValue += item.endingStock * item.unitPrice;
    return acc;
  }, {
    totalProducts: 0,
    totalBeginningStock: 0,
    totalEndingStock: 0,
    totalImports: 0,
    totalExports: 0,
    totalValue: 0
  });

  // Tính toán các chỉ số bổ sung
  stats.averageStock = stats.totalEndingStock / stats.totalProducts;
  stats.stockTurnover = stats.totalExports > 0 ? stats.totalExports / stats.totalEndingStock : 0;

  return stats;
};

/**
 * Tạo dữ liệu biểu đồ từ dữ liệu báo cáo
 */
export const createChartData = (
  data: WarehouseReportData[], 
  chartType: 'stock' | 'import' | 'export' | 'value',
  limit: number = 10
): ChartData => {
  if (!data || data.length === 0) {
    return {
      labels: [],
      datasets: []
    };
  }

  // Sắp xếp dữ liệu theo loại biểu đồ
  let sortedData = [...data];
  switch (chartType) {
    case 'stock':
      sortedData.sort((a, b) => b.endingStock - a.endingStock);
      break;
    case 'import':
      sortedData.sort((a, b) => b.totalImports - a.totalImports);
      break;
    case 'export':
      sortedData.sort((a, b) => b.totalExports - a.totalExports);
      break;
    case 'value':
      sortedData.sort((a, b) => (b.endingStock * b.unitPrice) - (a.endingStock * a.unitPrice));
      break;
  }

  // Lấy top N sản phẩm
  const topData = sortedData.slice(0, limit);

  const labels = topData.map(item => item.TenVT);
  let dataValues: number[] = [];
  let label = '';
  let backgroundColor = '';

  switch (chartType) {
    case 'stock':
      dataValues = topData.map(item => item.endingStock);
      label = 'Tồn kho';
      backgroundColor = 'rgba(59, 130, 246, 0.5)';
      break;
    case 'import':
      dataValues = topData.map(item => item.totalImports);
      label = 'Nhập kho';
      backgroundColor = 'rgba(34, 197, 94, 0.5)';
      break;
    case 'export':
      dataValues = topData.map(item => item.totalExports);
      label = 'Xuất kho';
      backgroundColor = 'rgba(239, 68, 68, 0.5)';
      break;
    case 'value':
      dataValues = topData.map(item => item.endingStock * item.unitPrice);
      label = 'Giá trị tồn';
      backgroundColor = 'rgba(168, 85, 247, 0.5)';
      break;
  }

  return {
    labels,
    datasets: [{
      label,
      data: dataValues,
      backgroundColor,
      borderColor: backgroundColor.replace('0.5', '1'),
      borderWidth: 1
    }]
  };
};

/**
 * Lọc dữ liệu báo cáo theo các tiêu chí
 */
export const filterReportData = (
  data: WarehouseReportData[],
  filters: {
    searchTerm?: string;
    warehouseId?: string;
    productGroup?: string;
    minValue?: number;
    maxValue?: number;
    minStock?: number;
    maxStock?: number;
  }
): WarehouseReportData[] => {
  return data.filter(item => {
    // Tìm kiếm theo tên, mã, nhóm
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch = 
        item.TenVT.toLowerCase().includes(searchLower) ||
        item.MaVT.toLowerCase().includes(searchLower) ||
        item.NhomVT.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Lọc theo kho
    if (filters.warehouseId && filters.warehouseId !== 'all') {
      if (item.MaKho !== filters.warehouseId) return false;
    }

    // Lọc theo nhóm sản phẩm
    if (filters.productGroup && filters.productGroup !== 'all') {
      if (item.NhomVT !== filters.productGroup) return false;
    }

    // Lọc theo giá trị
    const itemValue = item.endingStock * item.unitPrice;
    if (filters.minValue !== undefined && itemValue < filters.minValue) return false;
    if (filters.maxValue !== undefined && itemValue > filters.maxValue) return false;

    // Lọc theo tồn kho
    if (filters.minStock !== undefined && item.endingStock < filters.minStock) return false;
    if (filters.maxStock !== undefined && item.endingStock > filters.maxStock) return false;

    return true;
  });
};

/**
 * Sắp xếp dữ liệu báo cáo
 */
export const sortReportData = (
  data: WarehouseReportData[],
  sortField: keyof WarehouseReportData,
  sortDirection: 'asc' | 'desc'
): WarehouseReportData[] => {
  return [...data].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Xử lý các trường đặc biệt
    if (sortField === 'unitPrice') {
      aValue = a.unitPrice;
      bValue = b.unitPrice;
    }

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
};

/**
 * Phân trang dữ liệu báo cáo
 */
export const paginateReportData = (
  data: WarehouseReportData[],
  page: number,
  itemsPerPage: number
): {
  data: WarehouseReportData[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
} => {
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    totalPages,
    totalItems,
    currentPage: page
  };
};

/**
 * Tính toán các chỉ số hiệu suất
 */
export const calculatePerformanceMetrics = (data: WarehouseReportData[]) => {
  if (!data || data.length === 0) {
    return {
      averageStockTurnover: 0,
      topPerformingProducts: [],
      slowMovingProducts: [],
      stockAccuracy: 0
    };
  }

  // Tính tỷ lệ luân chuyển trung bình
  const totalExports = data.reduce((sum, item) => sum + item.totalExports, 0);
  const totalEndingStock = data.reduce((sum, item) => sum + item.endingStock, 0);
  const averageStockTurnover = totalEndingStock > 0 ? totalExports / totalEndingStock : 0;

  // Sản phẩm hoạt động tốt (tỷ lệ xuất cao)
  const topPerformingProducts = data
    .filter(item => item.endingStock > 0)
    .map(item => ({
      ...item,
      turnoverRate: item.totalExports / item.endingStock
    }))
    .sort((a, b) => b.turnoverRate - a.turnoverRate)
    .slice(0, 10);

  // Sản phẩm ít hoạt động (tồn cao, xuất ít)
  const slowMovingProducts = data
    .filter(item => item.endingStock > 0)
    .map(item => ({
      ...item,
      turnoverRate: item.totalExports / item.endingStock
    }))
    .sort((a, b) => a.turnoverRate - b.turnoverRate)
    .slice(0, 10);

  // Độ chính xác tồn kho (giả lập)
  const stockAccuracy = 0.95; // 95% chính xác

  return {
    averageStockTurnover,
    topPerformingProducts,
    slowMovingProducts,
    stockAccuracy
  };
};

/**
 * Tạo dữ liệu xuất Excel
 */
export const createExcelExportData = (data: WarehouseReportData[]) => {
  return data.map(item => ({
    'Mã vật tư': item.MaVT,
    'Tên vật tư': item.TenVT,
    'Nhóm vật tư': item.NhomVT,
    'Đơn vị tính': item.ĐVT,
    'Đơn giá': item.unitPrice,
    'Kho': item.TenKho,
    'Tồn đầu kỳ': item.beginningStock,
    'Tồn cuối kỳ': item.endingStock,
    'Biến động': item.endingStock - item.beginningStock,
    'Tổng nhập': item.totalImports,
    'Tổng xuất': item.totalExports,
    'Giá trị tồn': item.endingStock * item.unitPrice,
    'Ngày kiểm kê gần nhất': item.lastInventoryDate || '',
    'Ghi chú': item.notes || ''
  }));
};

/**
 * Định dạng số liệu cho hiển thị
 */
export const formatNumber = (value: number, type: 'currency' | 'number' | 'percentage' = 'number'): string => {
  switch (type) {
    case 'currency':
      return `₫${value.toLocaleString('vi-VN')}`;
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'number':
    default:
      return value.toLocaleString('vi-VN');
  }
};

/**
 * Tạo màu sắc cho biểu đồ
 */
export const getChartColors = (type: 'stock' | 'import' | 'export' | 'value') => {
  const colors = {
    stock: {
      background: 'rgba(59, 130, 246, 0.5)',
      border: 'rgba(59, 130, 246, 1)',
      text: '#3B82F6'
    },
    import: {
      background: 'rgba(34, 197, 94, 0.5)',
      border: 'rgba(34, 197, 94, 1)',
      text: '#22C55E'
    },
    export: {
      background: 'rgba(239, 68, 68, 0.5)',
      border: 'rgba(239, 68, 68, 1)',
      text: '#EF4444'
    },
    value: {
      background: 'rgba(168, 85, 247, 0.5)',
      border: 'rgba(168, 85, 247, 1)',
      text: '#A855F7'
    }
  };

  return colors[type];
};

/**
 * Tính toán xu hướng dữ liệu
 */
export const calculateTrend = (current: number, previous: number): {
  value: number;
  percentage: number;
  direction: 'up' | 'down' | 'stable';
} => {
  const difference = current - previous;
  const percentage = previous !== 0 ? (difference / previous) * 100 : 0;
  
  let direction: 'up' | 'down' | 'stable' = 'stable';
  if (Math.abs(percentage) > 5) { // Chỉ coi là có xu hướng nếu thay đổi > 5%
    direction = percentage > 0 ? 'up' : 'down';
  }

  return {
    value: difference,
    percentage: Math.abs(percentage),
    direction
  };
};
