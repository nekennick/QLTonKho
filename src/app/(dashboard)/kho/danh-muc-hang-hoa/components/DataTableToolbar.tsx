'use client';

import { useState } from 'react';
import { ChevronDown, X, Package, Filter, FileSpreadsheet, Download, Upload, Trash2, PackageX } from 'lucide-react';
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
import { useProductOptions } from '../hooks/useProductOptions';
import type { Product } from '../types/product';

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
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const isFiltered = table.getState().columnFilters.length > 0 || table.getState().globalFilter.length > 0 || showOutOfStock;
  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;

  // Get dynamic options from API
  const { productGroups, productQualities } = useProductOptions();

  const handleResetFilters = () => {
    table.resetColumnFilters();
    table.setGlobalFilter('');
    setShowOutOfStock(false);
  };

  const handleToggleOutOfStock = () => {
    const newValue = !showOutOfStock;
    setShowOutOfStock(newValue);

    if (newValue) {
      // Filter products with SoLuongTon = 0
      table.getColumn('SoLuongTon')?.setFilterValue(0);
    } else {
      // Clear the filter
      table.getColumn('SoLuongTon')?.setFilterValue(undefined);
    }
  };

  const FilterContent = () => (
    <div className="grid grid-cols-3 gap-2">
      {table.getColumn('NhomVT') && (
        <DataTableFacetedFilter
          column={table.getColumn('NhomVT')}
          title="Nhóm VT"
          options={productGroups}
        />
      )}
      {table.getColumn('ChatLuong') && (
        <DataTableFacetedFilter
          column={table.getColumn('ChatLuong')}
          title="Chất lượng"
          options={productQualities}
        />
      )}
    </div>
  );

  return (
    <div className="p-4 sm:p-0">
      {/* Single row toolbar - All controls in one line */}
      <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 lg:items-center">
        {/* Search and filters */}
        <div className="flex flex-1 gap-2 lg:gap-3">
          <Input
            placeholder="Tìm kiếm hàng hóa..."
            value={(table.getColumn('TenVT')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('TenVT')?.setFilterValue(event.target.value)
            }
            className="flex-1 lg:max-w-sm"
          />

          {/* Filter Button - Mobile/Tablet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="xl:hidden"
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
                  Sử dụng các bộ lọc bên dưới để tìm kiếm hàng hóa theo tiêu chí cụ thể.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Filter */}
          <div className="hidden xl:flex xl:items-center xl:space-x-2">
            <FilterContent />
          </div>

          {/* Quick Filter: Hết hàng */}
          <Button
            variant={showOutOfStock ? "default" : "outline"}
            size="sm"
            onClick={handleToggleOutOfStock}
            className={showOutOfStock ? "bg-red-500 hover:bg-red-600 text-white" : ""}
          >
            <PackageX className="mr-2 h-4 w-4" />
            Hết hàng
          </Button>

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

        {/* Excel Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportExcel}
            className="flex-1 lg:flex-none"
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
              className="flex-1 lg:flex-none"
            >
              <Upload className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Import Excel</span>
              <span className="sm:hidden">Import</span>
            </Button>
          )}
        </div>

        {/* Add New Button */}
        {(isAdmin || isManager) && (
          <Button onClick={onAddNew} size="sm" className="w-full lg:w-auto">
            <Package className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Thêm hàng hóa mới</span>
            <span className="sm:hidden">Thêm hàng hóa</span>
          </Button>
        )}

        {/* Bulk Actions */}
        {selectedRowsCount > 0 && (isAdmin || isManager) && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onBulkDelete}
            className="w-full lg:w-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Xóa ({selectedRowsCount})</span>
            <span className="sm:hidden">Xóa ({selectedRowsCount})</span>
          </Button>
        )}

        {/* Column visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full lg:w-auto">
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
                    {column.id === 'MaVT' ? 'Mã VT' :
                      column.id === 'TenVT' ? 'Tên VT' :
                        column.id === 'NhomVT' ? 'Nhóm VT' :
                          column.id === 'HinhAnh' ? 'Hình Ảnh' :
                            column.id === 'ĐVT' ? 'ĐVT' :
                              column.id === 'NoiSX' ? 'Nơi SX' :
                                column.id === 'ChatLuong' ? 'Chất Lượng' :
                                  column.id === 'DonGia' ? 'Đơn Giá' :
                                    column.id === 'GhiChu' ? 'Ghi Chú' :
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
