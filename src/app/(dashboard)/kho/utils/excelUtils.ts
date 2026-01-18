'use client';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { Warehouse, WarehouseFormData } from '../types/warehouse';

export interface ExcelPreviewData {
  data: WarehouseFormData[];
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
  static exportToExcel(warehouses: Warehouse[], filename = 'danh-sach-kho.xlsx') {
    try {
      // Chuẩn bị dữ liệu export
      const exportData = warehouses.map((warehouse, index) => ({
        'STT': index + 1,
        'Mã Kho': warehouse.MaKho || '',
        'Tên Kho': warehouse.TenKho || '',
        'Địa Chỉ': warehouse.DiaChi || '',
        'Hình Ảnh': warehouse.HinhAnh || '',
        'Ghi Chú': warehouse.GhiChu || '',
        'Thủ Kho': warehouse.ThuKho || ''
      }));

      // Tạo workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 5 },   // STT
        { wch: 15 },  // Mã Kho
        { wch: 25 },  // Tên Kho
        { wch: 40 },  // Địa Chỉ
        { wch: 30 },  // Hình Ảnh
        { wch: 30 },  // Ghi Chú
        { wch: 20 }   // Thủ Kho
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Kho');

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
          
          const warehouses: WarehouseFormData[] = [];
          const errors: ExcelError[] = [];
          
          // Xử lý từng dòng dữ liệu
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            console.log(`Processing row ${i + 1}:`, row);
            
            const warehouse = this.parseWarehouseRow(row, headerMapping, i + 1);
            console.log(`Parsed warehouse:`, warehouse);
            
            if (warehouse.data) {
              warehouses.push(warehouse.data);
            }
            
            if (warehouse.errors.length > 0) {
              errors.push(...warehouse.errors);
            }
          }

          const validCount = warehouses.length;
          const totalCount = jsonData.length - 1;

          console.log('Final result:', { warehouses, errors, validCount, totalCount });

          resolve({
            data: warehouses,
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
  static exportTemplate(filename = 'template-kho.xlsx') {
    try {
      const templateData = [
        {
          'Mã Kho': 'KHO001',
          'Tên Kho': 'Kho chính Hà Nội',
          'Địa Chỉ': '123 Đường ABC, Quận 1, Hà Nội',
          'Hình Ảnh': '',
          'Ghi Chú': 'Kho chính của công ty',
          'Thủ Kho': 'Nguyễn Văn A'
        }
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(templateData);

      // Set column widths
      ws['!cols'] = [
        { wch: 15 }, { wch: 25 }, { wch: 40 }, 
        { wch: 30 }, { wch: 30 }, { wch: 20 }
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
      'MaKho': ['mã kho', 'ma kho', 'makho', 'code', 'id'],
      'TenKho': ['tên kho', 'ten kho', 'tenkho', 'name', 'title'],
      'DiaChi': ['địa chỉ', 'dia chi', 'diachi', 'address', 'location'],
      'HinhAnh': ['hình ảnh', 'hinh anh', 'hinhanh', 'image', 'photo', 'picture'],
      'GhiChu': ['ghi chú', 'ghi chu', 'ghichu', 'note', 'notes', 'comment'],
      'ThuKho': ['thủ kho', 'thu kho', 'thukho', 'manager', 'keeper']
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

  private static parseWarehouseRow(row: any[], mapping: Record<string, number>, rowNumber: number) {
    const errors: ExcelError[] = [];
    const warehouse: Partial<WarehouseFormData> = {
      MaKho: '',
      TenKho: '',
      DiaChi: '',
      HinhAnh: '',
      GhiChu: '',
      ThuKho: ''
    };

    // Parse các field
    Object.entries(mapping).forEach(([field, index]) => {
      const value = row[index];
      
      if (value !== undefined && value !== null && value !== '') {
        const stringValue = value.toString().trim();
        (warehouse as any)[field] = stringValue;
      }
    });

    // Validate required fields
    const requiredFields: (keyof WarehouseFormData)[] = ['MaKho', 'TenKho'];
    requiredFields.forEach(field => {
      const value = warehouse[field];
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
      data: errors.length === 0 ? warehouse as WarehouseFormData : null,
      errors
    };
  }
}
