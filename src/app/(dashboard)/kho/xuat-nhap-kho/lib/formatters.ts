import type { NXKHO, NXKHODE } from '../types/inventory';

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// Format number
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

// Format date
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateObj);
};

// Format datetime for display (Vietnamese format)
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

// Format datetime for API (preserve local timezone)
export const formatDateTimeForAPI = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Format as ISO string but preserve local time values
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
};

// Format inventory status
export const formatInventoryStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'Mới': 'Mới',
    'Chờ xác nhận': 'Chờ xác nhận',
    'Đã xác nhận': 'Đã xác nhận',
    'Đã hoàn thành': 'Đã hoàn thành',
    'Hủy': 'Hủy',
  };
  return statusMap[status] || status;
};

// Format inventory type
export const formatInventoryType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'Nhập kho': 'Nhập kho',
    'Xuất kho': 'Xuất kho',
  };
  return typeMap[type] || type;
};

// Format quality
export const formatQuality = (quality: string): string => {
  const qualityMap: Record<string, string> = {
    'Tốt': 'Tốt',
    'Trung bình': 'Trung bình',
    'Kém': 'Kém',
    'Hỏng': 'Hỏng',
  };
  return qualityMap[quality] || quality;
};

// Get status color
export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'Mới': 'bg-blue-100 text-blue-800',
    'Chờ xác nhận': 'bg-yellow-100 text-yellow-800',
    'Đã xác nhận': 'bg-green-100 text-green-800',
    'Đã hoàn thành': 'bg-green-100 text-green-800',
    'Hủy': 'bg-red-100 text-red-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

// Get type color
export const getTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    'Nhập kho': 'bg-green-100 text-green-800',
    'Xuất kho': 'bg-red-100 text-red-800',
  };
  return colorMap[type] || 'bg-gray-100 text-gray-800';
};

// Get quality color
export const getQualityColor = (quality: string): string => {
  const colorMap: Record<string, string> = {
    'Tốt': 'bg-green-100 text-green-800',
    'Trung bình': 'bg-yellow-100 text-yellow-800',
    'Kém': 'bg-orange-100 text-orange-800',
    'Hỏng': 'bg-red-100 text-red-800',
  };
  return colorMap[quality] || 'bg-gray-100 text-gray-800';
};

// Calculate total amount for inventory
export const calculateInventoryTotal = (details: NXKHODE[]): number => {
  return details.reduce((total, detail) => total + (detail.ThanhTien || 0), 0);
};

// Calculate total quantity for inventory
export const calculateInventoryQuantity = (details: NXKHODE[]): number => {
  return details.reduce((total, detail) => total + (detail.SoLuong || 0), 0);
};

// Get inventory summary
export const getInventorySummary = (inventory: NXKHO, details: NXKHODE[]) => {
  const totalAmount = calculateInventoryTotal(details);
  const totalQuantity = calculateInventoryQuantity(details);
  const itemCount = details.length;

  return {
    totalAmount,
    totalQuantity,
    itemCount,
    formattedAmount: formatCurrency(totalAmount),
    formattedQuantity: formatNumber(totalQuantity),
  };
};
