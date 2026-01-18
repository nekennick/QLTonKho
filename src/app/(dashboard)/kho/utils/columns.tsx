'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { 
  ArrowUpDown, MoreHorizontal, Edit, Trash, MapPin, 
  Building2, Image, FileText, User, Package
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
import type { Warehouse } from '../types/warehouse';
import { formatAddress, formatNotes, formatImageUrl } from '../lib/formatters';

interface GetColumnsProps {
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (warehouse: Warehouse) => void;
  isAdmin: boolean;
  isManager: boolean;
}

export const getColumns = ({ 
  onEdit, 
  onDelete, 
  isAdmin, 
  isManager 
}: GetColumnsProps): ColumnDef<Warehouse>[] => [
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
    accessorKey: 'MaKho',
    id: 'MaKho',
    header: ({ column }) => (
      <Button 
        variant="ghost" 
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-auto p-0 hover:bg-transparent text-left justify-start"
      >
        <span className="text-xs sm:text-sm font-medium">Mã Kho</span>
        <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const warehouse = row.original;
      return (
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-xs sm:text-sm text-gray-900 truncate">
              {warehouse.MaKho || 'Chưa có'}
            </div>
            <div className="text-xs text-gray-500">Mã định danh</div>
          </div>
        </div>
      );
    },
    enableHiding: false,
    minSize: 120,
  },
  {
    accessorKey: 'TenKho',
    id: 'TenKho',
    header: ({ column }) => (
      <Button 
        variant="ghost" 
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-auto p-0 hover:bg-transparent text-left justify-start"
      >
        <span className="text-xs sm:text-sm font-medium">Tên Kho</span>
        <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const warehouse = row.original;
      return (
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
            <AvatarImage
              src={formatImageUrl(warehouse.HinhAnh)}
              alt={warehouse.TenKho}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white text-xs sm:text-sm font-semibold">
              <Building2 className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-xs sm:text-sm text-gray-900 truncate">
              {row.getValue('TenKho')}
            </div>
            <div className="text-xs text-gray-500 flex items-center truncate">
              <User className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{warehouse.ThuKho || 'Chưa cập nhật'}</span>
            </div>
          </div>
        </div>
      );
    },
    enableHiding: false,
    minSize: 200,
  },
  {
    accessorKey: 'DiaChi',
    id: 'DiaChi',
    header: () => <span className="text-xs sm:text-sm font-medium">Địa chỉ</span>,
    cell: ({ row }) => {
      const warehouse = row.original;
      return (
        <div className="flex items-center space-x-2 min-w-0">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[150px] cursor-help">
                  {formatAddress(warehouse.DiaChi)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{formatAddress(warehouse.DiaChi)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
    enableHiding: true,
    minSize: 150,
  },
  {
    accessorKey: 'ThuKho',
    id: 'ThuKho',
    header: () => <span className="text-xs sm:text-sm font-medium">Thủ kho</span>,
    cell: ({ row }) => {
      const warehouse = row.original;
      return (
        <div className="flex items-center space-x-2 min-w-0">
          <User className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">
            {warehouse.ThuKho || 'Chưa cập nhật'}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const cellValue = row.getValue(id);
      return Array.isArray(value) ? (value.length === 0 || value.includes(cellValue)) : true;
    },
    enableHiding: true,
    minSize: 120,
  },
  {
    accessorKey: 'HinhAnh',
    id: 'HinhAnh',
    header: () => <span className="text-xs sm:text-sm font-medium">Hình ảnh</span>,
    cell: ({ row }) => {
      const warehouse = row.original;
      const imageUrl = formatImageUrl(warehouse.HinhAnh);
      
      if (!imageUrl) {
        return (
          <div className="flex items-center text-xs text-gray-400">
            <Image className="w-3 h-3 mr-1" />
            Chưa có hình
          </div>
        );
      }

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2 min-w-0 cursor-help">
                <Image className="w-3 h-3 text-blue-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-gray-900 truncate">
                    {imageUrl.length > 30 ? imageUrl.substring(0, 30) + '...' : imageUrl}
                  </div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-md">
              <div className="space-y-1">
                <p className="font-medium text-sm mb-2">Hình ảnh:</p>
                <img 
                  src={imageUrl} 
                  alt={warehouse.TenKho}
                  className="w-32 h-24 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
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
    accessorKey: 'GhiChu',
    id: 'GhiChu',
    header: () => <span className="text-xs sm:text-sm font-medium">Ghi chú</span>,
    cell: ({ row }) => {
      const warehouse = row.original;
      const notes = formatNotes(warehouse.GhiChu);
      
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
    id: 'actions',
    enableHiding: false,
    size: 50,
    cell: ({ row }) => {
      const warehouse = row.original;
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
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuLabel className="text-xs sm:text-sm">Hành động</DropdownMenuLabel>
              
              {/* Edit Warehouse */}
              <DropdownMenuItem 
                onClick={() => onEdit(warehouse)}
                className="text-xs sm:text-sm"
              >
                <Edit className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span>Chỉnh sửa</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Delete Warehouse */}
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
                Bạn có chắc chắn muốn xóa kho <strong>"{warehouse.TenKho}"</strong>?
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
                  onDelete(warehouse);
                  setIsAlertDialogOpen(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm"
              >
                <Trash className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Xóa kho
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    },
  },
];
