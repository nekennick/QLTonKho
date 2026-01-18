import type { WarehouseFormData } from '../types/warehouse';

export const WAREHOUSE_STATUS = [
  { value: 'Hoạt động', label: 'Hoạt động' },
  { value: 'Bảo trì', label: 'Bảo trì' },
  { value: 'Ngừng hoạt động', label: 'Ngừng hoạt động' }
];

export const WAREHOUSE_TYPES = [
  { value: 'Kho chính', label: 'Kho chính' },
  { value: 'Kho phụ', label: 'Kho phụ' },
  { value: 'Kho lạnh', label: 'Kho lạnh' },
  { value: 'Kho khô', label: 'Kho khô' }
];

export const INITIAL_WAREHOUSE_FORM_DATA: WarehouseFormData = {
  MaKho: '', // Sẽ được tự sinh
  TenKho: '',
  DiaChi: '',
  HinhAnh: '',
  GhiChu: '',
  ThuKho: ''
};

// Hàm tự sinh mã kho
export const generateWarehouseCode = (existingCodes: string[]): string => {
  const prefix = 'KHO';
  let counter = 1;
  
  while (true) {
    const newCode = `${prefix}${counter.toString().padStart(3, '0')}`;
    if (!existingCodes.includes(newCode)) {
      return newCode;
    }
    counter++;
  }
};
