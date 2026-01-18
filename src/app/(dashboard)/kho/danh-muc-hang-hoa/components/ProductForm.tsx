'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Save, Loader2, X, Package, MapPin, Image, FileText, Tag, DollarSign, Star, Building2, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Product, ProductFormData } from '../types/product';
import { generateProductCode } from '../utils/constants';
import { EditableSelect } from './EditableSelect';
import { useProductOptions } from '../hooks/useProductOptions';
import authUtils from '@/utils/authUtils';

interface ProductFormProps {
  product?: Product | null;
  formData: ProductFormData;
  onFormDataChange: (data: ProductFormData) => void;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isAdmin: boolean;
  isManager: boolean;
  existingMaVTList?: string[];
  isPageMode?: boolean; // If true, render as page instead of dialog
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  isAdmin,
  isManager,
  existingMaVTList = [],
  isPageMode = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(formData.HinhAnh || null);
  const [isDragging, setIsDragging] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Get dynamic options from API
  const {
    productGroups,
    productUnits,
    productQualities,
    addNewGroup,
    addNewUnit,
    addNewQuality,
    refreshOptions
  } = useProductOptions();

  // Format currency with thousand separators (0.000.000)
  const formatCurrency = useCallback((value: string | number): string => {
    if (!value) return '';
    const numValue = typeof value === 'string' ? value.replace(/\./g, '') : value.toString();
    const num = parseFloat(numValue);
    if (isNaN(num)) return '';
    return num.toLocaleString('vi-VN');
  }, []);

  // Parse currency from formatted string to number string
  const parseCurrency = useCallback((value: string): string => {
    if (!value) return '';
    // Remove all dots (thousand separators)
    const cleaned = value.replace(/\./g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? '' : num.toString();
  }, []);

  const handleInputChange = useCallback((field: keyof ProductFormData, value: string) => {
    // Special handling for DonGia field - format with thousand separators
    if (field === 'DonGia') {
      // Parse the input to remove formatting, then format it again
      const parsed = parseCurrency(value);
      const formatted = formatCurrency(parsed);
      onFormDataChange({
        ...formData,
        [field]: parsed // Store the raw number value
      });
    } else {
      onFormDataChange({
        ...formData,
        [field]: value
      });
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [formData, onFormDataChange, errors, formatCurrency, parseCurrency]);

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

    if (!formData.MaVT.trim()) {
      newErrors.MaVT = 'Mã vật tư là bắt buộc';
    }

    if (!formData.TenVT.trim()) {
      newErrors.TenVT = 'Tên vật tư là bắt buộc';
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
      
      // Refresh options after successful submit to include new values
      refreshOptions();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, selectedImage, onSubmit, validateForm]);

  const isReadOnly = !isAdmin && !isManager;

  return (
    <div className="flex flex-col h-full">
      <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-4 flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8 pb-4">
          {/* Form Fields */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Mã VT */}
              <div className="space-y-2">
                <Label htmlFor="MaVT" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  Mã vật tư *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="MaVT"
                    value={formData.MaVT}
                    onChange={(e) => handleInputChange('MaVT', e.target.value)}
                    placeholder="Mã vật tư sẽ tự sinh"
                    className={cn(
                      "h-10 text-sm flex-1",
                      errors.MaVT && "border-red-500 focus:border-red-500"
                    )}
                    disabled={isReadOnly}
                  />
                  {!product && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newCode = generateProductCode(existingMaVTList);
                        handleInputChange('MaVT', newCode);
                      }}
                      className="h-10 px-3"
                      disabled={isReadOnly}
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {!product && (
                  <p className="text-xs text-gray-500">
                    Nhấn nút ✨ để tự sinh mã vật tư
                  </p>
                )}
                {errors.MaVT && (
                  <p className="text-xs text-red-600">{errors.MaVT}</p>
                )}
              </div>

              {/* Tên VT */}
              <div className="space-y-2">
                <Label htmlFor="TenVT" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Package className="h-4 w-4 text-green-600" />
                  Tên vật tư *
                </Label>
                <Input
                  id="TenVT"
                  value={formData.TenVT}
                  onChange={(e) => handleInputChange('TenVT', e.target.value)}
                  placeholder="Nhập tên vật tư"
                  className={cn(
                    "h-10 text-sm",
                    errors.TenVT && "border-red-500 focus:border-red-500"
                  )}
                  disabled={isReadOnly}
                />
                {errors.TenVT && (
                  <p className="text-xs text-red-600">{errors.TenVT}</p>
                )}
              </div>

              {/* Nhóm VT */}
              <EditableSelect
                value={formData.NhomVT}
                onValueChange={(value) => handleInputChange('NhomVT', value)}
                onAddNew={addNewGroup}
                options={productGroups}
                placeholder="Chọn hoặc thêm nhóm vật tư"
                label="Nhóm vật tư"
                disabled={isReadOnly}
                className="space-y-2"
              />

              {/* ĐVT */}
              <EditableSelect
                value={formData.ĐVT}
                onValueChange={(value) => handleInputChange('ĐVT', value)}
                onAddNew={addNewUnit}
                options={productUnits}
                placeholder="Chọn hoặc thêm đơn vị tính"
                label="Đơn vị tính"
                disabled={isReadOnly}
                className="space-y-2"
              />

              {/* Chất lượng */}
              <EditableSelect
                value={formData.ChatLuong}
                onValueChange={(value) => handleInputChange('ChatLuong', value)}
                onAddNew={addNewQuality}
                options={productQualities}
                placeholder="Chọn hoặc thêm chất lượng"
                label="Chất lượng"
                disabled={isReadOnly}
                className="space-y-2"
              />

              {/* Đơn giá */}
              <div className="space-y-2">
                <Label htmlFor="DonGia" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  Đơn giá
                </Label>
                <Input
                  id="DonGia"
                  type="text"
                  value={formData.DonGia ? formatCurrency(formData.DonGia) : ''}
                  onChange={(e) => handleInputChange('DonGia', e.target.value)}
                  placeholder="0.000.000"
                  className="h-10 text-sm"
                  disabled={isReadOnly}
                  inputMode="numeric"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Nơi SX */}
              <div className="space-y-2">
                <Label htmlFor="NoiSX" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  Nơi sản xuất
                </Label>
                <Input
                  id="NoiSX"
                  value={formData.NoiSX}
                  onChange={(e) => handleInputChange('NoiSX', e.target.value)}
                  placeholder="Nhập nơi sản xuất"
                  className="h-10 text-sm"
                  disabled={isReadOnly}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Image className="h-4 w-4 text-orange-600" />
                  Hình ảnh hàng hóa
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
                        <Package className="h-8 w-8 text-gray-300" />
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
                  placeholder="Nhập ghi chú về hàng hóa"
                  className="min-h-[120px] text-sm resize-none"
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Footer - Always Visible */}
      {isPageMode ? (
        <div className="sticky bottom-0 left-0 right-0 flex-shrink-0 border-t border-gray-200 bg-white px-6 py-4 z-10 shadow-sm">
          <div className="flex flex-row gap-3 w-full max-w-6xl mx-auto">
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
                    {product ? 'Cập nhật' : 'Tạo hàng hóa'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      ) : (
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
                    {product ? 'Cập nhật' : 'Tạo hàng hóa'}
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      )}
    </div>
  );
};
