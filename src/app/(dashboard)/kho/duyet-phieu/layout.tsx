import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Duyệt Phiếu Xuất Nhập Kho',
  description: 'Quản lý và duyệt các phiếu xuất nhập kho cho thủ kho',
  keywords: ['duyệt phiếu', 'xuất nhập kho', 'thủ kho', 'quản lý kho'],
};

export default function DuyetPhieuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
