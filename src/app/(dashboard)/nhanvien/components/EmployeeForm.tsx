'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  Save, Loader2, X, User, Mail, Phone, MapPin, FileText,
  Eye, EyeOff, Shield, Briefcase, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Employee, EmployeeFormData } from '../types/employee';
import { navigation, NavigationItem } from '@/lib/navigation';
import authUtils from '@/utils/authUtils';
interface EmployeeFormProps {
  employee?: Employee | null;
  formData: EmployeeFormData;
  onFormDataChange: (data: EmployeeFormData) => void;
  onSubmit: (data: EmployeeFormData) => void;
  onCancel: () => void;
  isAdmin: boolean;
  isManager: boolean;
  departments: string[];
  positions: string[];
}

// LazyImage Component - Tối ưu responsive
const LazyImage = React.memo<{
  src: string;
  alt: string;
  className?: string;
}>(({ src, alt, className }) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src || src.trim() === '') {
      setLoading(false);
      setError(true);
      return;
    }

    setLoading(true);
    setError(false);

    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setLoading(false);
    };
    img.onerror = () => {
      setError(true);
      setLoading(false);
    };
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  if (loading) {
    return (
      <div className={cn("animate-pulse bg-gray-200 rounded-full", className)} />
    );
  }

  if (error || !imageSrc) {
    return <User className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 text-gray-300" />;
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
});

LazyImage.displayName = 'LazyImage';

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  isAdmin,
  isManager,
  departments,
  positions
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(formData.Image || null);
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isAddingPosition, setIsAddingPosition] = useState(false);
  const [newPosition, setNewPosition] = useState('');
  const [isAddingDepartment, setIsAddingDepartment] = useState(false);
  const [newDepartment, setNewDepartment] = useState('');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Mặc định Ngày vào làm = hôm nay khi đang thêm mới và trống
  useEffect(() => {
    if (!formData['Ngày vào làm']) {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      updateFormData('Ngày vào làm', `${y}-${m}-${d}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detect mobile keyboard open/close
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let initialViewportHeight = window.innerHeight;
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
          const currentHeight = window.innerHeight;
          // If viewport height decreased by more than 150px, keyboard is likely open
          const heightDiff = initialViewportHeight - currentHeight;
          setIsKeyboardOpen(heightDiff > 150);
          
          // Update initial height if keyboard is closed
          if (heightDiff < 50) {
            initialViewportHeight = currentHeight;
          }
        } else {
          setIsKeyboardOpen(false);
        }
      }, 100);
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
          setIsKeyboardOpen(true);
          // Scroll input into view after keyboard opens
          setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
          }, 300);
        }
      }
    };

    const handleFocusOut = () => {
      // Delay to check if keyboard actually closed
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setTimeout(() => {
          const currentHeight = window.innerHeight;
          const heightDiff = initialViewportHeight - currentHeight;
          // If height is close to initial, keyboard is closed
          setIsKeyboardOpen(heightDiff > 150);
        }, 200);
      } else {
        setIsKeyboardOpen(false);
      }
    };

    // Use Visual Viewport API if available (better for mobile)
    if (window.visualViewport) {
      const handleVisualViewportResize = () => {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
          const viewport = window.visualViewport!;
          const heightDiff = window.innerHeight - viewport.height;
          setIsKeyboardOpen(heightDiff > 150);
        } else {
          setIsKeyboardOpen(false);
        }
      };
      
      window.visualViewport.addEventListener('resize', handleVisualViewportResize);
      window.addEventListener('resize', handleResize);
      document.addEventListener('focusin', handleFocusIn);
      document.addEventListener('focusout', handleFocusOut);

      return () => {
        window.visualViewport?.removeEventListener('resize', handleVisualViewportResize);
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('focusin', handleFocusIn);
        document.removeEventListener('focusout', handleFocusOut);
        clearTimeout(timeoutId);
      };
    } else {
      // Fallback for browsers without Visual Viewport API
      window.addEventListener('resize', handleResize);
      document.addEventListener('focusin', handleFocusIn);
      document.addEventListener('focusout', handleFocusOut);

      return () => {
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('focusin', handleFocusIn);
        document.removeEventListener('focusout', handleFocusOut);
        clearTimeout(timeoutId);
      };
    }
  }, []);

  const getAllNavigationItems = useCallback((items: NavigationItem[]): NavigationItem[] => {
    const allItems: NavigationItem[] = [];

    items.forEach(item => {
      if (!item.isGroup) {
        allItems.push(item);
      }

      if (item.children) {
        allItems.push(...item.children);
      }
    });

    return allItems;
  }, []);

  // Memoized selected permissions
  const selectedPermissions = useMemo(() => {
    if (formData['Quyền View']) {
      return formData['Quyền View'].split(',').map(item => item.trim()).filter(Boolean);
    }
    return [];
  }, [formData['Quyền View']]);

  const isEditMode = Boolean(employee);

  // Memoized role options
  const roleOptions = useMemo(() => [
    { value: 'Admin', label: 'Admin', desc: 'Quản trị viên hệ thống', icon: Shield, disabled: !isAdmin },
    { value: 'Giám đốc', label: 'Giám đốc', desc: 'Quản lý cấp cao', icon: Briefcase, disabled: !isAdmin },
    { value: 'Quản lý', label: 'Quản lý', desc: 'Quản lý trung cấp', icon: Users, disabled: !isAdmin && !isManager },
    { value: 'Nhân viên', label: 'Nhân viên', desc: 'Người dùng thông thường', icon: User, disabled: false }
  ], [isAdmin, isManager]);

  // Form handlers
  const updateFormData = useCallback((field: keyof EmployeeFormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  }, [formData, onFormDataChange]);
  // Auto update permissions for Admin
  useEffect(() => {
    if (formData['Phân quyền'] === 'Admin') {
      const allItems = getAllNavigationItems(navigation);
      const allPermissions = allItems.map(item => item.name);
      const currentPermissions = formData['Quyền View'];
      const allPermissionsString = allPermissions.join(', ');

      if (currentPermissions !== allPermissionsString) {
        updateFormData('Quyền View', allPermissionsString);
      }
    }
  }, [formData['Phân quyền'], formData['Quyền View'], updateFormData, getAllNavigationItems]);

  // Permission handlers
  const handlePermissionChange = useCallback((navName: string, checked: boolean) => {
    const currentPermissions = selectedPermissions;
    let newPermissions: string[];

    if (checked) {
      newPermissions = [...currentPermissions, navName];
    } else {
      newPermissions = currentPermissions.filter(perm => perm !== navName);
    }

    updateFormData('Quyền View', newPermissions.join(', '));
  }, [selectedPermissions, updateFormData]);

  const handleSelectAll = useCallback(() => {
    const allItems = getAllNavigationItems(navigation);
    const allPermissions = allItems.map(item => item.name);
    updateFormData('Quyền View', allPermissions.join(', '));
  }, [updateFormData, getAllNavigationItems]);

  const handleDeselectAll = useCallback(() => {
    updateFormData('Quyền View', '');
  }, [updateFormData]);

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
        updateFormData('Image', result.url);
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
  }, [updateFormData]);

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
    updateFormData('Image', '');
  }, [updateFormData]);

  // Validation
  const validateEmployee = useCallback((employee: EmployeeFormData): string[] => {
    const errors: string[] = [];

    if (!employee['Họ và Tên']?.trim()) errors.push('Họ và tên không được để trống');
    if (!employee['username']?.trim()) errors.push('Tên đăng nhập không được để trống');
    if (!isEditMode && !employee['password']?.trim()) errors.push('Mật khẩu không được để trống');
    if (!employee['Email']?.trim()) errors.push('Email không được để trống');

    if (employee['Số điện thoại'] && !/^[0-9+\-\s()]+$/.test(employee['Số điện thoại'])) {
      errors.push('Số điện thoại không hợp lệ');
    }

    if (employee['Email'] && !/\S+@\S+\.\S+/.test(employee['Email'])) {
      errors.push('Email không hợp lệ');
    }

    if (!isEditMode && employee['password'] && employee['password'].length < 3) {
      errors.push('Mật khẩu phải có ít nhất 3 ký tự');
    }

    return errors;
  }, [isEditMode]);

  // Handle form submission
  const submitForm = useCallback(async () => {
    if (isSubmitting || (!isAdmin && !isManager)) {
      if (!isAdmin && !isManager) {
        toast.error('Bạn không có quyền thực hiện chức năng này!');
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const employeeToValidate = {
        ...formData,
        Image: selectedImage || ''
      };

      const errors = validateEmployee(employeeToValidate);
      if (errors.length > 0) {
        toast.error(errors.join('\n'));
        setIsSubmitting(false);
        return;
      }

      if (!isAdmin && ['Admin', 'Giám đốc'].includes(employeeToValidate['Phân quyền'])) {
        toast.error('Bạn không có quyền tạo/sửa Admin hoặc Giám đốc!');
        setIsSubmitting(false);
        return;
      }

      await onSubmit(employeeToValidate);
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('Có lỗi xảy ra khi xử lý form');
    } finally {
      setIsSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, isManager, formData, selectedImage, validateEmployee, onSubmit]);

  // Input handlers
  const inputHandlers = useMemo(() => ({
    fullName: (e: React.ChangeEvent<HTMLInputElement>) => updateFormData('Họ và Tên', e.target.value),
    email: (e: React.ChangeEvent<HTMLInputElement>) => updateFormData('Email', e.target.value),
    phone: (e: React.ChangeEvent<HTMLInputElement>) => updateFormData('Số điện thoại', e.target.value),
    address: (e: React.ChangeEvent<HTMLTextAreaElement>) => updateFormData('Địa chỉ', e.target.value),
    notes: (e: React.ChangeEvent<HTMLTextAreaElement>) => updateFormData('Ghi chú', e.target.value),
    username: (e: React.ChangeEvent<HTMLInputElement>) => updateFormData('username', e.target.value),
    password: (e: React.ChangeEvent<HTMLInputElement>) => updateFormData('password', e.target.value),
    position: (value: string) => updateFormData('Chức vụ', value),
    department: (value: string) => updateFormData('Phòng', value),
  }), [updateFormData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  }, [submitForm]);

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto min-h-0">
          <form onSubmit={handleSubmit} className={`px-6 py-4 transition-all duration-200 ${isKeyboardOpen ? 'pb-4' : 'pb-16 sm:pb-20'}`}>
            <div className="space-y-3 sm:space-y-4 lg:space-y-5">
              {/* Responsive Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">

            {/* Column 1 - Basic Information */}
            <div className="space-y-2 sm:space-y-3 lg:space-y-4">

              {/* Họ và tên */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-xs sm:text-sm font-medium text-gray-700">
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={formData['Họ và Tên'] || ''}
                  onChange={inputHandlers.fullName}
                  placeholder="Nhập họ và tên"
                  className="h-8 sm:h-9 lg:h-10 text-xs sm:text-sm"
                  required
                />
              </div>

              {/* Chức vụ */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-gray-700">
                  Chức vụ
                </Label>
                {!isAddingPosition ? (
                  <Select
                    value={formData['Chức vụ'] || ''}
                    onValueChange={(val) => {
                      if (val === '__new__') {
                        setIsAddingPosition(true);
                        setNewPosition('');
                        return;
                      }
                      inputHandlers.position(val);
                    }}
                  >
                    <SelectTrigger className="h-8 sm:h-9 lg:h-10 text-xs sm:text-sm">
                      <SelectValue placeholder="Chọn chức vụ" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos}
                        </SelectItem>
                      ))}
                      <SelectItem value="__new__">+ Thêm mới...</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      autoFocus
                      value={newPosition}
                      onChange={(e) => setNewPosition(e.target.value)}
                      placeholder="Nhập chức vụ mới"
                      className="h-8 sm:h-9 lg:h-10 text-xs sm:text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const v = newPosition.trim();
                          if (v) {
                            inputHandlers.position(v);
                            setIsAddingPosition(false);
                          }
                        } else if (e.key === 'Escape') {
                          setIsAddingPosition(false);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 sm:h-9 lg:h-10 text-xs"
                      onClick={() => {
                        const v = newPosition.trim();
                        if (v) {
                          inputHandlers.position(v);
                          setIsAddingPosition(false);
                        }
                      }}
                    >
                      Lưu
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 sm:h-9 lg:h-10 text-xs"
                      onClick={() => setIsAddingPosition(false)}
                    >
                      Hủy
                    </Button>
                  </div>
                )}
              </div>

              {/* Phòng ban */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-gray-700">
                  Phòng ban
                </Label>
                {!isAddingDepartment ? (
                  <Select
                    value={formData['Phòng'] || ''}
                    onValueChange={(val) => {
                      if (val === '__new_dep__') {
                        setIsAddingDepartment(true);
                        setNewDepartment('');
                        return;
                      }
                      inputHandlers.department(val);
                    }}
                  >
                    <SelectTrigger className="h-8 sm:h-9 lg:h-10 text-xs sm:text-sm">
                      <SelectValue placeholder="Chọn phòng ban" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dep) => (
                        <SelectItem key={dep} value={dep}>
                          {dep}
                        </SelectItem>
                      ))}
                      <SelectItem value="__new_dep__">+ Thêm mới...</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      autoFocus
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      placeholder="Nhập phòng ban mới"
                      className="h-8 sm:h-9 lg:h-10 text-xs sm:text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const v = newDepartment.trim();
                          if (v) {
                            inputHandlers.department(v);
                            setIsAddingDepartment(false);
                          }
                        } else if (e.key === 'Escape') {
                          setIsAddingDepartment(false);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 sm:h-9 lg:h-10 text-xs"
                      onClick={() => {
                        const v = newDepartment.trim();
                        if (v) {
                          inputHandlers.department(v);
                          setIsAddingDepartment(false);
                        }
                      }}
                    >
                      Lưu
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 sm:h-9 lg:h-10 text-xs"
                      onClick={() => setIsAddingDepartment(false)}
                    >
                      Hủy
                    </Button>
                  </div>
                )}
              </div>

              {/* Ngày sinh */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-gray-700">
                  Ngày sinh
                </Label>
                <Input
                  type="date"
                  value={formData['Ngày sinh'] || ''}
                  onChange={(e) => updateFormData('Ngày sinh', e.target.value)}
                  className="h-8 sm:h-9 lg:h-10 text-xs sm:text-sm"
                />
              </div>

              {/* Ngày vào làm */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-gray-700">
                  Ngày vào làm
                </Label>
                <Input
                  type="date"
                  value={formData['Ngày vào làm'] || ''}
                  onChange={(e) => updateFormData('Ngày vào làm', e.target.value)}
                  className="h-8 sm:h-9 lg:h-10 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Column 2 - Contact & Bank Information */}
            <div className="space-y-2 sm:space-y-3 lg:space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-8 sm:pl-10 h-8 sm:h-9 lg:h-10 text-xs sm:text-sm"
                    value={formData['Email'] || ''}
                    onChange={inputHandlers.email}
                    placeholder="Nhập địa chỉ email"
                    required
                  />
                </div>
              </div>

              {/* Số điện thoại */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs sm:text-sm font-medium text-gray-700">
                  Số điện thoại
                </Label>
                <div className="relative">
                  <Phone className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    className="pl-8 sm:pl-10 h-8 sm:h-9 lg:h-10 text-xs sm:text-sm"
                    value={formData['Số điện thoại'] || ''}
                    onChange={inputHandlers.phone}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>


              {/* Địa chỉ */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs sm:text-sm font-medium text-gray-700">
                  Địa chỉ
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-2 sm:left-3 top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  <Textarea
                    id="address"
                    className="pl-8 sm:pl-10 resize-none min-h-[60px] sm:min-h-[80px] lg:min-h-[100px] text-xs sm:text-sm"
                    rows={3}
                    value={formData['Địa chỉ'] || ''}
                    onChange={inputHandlers.address}
                    placeholder="Nhập địa chỉ"
                  />
                </div>
              </div>


              {/* Ghi chú */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-xs sm:text-sm font-medium text-gray-700">
                  Ghi chú
                </Label>
                <div className="relative">
                  <FileText className="absolute left-2 sm:left-3 top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  <Textarea
                    id="notes"
                    className="pl-8 sm:pl-10 resize-none min-h-[60px] sm:min-h-[80px] lg:min-h-[100px] text-xs sm:text-sm"
                    rows={3}
                    value={formData['Ghi chú'] || ''}
                    onChange={inputHandlers.notes}
                    placeholder="Nhập ghi chú"
                  />
                </div>
              </div>
            </div>

            {/* Column 3 - Account & Status Information */}
            <div className="space-y-2 sm:space-y-3 lg:space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs sm:text-sm font-medium text-gray-700">
                  Tên đăng nhập <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  <Input
                    id="username"
                    className={`pl-8 sm:pl-10 h-8 sm:h-9 lg:h-10 text-xs sm:text-sm ${isEditMode ? 'bg-gray-100' : ''}`}
                    value={formData['username'] || ''}
                    onChange={inputHandlers.username}
                    placeholder="Nhập tên đăng nhập"
                    readOnly={isEditMode}
                    required
                  />
                </div>
                {isEditMode && (
                  <p className="text-xs text-gray-500 mt-1">
                    Tên đăng nhập không thể thay đổi sau khi đã tạo.
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs sm:text-sm font-medium text-gray-700">
                  Mật khẩu {!isEditMode && <span className="text-red-500">*</span>}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="pr-8 sm:pr-10 h-8 sm:h-9 lg:h-10 text-xs sm:text-sm"
                    value={formData['password'] || ''}
                    onChange={inputHandlers.password}
                    placeholder={isEditMode ? 'Nhập để thay đổi mật khẩu' : 'Nhập mật khẩu'}
                    required={!isEditMode}
                  />
                  <Button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 p-0"
                  >
                    {showPassword ?
                      <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> :
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                    }
                  </Button>
                </div>
                {isEditMode && (
                  <p className="text-xs text-gray-500 mt-1">
                    Để trống nếu không muốn thay đổi mật khẩu.
                  </p>
                )}
              </div>


              {/* Phân quyền */}
              <div className="space-y-3">
                <Label className="text-xs sm:text-sm font-medium text-gray-700">
                  Phân quyền <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-2">
                  {roleOptions.map((role) => (
                    <Label key={role.value} className={cn(
                      "flex items-start space-x-2 cursor-pointer p-2 sm:p-3 border rounded-lg transition-colors text-xs sm:text-sm",
                      role.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                    )}>
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={formData['Phân quyền'] === role.value}
                        onChange={(e) => updateFormData('Phân quyền', e.target.value)}
                        disabled={role.disabled}
                        className="h-3 w-3 sm:h-4 sm:w-4 text-primary focus:ring-primary mt-0.5 flex-shrink-0"
                      />
                      <div className="flex items-start space-x-2 flex-1 min-w-0">
                        <role.icon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium ${role.disabled ? 'text-gray-400' : 'text-gray-700'}`}>
                            {role.label}
                          </div>
                          <div className={`text-xs ${role.disabled ? 'text-gray-300' : 'text-gray-500'}`}>
                            {role.desc}
                          </div>
                        </div>
                      </div>
                    </Label>
                  ))}
                </div>
                {!isAdmin && (
                  <p className="text-xs text-red-500 mt-2 flex items-center">
                    <Shield className="h-3 w-3 mr-1 flex-shrink-0" />
                    Chỉ Admin mới có quyền tạo/sửa tài khoản Admin và Giám đốc
                  </p>
                )}
              </div>
            </div>

            {/* Column 4 - Image Upload & Permissions */}
            <div className="space-y-2 sm:space-y-3 lg:space-y-4 lg:col-span-2 xl:col-span-1">
              {/* Image Upload Section - Responsive */}
              <div
                ref={dropZoneRef}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-lg p-3 sm:p-4 lg:p-6 text-center transition-colors cursor-pointer hover:bg-gray-50",
                  isDragging ? 'border-primary bg-primary/10' : 'border-gray-300'
                )}
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 border-2 rounded-full flex items-center justify-center bg-white overflow-hidden mb-2 sm:mb-3 lg:mb-4">
                    {selectedImage && selectedImage.trim() !== '' ? (
                      <LazyImage
                        src={selectedImage}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <User className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 text-gray-300" />
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mb-2 text-center">
                    Kéo thả ảnh vào đây hoặc{' '}
                    <label htmlFor="imageUpload" className="text-primary cursor-pointer hover:underline">
                      chọn file
                    </label>
                  </div>
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-400">PNG, JPG, GIF tối đa 5MB</p>

                  {selectedImage && selectedImage.trim() !== '' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveImage}
                      className="mt-2 text-xs h-7 sm:h-8"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Xóa ảnh
                    </Button>
                  )}
                </div>
              </div>

              {/* Permissions Section - Responsive */}
              <div className="space-y-3">
                <Label className="text-xs sm:text-sm font-medium text-gray-700">
                  Quyền xem menu
                </Label>

                {/* Select All/Deselect All buttons */}
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="text-xs h-7 sm:h-8 flex-1"
                    disabled={formData['Phân quyền'] === 'Admin'}
                  >
                    Chọn tất cả
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectAll}
                    className="text-xs h-7 sm:h-8 flex-1"
                    disabled={formData['Phân quyền'] === 'Admin'}
                  >
                    Bỏ chọn tất cả
                  </Button>
                </div>

                {/* Permission checkboxes with groups */}
                <div className="space-y-3 max-h-40 sm:max-h-48 lg:max-h-56 overflow-y-auto border rounded-lg p-3">
                  {navigation.map((navItem) => {
                    const Icon = navItem.icon;
                    const isDisabled = formData['Phân quyền'] === 'Admin';

                    // Nếu là group có children
                    if (navItem.isGroup && navItem.children) {
                      const groupChildren = navItem.children;
                      const checkedChildren = groupChildren.filter(child =>
                        selectedPermissions.includes(child.name)
                      );
                      const isGroupFullyChecked = checkedChildren.length === groupChildren.length;
                      const isGroupPartiallyChecked = checkedChildren.length > 0 && checkedChildren.length < groupChildren.length;

                      return (
                        <div key={navItem.name} className="space-y-2">
                          {/* Group Header */}
                          <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`group-${navItem.name}`}
                                checked={isGroupFullyChecked}
                                disabled={isDisabled}
                                ref={(ref) => {
                                  if (ref && 'indeterminate' in ref) {
                                    (ref as HTMLInputElement).indeterminate = isGroupPartiallyChecked;
                                  }
                                }}
                                onCheckedChange={(checked) => {
                                  groupChildren.forEach(child => {
                                    handlePermissionChange(child.name, checked as boolean);
                                  });
                                }}
                              />
                              <Label
                                htmlFor={`group-${navItem.name}`}
                                className="flex items-center space-x-2 cursor-pointer font-medium text-xs sm:text-sm"
                              >
                                <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 flex-shrink-0" />
                                <span className="text-gray-700">{navItem.name}</span>
                                <span className="text-xs text-gray-500">
                                  ({checkedChildren.length}/{groupChildren.length})
                                </span>
                              </Label>
                            </div>
                          </div>

                          {/* Group Children */}
                          <div className="ml-4 sm:ml-6 space-y-2">
                            {groupChildren.map((child) => {
                              const ChildIcon = child.icon;
                              const isChecked = selectedPermissions.includes(child.name);

                              return (
                                <div key={child.name} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`perm-${child.name}`}
                                    checked={isChecked}
                                    disabled={isDisabled}
                                    onCheckedChange={(checked) =>
                                      handlePermissionChange(child.name, checked as boolean)
                                    }
                                  />
                                  <Label
                                    htmlFor={`perm-${child.name}`}
                                    className="flex items-center space-x-2 cursor-pointer flex-1 min-w-0 text-xs sm:text-sm"
                                  >
                                    <ChildIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                                    <span className="truncate text-gray-600">
                                      {child.name}
                                    </span>
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    // Nếu là item đơn lẻ (không phải group)
                    if (!navItem.isGroup) {
                      const isChecked = selectedPermissions.includes(navItem.name);

                      return (
                        <div key={navItem.name} className="flex items-center space-x-2">
                          <Checkbox
                            id={`perm-${navItem.name}`}
                            checked={isChecked}
                            disabled={isDisabled}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(navItem.name, checked as boolean)
                            }
                          />
                          <Label
                            htmlFor={`perm-${navItem.name}`}
                            className="flex items-center space-x-2 cursor-pointer flex-1 min-w-0 text-xs sm:text-sm"
                          >
                            <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                            <span className="truncate font-medium text-gray-700">
                              {navItem.name}
                            </span>
                          </Label>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>

                {formData['Phân quyền'] === 'Admin' && (
                  <p className="text-xs text-primary mt-2">
                    Admin có quyền truy cập tất cả menu
                  </p>
                )}

                {/* Display selected permissions count */}
                {selectedPermissions.length > 0 && formData['Phân quyền'] !== 'Admin' && (
                  <div className="mt-2 p-2 sm:p-3 bg-gray-50 rounded text-xs">
                    <span className="font-medium text-gray-700">
                      Đã chọn {selectedPermissions.length} quyền
                    </span>
                  </div>
                )}
              </div>
              </div>
            </div>
          </div>
          </form>
        </div>
      </div>

      {/* Footer - Fixed at Bottom of Viewport */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-lg lg:left-16 transition-all duration-200 ${
        isKeyboardOpen ? 'translate-y-full sm:translate-y-0' : 'translate-y-0'
      }`}>
        <div className="px-4 sm:px-6 py-3 sm:py-4 max-w-full">
          <div className="flex flex-row gap-3 w-full">
            <Button
              onClick={onCancel}
              variant="outline"
              disabled={isSubmitting}
              type="button"
              className="flex-1 h-10 sm:h-11 text-sm sm:text-base"
            >
              <X className="mr-2 h-4 w-4" />
              Hủy
            </Button>
            <Button
              onClick={submitForm}
              disabled={isSubmitting}
              className="flex-1 h-10 sm:h-11 text-sm sm:text-base"
              type="button"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Đang lưu...</span>
                  <span className="sm:hidden">Lưu...</span>
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">{isEditMode ? 'Cập nhật nhân viên' : 'Thêm nhân viên'}</span>
                  <span className="sm:hidden">{isEditMode ? 'Cập nhật' : 'Thêm mới'}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};