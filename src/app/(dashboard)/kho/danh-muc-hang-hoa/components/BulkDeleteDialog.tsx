'use client';

import React, { useState, useMemo } from 'react';
import { Trash2, AlertTriangle, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Product } from '../types/product';

interface BulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onConfirm: (maVTList: string[]) => Promise<void>;
  isAdmin: boolean;
}

export const BulkDeleteDialog: React.FC<BulkDeleteDialogProps> = ({
  open,
  onOpenChange,
  products,
  onConfirm,
  isAdmin
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  // Phân loại sản phẩm có thể xóa và không thể xóa
  const { canDelete, cannotDelete } = useMemo(() => {
    const canDeleteList: Product[] = [];
    const cannotDeleteList: Product[] = [];

    products.forEach(product => {
      // Logic kiểm tra có thể xóa hay không
      // Ví dụ: chỉ Admin mới có thể xóa tất cả
      if (isAdmin) {
        canDeleteList.push(product);
      } else {
        // Non-admin không thể xóa một số sản phẩm đặc biệt
        cannotDeleteList.push(product);
      }
    });

    return {
      canDelete: canDeleteList,
      cannotDelete: cannotDeleteList
    };
  }, [products, isAdmin]);

  const handleConfirm = async () => {
    if (canDelete.length === 0) return;

    setIsDeleting(true);
    try {
      const maVTList = canDelete.map(product => product.MaVT);
      await onConfirm(maVTList);
      onOpenChange(false);
    } catch (error) {
      console.error('Bulk delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Xác nhận xóa hàng loạt
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa {products.length} hàng hóa đã chọn?
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Trash2 className="h-5 w-5 text-red-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-red-900">Sẽ xóa</p>
                  <p className="text-2xl font-bold text-red-600">{canDelete.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">Không thể xóa</p>
                  <p className="text-2xl font-bold text-yellow-600">{cannotDelete.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến các hàng hóa này sẽ bị xóa vĩnh viễn.
            </AlertDescription>
          </Alert>

          {/* Cannot Delete Items */}
          {cannotDelete.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-yellow-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Không thể xóa ({cannotDelete.length})
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã VT</TableHead>
                      <TableHead>Tên VT</TableHead>
                      <TableHead>Lý do</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cannotDelete.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{product.MaVT}</TableCell>
                        <TableCell>{product.TenVT}</TableCell>
                        <TableCell>
                          {!isAdmin ? 'Cần quyền Admin để xóa' : 'Không xác định'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            <X className="h-3 w-3 mr-1" />
                            Không thể xóa
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Can Delete Items */}
          {canDelete.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-red-800 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Sẽ bị xóa ({canDelete.length})
              </h3>
              <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã VT</TableHead>
                      <TableHead>Tên VT</TableHead>
                      <TableHead>Nhóm VT</TableHead>
                      <TableHead>Đơn giá</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {canDelete.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{product.MaVT}</TableCell>
                        <TableCell>{product.TenVT}</TableCell>
                        <TableCell>{product.NhomVT}</TableCell>
                        <TableCell>{product.DonGia}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Sẽ xóa
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            <X className="mr-2 h-4 w-4" />
            Hủy
          </Button>
          
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting || canDelete.length === 0}
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Xác nhận xóa {canDelete.length} hàng hóa
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
