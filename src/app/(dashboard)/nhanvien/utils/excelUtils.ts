'use client';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { Employee, EmployeeFormData } from '../types/employee';

export interface ExcelPreviewData {
  data: EmployeeFormData[];
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
  // Xuất Excel (không có password)
  static exportToExcel(employees: Employee[], filename = 'danh-sach-nhan-vien.xlsx') {
    try {
      // Chuẩn bị dữ liệu export (loại bỏ password)
    const exportData = employees.map((emp, index) => ({
  'STT': index + 1,
  'Username': emp['username'] || '',
  'Họ và Tên': emp['Họ và Tên'] || '',
  'Chức vụ': emp['Chức vụ'] || '',
  'Phòng': emp['Phòng'] || '',
  'Phân quyền': emp['Phân quyền'] || '',
  'Email': emp['Email'] || '',
  'Image': emp['Image'] || '',
  'Quyền View': emp['Quyền View'] || '',
  'Số điện thoại': emp['Số điện thoại'] || '',
  'Địa chỉ': emp['Địa chỉ'] || '',
  'Ngày sinh': emp['Ngày sinh'] ? this.formatDateForExcel(emp['Ngày sinh']) : '',
  'Ngày vào làm': emp['Ngày vào làm'] ? this.formatDateForExcel(emp['Ngày vào làm']) : '',
  'Ghi chú': emp['Ghi chú'] || ''
}));

      // Tạo workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 5 },   // STT
        { wch: 15 },  // Username
        { wch: 25 },  // Họ và Tên
        { wch: 20 },  // Chức vụ
        { wch: 20 },  // Phòng
        { wch: 12 },  // Phân quyền
        { wch: 30 },  // Email
        { wch: 30 },  // Image
        { wch: 30 },  // Quyền View
        { wch: 15 },  // Số điện thoại
        { wch: 40 },  // Địa chỉ
        { wch: 12 },  // Ngày sinh
        { wch: 12 },  // Ngày vào làm
        { wch: 30 }   // Ghi chú
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Nhân viên');

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

          console.log('Raw Excel data:', jsonData); // Debug log

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
          console.log('Headers:', headers); // Debug log
          
          const headerMapping = this.createHeaderMapping(headers);
          console.log('Header mapping:', headerMapping); // Debug log
          
          const employees: EmployeeFormData[] = [];
          const errors: ExcelError[] = [];
          
          // Xử lý từng dòng dữ liệu
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            console.log(`Processing row ${i + 1}:`, row); // Debug log
            
            const employee = this.parseEmployeeRow(row, headerMapping, i + 1);
            console.log(`Parsed employee:`, employee); // Debug log
            
            if (employee.data) {
              employees.push(employee.data);
            }
            
            if (employee.errors.length > 0) {
              errors.push(...employee.errors);
            }
          }

          const validCount = employees.length;
          const totalCount = jsonData.length - 1;

          console.log('Final result:', { employees, errors, validCount, totalCount }); // Debug log

          resolve({
            data: employees,
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
  static exportTemplate(filename = 'template-nhan-vien.xlsx') {
    try {
      const templateData = [
        {
          'Username': 'nguyenvana',
          'Họ và Tên': 'Nguyễn Văn A',
          'Chức vụ': 'Nhân viên',
          'Phòng': 'IT',
          'Phân quyền': 'Nhân viên',
          'Email': 'nguyenvana@company.com',
          'Image': '',
          'Quyền View': 'Dashboard, Profile',
          'Số điện thoại': '0987654321',
          'Địa chỉ': '123 Đường ABC, Quận 1, TP.HCM',
          'Ngày sinh': '1990-01-01',
          'Ngày vào làm': '2023-01-01',
          'Ghi chú': 'Nhân viên mẫu'
        }
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(templateData);

      // Set column widths
      ws['!cols'] = [
        { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, 
        { wch: 12 }, { wch: 30 }, { wch: 30 }, { wch: 30 },
        { wch: 15 }, { wch: 40 }, { wch: 12 }, { wch: 12 },
        { wch: 30 }
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
  private static formatDateForExcel(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  }

 private static createHeaderMapping(headers: any[]): Record<string, number> {
  const mapping: Record<string, number> = {};
  
  const fieldMapping = {
    'username': ['username', 'tên đăng nhập', 'login', 'user name'],
    'Họ và Tên': ['họ và tên', 'họ tên', 'fullname', 'name'],
    'Chức vụ': ['chức vụ', 'position', 'title'],
    'Phòng': ['phòng', 'phòng ban', 'department'],
    'Phân quyền': ['phân quyền', 'role', 'quyền', 'roles'],
    'Email': ['email', 'mail', 'e-mail'],
    'Image': ['image', 'ảnh', 'avatar', 'hình ảnh'],
    'Quyền View': ['quyền view', 'quyền xem', 'permissions'],
    'Số điện thoại': ['số điện thoại', 'điện thoại', 'phone', 'sdt'],
    'Địa chỉ': ['địa chỉ', 'address', 'dia chi'],
    'Ngày sinh': ['ngày sinh', 'birthday', 'birth date', 'ngay sinh'],
    'Ngày vào làm': ['ngày vào làm', 'ngày làm việc', 'start date', 'join date'],
    'Ghi chú': ['ghi chú', 'note', 'notes', 'comment', 'ghi chu']
  };

    headers.forEach((header, index) => {
      if (!header) return;
      
      const normalizedHeader = header.toString().toLowerCase().trim();
      console.log(`Checking header "${normalizedHeader}" at index ${index}`); // Debug log
      
      Object.entries(fieldMapping).forEach(([field, alternatives]) => {
        // Kiểm tra exact match trước
        if (alternatives.some(alt => normalizedHeader === alt)) {
          mapping[field] = index;
          console.log(`Mapped "${field}" to index ${index} (exact match)`); // Debug log
        }
        // Sau đó kiểm tra contains
        else if (alternatives.some(alt => normalizedHeader.includes(alt))) {
          if (!mapping[field]) { // Chỉ map nếu chưa có exact match
            mapping[field] = index;
            console.log(`Mapped "${field}" to index ${index} (contains match)`); // Debug log
          }
        }
      });
    });

    console.log('Final mapping:', mapping); // Debug log
    return mapping;
  }

 private static parseEmployeeRow(row: any[], mapping: Record<string, number>, rowNumber: number) {
  const errors: ExcelError[] = [];
  const employee: Partial<EmployeeFormData> = {
    'username': '',
    'password': '123', // Mật khẩu mặc định cho nhân viên mới
    'Họ và Tên': '',
    'Chức vụ': '',
    'Phòng': '',
    'Phân quyền': 'Nhân viên',
    'Email': '',
    'Image': '',
    'Quyền View': '',
    'Số điện thoại': '',
    'Địa chỉ': '',
    'Ngày sinh': '',
    'Ngày vào làm': '',
    'Ghi chú': ''
  };

  // Parse các field với validation đặc biệt
  Object.entries(mapping).forEach(([field, index]) => {
    const value = row[index];
    
    if (value !== undefined && value !== null && value !== '') {
      const stringValue = value.toString().trim();
      
      switch (field) {
        case 'Phân quyền':
          const validRoles = ['Admin', 'Giám đốc', 'Quản lý', 'Nhân viên'];
          const normalizedRole = stringValue.trim();
          
          if (validRoles.includes(normalizedRole)) {
            (employee as any)[field] = normalizedRole;
          } else {
            const matchedRole = validRoles.find(role => 
              role.toLowerCase() === normalizedRole.toLowerCase()
            );
            
            if (matchedRole) {
              (employee as any)[field] = matchedRole;
            } else {
              errors.push({
                row: rowNumber,
                field,
                message: `Phân quyền không hợp lệ. Chỉ chấp nhận: ${validRoles.join(', ')}`,
                value: stringValue
              });
              (employee as any)[field] = 'Nhân viên';
            }
          }
          break;
          
        case 'Email':
          if (this.isValidEmail(stringValue)) {
            (employee as any)[field] = stringValue;
          } else {
            errors.push({
              row: rowNumber,
              field,
              message: 'Email không hợp lệ',
              value: stringValue
            });
          }
          break;
          
        case 'Ngày sinh':
        case 'Ngày vào làm':
          const parsedDate = this.parseDate(stringValue);
          if (parsedDate) {
            (employee as any)[field] = parsedDate;
          } else {
            errors.push({
              row: rowNumber,
              field,
              message: 'Định dạng ngày không hợp lệ (DD/MM/YYYY hoặc YYYY-MM-DD)',
              value: stringValue
            });
          }
          break;
          
        default:
          (employee as any)[field] = stringValue;
      }
    }
  });

  // Validate required fields
  const requiredFields: (keyof EmployeeFormData)[] = ['Họ và Tên', 'username', 'Email'];
  requiredFields.forEach(field => {
    const value = employee[field];
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
    data: errors.length === 0 ? employee as EmployeeFormData : null,
    errors
  };
}

  private static parseDate(value: string): string {
    if (!value) return '';
    
    // Thử các định dạng khác nhau
    const formats = [
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // DD/MM/YYYY
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // DD-MM-YYYY
      /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/, // DD.MM.YYYY
    ];

    for (const format of formats) {
      const match = value.match(format);
      if (match) {
        let year, month, day;
        
        if (format === formats[0]) { // YYYY-MM-DD
          [, year, month, day] = match;
        } else { // DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
          [, day, month, year] = match;
        }
        
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
    }

    // Thử parse trực tiếp
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }

    return '';
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}