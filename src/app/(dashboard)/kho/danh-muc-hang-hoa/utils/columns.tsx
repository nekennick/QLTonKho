'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  ArrowUpDown, MoreHorizontal, Edit, Trash, Package,
  Building2, Image, FileText, DollarSign, Star, MapPin, Tag,
  Copy, QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Product } from '../types/product';
import { formatCurrency, formatNotes, formatImageUrl, formatQuality } from '../lib/formatters';

interface GetColumnsProps {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onCopy: (product: Product) => void;
  onPrintCodes: (product: Product) => void;
  isAdmin: boolean;
  isManager: boolean;
}

export const getColumns = ({
  onEdit,
  onDelete,
  onCopy,
  onPrintCodes,
  isAdmin,
  isManager
}: GetColumnsProps): ColumnDef<Product>[] => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      id: "stt",
      header: () => <span className="text-xs sm:text-sm font-medium">STT</span>,
      cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        return (
          <div className="text-xs sm:text-sm text-gray-500">
            {pageIndex * pageSize + row.index + 1}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    {
      accessorKey: 'MaVT',
      id: 'MaVT',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 hover:bg-transparent text-left justify-start"
        >
          <span className="text-xs sm:text-sm font-medium">Mã VT</span>
          <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-xs sm:text-sm text-gray-900 truncate">
                {product.MaVT || 'Chưa có'}
              </div>
              <div className="text-xs text-gray-500">Mã vật tư</div>
            </div>
          </div>
        );
      },
      enableHiding: false,
      minSize: 120,
    },
    {
      accessorKey: 'TenVT',
      id: 'TenVT',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 hover:bg-transparent text-left justify-start"
        >
          <span className="text-xs sm:text-sm font-medium">Tên VT</span>
          <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
              <AvatarImage
                src={formatImageUrl(product.HinhAnh)}
                alt={product.TenVT}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white text-xs sm:text-sm font-semibold">
                <Package className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-xs sm:text-sm text-gray-900 break-words leading-tight">
                {row.getValue('TenVT')}
              </div>
              <div className="text-xs text-gray-500 flex items-center truncate">
                <Tag className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{product.NhomVT || 'Chưa phân loại'}</span>
              </div>
            </div>
          </div>
        );
      },
      enableHiding: false,
      minSize: 200,
      size: 250,
    },
    {
      accessorKey: 'NhomVT',
      id: 'NhomVT',
      header: () => <span className="text-xs sm:text-sm font-medium">Nhóm VT</span>,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <Badge
            variant="secondary"
            className="text-xs px-2 py-1 font-normal truncate max-w-[120px]"
          >
            {product.NhomVT || 'Chưa phân loại'}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        const cellValue = row.getValue(id);
        return Array.isArray(value) ? (value.length === 0 || value.includes(cellValue)) : true;
      },
      enableHiding: true,
      minSize: 100,
    },
    {
      accessorKey: 'ĐVT',
      id: 'ĐVT',
      header: () => <span className="text-xs sm:text-sm font-medium">Đơn vị</span>,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center space-x-2 min-w-0">
            <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">
              {product.ĐVT || 'Chưa có'}
            </span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const cellValue = row.getValue(id);
        return Array.isArray(value) ? (value.length === 0 || value.includes(cellValue)) : true;
      },
      enableHiding: true,
      minSize: 80,
    },
    {
      accessorKey: 'NoiSX',
      id: 'NoiSX',
      header: () => <span className="text-xs sm:text-sm font-medium">Nơi SX</span>,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center space-x-2 min-w-0">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[120px] cursor-help">
                    {product.NoiSX || 'Chưa xác định'}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{product.NoiSX || 'Chưa xác định'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
      enableHiding: true,
      minSize: 120,
    },
    {
      accessorKey: 'ChatLuong',
      id: 'ChatLuong',
      header: () => <span className="text-xs sm:text-sm font-medium">Chất lượng</span>,
      cell: ({ row }) => {
        const product = row.original;
        const quality = formatQuality(product.ChatLuong);

        const getQualityColor = (quality: string) => {
          switch (quality.toUpperCase()) {
            case 'A': return 'bg-green-100 text-green-800';
            case 'B': return 'bg-blue-100 text-blue-800';
            case 'C': return 'bg-yellow-100 text-yellow-800';
            case 'D': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
          }
        };

        return (
          <div className="flex items-center space-x-2 min-w-0">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 flex-shrink-0" />
            <Badge
              variant="secondary"
              className={`text-xs px-2 py-1 font-normal ${getQualityColor(quality)}`}
            >
              {quality}
            </Badge>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const cellValue = row.getValue(id);
        return Array.isArray(value) ? (value.length === 0 || value.includes(cellValue)) : true;
      },
      enableHiding: true,
      minSize: 100,
    },
    {
      accessorKey: 'DonGia',
      id: 'DonGia',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 hover:bg-transparent text-left justify-start"
        >
          <span className="text-xs sm:text-sm font-medium">Đơn giá</span>
          <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center space-x-2 min-w-0">
            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-gray-900">
              {formatCurrency(product.DonGia)}
            </span>
          </div>
        );
      },
      enableHiding: true,
      minSize: 120,
    },
    {
      accessorKey: 'GhiChu',
      id: 'GhiChu',
      header: () => <span className="text-xs sm:text-sm font-medium">Ghi chú</span>,
      cell: ({ row }) => {
        const product = row.original;
        const notes = formatNotes(product.GhiChu);

        if (notes === 'Chưa có ghi chú') {
          return (
            <div className="flex items-center text-xs text-gray-400">
              <FileText className="w-3 h-3 mr-1" />
              Chưa có ghi chú
            </div>
          );
        }

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-start space-x-2 min-w-0 cursor-help">
                  <FileText className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-900 truncate">
                      {notes.length > 50 ? notes.substring(0, 50) + '...' : notes}
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-md">
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  <p className="font-medium text-sm mb-2">Ghi chú:</p>
                  <p className="text-xs whitespace-pre-wrap">
                    {notes}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
      enableHiding: true,
      minSize: 150,
    },
    {
      accessorKey: 'SoLuongTon',
      id: 'SoLuongTon',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 hover:bg-transparent text-left justify-start"
        >
          <span className="text-xs sm:text-sm font-medium">SL Tồn</span>
          <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const product = row.original;
        const soLuong = product.SoLuongTon ?? 0;
        // Format: 1.000 (Việt Nam)
        const formattedSL = soLuong.toLocaleString('vi-VN');

        return (
          <div className="flex items-center space-x-2 min-w-0">
            <Badge variant={soLuong > 0 ? "outline" : "destructive"} className="text-xs">
              {formattedSL}
            </Badge>
          </div>
        );
      },
      filterFn: (row, id, filterValue) => {
        const soLuong = row.original.SoLuongTon ?? 0;
        if (filterValue === 0) {
          return soLuong === 0;
        }
        return true;
      },
      enableHiding: true,
      minSize: 80,
    },
    {
      id: 'actions',
      enableHiding: false,
      size: 50,
      cell: ({ row }) => {
        const product = row.original;
        const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);

        if (!isAdmin && !isManager) return null;

        return (
          <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-6 w-6 sm:h-8 sm:w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel className="text-xs sm:text-sm">Hành động</DropdownMenuLabel>

                {/* Edit Product */}
                <DropdownMenuItem
                  onClick={() => onEdit(product)}
                  className="text-xs sm:text-sm"
                >
                  <Edit className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Chỉnh sửa</span>
                </DropdownMenuItem>

                {/* Copy Product */}
                <DropdownMenuItem
                  onClick={() => onCopy(product)}
                  className="text-xs sm:text-sm"
                >
                  <Copy className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Sao chép</span>
                </DropdownMenuItem>

                {/* Print QR & Barcode - Temporarily hidden */}
                {/* <DropdownMenuItem 
                onClick={() => onPrintCodes(product)}
                className="text-xs sm:text-sm"
              >
                <QrCode className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span>In mã QR</span>
              </DropdownMenuItem> */}

                <DropdownMenuSeparator />

                {/* Delete Product */}
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 text-xs sm:text-sm">
                    <Trash className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Xóa</span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete Confirmation Dialog */}
            <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Trash className="h-4 w-4 text-red-600" />
                  Xác nhận xóa
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs sm:text-sm">
                  Bạn có chắc chắn muốn xóa hàng hóa <strong>"{product.TenVT}"</strong>?
                  <br />
                  <span className="text-red-600 font-medium">Hành động này không thể hoàn tác.</span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                <AlertDialogCancel className="text-xs sm:text-sm">
                  Hủy
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onDelete(product);
                    setIsAlertDialogOpen(false);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm"
                >
                  <Trash className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Xóa hàng hóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      },
    },
  ];
