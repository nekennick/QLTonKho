'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Save, Loader2, X, Building2, MapPin, Image, FileText, User, Sparkles, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Warehouse, WarehouseFormData } from '../types/warehouse';
import { generateWarehouseCode } from '../utils/constants';
import authUtils from '@/utils/authUtils';

interface WarehouseFormProps {
  warehouse?: Warehouse | null;
  formData: WarehouseFormData;
  onFormDataChange: (data: WarehouseFormData) => void;
  onSubmit: (data: WarehouseFormData) => void;
  onCancel: () => void;
  isAdmin: boolean;
  isManager: boolean;
  existingMaKhoList?: string[];
}

export const WarehouseForm: React.FC<WarehouseFormProps> = ({
  warehouse,
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  isAdmin,
  isManager,
  existingMaKhoList = []
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(formData.HinhAnh || null);
  const [isDragging, setIsDragging] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleInputChange = useCallback((field: keyof WarehouseFormData, value: string) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [formData, onFormDataChange, errors]);

  // Image upload handlers
  const handleImageUpload = useCallback(async (file: File) => {
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      const toastId = toast.loading("Đang tải ảnh lên...");

      const result = await authUtils.uploadImage(file);

      if (result?.success && result?.url) {
        handleInputChange('HinhAnh', result.url);
        setSelectedImage(result.url);
        toast.success("Tải ảnh thành công", { id: toastId });
      } else {
        throw new Error("Không thể lấy URL ảnh");
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Lỗi khi tải ảnh: ' + (error as Error).message);
      setSelectedImage(null);
    }
  }, [handleInputChange]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const validation = authUtils.validateImage(file);
      if (!validation.isValid) {
        toast.error(validation.errors.join('\n'));
        return;
      }
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const handleImageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = authUtils.validateImage(file);
      if (!validation.isValid) {
        toast.error(validation.errors.join('\n'));
        return;
      }
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
    handleInputChange('HinhAnh', '');
  }, [handleInputChange]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.MaKho.trim()) {
      newErrors.MaKho = 'Mã kho là bắt buộc';
    }

    if (!formData.TenKho.trim()) {
      newErrors.TenKho = 'Tên kho là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        HinhAnh: selectedImage || formData.HinhAnh
      };
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, selectedImage, onSubmit, validateForm]);

  const isReadOnly = !isAdmin && !isManager;

  return (
    <div className="flex flex-col">
      <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Form Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* Mã Kho */}
              <div className="space-y-2">
                <Label htmlFor="MaKho" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  Mã kho *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="MaKho"
                    value={formData.MaKho}
                    onChange={(e) => handleInputChange('MaKho', e.target.value)}
                    placeholder="Mã kho sẽ tự sinh"
                    className={cn(
                      "h-10 text-sm flex-1",
                      errors.MaKho && "border-red-500 focus:border-red-500"
                    )}
                    disabled={isReadOnly}
                  />
                  {!warehouse && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newCode = generateWarehouseCode(existingMaKhoList);
                        handleInputChange('MaKho', newCode);
                      }}
                      className="h-10 px-3"
                      disabled={isReadOnly}
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {!warehouse && (
                  <p className="text-xs text-gray-500">
                    Nhấn nút ✨ để tự sinh mã kho
                  </p>
                )}
                {errors.MaKho && (
                  <p className="text-xs text-red-600">{errors.MaKho}</p>
                )}
              </div>

              {/* Tên Kho */}
              <div className="space-y-2">
                <Label htmlFor="TenKho" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-green-600" />
                  Tên kho *
                </Label>
                <Input
                  id="TenKho"
                  value={formData.TenKho}
                  onChange={(e) => handleInputChange('TenKho', e.target.value)}
                  placeholder="Nhập tên kho"
                  className={cn(
                    "h-10 text-sm",
                    errors.TenKho && "border-red-500 focus:border-red-500"
                  )}
                  disabled={isReadOnly}
                />
                {errors.TenKho && (
                  <p className="text-xs text-red-600">{errors.TenKho}</p>
                )}
              </div>

              {/* Thủ Kho */}
              <div className="space-y-2">
                <Label htmlFor="ThuKho" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-600" />
                  Thủ kho
                </Label>
                <Input
                  id="ThuKho"
                  value={formData.ThuKho}
                  onChange={(e) => handleInputChange('ThuKho', e.target.value)}
                  placeholder="Nhập tên thủ kho"
                  className="h-10 text-sm"
                  disabled={isReadOnly}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Image className="h-4 w-4 text-orange-600" />
                  Hình ảnh kho
                </Label>
                <div
                  ref={dropZoneRef}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer hover:bg-gray-50",
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  )}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-2 rounded-lg flex items-center justify-center bg-white overflow-hidden mb-3">
                      {selectedImage && selectedImage.trim() !== '' ? (
                        <img
                          src={selectedImage}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Building2 className="h-8 w-8 text-gray-300" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Kéo thả ảnh vào đây hoặc{' '}
                      <label htmlFor="imageUpload" className="text-blue-600 cursor-pointer hover:underline">
                        chọn file
                      </label>
                    </div>
                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={isReadOnly}
                    />
                    <p className="text-xs text-gray-400">PNG, JPG, GIF tối đa 5MB</p>

                    {selectedImage && selectedImage.trim() !== '' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="mt-2 text-xs h-8"
                        disabled={isReadOnly}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Xóa ảnh
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* Địa Chỉ */}
              <div className="space-y-2">
                <Label htmlFor="DiaChi" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  Địa chỉ
                </Label>
                <Textarea
                  id="DiaChi"
                  value={formData.DiaChi}
                  onChange={(e) => handleInputChange('DiaChi', e.target.value)}
                  placeholder="Nhập địa chỉ kho"
                  className="min-h-[100px] text-sm resize-none"
                  disabled={isReadOnly}
                />
              </div>

              {/* Ghi Chú */}
              <div className="space-y-2">
                <Label htmlFor="GhiChu" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  Ghi chú
                </Label>
                <Textarea
                  id="GhiChu"
                  value={formData.GhiChu}
                  onChange={(e) => handleInputChange('GhiChu', e.target.value)}
                  placeholder="Nhập ghi chú về kho"
                  className="min-h-[100px] text-sm resize-none"
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Footer - Always Visible */}
      <DialogFooter className="flex-shrink-0 border-t border-gray-200 bg-white px-6 py-4">
        <div className="flex flex-row gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isSubmitting}
          >
            <X className="mr-2 h-4 w-4" />
            Hủy
          </Button>
          
          {!isReadOnly && (
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {warehouse ? 'Cập nhật' : 'Tạo kho'}
                </>
              )}
            </Button>
          )}
        </div>
      </DialogFooter>
    </div>
  );
};
