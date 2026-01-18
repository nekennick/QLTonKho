'use client';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { Product, ProductFormData } from '../types/product';

export interface ExcelPreviewData {
  data: ProductFormData[];
  errors: ExcelError[];
  validCount: number;
  totalCount: number;
}

export interface ExcelError {
  row: number;
  field: string;
  message: string;
  value: any;
}

export class ExcelUtils {
  // Xuất Excel
  static exportToExcel(products: Product[], filename = 'danh-sach-hang-hoa.xlsx') {
    try {
      // Chuẩn bị dữ liệu export
      const exportData = products.map((product, index) => ({
        'STT': index + 1,
        'Mã VT': product.MaVT || '',
        'Tên VT': product.TenVT || '',
        'Nhóm VT': product.NhomVT || '',
        'Hình Ảnh': product.HinhAnh || '',
        'ĐVT': product.ĐVT || '',
        'Nơi SX': product.NoiSX || '',
        'Chất Lượng': product.ChatLuong || '',
        'Đơn Giá': product.DonGia || '',
        'Ghi Chú': product.GhiChu || ''
      }));

      // Tạo workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 5 },   // STT
        { wch: 15 },  // Mã VT
        { wch: 30 },  // Tên VT
        { wch: 20 },  // Nhóm VT
        { wch: 30 },  // Hình Ảnh
        { wch: 10 },  // ĐVT
        { wch: 25 },  // Nơi SX
        { wch: 15 },  // Chất Lượng
        { wch: 15 },  // Đơn Giá
        { wch: 30 }   // Ghi Chú
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Hàng hóa');

      // Generate buffer and save
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, filename);

      return { success: true, message: 'Xuất Excel thành công!' };
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      return { success: false, message: 'Lỗi khi xuất Excel: ' + (error as Error).message };
    }
  }

  // Đọc file Excel và preview
  static async readExcelFile(file: File): Promise<ExcelPreviewData> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Lấy sheet đầu tiên
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Chuyển đổi sang JSON với header
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: '',
            blankrows: false
          }) as any[][];

          console.log('Raw Excel data:', jsonData);

          if (jsonData.length < 2) {
            resolve({
              data: [],
              errors: [{ row: 0, field: 'file', message: 'File Excel không có dữ liệu hoặc thiếu header', value: '' }],
              validCount: 0,
              totalCount: 0
            });
            return;
          }

          // Lấy header và mapping
          const headers = jsonData[0];
          console.log('Headers:', headers);
          
          const headerMapping = this.createHeaderMapping(headers);
          console.log('Header mapping:', headerMapping);
          
          const products: ProductFormData[] = [];
          const errors: ExcelError[] = [];
          
          // Xử lý từng dòng dữ liệu
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            console.log(`Processing row ${i + 1}:`, row);
            
            const product = this.parseProductRow(row, headerMapping, i + 1);
            console.log(`Parsed product:`, product);
            
            if (product.data) {
              products.push(product.data);
            }
            
            if (product.errors.length > 0) {
              errors.push(...product.errors);
            }
          }

          const validCount = products.length;
          const totalCount = jsonData.length - 1;

          console.log('Final result:', { products, errors, validCount, totalCount });

          resolve({
            data: products,
            errors,
            validCount,
            totalCount
          });

        } catch (error) {
          console.error('Error reading Excel file:', error);
          resolve({
            data: [],
            errors: [{ row: 0, field: 'file', message: 'Lỗi khi đọc file Excel: ' + (error as Error).message, value: '' }],
            validCount: 0,
            totalCount: 0
          });
        }
      };

      reader.readAsArrayBuffer(file);
    });
  }

  // Tạo template Excel
  static exportTemplate(filename = 'template-hang-hoa.xlsx') {
    try {
      const templateData = [
        {
          'Mã VT': 'VT0001',
          'Tên VT': 'Laptop Dell Inspiron 15',
          'Nhóm VT': 'Điện tử',
          'Hình Ảnh': '',
          'ĐVT': 'Cái',
          'Nơi SX': 'Việt Nam',
          'Chất Lượng': 'A',
          'Đơn Giá': '15000000',
          'Ghi Chú': 'Hàng hóa mẫu'
        }
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(templateData);

      // Set column widths
      ws['!cols'] = [
        { wch: 15 }, { wch: 30 }, { wch: 20 }, 
        { wch: 30 }, { wch: 10 }, { wch: 25 },
        { wch: 15 }, { wch: 15 }, { wch: 30 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Template');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, filename);

      return { success: true, message: 'Tải template thành công!' };
    } catch (error) {
      return { success: false, message: 'Lỗi khi tạo template: ' + (error as Error).message };
    }
  }

  // Helper methods
  private static createHeaderMapping(headers: any[]): Record<string, number> {
    const mapping: Record<string, number> = {};
    
    const fieldMapping = {
      'MaVT': ['mã vt', 'ma vt', 'mavt', 'code', 'id'],
      'TenVT': ['tên vt', 'ten vt', 'tenvt', 'name', 'title'],
      'NhomVT': ['nhóm vt', 'nhom vt', 'nhomvt', 'group', 'category'],
      'HinhAnh': ['hình ảnh', 'hinh anh', 'hinhanh', 'image', 'photo', 'picture'],
      'ĐVT': ['đvt', 'dvt', 'unit', 'đơn vị tính', 'don vi tinh'],
      'NoiSX': ['nơi sx', 'noi sx', 'noisx', 'origin', 'manufacturer'],
      'ChatLuong': ['chất lượng', 'chat luong', 'chatluong', 'quality'],
      'DonGia': ['đơn giá', 'don gia', 'dongia', 'price', 'cost'],
      'GhiChu': ['ghi chú', 'ghi chu', 'ghichu', 'note', 'notes', 'comment']
    };

    headers.forEach((header, index) => {
      if (!header) return;
      
      const normalizedHeader = header.toString().toLowerCase().trim();
      console.log(`Checking header "${normalizedHeader}" at index ${index}`);
      
      Object.entries(fieldMapping).forEach(([field, alternatives]) => {
        // Kiểm tra exact match trước
        if (alternatives.some(alt => normalizedHeader === alt)) {
          mapping[field] = index;
          console.log(`Mapped "${field}" to index ${index} (exact match)`);
        }
        // Sau đó kiểm tra contains
        else if (alternatives.some(alt => normalizedHeader.includes(alt))) {
          if (!mapping[field]) { // Chỉ map nếu chưa có exact match
            mapping[field] = index;
            console.log(`Mapped "${field}" to index ${index} (contains match)`);
          }
        }
      });
    });

    console.log('Final mapping:', mapping);
    return mapping;
  }

  private static parseProductRow(row: any[], mapping: Record<string, number>, rowNumber: number) {
    const errors: ExcelError[] = [];
    const product: Partial<ProductFormData> = {
      MaVT: '',
      TenVT: '',
      NhomVT: '',
      HinhAnh: '',
      ĐVT: '',
      NoiSX: '',
      ChatLuong: '',
      DonGia: '',
      GhiChu: ''
    };

    // Parse các field
    Object.entries(mapping).forEach(([field, index]) => {
      const value = row[index];
      
      if (value !== undefined && value !== null && value !== '') {
        const stringValue = value.toString().trim();
        
        // Validation cho giá tiền
        if (field === 'DonGia') {
          const numericValue = parseFloat(stringValue.replace(/[^\d.-]/g, ''));
          if (!isNaN(numericValue)) {
            (product as any)[field] = numericValue.toString();
          } else {
            errors.push({
              row: rowNumber,
              field,
              message: `${field} phải là số hợp lệ`,
              value: stringValue
            });
          }
        } else {
          (product as any)[field] = stringValue;
        }
      }
    });

    // Validate required fields
    const requiredFields: (keyof ProductFormData)[] = ['MaVT', 'TenVT'];
    requiredFields.forEach(field => {
      const value = product[field];
      if (!value || !value.toString().trim()) {
        errors.push({
          row: rowNumber,
          field,
          message: 'Trường bắt buộc không được để trống',
          value: value || ''
        });
      }
    });

    return {
      data: errors.length === 0 ? product as ProductFormData : null,
      errors
    };
  }
}
