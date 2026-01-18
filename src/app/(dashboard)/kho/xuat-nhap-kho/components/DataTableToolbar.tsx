'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Download, Upload, FileText, Filter, X } from 'lucide-react';
import { INVENTORY_TYPES, INVENTORY_STATUS } from '../utils/constants';
import { createInventoryTemplate } from '../utils/excelUtils';

interface DataTableToolbarProps {
  onAddNew: () => void;
  onImport: (file: File) => void;
  onExport: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onClearFilters: () => void;
}

export function DataTableToolbar({
  onAddNew,
  onImport,
  onExport,
  searchValue,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  onClearFilters,
}: DataTableToolbarProps) {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const handleImport = () => {
    if (importFile) {
      onImport(importFile);
      setImportFile(null);
      setImportDialogOpen(false);
    }
  };

  const hasActiveFilters = typeFilter || statusFilter || searchValue;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Tìm kiếm phiếu xuất nhập kho..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        
        <Select value={typeFilter || "all"} onValueChange={(value) => onTypeFilterChange(value === "all" ? "" : value)}>
          <SelectTrigger className="h-8 w-[150px]">
            <SelectValue placeholder="Loại phiếu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            {Object.values(INVENTORY_TYPES).map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter || "all"} onValueChange={(value) => onStatusFilterChange(value === "all" ? "" : value)}>
          <SelectTrigger className="h-8 w-[150px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {Object.values(INVENTORY_STATUS).map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="h-8 px-2 lg:px-3"
          >
            Xóa bộ lọc
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="h-8"
        >
          <Download className="mr-2 h-4 w-4" />
          Xuất Excel
        </Button>

        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Upload className="mr-2 h-4 w-4" />
              Nhập Excel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nhập dữ liệu từ Excel</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="file">Chọn file Excel</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                />
              </div>
              <div className="text-sm text-gray-500">
                <p>File Excel phải có định dạng chuẩn với các cột:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Mã Phiếu, Loại Phiếu, Địa Chỉ, Ngày...</li>
                  <li>Mã Chi Tiết, Mã VT, Tên VT, Số Lượng...</li>
                </ul>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    createInventoryTemplate();
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Tải mẫu
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!importFile}
                >
                  Nhập dữ liệu
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button onClick={onAddNew} size="sm" className="h-8">
          <Plus className="mr-2 h-4 w-4" />
          Thêm mới
        </Button>
      </div>
    </div>
  );
}
