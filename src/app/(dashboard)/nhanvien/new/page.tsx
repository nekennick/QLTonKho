'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmployeeForm } from '../components/EmployeeForm';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  useEmployeesQuery,
  useAddEmployeeMutation,
} from '../hooks/useEmployeesQuery';
import { INITIAL_FORM_DATA } from '../utils/constants';
import type { EmployeeFormData } from '../types/employee';
import authUtils from '@/utils/authUtils';

export default function EmployeeCreatePage() {
  usePageTitle('Thêm nhân viên');

  const router = useRouter();

  const [formData, setFormData] = useState<EmployeeFormData>(INITIAL_FORM_DATA);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const addMutation = useAddEmployeeMutation();

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

  const handleSubmit = useCallback(async (data: EmployeeFormData) => {
    try {
      await addMutation.mutateAsync(data);
      router.push('/dashboard/nhanvien');
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  }, [addMutation, router]);

  const handleCancel = useCallback(() => {
    router.push('/nhanvien');
  }, [router]);

  if (!accessChecked || (isAuthorized && isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex flex-col h-full min-h-0 -m-6">
      <div className="flex-shrink-0 px-6 pt-4 pb-4 sm:px-8 sm:pt-6">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
            Thêm nhân viên
          </h1>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
       
            <EmployeeForm
              employee={null}
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


