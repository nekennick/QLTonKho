'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { formatNumber } from '../utils/kiemKeUtils';

import { ProductFormData } from '@/app/(dashboard)/kho/danh-muc-hang-hoa/types/product';

export interface PreviewItem {
    MaVT: string;
    TenVT: string;
    SoLuongCu: number;
    SoLuongMoi: number;
    isFound: boolean;
    extraData?: Partial<ProductFormData>;
}

interface ImportPreviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    data: PreviewItem[];
    onAddItem?: (item: PreviewItem) => void;
    onAddAll?: () => void;
}

const ImportPreviewDialog: React.FC<ImportPreviewDialogProps> = ({ isOpen, onClose, onConfirm, data, onAddItem, onAddAll }) => {
    const foundCount = data.filter(item => item.isFound).length;
    const notFoundCount = data.length - foundCount;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                        Xem trước dữ liệu Import
                    </DialogTitle>
                    <DialogDescription>
                        Kiểm tra lại dữ liệu từ file Excel trước khi cập nhật vào bảng kiểm kê.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-between items-center py-2">
                    <div className="flex gap-4">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            ✅ {foundCount} vật tư hợp lệ
                        </Badge>
                        {notFoundCount > 0 && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                ⚠️ {notFoundCount} mã không khớp
                            </Badge>
                        )}
                    </div>


                </div>

                <div className="flex-1 min-h-0 border rounded-md overflow-hidden">
                    <ScrollArea className="h-[50vh]">
                        <Table>
                            <TableHeader className="bg-gray-50 sticky top-0 z-10">
                                <TableRow>
                                    <TableHead className="w-[150px]">Mã VT</TableHead>
                                    <TableHead>Tên Vật Tư</TableHead>
                                    <TableHead className="text-right">SL Cũ</TableHead>
                                    <TableHead className="text-right">SL Mới</TableHead>
                                    <TableHead className="text-center">Trạng thái</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((item, index) => (
                                    <TableRow key={index} className={item.isFound ? "" : "bg-red-50"}>
                                        <TableCell className="font-medium">{item.MaVT}</TableCell>
                                        <TableCell className="max-w-[300px] truncate">
                                            {item.isFound ? (
                                                item.TenVT
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-red-500 italic">Không tìm thấy</span>
                                                    {onAddItem && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-6 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                                                            onClick={() => onAddItem(item)}
                                                        >
                                                            + Thêm mới
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right text-gray-500">
                                            {item.isFound ? formatNumber(item.SoLuongCu) : "-"}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-blue-600">
                                            {formatNumber(item.SoLuongMoi)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {item.isFound ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>

                <DialogFooter className="mt-4 gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Hủy bỏ
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={foundCount === 0}
                    >
                        Xác nhận Cập nhật ({foundCount} mục)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ImportPreviewDialog;
