// components/SalaryChangeDialog.tsx
'use client';

import React, { useState } from 'react';
import { TrendingUp, Save, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SALARY_LEVELS } from '../utils/constants';
import type { Employee } from '../types/employee';

interface SalaryChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onConfirm: (newSalaryLevel: string, reason: string) => Promise<void>;
}

export const SalaryChangeDialog: React.FC<SalaryChangeDialogProps> = ({
  open,
  onOpenChange,
  employee,
  onConfirm
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (employee && open) {
      setSelectedLevel(employee['Bậc lương'] || 'Bậc 1');
      setReason('');
    }
  }, [employee, open]);

  const handleSubmit = async () => {
    if (!employee || !selectedLevel || selectedLevel === employee['Bậc lương']) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(selectedLevel, reason.trim());
      onOpenChange(false);
    } catch (error) {
      console.error('Error changing salary:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isChanged = selectedLevel !== employee?.['Bậc lương'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Thay đổi bậc lương
          </DialogTitle>
        </DialogHeader>

        {employee && (
          <div className="space-y-4">
            {/* Thông tin nhân viên */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-700">
                {employee['Họ và Tên']}
              </div>
              <div className="text-xs text-gray-500">
                {employee['Chức vụ']} - {employee['Phòng']}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Bậc lương hiện tại: <span className="font-medium">{employee['Bậc lương']}</span>
              </div>
            </div>

            {/* Chọn bậc lương mới */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                Bậc lương mới <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {SALARY_LEVELS.map((level) => (
                  <Label 
                    key={level.value} 
                    className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50 text-xs"
                  >
                    <input
                      type="radio"
                      name="newSalaryLevel"
                      value={level.value}
                      checked={selectedLevel === level.value}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="h-3 w-3 text-primary focus:ring-primary"
                    />
                    <TrendingUp className="h-3 w-3 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-700">{level.label}</span>
                  </Label>
                ))}
              </div>
            </div>

            {/* Lý do thay đổi */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
                Lý do thay đổi (tùy chọn)
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do thay đổi bậc lương..."
                className="resize-none min-h-[80px] text-sm"
                rows={3}
              />
            </div>

            {/* Warning nếu chưa thay đổi */}
            {!isChanged && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Vui lòng chọn bậc lương khác với bậc lương hiện tại
                </AlertDescription>
              </Alert>
            )}

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !isChanged}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Cập nhật
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};