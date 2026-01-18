export interface NXKHO {
  MaPhieu: string;
  LoaiPhieu: string;
  DiaChi: string;
  Ngay: string;
  NhanVienDeNghi: string;
  Tu: string;
  Den: string;
  GhiChu: string;
  LichSu: string;
  TrangThai: string;
  NhanVienKho: string;
  [key: string]: any;
}

export interface NXKHODE {
  MaPhieuDe: string;
  MaPhieu: string;
  MaVT: string;
  TenVT: string;
  ĐVT: string;
  SoLuong: number;
  ChatLuong: string;
  DonGia: number;
  ThanhTien: number;
  GhiChu: string;
  [key: string]: any;
}

export interface InventoryFormData {
  MaPhieu: string;
  LoaiPhieu: string;
  DiaChi: string;
  Ngay: string;
  NhanVienDeNghi: string;
  Tu: string;
  Den: string;
  GhiChu: string;
  LichSu: string;
  TrangThai: string;
  NhanVienKho: string;
}

export interface InventoryDetailFormData {
  MaPhieuDe: string;
  MaPhieu: string;
  MaVT: string;
  TenVT: string;
  ĐVT: string;
  SoLuong: number;
  ChatLuong: string;
  DonGia: number;
  ThanhTien: number;
  GhiChu: string;
}

export interface InventoryWithDetails extends NXKHO {
  details: NXKHODE[];
}
