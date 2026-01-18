'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Printer,
  Clock,
  User,
  Calendar,
  Package,
  Edit
} from 'lucide-react';
import type { NXKHO } from '../../xuat-nhap-kho/types/inventory';

interface ActionHandlers {
  onViewDetails: (inventory: NXKHO) => void;
  onApprove: (inventory: NXKHO) => void;
  onReject: (inventory: NXKHO) => void;
  onPrint: (inventory: NXKHO) => void;
  onEdit: (inventory: NXKHO) => void;
}

export const columns = (handlers: ActionHandlers): ColumnDef<NXKHO>[] => [
  {
    accessorKey: 'MaPhieu',
    header: 'Mã Phiếu',
    cell: ({ row }) => {
      const inventory = row.original;
      return (
        <div className="font-mono text-sm font-medium">
          {inventory.MaPhieu}
        </div>
      );
    },
  },
  {
    accessorKey: 'LoaiPhieu',
    header: 'Loại Phiếu',
    cell: ({ row }) => {
      const inventory = row.original;
      const isImport = inventory.LoaiPhieu === 'Nhập kho';
      return (
        <Badge 
          variant={isImport ? 'default' : 'secondary'}
          className={`text-xs ${
            isImport 
              ? 'bg-blue-100 text-blue-800 border-blue-200' 
              : 'bg-green-100 text-green-800 border-green-200'
          }`}
        >
          <Package className="h-3 w-3 mr-1" />
          {inventory.LoaiPhieu}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'TrangThai',
    header: 'Trạng Thái',
    cell: ({ row }) => {
      const inventory = row.original;
      const getStatusIcon = (status: string) => {
        switch (status) {
          case 'Đã duyệt':
            return <CheckCircle className="h-3 w-3 text-green-600" />;
          case 'Từ chối':
            return <XCircle className="h-3 w-3 text-red-600" />;
          case 'Chờ xác nhận':
            return <Clock className="h-3 w-3 text-yellow-600" />;
          default:
            return <Clock className="h-3 w-3 text-gray-600" />;
        }
      };

      const getStatusColor = (status: string) => {
        switch (status) {
          case 'Đã duyệt':
            return 'bg-green-100 text-green-800 border-green-200';
          case 'Từ chối':
            return 'bg-red-100 text-red-800 border-red-200';
          case 'Chờ xác nhận':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
          default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
        }
      };

      return (
        <Badge className={`text-xs flex items-center gap-1 ${getStatusColor(inventory.TrangThai)}`}>
          {getStatusIcon(inventory.TrangThai)}
          {inventory.TrangThai}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'NhanVienDeNghi',
    header: 'Người Đề Nghị',
    cell: ({ row }) => {
      const inventory = row.original;
      return (
        <div className="flex items-center gap-2">
          <User className="h-3 w-3 text-gray-500" />
          <span className="text-sm">{inventory.NhanVienDeNghi}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'Ngay',
    header: 'Ngày Tạo',
    cell: ({ row }) => {
      const inventory = row.original;
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3 text-gray-500" />
          <span className="text-sm">
            {new Date(inventory.Ngay).toLocaleDateString('vi-VN')}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'Tu',
    header: 'Từ Kho',
    cell: ({ row }) => {
      const inventory = row.original;
      return (
        <div className="text-sm font-medium">
          {inventory.Tu}
        </div>
      );
    },
  },
  {
    accessorKey: 'Den',
    header: 'Đến Kho',
    cell: ({ row }) => {
      const inventory = row.original;
      return (
        <div className="text-sm font-medium">
          {inventory.Den}
        </div>
      );
    },
  },
  {
    accessorKey: 'NhanVienKho',
    header: 'Thủ Kho',
    cell: ({ row }) => {
      const inventory = row.original;
      return (
        <div className="text-sm">
          {inventory.NhanVienKho || '-'}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Thao Tác',
    cell: ({ row }) => {
      const inventory = row.original;
      const isPending = inventory.TrangThai === 'Chờ xác nhận';
      const isApproved = inventory.TrangThai === 'Đã duyệt';
      const isRejected = inventory.TrangThai === 'Từ chối';

      return (
        <div className="flex items-center gap-1">
          {/* View Details Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlers.onViewDetails(inventory)}
            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
            title="Xem chi tiết"
          >
            <Eye className="h-3 w-3" />
          </Button>

          {/* Print Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlers.onPrint(inventory)}
            className="h-8 w-8 p-0 hover:bg-gray-50 hover:text-gray-600"
            title="In phiếu"
          >
            <Printer className="h-3 w-3" />
          </Button>

          {/* Edit Button - Only show for pending */}
          {isPending && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlers.onEdit(inventory)}
              className="h-8 w-8 p-0 hover:bg-orange-50 hover:text-orange-600"
              title="Sửa phiếu"
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}

          {/* Approve Button - Only show for pending */}
          {isPending && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlers.onApprove(inventory)}
              className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
              title="Duyệt phiếu"
            >
              <CheckCircle className="h-3 w-3" />
            </Button>
          )}

          {/* Reject Button - Only show for pending */}
          {isPending && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlers.onReject(inventory)}
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
              title="Từ chối phiếu"
            >
              <XCircle className="h-3 w-3" />
            </Button>
          )}

          {/* Status indicators for non-pending */}
          {isApproved && (
            <div className="h-8 w-8 flex items-center justify-center" title="Đã duyệt">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          )}

          {isRejected && (
            <div className="h-8 w-8 flex items-center justify-center" title="Đã từ chối">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
          )}
        </div>
      );
    },
  },
];
