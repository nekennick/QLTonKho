'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ExcelUtils, type ExcelPreviewData } from '../utils/excelUtils';
import type { ProductFormData } from '../types/product';

interface ImportExcelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (products: ProductFormData[]) => Promise<void>;
  existingMaVTList: string[];
}

export const ImportExcelDialog: React.FC<ImportExcelDialogProps> = ({
  open,
  onOpenChange,
  onImport,
  existingMaVTList
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ExcelPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsLoading(true);

    try {
      const data = await ExcelUtils.readExcelFile(selectedFile);
      setPreviewData(data);
    } catch (error) {
      console.error('Error reading Excel file:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.xlsx')) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleImport = useCallback(async () => {
    if (!previewData || previewData.data.length === 0) return;

    setIsImporting(true);
    try {
      await onImport(previewData.data);
      handleClose();
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsImporting(false);
    }
  }, [previewData, onImport]);

  const handleClose = useCallback(() => {
    setFile(null);
    setPreviewData(null);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleDownloadTemplate = useCallback(() => {
    ExcelUtils.exportTemplate();
  }, []);

  const getValidationErrors = useCallback((product: ProductFormData) => {
    const errors: string[] = [];
    
    if (!product.MaVT) errors.push('Mã VT không được để trống');
    if (!product.TenVT) errors.push('Tên VT không được để trống');
    if (existingMaVTList.includes(product.MaVT)) errors.push('Mã VT đã tồn tại');
    
    return errors;
  }, [existingMaVTList]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Import hàng hóa từ Excel
          </DialogTitle>
          <DialogDescription>
            Tải lên file Excel để import dữ liệu hàng hóa. Đảm bảo file có đúng định dạng.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {!file ? (
            // File Upload Area
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chọn file Excel để upload
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Kéo thả file vào đây hoặc click để chọn file
                </p>
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button variant="outline" size="sm">
                  Chọn file
                </Button>
              </div>

              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Tải template Excel
                </Button>
              </div>
            </div>
          ) : (
            // Preview Data
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-sm text-gray-500">Đang đọc file Excel...</p>
                </div>
              ) : previewData ? (
                <>
                  {/* Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-green-900">Hợp lệ</p>
                          <p className="text-2xl font-bold text-green-600">{previewData.validCount}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-red-900">Lỗi</p>
                          <p className="text-2xl font-bold text-red-600">{previewData.errors.length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <FileSpreadsheet className="h-5 w-5 text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">Tổng</p>
                          <p className="text-2xl font-bold text-blue-600">{previewData.totalCount}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Errors */}
                  {previewData.errors.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <p className="font-medium">Có {previewData.errors.length} lỗi cần khắc phục:</p>
                          <div className="max-h-32 overflow-y-auto">
                            {previewData.errors.slice(0, 10).map((error, index) => (
                              <p key={index} className="text-sm text-red-600">
                                Dòng {error.row}: {error.message}
                              </p>
                            ))}
                            {previewData.errors.length > 10 && (
                              <p className="text-sm text-gray-500">... và {previewData.errors.length - 10} lỗi khác</p>
                            )}
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Preview Table */}
                  {previewData.data.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Dữ liệu sẽ được import:</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Mã VT</TableHead>
                              <TableHead>Tên VT</TableHead>
                              <TableHead>Nhóm VT</TableHead>
                              <TableHead>ĐVT</TableHead>
                              <TableHead>Đơn giá</TableHead>
                              <TableHead>Trạng thái</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {previewData.data.slice(0, 10).map((product, index) => {
                              const errors = getValidationErrors(product);
                              const isValid = errors.length === 0;
                              
                              return (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{product.MaVT}</TableCell>
                                  <TableCell>{product.TenVT}</TableCell>
                                  <TableCell>{product.NhomVT}</TableCell>
                                  <TableCell>{product.ĐVT}</TableCell>
                                  <TableCell>{product.DonGia}</TableCell>
                                  <TableCell>
                                    <Badge variant={isValid ? "default" : "destructive"}>
                                      {isValid ? "Hợp lệ" : "Lỗi"}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                        {previewData.data.length > 10 && (
                          <div className="p-4 text-center text-sm text-gray-500">
                            ... và {previewData.data.length - 10} dòng khác
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isImporting}>
            <X className="mr-2 h-4 w-4" />
            Đóng
          </Button>
          
          {previewData && previewData.data.length > 0 && (
            <Button
              onClick={handleImport}
              disabled={isImporting || previewData.errors.length > 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang import...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import {previewData.validCount} hàng hóa
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
