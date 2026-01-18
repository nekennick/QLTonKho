'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Eye, Edit, User, Mail, Phone, MapPin, Briefcase, Building, Shield, Calendar, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useEmployeesQuery } from '../hooks/useEmployeesQuery';
import { formatDate, formatPhoneNumber } from '../lib/formatters';
import { EMPLOYEE_ROLES } from '../utils/constants';
import type { Employee } from '../types/employee';
import authUtils from '@/utils/authUtils';
import toast from 'react-hot-toast';

export default function EmployeeDetailPage() {
  const params = useParams<{ username: string }>();
  const rawUsername = Array.isArray(params?.username) ? params?.username[0] : params?.username;
  const decodedUsername = decodeURIComponent(rawUsername || '');
  usePageTitle('Chi tiết nhân viên');

  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    if (params && !rawUsername) {
      toast.error('Không tìm thấy nhân viên');
      router.push('/nhanvien');
    }
  }, [params, rawUsername, router]);

  useEffect(() => {
    if (accessChecked) {
      return;
    }

    const userData = authUtils.getUserData();
    if (!userData) {
      router.push('/login');
      return;
    }

    const isAdminUser = userData['Phân quyền'] === 'Admin';
    const isManagerUser = userData['Phân quyền'] === 'Quản lý';
    setIsAdmin(isAdminUser);
    setIsManager(isManagerUser);
    setAccessChecked(true);
  }, [router, accessChecked]);

  const { data: employees = [], isLoading } = useEmployeesQuery();

  const currentEmployee: Employee | undefined = useMemo(
    () => employees.find(emp => emp.username === decodedUsername),
    [employees, decodedUsername]
  );

  const handleEdit = () => {
    if (!isAdmin && !isManager) {
      toast.error('Bạn không có quyền chỉnh sửa nhân viên!');
      return;
    }
    router.push(`/nhanvien/${encodeURIComponent(decodedUsername)}/edit`);
  };

  const role = useMemo(() => {
    if (!currentEmployee) return null;
    return EMPLOYEE_ROLES.find((r) => r.value === currentEmployee['Phân quyền']);
  }, [currentEmployee]);

  if (!accessChecked || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentEmployee) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 p-6 text-center">
        <Eye className="h-10 w-10 text-gray-300" />
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Không tìm thấy nhân viên</h2>
          <p className="text-sm text-gray-500">
            Tài khoản "{decodedUsername}" có thể đã bị xóa hoặc bạn không có quyền truy cập.
          </p>
        </div>
        <Button onClick={() => router.push('/nhanvien')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="sm:p-2">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/nhanvien')}
            className="h-9 px-0 text-primary hover:text-primary/90"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Button>

          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              Chi tiết nhân viên
            </h1>
          </div>
        </div>

        {/* Main Content */}
      
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Avatar */}
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white shadow-lg">
                <AvatarImage
                  src={currentEmployee['Image'] || ''}
                  alt={currentEmployee['Họ và Tên']}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl sm:text-3xl font-semibold">
                  {currentEmployee['Họ và Tên']?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>

              {/* Name and Role */}
              <div className="flex-1 space-y-2">
                <div>
                  <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                    {currentEmployee['Họ và Tên'] || currentEmployee.username}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base mt-1">
                    {currentEmployee.username}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {role && (
                    <Badge
                      variant={
                        role.value === 'Admin' ? 'destructive' :
                        role.value === 'Giám đốc' ? 'default' : 'secondary'
                      }
                      className="text-xs sm:text-sm px-3 py-1"
                    >
                      {role.icon && <role.icon className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />}
                      {role.label}
                    </Badge>
                  )}
                  {currentEmployee['Chức vụ'] && (
                    <Badge variant="outline" className="text-xs sm:text-sm px-3 py-1">
                      <Briefcase className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                      {currentEmployee['Chức vụ']}
                    </Badge>
                  )}
                  {currentEmployee['Phòng'] && (
                    <Badge variant="outline" className="text-xs sm:text-sm px-3 py-1">
                      <Building className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                      {currentEmployee['Phòng']}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Button */}
              {(isAdmin || isManager) && (
                <Button
                  onClick={handleEdit}
                  className="w-full sm:w-auto"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </Button>
              )}
            </div>
         

          <Separator />

        
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Thông tin liên hệ
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <div className="text-sm sm:text-base font-medium text-gray-900">
                    {currentEmployee['Email'] || 'Chưa cập nhật'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Số điện thoại
                  </div>
                  <div className="text-sm sm:text-base font-medium text-gray-900">
                    {formatPhoneNumber(currentEmployee['Số điện thoại']) || 'Chưa cập nhật'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Địa chỉ
                  </div>
                  <div className="text-sm sm:text-base font-medium text-gray-900">
                    {currentEmployee['Địa chỉ'] || 'Chưa cập nhật'}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Thông tin cá nhân
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Ngày sinh
                  </div>
                  <div className="text-sm sm:text-base font-medium text-gray-900">
                    {formatDate(currentEmployee['Ngày sinh']) || 'Chưa cập nhật'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Ngày vào làm
                  </div>
                  <div className="text-sm sm:text-base font-medium text-gray-900">
                    {formatDate(currentEmployee['Ngày vào làm']) || 'Chưa cập nhật'}
                  </div>
                </div>
                {currentEmployee['Quyền View'] && (
                  <div className="space-y-1">
                    <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Quyền View
                    </div>
                    <div className="text-sm sm:text-base font-medium text-gray-900">
                      {currentEmployee['Quyền View']}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {currentEmployee['Ghi chú'] && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Ghi chú
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">
                      {currentEmployee['Ghi chú']}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Image */}
            {currentEmployee['Image'] && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    Hình ảnh
                  </h3>
                  <div className="flex justify-center">
                    <img
                      src={currentEmployee['Image']}
                      alt={currentEmployee['Họ và Tên']}
                      className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              </>
            )}
      </div>
    </div>
  );
}
