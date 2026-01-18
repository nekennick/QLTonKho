/**
 * Query keys cho TanStack Query
 * Tổ chức các query keys theo module để dễ quản lý
 */

export const queryKeys = {
  // Kho
  warehouses: {
    all: ['warehouses'] as const,
    lists: () => [...queryKeys.warehouses.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.warehouses.lists(), { filters }] as const,
    details: () => [...queryKeys.warehouses.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.warehouses.details(), id] as const,
  },

  // Nhân viên
  employees: {
    all: ['employees'] as const,
    lists: () => [...queryKeys.employees.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.employees.lists(), { filters }] as const,
    details: () => [...queryKeys.employees.all, 'detail'] as const,
    detail: (username: string) => [...queryKeys.employees.details(), username] as const,
  },

  // Hàng hóa
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.products.lists(), { filters }] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
  },

  // Tab data
  tabData: {
    all: ['tabData'] as const,
    tab: (tabId: string) => [...queryKeys.tabData.all, tabId] as const,
  },

  // Inventory Approval (Duyệt phiếu)
  inventoryApproval: {
    all: ['inventoryApproval'] as const,
    inventories: () => [...queryKeys.inventoryApproval.all, 'inventories'] as const,
    inventoryDetails: () => [...queryKeys.inventoryApproval.all, 'inventoryDetails'] as const,
    inventory: (maPhieu: string) => [...queryKeys.inventoryApproval.all, 'inventory', maPhieu] as const,
  },

  // Inventory (Kiểm kê)
  inventory: {
    all: ['inventory'] as const,
    items: () => [...queryKeys.inventory.all, 'items'] as const,
    item: (id: string) => [...queryKeys.inventory.all, 'item', id] as const,
  },

  // Kiểm kê (KiemKe)
  kiemke: {
    all: ['kiemke'] as const,
    data: () => [...queryKeys.kiemke.all, 'data'] as const,
    dataByDate: (date: Date) => [...queryKeys.kiemke.data(), date.toISOString()] as const,
    history: () => [...queryKeys.kiemke.all, 'history'] as const,
    historyByFilters: (filters?: { date?: Date; month?: Date; year?: number }) => 
      [...queryKeys.kiemke.history(), filters] as const,
    products: () => [...queryKeys.kiemke.all, 'products'] as const,
  },

  // Inventory Transaction (Xuất nhập kho)
  inventoryTransaction: {
    all: ['inventoryTransaction'] as const,
    inventories: () => [...queryKeys.inventoryTransaction.all, 'inventories'] as const,
    inventoryDetails: () => [...queryKeys.inventoryTransaction.all, 'inventoryDetails'] as const,
    inventory: (maPhieu: string) => [...queryKeys.inventoryTransaction.all, 'inventory', maPhieu] as const,
  },

  // Báo cáo kho (BaoCaoKho)
  baoCaoKho: {
    all: ['baoCaoKho'] as const,
    report: () => [...queryKeys.baoCaoKho.all, 'report'] as const,
    reportByFilters: (filters?: { 
      warehouseId?: string; 
      startDate?: Date; 
      endDate?: Date; 
      month?: Date; 
      year?: number;
    }) => [...queryKeys.baoCaoKho.report(), filters] as const,
  },

  // Generic query key cho các query tùy chỉnh
  custom: (key: string, ...args: any[]) => [key, ...args] as const,
} as const;

