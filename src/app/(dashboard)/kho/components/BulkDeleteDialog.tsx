'use client';

import React, { useState } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Warehouse } from '../types/warehouse';

interface BulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouses: Warehouse[];
  onConfirm: (maKhoList: string[]) => Promise<void>;
  isAdmin: boolean;
}

export const BulkDeleteDialog: React.FC<BulkDeleteDialogProps> = ({
  open,
  onOpenChange,
  warehouses,
  onConfirm,
  isAdmin
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  // Phân loại kho có thể xóa và không thể xóa
  const categorizedWarehouses = React.useMemo(() => {
    const canDelete: Warehouse[] = [];
    const cannotDelete: Warehouse[] = [];

    warehouses.forEach(warehouse => {
      // Có thể thêm logic kiểm tra kho có đang được sử dụng hay không
      canDelete.push(warehouse);
    });

    return { canDelete, cannotDelete };
  }, [warehouses, isAdmin]);

  const handleConfirm = async () => {
    if (categorizedWarehouses.canDelete.length === 0) {
      return;
    }

    setIsDeleting(true);
    try {
      const maKhoList = categorizedWarehouses.canDelete.map(warehouse => warehouse.MaKho);
      await onConfirm(maKhoList);
      onOpenChange(false);
    } catch (error) {
      console.error('Error in bulk delete:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Xác nhận xóa nhiều kho
          </DialogTitle>
          <DialogDescription>
            Bạn đang yêu cầu xóa {warehouses.length} kho. Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                <span className="font-medium">Sẽ bị xóa</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {categorizedWarehouses.canDelete.length}
              </p>
            </div>
            
            {categorizedWarehouses.cannotDelete.length > 0 && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">Không thể xóa</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {categorizedWarehouses.cannotDelete.length}
                </p>
              </div>
            )}
          </div>

          {/* Warning for protected warehouses */}
          {categorizedWarehouses.cannotDelete.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <p>Một số kho không thể xóa do đang được sử dụng hoặc hạn chế hệ thống.</p>
              </AlertDescription>
            </Alert>
          )}

          {/* Warehouse List */}
          <div className="flex-1 border rounded-lg overflow-hidden">
            <div className="overflow-auto max-h-96">
              <Table>
                <TableHeader className="sticky top-0 bg-white">
                  <TableRow>
                    <TableHead>Mã Kho</TableHead>
                    <TableHead>Tên Kho</TableHead>
                    <TableHead>Địa Chỉ</TableHead>
                    <TableHead>Thủ Kho</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Warehouses that can be deleted */}
                  {categorizedWarehouses.canDelete.map((warehouse) => (
                    <TableRow key={warehouse.MaKho} className="hover:bg-gray-50">
                      <TableCell>{warehouse.MaKho}</TableCell>
                      <TableCell>{warehouse.TenKho}</TableCell>
                      <TableCell>{warehouse.DiaChi}</TableCell>
                      <TableCell>{warehouse.ThuKho}</TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="text-xs">
                          Sẽ bị xóa
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Warehouses that cannot be deleted */}
                  {categorizedWarehouses.cannotDelete.map((warehouse) => (
                    <TableRow key={warehouse.MaKho} className="bg-orange-50 hover:bg-orange-100">
                      <TableCell>{warehouse.MaKho}</TableCell>
                      <TableCell>{warehouse.TenKho}</TableCell>
                      <TableCell>{warehouse.DiaChi}</TableCell>
                      <TableCell>{warehouse.ThuKho}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          Được bảo vệ
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting || categorizedWarehouses.canDelete.length === 0}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa {categorizedWarehouses.canDelete.length} kho
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
