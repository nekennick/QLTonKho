// Constants for inventory management
export const INVENTORY_TYPES = {
  NHAP: 'Nhập kho',
  XUAT: 'Xuất kho'
} as const;

export const INVENTORY_STATUS = {
  MOI: 'Mới',
  CHO_XAC_NHAN: 'Chờ xác nhận',
  DA_XAC_NHAN: 'Đã xác nhận',
  DA_HOAN_THANH: 'Đã hoàn thành',
  HUY: 'Hủy'
} as const;

export const INVENTORY_QUALITY = {
  TOT: 'Tốt',
  TRUNG_BINH: 'Trung bình',
  KEM: 'Kém',
  HONG: 'Hỏng'
} as const;

// Generate inventory code
export const generateInventoryCode = (existingCodes: string[], loaiPhieu: string): string => {
  const prefix = loaiPhieu === INVENTORY_TYPES.NHAP ? 'NK' : 'XK';
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  
  const datePrefix = `${prefix}${year}${month}${day}`;
  
  // Find the highest number for today
  const todayCodes = existingCodes.filter(code => code.startsWith(datePrefix));
  let maxNumber = 0;
  
  todayCodes.forEach(code => {
    const numberPart = parseInt(code.replace(datePrefix, ''), 10);
    if (!isNaN(numberPart) && numberPart > maxNumber) {
      maxNumber = numberPart;
    }
  });
  
  const nextNumber = (maxNumber + 1).toString().padStart(3, '0');
  return `${datePrefix}${nextNumber}`;
};

// Generate detail code
export const generateDetailCode = (maPhieu: string, existingCodes: string[]): string => {
  const prefix = `${maPhieu}_`;
  
  // Find the highest number for this invoice
  const invoiceCodes = existingCodes.filter(code => code.startsWith(prefix));
  let maxNumber = 0;
  
  invoiceCodes.forEach(code => {
    const numberPart = parseInt(code.replace(prefix, ''), 10);
    if (!isNaN(numberPart) && numberPart > maxNumber) {
      maxNumber = numberPart;
    }
  });
  
  const nextNumber = (maxNumber + 1).toString().padStart(3, '0');
  return `${prefix}${nextNumber}`;
};

// Default form values
export const DEFAULT_INVENTORY_FORM = {
  MaPhieu: '',
  LoaiPhieu: INVENTORY_TYPES.XUAT,
  DiaChi: '',
  Ngay: new Date().toISOString().slice(0, 16),
  NhanVienDeNghi: '',
  Tu: '',
  Den: '',
  GhiChu: '',
  LichSu: '',
  TrangThai: INVENTORY_STATUS.MOI,
  NhanVienKho: ''
};

export const DEFAULT_DETAIL_FORM = {
  MaPhieuDe: '',
  MaPhieu: '',
  MaVT: '',
  TenVT: '',
  ĐVT: '',
  SoLuong: 0,
  ChatLuong: INVENTORY_QUALITY.TOT,
  DonGia: 0,
  ThanhTien: 0,
  GhiChu: ''
};
