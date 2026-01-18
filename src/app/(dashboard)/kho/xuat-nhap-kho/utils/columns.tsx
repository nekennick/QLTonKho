'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { NXKHO, NXKHODE } from '../types/inventory';

// Columns for main inventory table
export const inventoryColumns: ColumnDef<NXKHO>[] = [
  {
    accessorKey: 'MaPhieu',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 lg:px-3"
        >
          Mã Phiếu
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="font-medium text-blue-600">
          {row.getValue('MaPhieu')}
        </div>
      );
    },
  },
  {
    accessorKey: 'LoaiPhieu',
    header: 'Loại Phiếu',
    cell: ({ row }) => {
      const loaiPhieu = row.getValue('LoaiPhieu') as string;
      return (
        <Badge 
          variant={loaiPhieu === 'Nhập kho' ? 'default' : 'destructive'}
          className="text-xs"
        >
          {loaiPhieu}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'DiaChi',
    header: 'Địa Chỉ',
    cell: ({ row }) => {
      return (
        <div className="max-w-[200px] truncate" title={row.getValue('DiaChi')}>
          {row.getValue('DiaChi')}
        </div>
      );
    },
  },
  {
    accessorKey: 'Ngay',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 lg:px-3"
        >
          Ngày
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const ngay = row.getValue('Ngay') as string;
      return (
        <div className="text-sm">
          {new Date(ngay).toLocaleDateString('vi-VN')}
        </div>
      );
    },
  },
  {
    accessorKey: 'NhanVienDeNghi',
    header: 'Nhân Viên Đề Nghị',
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          {row.getValue('NhanVienDeNghi')}
        </div>
      );
    },
  },
  {
    accessorKey: 'Tu',
    header: 'Từ',
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          {row.getValue('Tu')}
        </div>
      );
    },
  },
  {
    accessorKey: 'Den',
    header: 'Đến',
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          {row.getValue('Den')}
        </div>
      );
    },
  },
  {
    accessorKey: 'TrangThai',
    header: 'Trạng Thái',
    cell: ({ row }) => {
      const trangThai = row.getValue('TrangThai') as string;
      const getStatusVariant = (status: string) => {
        switch (status) {
          case 'Mới':
            return 'secondary';
          case 'Chờ xác nhận':
            return 'outline';
          case 'Đã xác nhận':
            return 'default';
          case 'Đã hoàn thành':
            return 'default';
          case 'Hủy':
            return 'destructive';
          default:
            return 'secondary';
        }
      };
      
      return (
        <Badge variant={getStatusVariant(trangThai)} className="text-xs">
          {trangThai}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const inventory = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(inventory.MaPhieu)}
            >
              Sao chép mã phiếu
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Package className="mr-2 h-4 w-4" />
              Xem sản phẩm
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Columns for inventory details table
export const inventoryDetailColumns: ColumnDef<NXKHODE>[] = [
  {
    accessorKey: 'MaPhieuDe',
    header: 'Mã Chi Tiết',
    cell: ({ row }) => {
      return (
        <div className="font-mono text-xs text-gray-600">
          {row.getValue('MaPhieuDe')}
        </div>
      );
    },
  },
  {
    accessorKey: 'MaVT',
    header: 'Mã VT',
    cell: ({ row }) => {
      return (
        <div className="font-medium text-blue-600">
          {row.getValue('MaVT')}
        </div>
      );
    },
  },
  {
    accessorKey: 'TenVT',
    header: 'Tên Vật Tư',
    cell: ({ row }) => {
      return (
        <div className="max-w-[200px] truncate" title={row.getValue('TenVT')}>
          {row.getValue('TenVT')}
        </div>
      );
    },
  },
  {
    accessorKey: 'ĐVT',
    header: 'ĐVT',
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="text-xs">
          {row.getValue('ĐVT')}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'SoLuong',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 lg:px-3"
        >
          Số Lượng
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const soLuong = row.getValue('SoLuong') as number;
      return (
        <div className="text-right font-medium">
          {soLuong.toLocaleString('vi-VN')}
        </div>
      );
    },
  },
  {
    accessorKey: 'ChatLuong',
    header: 'Chất Lượng',
    cell: ({ row }) => {
      const chatLuong = row.getValue('ChatLuong') as string;
      const getQualityVariant = (quality: string) => {
        switch (quality) {
          case 'Tốt':
            return 'default';
          case 'Trung bình':
            return 'secondary';
          case 'Kém':
            return 'outline';
          case 'Hỏng':
            return 'destructive';
          default:
            return 'secondary';
        }
      };
      
      return (
        <Badge variant={getQualityVariant(chatLuong)} className="text-xs">
          {chatLuong}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'DonGia',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 lg:px-3"
        >
          Đơn Giá
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const donGia = row.getValue('DonGia') as number;
      return (
        <div className="text-right font-medium">
          {donGia.toLocaleString('vi-VN')} ₫
        </div>
      );
    },
  },
  {
    accessorKey: 'ThanhTien',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 lg:px-3"
        >
          Thành Tiền
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const thanhTien = row.getValue('ThanhTien') as number;
      return (
        <div className="text-right font-bold text-green-600">
          {thanhTien.toLocaleString('vi-VN')} ₫
        </div>
      );
    },
  },
  {
    accessorKey: 'GhiChu',
    header: 'Ghi Chú',
    cell: ({ row }) => {
      return (
        <div className="max-w-[150px] truncate" title={row.getValue('GhiChu')}>
          {row.getValue('GhiChu')}
        </div>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const detail = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(detail.MaPhieuDe)}
            >
              Sao chép mã chi tiết
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
