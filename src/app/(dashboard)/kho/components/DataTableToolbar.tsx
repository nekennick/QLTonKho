'use client';

import { ChevronDown, X, Building2, Filter, FileSpreadsheet, Download, Upload, Trash2 } from 'lucide-react';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { DataTableFacetedFilter } from './DataTableFacetedFilter';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  onAddNew: () => void;
  onExportExcel: () => void;
  onImportExcel: () => void;
  onBulkDelete: () => void;
  isAdmin: boolean;
  isManager: boolean;
}

export function DataTableToolbar<TData>({ 
  table, 
  onAddNew,
  onExportExcel,
  onImportExcel,
  onBulkDelete,
  isAdmin, 
  isManager
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || table.getState().globalFilter.length > 0;
  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;

  const handleResetFilters = () => {
    table.resetColumnFilters();
    table.setGlobalFilter('');
  };

  const FilterContent = () => (
    <div className="space-y-4">
      {table.getColumn('ThuKho') && (
        <DataTableFacetedFilter
          column={table.getColumn('ThuKho')}
          title="Thủ kho"
          options={[]}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-3 sm:space-y-4 p-0 sm:p-0">
      {/* Main toolbar - Responsive */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Search and primary actions */}
        <div className="flex flex-1 gap-2 sm:gap-3">
          <Input
            placeholder="Tìm kiếm kho..."
            value={(table.getColumn('TenKho')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('TenKho')?.setFilterValue(event.target.value)
            }
            className="flex-1 sm:max-w-sm h-9 sm:h-10"
          />

          {/* Filter Button - Mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
              >
                <Filter className="mr-2 h-4 w-4" />
                Lọc
                {isFiltered && (
                  <span className="ml-2 bg-blue-500 text-white rounded-full px-1.5 py-0.5 text-xs">
                    {table.getState().columnFilters.length + (table.getState().globalFilter ? 1 : 0)}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Bộ lọc</SheetTitle>
                <SheetDescription>
                  Sử dụng các bộ lọc bên dưới để tìm kiếm kho theo tiêu chí cụ thể.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Filter */}
          <div className="hidden lg:flex lg:items-center lg:space-x-2">
            <FilterContent />
          </div>

          {isFiltered && (
            <Button
              variant="ghost"
              onClick={handleResetFilters}
              className="h-8 px-2 lg:px-3"
            >
              Xóa bộ lọc
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* Add New Button */}
          {(isAdmin || isManager) && (
            <Button onClick={onAddNew} size="sm" className="w-full sm:w-auto">
              <Building2 className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Thêm kho mới</span>
              <span className="sm:hidden">Thêm kho</span>
            </Button>
          )}

          {/* Bulk Actions */}
          {selectedRowsCount > 0 && (isAdmin || isManager) && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onBulkDelete}
              className="w-full sm:w-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Xóa ({selectedRowsCount})</span>
              <span className="sm:hidden">Xóa ({selectedRowsCount})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Secondary actions */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        {/* Excel Actions */}
        <div className="flex gap-2 flex-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportExcel}
            className="flex-1 sm:flex-none"
          >
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Xuất Excel</span>
            <span className="sm:hidden">Xuất</span>
          </Button>

          {(isAdmin || isManager) && (
            <Button
              variant="outline"
              size="sm"
              onClick={onImportExcel}
              className="flex-1 sm:flex-none"
            >
              <Upload className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Import Excel</span>
              <span className="sm:hidden">Import</span>
            </Button>
          )}
        </div>

        {/* Column visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full sm:w-auto sm:ml-auto">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Cột
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[150px]">
            <DropdownMenuLabel>Hiển thị cột</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== "undefined" && column.getCanHide()
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id === 'MaKho' ? 'Mã Kho' :
                     column.id === 'TenKho' ? 'Tên Kho' :
                     column.id === 'DiaChi' ? 'Địa Chỉ' :
                     column.id === 'HinhAnh' ? 'Hình Ảnh' :
                     column.id === 'GhiChu' ? 'Ghi Chú' :
                     column.id === 'ThuKho' ? 'Thủ Kho' :
                     column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
