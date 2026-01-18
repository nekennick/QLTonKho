'use client';

import { ChevronDown, X, UserPlus, Download, Upload, Trash2 } from 'lucide-react';
import type { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTableFacetedFilter } from './DataTableFacetedFilter';
import { EMPLOYEE_ROLES } from '../utils/constants';
import type { Employee } from '../types/employee';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  departments: string[];
  positions: string[];
  onAddNew: () => void;
  onExportExcel: () => void;
  onImportExcel: () => void;
  onBulkDelete: () => void;
  isAdmin: boolean;
  isManager: boolean;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
}

export function DataTableToolbar<TData>({ 
  table, 
  departments, 
  positions, 
  onAddNew,
  onExportExcel,
  onImportExcel,
  onBulkDelete,
  isAdmin, 
  isManager,
  globalFilter,
  onGlobalFilterChange 
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || globalFilter.length > 0;
  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;

  const departmentOptions = departments.map(dept => ({ label: dept, value: dept }));
  const positionOptions = positions.map(pos => ({ label: pos, value: pos }));

  const handleResetFilters = () => {
    table.resetColumnFilters();
    onGlobalFilterChange('');
  };

  const FilterContent = () => (
    <>
      {table.getColumn('Phân quyền') && (
        <div className="flex-shrink-0">
          <DataTableFacetedFilter
            column={table.getColumn('Phân quyền')}
            title="Phân quyền"
            options={EMPLOYEE_ROLES}
          />
        </div>
      )}
      
      {table.getColumn('Phòng') && (
        <div className="flex-shrink-0">
          <DataTableFacetedFilter
            column={table.getColumn('Phòng')}
            title="Phòng ban"
            options={departmentOptions}
          />
        </div>
      )}
      
      {table.getColumn('Chức vụ') && (
        <div className="flex-shrink-0">
          <DataTableFacetedFilter
            column={table.getColumn('Chức vụ')}
            title="Chức vụ"
            options={positionOptions}
          />
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Main toolbar - Responsive */}
      <div className="flex flex-row gap-2 sm:gap-4">
        {/* Search */}
        <div className="flex flex-1 gap-2 sm:gap-3">
          <Input
            placeholder="Tìm kiếm nhân viên..."
            value={globalFilter}
            onChange={(event) => onGlobalFilterChange(event.target.value)}
            className="flex-1 h-9 sm:h-10 text-sm sm:text-base min-w-0"
          />
        </div>

        {/* Add button - Cạnh thanh tìm kiếm trên mobile, ẩn trên desktop */}
        {(isAdmin || isManager) && (
          <Button
            onClick={onAddNew}
            size="sm"
            className="bg-primary hover:bg-primary/90 h-9 sm:h-10 text-sm flex-shrink-0 sm:hidden"
          >
            <UserPlus className="w-4 h-4 mr-1" />
            <span>Thêm</span>
          </Button>
        )}

        {/* Action buttons - Desktop */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Bulk delete button - chỉ hiện khi có selection */}
          {selectedRowsCount > 0 && (isAdmin || isManager) && (
            <Button
              onClick={onBulkDelete}
              variant="destructive"
              size="sm"
              className="h-9 sm:h-10 text-sm flex-shrink-0"
            >
              <Trash2 className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Xóa {selectedRowsCount}</span>
              <span className="xs:hidden">Xóa</span>
            </Button>
          )}

          {/* Excel buttons */}
          <div className="flex gap-1 sm:gap-2">
            <Button
              onClick={onExportExcel}
              variant="outline"
              size="sm"
              className="h-9 sm:h-10 text-sm flex-shrink-0"
            >
              <Download className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Xuất Excel</span>
              <span className="sm:hidden">Xuất</span>
            </Button>

            {(isAdmin || isManager) && (
              <Button
                onClick={onImportExcel}
                variant="outline"
                size="sm"
                className="h-9 sm:h-10 text-sm flex-shrink-0"
              >
                <Upload className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Import Excel</span>
                <span className="sm:hidden">Import</span>
              </Button>
            )}
          </div>
          
          {/* Add button - Desktop */}
          {(isAdmin || isManager) && (
            <Button
              onClick={onAddNew}
              size="sm"
              className="bg-primary hover:bg-primary/90 h-9 sm:h-10 text-sm flex-shrink-0"
            >
              <UserPlus className="w-4 h-4 mr-1 sm:mr-2" />
              <span>Thêm nhân viên</span>
            </Button>
          )}
          
          {/* Column visibility dropdown - Desktop only */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden lg:flex h-9 sm:h-10 text-sm"
              >
                <ChevronDown className="mr-2 h-4 w-4" />
                Cột hiển thị
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuLabel>Bật/tắt cột</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  const headerText = {
                    'Họ và Tên': 'Họ và tên',
                    'username': 'Tài khoản',
                    'Chức vụ': 'Chức vụ',
                    'Phòng': 'Phòng ban',
                    'Phân quyền': 'Phân quyền',
                    'Số điện thoại': 'Số điện thoại',
                    'Địa chỉ': 'Địa chỉ',
                    'Ngày sinh': 'Ngày sinh',
                    'Ngày vào làm': 'Ngày vào làm',
                    'Ghi chú': 'Ghi chú'
                  }[column.id] || column.id;
                  
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize text-sm"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {headerText}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile action buttons - Hiển thị khi có selection */}
      <div className="flex sm:hidden items-center gap-2 flex-wrap">
        {selectedRowsCount > 0 && (isAdmin || isManager) && (
          <Button
            onClick={onBulkDelete}
            variant="destructive"
            size="sm"
            className="h-9 text-sm flex-shrink-0"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            <span>Xóa {selectedRowsCount}</span>
          </Button>
        )}
      </div>

      {/* Filters - Hiển thị trên cả mobile và desktop */}
      <div className="flex items-center gap-2 sm:flex-wrap overflow-x-auto sm:overflow-x-visible scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {/* Reset filter button - Đặt ở đầu */}
        {isFiltered && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleResetFilters}
            className="h-8 w-8 flex-shrink-0"
            title="Xóa bộ lọc"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        
        {/* Filter content with horizontal scroll on mobile */}
        <FilterContent />
      </div>

     

      {/* Selection info */}
      {selectedRowsCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 px-3 py-2 rounded-lg">
          <span>Đã chọn {selectedRowsCount} nhân viên</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.toggleAllRowsSelected(false)}
            className="h-6 px-2 text-xs"
          >
            Bỏ chọn tất cả
          </Button>
        </div>
      )}
    </div>
  );
}