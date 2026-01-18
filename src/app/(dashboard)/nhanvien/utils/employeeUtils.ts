// utils/employeeUtils.ts
'use client';

interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
}

export class EmployeeUtils {

  // Lấy danh sách ngân hàng từ API
  static async fetchBanks(): Promise<Bank[]> {
    try {
      const response = await fetch('https://api.vietqr.io/v2/banks');
      const data = await response.json();
      
      if (data.code === "00" && data.data) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching banks:', error);
      return [];
    }
  }

  // Format tên ngân hàng theo yêu cầu: (bin) shortName
  static formatBankName(bank: Bank): string {
    return `(${bank.bin}) ${bank.shortName}`;
  }

  // Tạo lịch sử thay đổi
  static createHistoryEntry(
    oldData: any,
    newData: any,
    changedBy: string,
    action: 'create' | 'update' | 'salary_change'
  ): string {
    const now = new Date();
    const dateStr = now.toLocaleString('vi-VN');
    
    if (action === 'create') {
      return `[${dateStr}] Tạo mới bởi ${changedBy}`;
    }
    
    if (action === 'salary_change') {
      return `[${dateStr}] Thay đổi bậc lương từ "${oldData['Bậc lương']}" thành "${newData['Bậc lương']}" bởi ${changedBy}`;
    }
    
    // Tìm các trường đã thay đổi
    const changes: string[] = [];
    const fieldsToCheck = [
      'Họ và Tên', 'Email', 'Số điện thoại', 'Địa chỉ',
      'Chức vụ', 'Phòng', 'Khu vực', 'Trạng thái',
      'Phân quyền', 'Số tài khoản', 'Mở tại ngân hàng'
    ];
    
    fieldsToCheck.forEach(field => {
      if (oldData[field] !== newData[field]) {
        changes.push(`${field}: "${oldData[field] || ''}" → "${newData[field] || ''}"`);
      }
    });
    
    if (changes.length === 0) return oldData['Lịch sử'] || '';
    
    const changeStr = changes.join(', ');
    const newEntry = `[${dateStr}] Cập nhật ${changeStr} bởi ${changedBy}`;
    
    // Thêm vào lịch sử cũ
    const oldHistory = oldData['Lịch sử'] || '';
    return oldHistory ? `${oldHistory}\n${newEntry}` : newEntry;
  }
}