'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle,
  XCircle,
  Eye,
  Printer,
  User,
  Package,
  Calendar,
  MapPin,
  Edit
} from 'lucide-react';
import type { NXKHO } from '../../xuat-nhap-kho/types/inventory';

interface MobileApprovalCardProps {
  inventory: NXKHO;
  onViewDetails: (inventory: NXKHO) => void;
  onApprove: (inventory: NXKHO) => void;
  onReject: (inventory: NXKHO) => void;
  onPrint: (inventory: NXKHO) => void;
  onEdit: (inventory: NXKHO) => void;
}

export default function MobileApprovalCard({
  inventory,
  onViewDetails,
  onApprove,
  onReject,
  onPrint,
  onEdit
}: MobileApprovalCardProps) {
  const handleViewDetails = useCallback(() => {
    onViewDetails(inventory);
  }, [inventory, onViewDetails]);

  const handleApprove = useCallback(() => {
    onApprove(inventory);
  }, [inventory, onApprove]);

  const handleReject = useCallback(() => {
    onReject(inventory);
  }, [inventory, onReject]);

  const handlePrint = useCallback(() => {
    onPrint(inventory);
  }, [inventory, onPrint]);

  const handleEdit = useCallback(() => {
    onEdit(inventory);
  }, [inventory, onEdit]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Chờ xác nhận':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Đã duyệt':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Từ chối':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Nhập kho':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Xuất kho':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="p-2 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-0">
        <div className="space-y-3">
          {/* Header with badges and date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline"
                className={`text-xs ${getStatusColor(inventory.TrangThai)}`}
              >
                {inventory.TrangThai}
              </Badge>
              <Badge 
                variant="outline"
                className={`text-xs ${getTypeColor(inventory.LoaiPhieu)}`}
              >
                {inventory.LoaiPhieu}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              {new Date(inventory.Ngay).toLocaleDateString('vi-VN')}
            </div>
          </div>

          {/* Main content */}
          <div className="space-y-2">
            {/* Phiếu code */}
            <div className="font-semibold text-base text-gray-900">
              {inventory.MaPhieu}
            </div>

            {/* Nhân viên đề nghị */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4 text-gray-400" />
              <span>{inventory.NhanVienDeNghi}</span>
            </div>

            {/* Từ kho - Đến kho */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Package className="h-4 w-4 text-gray-400" />
              <span className="flex items-center gap-1">
                <span className="font-medium">{inventory.Tu}</span>
                <span className="text-gray-400">→</span>
                <span className="font-medium">{inventory.Den}</span>
              </span>
            </div>

            {/* Địa chỉ */}
            {inventory.DiaChi && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{inventory.DiaChi}</span>
              </div>
            )}

            {/* Ghi chú */}
            {inventory.GhiChu && (
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                <span className="font-medium">Ghi chú:</span> {inventory.GhiChu}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            {/* Primary action - View details */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleViewDetails}
              className="h-8 text-xs flex-1"
            >
              <Eye className="h-3 w-3 mr-1" />
              Xem chi tiết
            </Button>

            {/* Secondary actions */}
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="h-8 w-8 p-0"
              title="In phiếu"
            >
              <Printer className="h-3 w-3" />
            </Button>

            {/* Conditional actions for pending status */}
            {inventory.TrangThai === 'Chờ xác nhận' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleEdit}
                  className="h-8 w-8 p-0"
                  title="Chỉnh sửa"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleApprove}
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                  title="Duyệt phiếu"
                >
                  <CheckCircle className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReject}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  title="Từ chối phiếu"
                >
                  <XCircle className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
