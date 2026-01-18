import * as XLSX from 'xlsx';
import type { NXKHO, NXKHODE, InventoryFormData, InventoryDetailFormData } from '../types/inventory';

// Export inventory data to Excel
export const exportInventoryToExcel = (inventories: NXKHO[], details: NXKHODE[]) => {
  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Prepare main inventory data
  const inventoryData = inventories.map(inv => ({
    'Mã Phiếu': inv.MaPhieu,
    'Loại Phiếu': inv.LoaiPhieu,
    'Địa Chỉ': inv.DiaChi,
    'Ngày': new Date(inv.Ngay).toLocaleDateString('vi-VN'),
    'Nhân Viên Đề Nghị': inv.NhanVienDeNghi,
    'Từ': inv.Tu,
    'Đến': inv.Den,
    'Ghi Chú': inv.GhiChu,
    'Lịch Sử': inv.LichSu,
    'Trạng Thái': inv.TrangThai,
    'Nhân Viên Kho': inv.NhanVienKho
  }));

  // Prepare detail data
  const detailData = details.map(detail => ({
    'Mã Chi Tiết': detail.MaPhieuDe,
    'Mã Phiếu': detail.MaPhieu,
    'Mã VT': detail.MaVT,
    'Tên VT': detail.TenVT,
    'ĐVT': detail.ĐVT,
    'Số Lượng': detail.SoLuong,
    'Chất Lượng': detail.ChatLuong,
    'Đơn Giá': detail.DonGia,
    'Thành Tiền': detail.ThanhTien,
    'Ghi Chú': detail.GhiChu
  }));

  // Create worksheets
  const inventorySheet = XLSX.utils.json_to_sheet(inventoryData);
  const detailSheet = XLSX.utils.json_to_sheet(detailData);

  // Add worksheets to workbook
  XLSX.utils.book_append_sheet(workbook, inventorySheet, 'Phiếu Xuất Nhập Kho');
  XLSX.utils.book_append_sheet(workbook, detailSheet, 'Chi Tiết Phiếu');

  // Generate filename
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  const filename = `XuatNhapKho_${dateStr}.xlsx`;

  // Save file
  XLSX.writeFile(workbook, filename);
};

// Import inventory data from Excel
export const importInventoryFromExcel = (file: File): Promise<{
  inventories: InventoryFormData[];
  details: InventoryDetailFormData[];
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const inventories: InventoryFormData[] = [];
        const details: InventoryDetailFormData[] = [];
        
        // Read inventory sheet
        if (workbook.SheetNames.includes('Phiếu Xuất Nhập Kho')) {
          const inventorySheet = workbook.Sheets['Phiếu Xuất Nhập Kho'];
          const inventoryJson = XLSX.utils.sheet_to_json(inventorySheet);
          
          inventoryJson.forEach((row: any) => {
            inventories.push({
              MaPhieu: row['Mã Phiếu'] || '',
              LoaiPhieu: row['Loại Phiếu'] || '',
              DiaChi: row['Địa Chỉ'] || '',
              Ngay: row['Ngày'] ? new Date(row['Ngày']).toISOString().slice(0, 16) : '',
              NhanVienDeNghi: row['Nhân Viên Đề Nghị'] || '',
              Tu: row['Từ'] || '',
              Den: row['Đến'] || '',
              GhiChu: row['Ghi Chú'] || '',
              LichSu: row['Lịch Sử'] || '',
              TrangThai: row['Trạng Thái'] || '',
              NhanVienKho: row['Nhân Viên Kho'] || ''
            });
          });
        }
        
        // Read detail sheet
        if (workbook.SheetNames.includes('Chi Tiết Phiếu')) {
          const detailSheet = workbook.Sheets['Chi Tiết Phiếu'];
          const detailJson = XLSX.utils.sheet_to_json(detailSheet);
          
          detailJson.forEach((row: any) => {
            details.push({
              MaPhieuDe: row['Mã Chi Tiết'] || '',
              MaPhieu: row['Mã Phiếu'] || '',
              MaVT: row['Mã VT'] || '',
              TenVT: row['Tên VT'] || '',
              ĐVT: row['ĐVT'] || '',
              SoLuong: parseFloat(row['Số Lượng']) || 0,
              ChatLuong: row['Chất Lượng'] || '',
              DonGia: parseFloat(row['Đơn Giá']) || 0,
              ThanhTien: parseFloat(row['Thành Tiền']) || 0,
              GhiChu: row['Ghi Chú'] || ''
            });
          });
        }
        
        resolve({ inventories, details });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Lỗi khi đọc file'));
    reader.readAsArrayBuffer(file);
  });
};

// Create Excel template
export const createInventoryTemplate = () => {
  const workbook = XLSX.utils.book_new();
  
  // Template for main inventory
  const inventoryTemplate = [
    {
      'Mã Phiếu': 'NK240101001',
      'Loại Phiếu': 'Nhập kho',
      'Địa Chỉ': '123 Đường ABC, Quận 1, TP.HCM',
      'Ngày': '01/01/2024',
      'Nhân Viên Đề Nghị': 'NV001',
      'Từ': 'Nhà cung cấp ABC',
      'Đến': 'Kho chính',
      'Ghi Chú': 'Nhập hàng đầu tháng',
      'Lịch Sử': '',
      'Trạng Thái': 'Mới',
      'Nhân Viên Kho': 'NV002'
    }
  ];
  
  // Template for details
  const detailTemplate = [
    {
      'Mã Chi Tiết': 'NK240101001_001',
      'Mã Phiếu': 'NK240101001',
      'Mã VT': 'VT001',
      'Tên VT': 'Vật tư mẫu',
      'ĐVT': 'Cái',
      'Số Lượng': 100,
      'Chất Lượng': 'Tốt',
      'Đơn Giá': 50000,
      'Thành Tiền': 5000000,
      'Ghi Chú': 'Hàng mới'
    }
  ];
  
  const inventorySheet = XLSX.utils.json_to_sheet(inventoryTemplate);
  const detailSheet = XLSX.utils.json_to_sheet(detailTemplate);
  
  XLSX.utils.book_append_sheet(workbook, inventorySheet, 'Phiếu Xuất Nhập Kho');
  XLSX.utils.book_append_sheet(workbook, detailSheet, 'Chi Tiết Phiếu');
  
  const filename = 'Mau_XuatNhapKho.xlsx';
  XLSX.writeFile(workbook, filename);
};
