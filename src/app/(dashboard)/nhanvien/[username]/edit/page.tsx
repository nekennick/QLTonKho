'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmployeeForm } from '../../components/EmployeeForm';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  useEmployeesQuery,
  useUpdateEmployeeMutation,
} from '../../hooks/useEmployeesQuery';
import { INITIAL_FORM_DATA } from '../../utils/constants';
import type { EmployeeFormData, Employee } from '../../types/employee';
import authUtils from '@/utils/authUtils';

export default function EmployeeEditPage() {
  const params = useParams<{ username: string }>();
  const rawUsername = Array.isArray(params?.username) ? params?.username[0] : params?.username;
  const decodedUsername = decodeURIComponent(rawUsername || '');
  usePageTitle('Cập nhật nhân viên');

  const router = useRouter();

  const [formData, setFormData] = useState<EmployeeFormData>(INITIAL_FORM_DATA);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [hasInitializedForm, setHasInitializedForm] = useState(false);

  const updateMutation = useUpdateEmployeeMutation();

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

    if (!isAdminUser && !isManagerUser) {
      toast.error('Bạn không có quyền truy cập trang này!');
      setAccessChecked(true);
      router.push('/nhanvien');
      return;
    }

    setIsAuthorized(true);
    setAccessChecked(true);
  }, [router, accessChecked]);

  const { data: employees = [], isLoading } = useEmployeesQuery(isAuthorized);

  const departmentsList = useMemo(
    () => Array.from(new Set(employees.map(emp => emp['Phòng']).filter(Boolean))),
    [employees]
  );

  const positionsList = useMemo(
    () => Array.from(new Set(employees.map(emp => emp['Chức vụ']).filter(Boolean))),
    [employees]
  );

  const currentEmployee: Employee | undefined = useMemo(
    () => employees.find(emp => emp.username === decodedUsername),
    [employees, decodedUsername]
  );

  useEffect(() => {
    if (!hasInitializedForm && currentEmployee) {
      setFormData({
        username: currentEmployee['username'] || '',
        password: currentEmployee['password'] || '',
        'Họ và Tên': currentEmployee['Họ và Tên'] || '',
        'Chức vụ': currentEmployee['Chức vụ'] || '',
        'Phòng': currentEmployee['Phòng'] || '',
        'Phân quyền': currentEmployee['Phân quyền'] || 'Nhân viên',
        'Email': currentEmployee['Email'] || '',
        'Image': currentEmployee['Image'] || '',
        'Quyền View': currentEmployee['Quyền View'] || '',
        'Số điện thoại': currentEmployee['Số điện thoại'] || '',
        'Địa chỉ': currentEmployee['Địa chỉ'] || '',
        'Ngày sinh': currentEmployee['Ngày sinh'] || '',
        'Ngày vào làm': currentEmployee['Ngày vào làm'] || '',
        'Ghi chú': currentEmployee['Ghi chú'] || ''
      });
      setHasInitializedForm(true);
    }
  }, [currentEmployee, hasInitializedForm]);

  const handleSubmit = useCallback(async (data: EmployeeFormData) => {
    try {
      await updateMutation.mutateAsync({ username: decodedUsername, formData: data });
      router.push('/nhanvien');
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  }, [updateMutation, decodedUsername, router]);

  const handleCancel = useCallback(() => {
    router.push('/nhanvien');
  }, [router]);

  if (!accessChecked || (isAuthorized && (isLoading || (!hasInitializedForm && !!currentEmployee)))) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  if (!currentEmployee) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 p-6 text-center">
        <Pencil className="h-10 w-10 text-gray-300" />
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
    <div className="flex flex-col h-full min-h-0 -m-6">
      <div className="flex-shrink-0 px-6 pt-4 pb-4 sm:px-8 sm:pt-6">
        <div className="flex items-center gap-2">
          <Pencil className="h-5 w-5 text-primary" />
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
            Chỉnh sửa nhân viên
          </h1>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        
            <EmployeeForm
              employee={currentEmployee}
              formData={formData}
              onFormDataChange={setFormData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isAdmin={isAdmin}
              isManager={isManager}
              departments={departmentsList}
              positions={positionsList}
            />
       
      </div>
    </div>
  );
}


