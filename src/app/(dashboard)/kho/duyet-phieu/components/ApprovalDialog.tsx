'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { CheckCircle, XCircle, FileText, User, Calendar, Package, List } from 'lucide-react';
import type { NXKHO, NXKHODE } from '../../xuat-nhap-kho/types/inventory';

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory: NXKHO | null;
  inventoryDetails: NXKHODE[];
  onSubmit: (action: 'approve' | 'reject', notes?: string) => void;
}

export function ApprovalDialog({ open, onOpenChange, inventory, inventoryDetails, onSubmit }: ApprovalDialogProps) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (action: 'approve' | 'reject') => {
    if (!inventory) return;

    setIsSubmitting(true);
    try {
      await onSubmit(action, notes.trim() || undefined);
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNotes('');
    onOpenChange(false);
  };

  if (!inventory) return null;

  // Calculate totals
  const totalQuantity = inventoryDetails.reduce((sum, detail) => sum + Number(detail.SoLuong), 0);
  const totalAmount = inventoryDetails.reduce((sum, detail) => sum + Number(detail.ThanhTien), 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Duyệt Phiếu Xuất Nhập Kho
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Inventory Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{inventory.MaPhieu}</h3>
              <Badge 
                variant={inventory.TrangThai === 'Chờ xác nhận' ? 'secondary' : 
                        inventory.TrangThai === 'Đã duyệt' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {inventory.TrangThai}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Loại phiếu:</span>
                <span>{inventory.LoaiPhieu}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Người đề nghị:</span>
                <span>{inventory.NhanVienDeNghi}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Ngày tạo:</span>
                <span>{new Date(inventory.Ngay).toLocaleDateString('vi-VN')}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Từ kho:</span>
                <span>{inventory.Tu}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Đến kho:</span>
                <span>{inventory.Den}</span>
              </div>
              
              {inventory.DiaChi && (
                <div className="md:col-span-2">
                  <span className="font-medium">Địa chỉ:</span>
                  <span className="ml-2">{inventory.DiaChi}</span>
                </div>
              )}
              
              {inventory.GhiChu && (
                <div className="md:col-span-2">
                  <span className="font-medium">Ghi chú:</span>
                  <span className="ml-2">{inventory.GhiChu}</span>
                </div>
              )}
            </div>
          </div>

          {/* Materials List */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <List className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-lg">Danh sách vật tư</h4>
              <Badge variant="outline" className="text-xs">
                {inventoryDetails.length} mặt hàng
              </Badge>
            </div>
            
            {inventoryDetails.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">STT</TableHead>
                        <TableHead>Mã VT</TableHead>
                        <TableHead>Tên Vật Tư</TableHead>
                        <TableHead className="w-20">ĐVT</TableHead>
                        <TableHead className="w-24 text-right">Số Lượng</TableHead>
                        <TableHead className="w-24 text-right">Đơn Giá</TableHead>
                        <TableHead className="w-32 text-right">Thành Tiền</TableHead>
                        <TableHead className="w-20">Chất Lượng</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventoryDetails.map((detail, index) => (
                        <TableRow key={detail.MaPhieuDe}>
                          <TableCell className="text-center">{index + 1}</TableCell>
                          <TableCell className="font-mono text-sm">{detail.MaVT}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={detail.TenVT}>
                              {detail.TenVT}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-xs">
                              {detail.ĐVT}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {detail.SoLuong.toLocaleString('vi-VN')}
                          </TableCell>
                          <TableCell className="text-right">
                            ₫{detail.DonGia.toLocaleString('vi-VN')}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            ₫{detail.ThanhTien.toLocaleString('vi-VN')}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${
                                detail.ChatLuong === 'A' ? 'bg-green-100 text-green-800' :
                                detail.ChatLuong === 'B' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              {detail.ChatLuong}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="block sm:hidden space-y-2 p-3">
                  {inventoryDetails.map((detail, index) => (
                    <div key={detail.MaPhieuDe} className="border rounded-lg p-3 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs w-6 h-6 flex items-center justify-center p-0">
                            {index + 1}
                          </Badge>
                          <span className="font-mono text-xs text-gray-600">{detail.MaVT}</span>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            detail.ChatLuong === 'A' ? 'bg-green-100 text-green-800' :
                            detail.ChatLuong === 'B' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          {detail.ChatLuong}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-xs">
                        <div className="font-medium text-sm truncate" title={detail.TenVT}>
                          {detail.TenVT}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-gray-500">ĐVT:</span>
                            <Badge variant="outline" className="text-xs ml-1">
                              {detail.ĐVT}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-500">SL:</span>
                            <span className="font-medium ml-1">{detail.SoLuong.toLocaleString('vi-VN')}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-gray-500">Đơn giá:</span>
                            <span className="ml-1">₫{detail.DonGia.toLocaleString('vi-VN')}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-500">Thành tiền:</span>
                            <span className="font-semibold text-green-600 ml-1">₫{detail.ThanhTien.toLocaleString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="bg-blue-50 p-3 border-t">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="space-y-1">
                      <div className="text-xs sm:text-sm">
                        <span className="font-medium">Tổng số mặt hàng:</span>
                        <span className="ml-2 font-bold text-blue-600">{inventoryDetails.length}</span>
                      </div>
                      <div className="text-xs sm:text-sm">
                        <span className="font-medium">Tổng số lượng:</span>
                        <span className="ml-2 font-bold text-blue-600">{totalQuantity.toLocaleString('vi-VN')}</span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-xs sm:text-sm">
                        <span className="font-medium">Tổng thành tiền:</span>
                      </div>
                      <div className="text-lg sm:text-xl font-bold text-green-600">
                        ₫{totalAmount.toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border rounded-lg">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Không có chi tiết vật tư</p>
              </div>
            )}
          </div>

          {/* Notes Input */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
            <Textarea
              id="notes"
              placeholder="Nhập ghi chú cho việc duyệt/từ chối phiếu..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          
          <Button
            variant="destructive"
            onClick={() => handleSubmit('reject')}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            Từ chối
          </Button>
          
          <Button
            onClick={() => handleSubmit('approve')}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Duyệt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
