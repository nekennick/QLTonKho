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
import type { EmployeeFormData } from '../types/employee';
import toast from 'react-hot-toast';

interface ImportExcelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (employees: EmployeeFormData[]) => Promise<void>;
  existingUsernames: string[];
}

export const ImportExcelDialog: React.FC<ImportExcelDialogProps> = ({
  open,
  onOpenChange,
  onImport,
  existingUsernames
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
      
      // Kiểm tra username trùng lặp
      const duplicateErrors: ExcelError[] = [];
      result.data.forEach((emp, index) => {
        if (existingUsernames.includes(emp.username.toLowerCase())) {
          duplicateErrors.push({
            row: index + 2,
            field: 'username',
            message: 'Username đã tồn tại trong hệ thống',
            value: emp.username
          });
        }
      });

      const finalResult = {
        ...result,
        errors: [...result.errors, ...duplicateErrors],
        validCount: result.data.filter(emp => 
          !existingUsernames.includes(emp.username.toLowerCase())
        ).length
      };

      setPreviewData(finalResult);
      setCurrentStep('preview');
      toast.success('Đọc file thành công!', { id: toastId });
    } catch (error) {
      toast.error('Lỗi khi đọc file: ' + (error as Error).message, { id: toastId });
    }
  }, [existingUsernames]);

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

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = '';
  }, [processFile]);

  const handleImport = useCallback(async () => {
    if (!previewData || previewData.validCount === 0) {
      toast.error('Không có dữ liệu hợp lệ để import');
      return;
    }

    setIsImporting(true);
    const toastId = toast.loading('Đang import dữ liệu...');

    try {
      // Lọc ra các employee hợp lệ (không có lỗi và không trùng username)
      const validEmployees = previewData.data.filter(emp => 
        !existingUsernames.includes(emp.username.toLowerCase())
      );

      await onImport(validEmployees);
      toast.success(`Import thành công ${validEmployees.length} nhân viên!`, { id: toastId });
      handleClose();
    } catch (error) {
      toast.error('Lỗi khi import: ' + (error as Error).message, { id: toastId });
    } finally {
      setIsImporting(false);
    }
  }, [previewData, existingUsernames, onImport, handleClose]);

  const handleDownloadTemplate = useCallback(() => {
    const result = ExcelUtils.exportTemplate();
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  }, []);

  const getRowClassName = useCallback((employee: EmployeeFormData, index: number) => {
    const hasError = previewData?.errors.some(error => error.row === index + 2);
    const isDuplicate = existingUsernames.includes(employee.username.toLowerCase());
    
    if (hasError || isDuplicate) {
      return 'bg-red-50 hover:bg-red-100';
    }
    return 'hover:bg-gray-50';
  }, [previewData?.errors, existingUsernames]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Import nhân viên từ Excel
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {currentStep === 'upload' && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 p-8">
              <div
                className={`w-full max-w-md p-8 border-2 border-dashed rounded-lg text-center transition-colors ${
                  dragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
                }`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDragActive(false);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Kéo thả file Excel vào đây
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  hoặc chọn file từ máy tính
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="excel-file-input"
                />
                <label
                  htmlFor="excel-file-input"
                  className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 cursor-pointer"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Chọn file Excel
                </label>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Tải template Excel
                </Button>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  File Excel phải chứa các cột: Username*, Họ và Tên*, Email*
                </p>
                <p className="text-xs text-gray-500">
                  * = Trường bắt buộc. Các trường khác: Chức vụ, Phòng, Phân quyền, Image, Quyền View, Số điện thoại, Địa chỉ, Ngày sinh, Ngày vào làm, Ghi chú
                </p>
                <p className="text-xs text-primary">
                  Mật khẩu sẽ được tự động tạo mặc định cho nhân viên mới
                </p>
              </div>
            </div>
          )}

          {currentStep === 'preview' && previewData && (
            <div className="flex-1 flex flex-col space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    <span className="font-medium">Tổng số dòng</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">{previewData.totalCount}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Hợp lệ</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{previewData.validCount}</p>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="font-medium">Có lỗi</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {previewData.totalCount - previewData.validCount}
                  </p>
                </div>
              </div>

              {/* Errors Summary */}
              {previewData.errors.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">Danh sách lỗi:</p>
                      <div className="max-h-20 overflow-y-auto space-y-1">
                        {previewData.errors.slice(0, 5).map((error, index) => (
                          <p key={index} className="text-sm">
                            Dòng {error.row}: {error.field} - {error.message}
                          </p>
                        ))}
                        {previewData.errors.length > 5 && (
                          <p className="text-sm text-gray-500">
                            ... và {previewData.errors.length - 5} lỗi khác
                          </p>
                        )}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Preview Table */}
              <div className="flex-1 border rounded-lg overflow-hidden">
                <div className="overflow-auto max-h-96">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white">
                      <TableRow>
                        <TableHead className="w-12">STT</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Họ và Tên</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Chức vụ</TableHead>
                        <TableHead>Phòng</TableHead>
                        <TableHead>Phân quyền</TableHead>
                        <TableHead>Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.data.map((employee, index) => {
                        const rowErrors = previewData.errors.filter(error => error.row === index + 2);
                        const isDuplicate = existingUsernames.includes(employee.username.toLowerCase());
                        const hasError = rowErrors.length > 0 || isDuplicate;

                        return (
                          <TableRow key={index} className={getRowClassName(employee, index)}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{employee.username}</TableCell>
                            <TableCell>{employee['Họ và Tên']}</TableCell>
                            <TableCell>{employee['Email']}</TableCell>
                            <TableCell>{employee['Chức vụ']}</TableCell>
                            <TableCell>{employee['Phòng']}</TableCell>
                            <TableCell>{employee['Phân quyền']}</TableCell>
                            <TableCell>
                              {hasError ? (
                                <Badge variant="destructive" className="text-xs">
                                  {isDuplicate ? 'Trùng lặp' : 'Có lỗi'}
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  Hợp lệ
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            {currentStep === 'preview' && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep('upload')}
                disabled={isImporting}
              >
                ← Chọn file khác
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isImporting}>
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
            
            {currentStep === 'preview' && previewData && previewData.validCount > 0 && (
              <Button
                onClick={handleImport}
                disabled={isImporting}
              className="bg-green-600 hover:bg-green-700"
             >
               {isImporting ? (
                 <>
                   <Upload className="h-4 w-4 mr-2 animate-spin" />
                   Đang import...
                 </>
               ) : (
                 <>
                   <Upload className="h-4 w-4 mr-2" />
                   Import {previewData.validCount} nhân viên
                 </>
               )}
             </Button>
           )}
         </div>
       </div>
     </DialogContent>
   </Dialog>
 );
};