// Constants for inventory approval management

export const INVENTORY_TYPES = {
  IMPORT: 'Nhập kho',
  EXPORT: 'Xuất kho',
} as const;

export const INVENTORY_STATUS = {
  PENDING: 'Chờ xác nhận',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
} as const;

export const APPROVAL_ACTIONS = {
  APPROVE: 'approve',
  REJECT: 'reject',
} as const;

// Status colors for UI
export const STATUS_COLORS = {
  [INVENTORY_STATUS.PENDING]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    icon: 'text-yellow-600'
  },
  [INVENTORY_STATUS.APPROVED]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: 'text-green-600'
  },
  [INVENTORY_STATUS.REJECTED]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: 'text-red-600'
  }
} as const;

// Type colors for UI
export const TYPE_COLORS = {
  [INVENTORY_TYPES.IMPORT]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: 'text-blue-600'
  },
  [INVENTORY_TYPES.EXPORT]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: 'text-green-600'
  }
} as const;

// Table column visibility options
export const COLUMN_VISIBILITY = {
  MaPhieu: true,
  LoaiPhieu: true,
  TrangThai: true,
  NhanVienDeNghi: true,
  Ngay: true,
  Tu: true,
  Den: true,
  NhanVienKho: false,
  actions: true,
} as const;

// Default pagination settings
export const PAGINATION_CONFIG = {
  pageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
} as const;

// Search and filter options
export const SEARCH_CONFIG = {
  debounceMs: 300,
  minLength: 2,
} as const;

// Print template options
export const PRINT_OPTIONS = {
  showCompanyInfo: true,
  showSignatures: true,
  showTotals: true,
  paperSize: 'A4' as const,
} as const;
