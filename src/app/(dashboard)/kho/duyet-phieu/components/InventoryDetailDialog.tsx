'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  User, 
  Calendar, 
  Package, 
  Printer,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Trash2
} from 'lucide-react';
import type { NXKHO, NXKHODE } from '../../xuat-nhap-kho/types/inventory';

interface InventoryDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory: NXKHO | null;
  details: NXKHODE[];
  onPrint: (inventory: NXKHO) => void;
  onDelete?: (inventory: NXKHO) => void;
}

export function InventoryDetailDialog({ 
  open, 
  onOpenChange, 
  inventory, 
  details, 
  onPrint,
  onDelete
}: InventoryDetailDialogProps) {
  if (!inventory) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Đã duyệt':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Từ chối':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'Chờ xác nhận':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
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

  const totalQuantity = details.reduce((sum, detail) => sum + Number(detail.SoLuong), 0);
  const totalAmount = details.reduce((sum, detail) => sum + Number(detail.ThanhTien), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto p-2 sm:p-6">
        <DialogHeader className="p-2 sm:p-0">
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            Chi Tiết Phiếu Xuất Nhập Kho
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-8 sm:h-10">
            <TabsTrigger value="info" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Thông Tin Phiếu</span>
              <span className="sm:hidden">Thông Tin</span>
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Package className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Vật Tư ({details.length})</span>
              <span className="sm:hidden">Vật Tư</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-3 sm:space-y-4">
            {/* Inventory Header Info */}
            <div className="bg-gray-50 p-2 sm:p-4 rounded-lg space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="font-bold text-lg sm:text-xl">{inventory.MaPhieu}</h3>
                <div className="flex items-center gap-2">
                  {getStatusIcon(inventory.TrangThai)}
                  <Badge className={`text-xs ${getStatusColor(inventory.TrangThai)}`}>
                    {inventory.TrangThai}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <Package className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                  <span className="font-medium">Loại phiếu:</span>
                  <span>{inventory.LoaiPhieu}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                  <span className="font-medium">Người đề nghị:</span>
                  <span className="truncate">{inventory.NhanVienDeNghi}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                  <span className="font-medium">Ngày tạo:</span>
                  <span>{new Date(inventory.Ngay).toLocaleDateString('vi-VN')}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Package className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                  <span className="font-medium">Từ kho:</span>
                  <span className="truncate">{inventory.Tu}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Package className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                  <span className="font-medium">Đến kho:</span>
                  <span className="truncate">{inventory.Den}</span>
                </div>
                
                {inventory.NhanVienKho && (
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                    <span className="font-medium">Thủ kho:</span>
                    <span className="truncate">{inventory.NhanVienKho}</span>
                  </div>
                )}
              </div>

              {(inventory.DiaChi || inventory.GhiChu) && (
                <div className="space-y-2">
                  {inventory.DiaChi && (
                    <div className="text-xs sm:text-sm">
                      <span className="font-medium">Địa chỉ:</span>
                      <span className="ml-2 break-words">{inventory.DiaChi}</span>
                    </div>
                  )}
                  {inventory.GhiChu && (
                    <div className="text-xs sm:text-sm">
                      <span className="font-medium">Ghi chú:</span>
                      <span className="ml-2 break-words">{inventory.GhiChu}</span>
                    </div>
                  )}
                </div>
              )}

              {inventory.LichSu && (
                <div>
                  <span className="font-medium text-xs sm:text-sm">Lịch sử:</span>
                  <div className="mt-1 p-2 bg-white rounded border text-xs whitespace-pre-line max-h-24 sm:max-h-32 overflow-y-auto">
                    {inventory.LichSu}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="materials" className="space-y-3 sm:space-y-4">
            {/* Details Table */}
            <div className="space-y-2 sm:space-y-3">
              <h4 className="font-semibold text-base sm:text-lg">Chi Tiết Vật Tư</h4>
              
              {details.length > 0 ? (
                <div className="space-y-2">
                  {/* Mobile Card View */}
                  <div className="block sm:hidden space-y-2">
                    {details.map((detail, index) => (
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

                  {/* Desktop Table View */}
                  <div className="hidden sm:block border rounded-lg overflow-hidden">
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
                        {details.map((detail, index) => (
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
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <Package className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm sm:text-base">Không có chi tiết vật tư</p>
                </div>
              )}

              {/* Summary */}
              {details.length > 0 && (
                <div className="bg-blue-50 p-2 sm:p-4 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="space-y-1">
                      <div className="text-xs sm:text-sm">
                        <span className="font-medium">Tổng số mặt hàng:</span>
                        <span className="ml-2 font-bold text-blue-600">{details.length}</span>
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
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 p-2 sm:p-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Đóng</span>
          </Button>
          
          {onDelete && inventory.TrangThai === 'Chờ xác nhận' && (
            <Button
              variant="destructive"
              onClick={() => onDelete(inventory)}
              className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Xóa Phiếu</span>
            </Button>
          )}
          
          <Button
            onClick={() => onPrint(inventory)}
            className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto"
          >
            <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">In Phiếu</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
