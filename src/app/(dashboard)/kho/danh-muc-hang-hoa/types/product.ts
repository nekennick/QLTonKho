export interface Product {
  MaVT: string;
  TenVT: string;
  NhomVT: string;
  HinhAnh: string;
  ĐVT: string;
  NoiSX: string;
  ChatLuong: string;
  DonGia: string;
  GhiChu: string;
  TonKiemKe?: string; // Cột ảo - Tồn Kiểm kê
  NgayKiemKeCuoi?: string; // Cột ảo - Ngày kiểm kê cuối
  TongNhap?: number; // Tổng nhập - từ server tính toán
  TongXuat?: number; // Tổng xuất - từ server tính toán
  TonApp?: number; // Tồn App - từ server tính toán
  SoLuongTon?: number; // Số lượng tồn - từ kiểm kê gần nhất
  NgayKiemKe?: string; // Ngày kiểm kê gần nhất (dd/MM/yyyy)
  [key: string]: any;
}

export interface ProductFormData {
  MaVT: string;
  TenVT: string;
  NhomVT: string;
  HinhAnh: string;
  ĐVT: string;
  NoiSX: string;
  ChatLuong: string;
  DonGia: string;
  GhiChu: string;
}
