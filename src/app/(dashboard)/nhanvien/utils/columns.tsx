'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { 
  ArrowUpDown, MoreHorizontal, Edit, Trash, Mail, Phone, MapPin, 
  User, Briefcase, CreditCard, Building, TrendingUp, History, FileText, Eye
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
import type { Employee } from '../types/employee';
import { EMPLOYEE_ROLES } from './constants';
import { formatDate, formatPhoneNumber } from '@/app/(dashboard)/nhanvien/lib/formatters';

interface GetColumnsProps {
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  isAdmin: boolean;
  isManager: boolean;
}

export const getColumns = ({ 
  onView,
  onEdit, 
  onDelete, 
  isAdmin, 
  isManager 
}: GetColumnsProps): ColumnDef<Employee>[] => [
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
    accessorKey: 'username',
    id: 'username',
    header: ({ column }) => (
      <Button 
        variant="ghost" 
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-auto p-0 hover:bg-transparent text-left justify-start"
      >
        <span className="text-xs sm:text-sm font-medium">Username</span>
        <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-xs sm:text-sm text-gray-900 truncate">
              {employee['username'] || 'Chưa có'}
            </div>
            <div className="text-xs text-gray-500">Tên đăng nhập</div>
          </div>
        </div>
      );
    },
    enableHiding: false,
    minSize: 120,
  },
  {
    accessorKey: 'Họ và Tên',
    id: 'Họ và Tên',
    header: ({ column }) => (
      <Button 
        variant="ghost" 
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-auto p-0 hover:bg-transparent text-left justify-start"
      >
        <span className="text-xs sm:text-sm font-medium">Họ và tên</span>
        <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
            <AvatarImage
              src={employee['Image'] || ''}
              alt={employee['Họ và Tên']}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm font-semibold">
              {employee['Họ và Tên']?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-xs sm:text-sm text-gray-900 truncate">
              {row.getValue('Họ và Tên')}
            </div>
            <div className="text-xs text-gray-500 flex items-center truncate">
              <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{employee['Email'] || 'Chưa cập nhật'}</span>
            </div>
          </div>
        </div>
      );
    },
    enableHiding: false,
    minSize: 200,
  },
  {
    accessorKey: 'Chức vụ',
    id: 'Chức vụ',
    header: () => <span className="text-xs sm:text-sm font-medium">Chức vụ</span>,
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div className="flex items-center space-x-2 min-w-0">
          <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">
            {employee['Chức vụ'] || 'Chưa cập nhật'}
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
    accessorKey: 'Phòng',
    id: 'Phòng',
    header: () => <span className="text-xs sm:text-sm font-medium">Phòng ban</span>,
    cell: ({ row }) => (
      <Badge 
        variant="secondary" 
        className="text-xs px-2 py-1 font-normal truncate max-w-[120px]"
      >
        {row.getValue('Phòng') || 'Chưa cập nhật'}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      const cellValue = row.getValue(id);
      return Array.isArray(value) ? (value.length === 0 || value.includes(cellValue)) : true;
    },
    enableHiding: true,
    minSize: 100,
  },
  {
    accessorKey: 'Phân quyền',
    id: 'Phân quyền',
    header: () => <span className="text-xs sm:text-sm font-medium">Phân quyền</span>,
    cell: ({ row }) => {
      const role = EMPLOYEE_ROLES.find((r) => r.value === row.getValue('Phân quyền'));
      if (!role) return null;
      return (
        <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
          {role.icon && <role.icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />}
          <Badge
            variant={
              role.value === 'Admin' ? 'destructive' :
                role.value === 'Giám đốc' ? 'default' : 'secondary'
            }
            className="text-xs px-2 py-1 font-normal"
          >
            {role.label}
          </Badge>
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
    accessorKey: 'Số điện thoại',
    id: 'Số điện thoại',
    header: () => <span className="text-xs sm:text-sm font-medium">Số điện thoại</span>,
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div className="flex items-center space-x-2 min-w-0">
          <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-gray-900 truncate">
            {formatPhoneNumber(employee['Số điện thoại']) || 'Chưa cập nhật'}
          </span>
        </div>
      );
    },
    enableHiding: true,
    minSize: 140,
  },
  {
    accessorKey: 'Địa chỉ',
    id: 'Địa chỉ',
    header: () => <span className="text-xs sm:text-sm font-medium">Địa chỉ</span>,
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div className="flex items-center space-x-2 min-w-0">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[150px] cursor-help">
                  {employee['Địa chỉ'] || 'Chưa cập nhật'}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{employee['Địa chỉ'] || 'Chưa cập nhật'}</p>
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
    accessorKey: 'Ngày sinh',
    id: 'Ngày sinh',
    header: ({ column }) => (
      <Button 
        variant="ghost" 
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-auto p-0 hover:bg-transparent text-left justify-start"
      >
        <span className="text-xs sm:text-sm font-medium">Ngày sinh</span>
        <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const employee = row.original;
      const birthDate = employee['Ngày sinh'];
      
      return (
        <div className="text-xs sm:text-sm text-gray-900">
          {formatDate(birthDate) || 'Chưa cập nhật'}
        </div>
      );
    },
    enableHiding: true,
    minSize: 120,
  },
  {
    accessorKey: 'Ngày vào làm',
    id: 'Ngày vào làm',
    header: ({ column }) => (
      <Button 
        variant="ghost" 
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-auto p-0 hover:bg-transparent text-left justify-start"
      >
        <span className="text-xs sm:text-sm font-medium">Ngày vào làm</span>
        <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const employee = row.original;
      const workDate = employee['Ngày vào làm'];
      
      return (
        <div className="text-xs sm:text-sm text-gray-900">
          {formatDate(workDate) || 'Chưa cập nhật'}
        </div>
      );
    },
    enableHiding: true,
    minSize: 120,
  },
  {
    accessorKey: 'Ghi chú',
    id: 'Ghi chú',
    header: () => <span className="text-xs sm:text-sm font-medium">Ghi chú</span>,
    cell: ({ row }) => {
      const employee = row.original;
      const notes = employee['Ghi chú'];
      
      if (!notes || notes.trim() === '') {
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
                <FileText className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
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
     const employee = row.original;
     const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);

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
             
             {/* View Employee Details */}
             <DropdownMenuItem 
               onClick={() => onView(employee)}
               className="text-xs sm:text-sm"
             >
               <Eye className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
               <span>Xem chi tiết</span>
             </DropdownMenuItem>

             {/* Edit and Delete - Only for Admin/Manager */}
             {(isAdmin || isManager) && (
               <>
                 <DropdownMenuSeparator />
                 
                 {/* Edit Employee */}
                 <DropdownMenuItem 
                   onClick={() => onEdit(employee)}
                   className="text-xs sm:text-sm"
                 >
                   <Edit className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                   <span>Chỉnh sửa</span>
                 </DropdownMenuItem>

                 <DropdownMenuSeparator />

                 {/* Delete Employee */}
                 <AlertDialogTrigger asChild>
                   <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 text-xs sm:text-sm">
                     <Trash className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                     <span>Xóa</span>
                   </DropdownMenuItem>
                 </AlertDialogTrigger>
               </>
             )}
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
               Bạn có chắc chắn muốn xóa nhân viên <strong>"{employee['Họ và Tên']}"</strong>?
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
                 onDelete(employee);
                 setIsAlertDialogOpen(false);
               }}
               className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm"
             >
               <Trash className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
               Xóa nhân viên
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
     );
   },
 },
];