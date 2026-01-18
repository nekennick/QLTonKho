'use client';

import React, { useState, useCallback } from 'react';
import { FileSpreadsheet, Upload, X, AlertTriangle, CheckCircle, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExcelUtils, type ExcelPreviewData, type ExcelError } from '../utils/excelUtils';
import type { WarehouseFormData } from '../types/warehouse';
import toast from 'react-hot-toast';

interface ImportExcelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (warehouses: WarehouseFormData[]) => Promise<void>;
  existingMaKhoList: string[];
}

export const ImportExcelDialog: React.FC<ImportExcelDialogProps> = ({
  open,
  onOpenChange,
  onImport,
  existingMaKhoList
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewData, setPreviewData] = useState<ExcelPreviewData | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview'>('upload');

  const resetState = useCallback(() => {
    setPreviewData(null);
    setCurrentStep('upload');
    setDragActive(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onOpenChange(false);
  }, [resetState, onOpenChange]);

  const processFile = useCallback(async (file: File) => {
    const toastId = toast.loading('Đang đọc file Excel...');
    
    try {
      const result = await ExcelUtils.readExcelFile(file);
      
      // Kiểm tra MaKho trùng lặp
      const duplicateErrors: ExcelError[] = [];
      result.data.forEach((warehouse, index) => {
        if (existingMaKhoList.includes(warehouse.MaKho.toLowerCase())) {
          duplicateErrors.push({
            row: index + 2,
            field: 'MaKho',
            message: 'Mã kho đã tồn tại trong hệ thống',
            value: warehouse.MaKho
          });
        }
      });

      const finalResult = {
        ...result,
        errors: [...result.errors, ...duplicateErrors],
        validCount: result.data.filter(warehouse => 
          !existingMaKhoList.includes(warehouse.MaKho.toLowerCase())
        ).length
      };

      setPreviewData(finalResult);
      setCurrentStep('preview');
      toast.success('Đọc file thành công!', { id: toastId });
    } catch (error) {
      toast.error('Lỗi khi đọc file: ' + (error as Error).message, { id: toastId });
    }
  }, [existingMaKhoList]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.match(/\.(xlsx|xls)$/)) {
        toast.error('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
        return;
      }
      processFile(file);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.match(/\.(xlsx|xls)$/)) {
        toast.error('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
        return;
      }
      processFile(file);
    }
  }, [processFile]);

  const handleImport = useCallback(async () => {
    if (!previewData) return;

    setIsImporting(true);
    try {
      await onImport(previewData.data);
      handleClose();
    } catch (error) {
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
    }
  }, [previewData, onImport, handleClose]);

  const downloadTemplate = useCallback(() => {
    ExcelUtils.exportTemplate('template-kho.xlsx');
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            Import Excel - Danh sách kho
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {currentStep === 'upload' && (
            <div className="space-y-6">
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Kéo thả file Excel vào đây
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  hoặc click để chọn file
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileInput}
                  className="hidden"
                  id="excel-upload"
                />
                <label
                  htmlFor="excel-upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  Chọn file
                </label>
              </div>

              {/* Template Download */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Cần file mẫu?</h4>
                    <p className="text-sm text-gray-500">
                      Tải template Excel để biết định dạng dữ liệu
                    </p>
                  </div>
                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Tải template
                  </Button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'preview' && previewData && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Hợp lệ</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {previewData.validCount}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-red-900">Lỗi</p>
                      <p className="text-2xl font-bold text-red-600">
                        {previewData.errors.length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-5 w-5 text-gray-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Tổng cộng</p>
                      <p className="text-2xl font-bold text-gray-600">
                        {previewData.totalCount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Errors */}
              {previewData.errors.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Phát hiện {previewData.errors.length} lỗi:</strong>
                    <div className="mt-2 max-h-32 overflow-y-auto">
                      {previewData.errors.slice(0, 5).map((error, index) => (
                        <div key={index} className="text-sm">
                          Dòng {error.row}: {error.message}
                        </div>
                      ))}
                      {previewData.errors.length > 5 && (
                        <div className="text-sm text-gray-500">
                          ... và {previewData.errors.length - 5} lỗi khác
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Preview Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h4 className="font-medium text-gray-900">
                    Dữ liệu sẽ được import ({previewData.validCount} kho)
                  </h4>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã Kho</TableHead>
                        <TableHead>Tên Kho</TableHead>
                        <TableHead>Địa Chỉ</TableHead>
                        <TableHead>Thủ Kho</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.data.slice(0, 10).map((warehouse, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Badge variant="outline">{warehouse.MaKho}</Badge>
                          </TableCell>
                          <TableCell>{warehouse.TenKho}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {warehouse.DiaChi}
                          </TableCell>
                          <TableCell>{warehouse.ThuKho}</TableCell>
                        </TableRow>
                      ))}
                      {previewData.data.length > 10 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-gray-500">
                            ... và {previewData.data.length - 10} kho khác
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={resetState}>
                  <X className="h-4 w-4 mr-2" />
                  Chọn file khác
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={isImporting || previewData.validCount === 0}
                >
                  {isImporting ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Đang import...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import {previewData.validCount} kho
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
