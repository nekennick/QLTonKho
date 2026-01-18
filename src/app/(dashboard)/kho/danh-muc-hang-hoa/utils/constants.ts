import type { ProductFormData } from '../types/product';

// Interface cho option
export interface ProductOption {
  value: string;
  label: string;
}

export const INITIAL_PRODUCT_FORM_DATA: ProductFormData = {
  MaVT: '', // Sẽ được tự sinh
  TenVT: '',
  NhomVT: '',
  HinhAnh: '',
  ĐVT: '',
  NoiSX: '',
  ChatLuong: '',
  DonGia: '',
  GhiChu: ''
};

// Hàm tự sinh mã vật tư
export const generateProductCode = (existingCodes: string[]): string => {
  const prefix = 'VT';
  let counter = 1;
  
  while (true) {
    const newCode = `${prefix}${counter.toString().padStart(4, '0')}`;
    if (!existingCodes.includes(newCode)) {
      return newCode;
    }
    counter++;
  }
};
