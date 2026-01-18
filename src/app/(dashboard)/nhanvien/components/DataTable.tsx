'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTableToolbar } from './DataTableToolbar';
import type { Employee } from '../types/employee';
import { Eye, Edit, Trash } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  departments: string[];
  positions: string[];
  onAddNew: () => void;
  onExportExcel: () => void;
  onImportExcel: () => void;
  onBulkDelete: () => void;
  onSelectionChange?: (selectedEmployees: Employee[]) => void;
  onView?: (employee: Employee) => void;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
  isAdmin: boolean;
  isManager: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  departments,
  positions,
  onAddNew,
  onExportExcel,
  onImportExcel,
  onBulkDelete,
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
  isAdmin,
  isManager,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    'username': false, // Ẩn trên mobile và tablet
    'Số điện thoại': false, // Ẩn trên mobile
  });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [employeeToDelete, setEmployeeToDelete] = React.useState<Employee | null>(null);

  // Responsive column visibility
  React.useEffect(() => {
    const updateColumnVisibility = () => {
      const width = window.innerWidth;
      
      if (width < 640) { // Mobile
        setColumnVisibility({
          'username': false,
          'Số điện thoại': false,
          'Chức vụ': false,
        });
      } else if (width < 768) { // Small tablet
        setColumnVisibility({
          'username': false,
          'Số điện thoại': false,
        });
      } else if (width < 1024) { // Tablet
        setColumnVisibility({
          'username': false,
        });
      } else { // Desktop
        const savedVisibility = localStorage.getItem('employee-table-visibility');
        if (savedVisibility) {
          try {
            setColumnVisibility(JSON.parse(savedVisibility));
          } catch {
            setColumnVisibility({});
          }
        } else {
          setColumnVisibility({});
        }
      }
    };

    updateColumnVisibility();
    window.addEventListener('resize', updateColumnVisibility);
    return () => window.removeEventListener('resize', updateColumnVisibility);
  }, []);

  // Save column visibility on desktop
  React.useEffect(() => {
    if (window.innerWidth >= 1024) {
      localStorage.setItem('employee-table-visibility', JSON.stringify(columnVisibility));
    }
  }, [columnVisibility]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    globalFilterFn: (row, columnId, value) => {
      const search = value.toLowerCase();
      const employee = row.original as any;
      return (
        employee['Họ và Tên']?.toLowerCase().includes(search) ||
        employee['username']?.toLowerCase().includes(search) ||
        employee['Email']?.toLowerCase().includes(search) ||
        employee['Chức vụ']?.toLowerCase().includes(search) ||
        employee['Phòng']?.toLowerCase().includes(search) ||
        employee['Số điện thoại']?.toLowerCase().includes(search) ||
        employee['Địa chỉ']?.toLowerCase().includes(search)
      );
    },
  });

  // Update selected employees when row selection changes
  React.useEffect(() => {
    if (onSelectionChange) {
      const selectedEmployees = table.getFilteredSelectedRowModel().rows.map(
        row => row.original as Employee
      );
      onSelectionChange(selectedEmployees);
    }
  }, [rowSelection, onSelectionChange, table]);

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      <DataTableToolbar
        table={table}
        departments={departments}
        positions={positions}
        onAddNew={onAddNew}
        onExportExcel={onExportExcel}
        onImportExcel={onImportExcel}
        onBulkDelete={onBulkDelete}
        isAdmin={isAdmin}
        isManager={isManager}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
      />

      {/* Mobile cards (edge-to-edge) */}
      <div className="sm:hidden -mx-4">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row, index) => {
            const employee = row.original as Employee;
            return (
              <div
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className={`px-4 py-3 border-b ${index === 0 ? 'border-t' : ''} border-gray-200 bg-white`}
              >
                <div className="space-y-2">
                  {row.getVisibleCells()
                    .filter((cell) => !['select', 'actions'].includes(cell.column.id))
                    .map((cell) => {
                      const headerDef = cell.column.columnDef.header as any;
                      const headerText = typeof headerDef === 'string' ? headerDef : (cell.column.id || '');
                      return (
                        <div key={cell.id} className="flex items-start justify-between gap-3">
                          <div className="text-xs text-gray-500">
                            {headerText}
                          </div>
                          <div className="text-sm text-gray-900 max-w-[60%] text-right">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        </div>
                      );
                    })}
                </div>
                
                {/* Action Buttons for Mobile */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    {/* View Button - Available for all */}
                    {onView && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(employee)}
                        className="flex-1 h-9 text-xs"
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        Chi tiết
                      </Button>
                    )}
                    
                    {/* Edit Button - Only for Admin/Manager */}
                    {(isAdmin || isManager) && onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(employee)}
                        className="flex-1 h-9 text-xs"
                      >
                        <Edit className="mr-1.5 h-3.5 w-3.5" />
                        Sửa
                      </Button>
                    )}
                    
                    {/* Delete Button - Only for Admin/Manager */}
                    {(isAdmin || isManager) && onDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEmployeeToDelete(employee);
                          setDeleteDialogOpen(true);
                        }}
                        className="flex-1 h-9 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash className="mr-1.5 h-3.5 w-3.5" />
                        Xóa
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-4 py-10 text-center text-gray-500 border-t border-b border-gray-200 bg-white">
            <div className="text-sm">Không có dữ liệu</div>
            <div className="text-xs">Thử thay đổi bộ lọc hoặc thêm nhân viên mới</div>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Dialog for Mobile */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm sm:text-base flex items-center gap-2">
              <Trash className="h-4 w-4 text-red-600" />
              Xác nhận xóa
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Bạn có chắc chắn muốn xóa nhân viên <strong>"{employeeToDelete?.['Họ và Tên']}"</strong>?
              <br />
              <span className="text-red-600 font-medium">Hành động này không thể hoàn tác.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="text-xs sm:text-sm w-full sm:w-auto">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (employeeToDelete && onDelete) {
                  onDelete(employeeToDelete);
                  setDeleteDialogOpen(false);
                  setEmployeeToDelete(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm w-full sm:w-auto"
            >
              <Trash className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Xóa nhân viên
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Table for >= sm */}
      <div className="hidden sm:block border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-gray-50 hover:bg-gray-50">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="px-3 py-3 sm:px-4 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap"
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} ${row.getIsSelected() ? 'bg-primary/10 hover:bg-primary/20' : ''}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-3 py-3 sm:px-4 sm:py-4 text-sm text-gray-900 align-top">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 sm:h-40 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
                      <div className="text-sm sm:text-base">Không có dữ liệu</div>
                      <div className="text-xs sm:text-sm">Thử thay đổi bộ lọc hoặc thêm nhân viên mới</div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Responsive pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 py-3 sm:py-4">
        <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
          <span className="hidden sm:inline">
            {table.getFilteredSelectedRowModel().rows.length} / {table.getFilteredRowModel().rows.length} dòng được chọn
          </span>
          <span className="sm:hidden">
            {table.getFilteredSelectedRowModel().rows.length}/{table.getFilteredRowModel().rows.length} được chọn
          </span>
        </div>
        
        <div className="flex items-center space-x-2 order-1 sm:order-2">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="hidden sm:flex text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              Đầu
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              ←
            </Button>
            
            <div className="flex items-center justify-center text-xs sm:text-sm text-gray-600 min-w-[80px] sm:min-w-[100px] px-2">
              <span className="hidden sm:inline">
                Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
              </span>
              <span className="sm:hidden">
                {table.getState().pagination.pageIndex + 1}/{table.getPageCount()}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              →
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="hidden sm:flex text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              Cuối
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}