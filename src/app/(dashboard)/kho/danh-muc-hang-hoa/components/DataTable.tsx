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
import type { Product } from '../types/product';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onAddNew: () => void;
  onExportExcel: () => void;
  onImportExcel: () => void;
  onBulkDelete: () => void;
  onSelectionChange?: (selectedProducts: Product[]) => void;
  isAdmin: boolean;
  isManager: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onAddNew,
  onExportExcel,
  onImportExcel,
  onBulkDelete,
  onSelectionChange,
  isAdmin,
  isManager,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    'HinhAnh': false, // Ẩn trên mobile và tablet
    'GhiChu': false, // Ẩn trên mobile
    'NoiSX': false, // Ẩn trên mobile
  });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState<string>('');

  // Responsive column visibility
  React.useEffect(() => {
    const updateColumnVisibility = () => {
      const width = window.innerWidth;

      if (width < 640) { // Mobile
        setColumnVisibility({
          'HinhAnh': false,
          'GhiChu': false,
          'NoiSX': false,
          'ĐVT': false,
          'ChatLuong': false,
        });
      } else if (width < 768) { // Small tablet
        setColumnVisibility({
          'HinhAnh': false,
          'GhiChu': false,
          'NoiSX': false,
        });
      } else if (width < 1024) { // Tablet
        setColumnVisibility({
          'HinhAnh': false,
        });
      } else { // Desktop
        const savedVisibility = localStorage.getItem('product-table-visibility');
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

  // Save column visibility to localStorage when it changes
  React.useEffect(() => {
    localStorage.setItem('product-table-visibility', JSON.stringify(columnVisibility));
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
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
  });

  // Notify parent of selection changes
  React.useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table.getFilteredSelectedRowModel().rows;
      const selectedProducts = selectedRows.map(row => row.original as Product);
      onSelectionChange(selectedProducts);
    }
  }, [rowSelection, onSelectionChange, table]);

  return (
    <div className="space-y-4 p-4 sm:p-0">
      <DataTableToolbar
        table={table}
        onAddNew={onAddNew}
        onExportExcel={onExportExcel}
        onImportExcel={onImportExcel}
        onBulkDelete={onBulkDelete}
        isAdmin={isAdmin}
        isManager={isManager}
      />

      <div className="rounded-md border">
        <div className="max-h-[calc(100vh-350px)] overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b sticky top-0 z-10 bg-muted/95 backdrop-blur supports-[backdrop-filter]:bg-muted/60">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b transition-colors hover:bg-muted/50">
                  {headerGroup.headers.map((header) => {
                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        className="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <td
                    colSpan={columns.length}
                    className="h-24 text-center p-2 align-middle"
                  >
                    Không có dữ liệu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4 px-4 sm:px-0">
        <div className="flex-1 text-sm text-muted-foreground text-center sm:text-left">
          {table.getFilteredSelectedRowModel().rows.length} trong số{" "}
          {table.getFilteredRowModel().rows.length} dòng được chọn.
        </div>
        <div className="flex items-center space-x-2 sm:space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Số dòng mỗi trang</p>
            <select
              value={`${table.getState().pagination.pageSize}`}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="h-8 w-[100px] border border-input bg-background px-3 py-1 text-sm rounded-md"
            >
              {[50, 100, 150].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
              <option value={data.length}>Tất cả</option>
            </select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Trang {table.getState().pagination.pageIndex + 1} trên{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Đi đến trang đầu</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Đi đến trang trước</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Đi đến trang tiếp</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Đi đến trang cuối</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
