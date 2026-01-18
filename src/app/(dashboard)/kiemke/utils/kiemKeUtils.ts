// Format số với dấu chấm (Việt Nam: 1.000.000)
export const formatNumber = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFormattedNumber(value) : value;
  if (num === 0) return '0';
  return num.toLocaleString('vi-VN');
};

// Parse số từ string (Hỗ trợ định dạng VN: 1.000.000,50 hoặc Excel: 8,00 hoặc 600 800,00)
export const parseFormattedNumber = (value: string | number): number => {
  if (value === undefined || value === null || value === '') return 0;
  if (typeof value === 'number') return value;

  // Chuyển về string
  let strVal = String(value).trim();

  // Loại bỏ khoảng trắng (nếu có, VD: "600 800")
  strVal = strVal.replace(/\s/g, '');

  // Logic xử lý số kiểu Việt Nam
  // Bước 1: Loại bỏ dấu chấm (hàng nghìn)
  strVal = strVal.replace(/\./g, '');

  // Bước 2: Chuyển dấu phẩy thành dấu chấm (thập phân)
  strVal = strVal.replace(/,/g, '.');

  const parsed = parseFloat(strVal);
  return isNaN(parsed) ? 0 : parsed;
};

// Tính toán thành tiền
export const calculateThanhTien = (donGia: number | string, soLuong: number | string): number => {
  const dg = typeof donGia === 'string' ? parseFormattedNumber(donGia) || 0 : donGia;
  const sl = typeof soLuong === 'string' ? parseFormattedNumber(soLuong) || 0 : soLuong;
  return dg * sl;
};

