export interface WarehouseReportData {
  // Thông tin hàng hóa
  MaVT: string;
  TenVT: string;
  NhomVT: string;
  ĐVT: string;
  DonGia: number;
  unitPrice: number;
  
  // Thông tin kho
  MaKho: string;
  TenKho: string;
  
  // Số liệu tồn kho
  beginningStock: number; // Tồn đầu kỳ
  endingStock: number;    // Tồn cuối kỳ
  totalImports: number;   // Tổng nhập trong kỳ
  totalExports: number;   // Tổng xuất trong kỳ
  
  // Chi tiết nhập xuất
  importDetails: ImportExportDetail[];
  exportDetails: ImportExportDetail[];
  
  // Thông tin bổ sung
  lastInventoryDate?: string; // Ngày kiểm kê gần nhất
  notes?: string;
}

export interface ImportExportDetail {
  MaPhieu: string;
  Ngay: string;
  SoLuong: number;
  DonGia: number;
  ThanhTien: number;
  NhanVienDeNghi: string;
  GhiChu?: string;
  TrangThai: string;
}

export interface ReportPeriod {
  type: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate: Date;
  endDate: Date;
}

export interface ReportFilters {
  warehouseId: string;
  period: ReportPeriod;
  startDate: Date;
  endDate: Date;
  productGroup?: string;
  productCode?: string;
  minValue?: number;
  maxValue?: number;
}

export interface ReportSummary {
  totalProducts: number;
  totalBeginningStock: number;
  totalEndingStock: number;
  totalImports: number;
  totalExports: number;
  totalValue: number;
  averageStock: number;
  stockTurnover: number;
}

export interface WarehouseReportStats {
  // Thống kê tổng quan
  totalWarehouses: number;
  totalProducts: number;
  totalValue: number;
  
  // Thống kê theo kho
  warehouseStats: {
    [warehouseId: string]: {
      warehouseName: string;
      productCount: number;
      totalValue: number;
      totalStock: number;
      totalImports: number;
      totalExports: number;
    };
  };
  
  // Thống kê theo nhóm hàng hóa
  productGroupStats: {
    [groupName: string]: {
      productCount: number;
      totalValue: number;
      totalStock: number;
      totalImports: number;
      totalExports: number;
    };
  };
  
  // Thống kê theo thời gian
  timeStats: {
    daily: { [date: string]: ReportSummary };
    weekly: { [week: string]: ReportSummary };
    monthly: { [month: string]: ReportSummary };
  };
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface ExportOptions {
  format: 'excel' | 'pdf' | 'csv';
  includeCharts?: boolean;
  includeDetails?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  warehouses?: string[];
  productGroups?: string[];
}

export type ReportPeriodType = 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface ReportPeriodConfig {
  type: ReportPeriodType;
  label: string;
  getDateRange: () => { start: Date; end: Date };
}

export const REPORT_PERIODS: ReportPeriodConfig[] = [
  {
    type: 'week',
    label: 'Tuần này',
    getDateRange: () => {
      const now = new Date();
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { start, end: now };
    }
  },
  {
    type: 'month',
    label: 'Tháng này',
    getDateRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start, end: now };
    }
  },
  {
    type: 'quarter',
    label: 'Quý này',
    getDateRange: () => {
      const now = new Date();
      const quarter = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), quarter * 3, 1);
      return { start, end: now };
    }
  },
  {
    type: 'year',
    label: 'Năm này',
    getDateRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      return { start, end: now };
    }
  },
  {
    type: 'custom',
    label: 'Tùy chọn',
    getDateRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start, end: now };
    }
  }
];
