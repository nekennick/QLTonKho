'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  useEmployeesQuery,
  useDeleteEmployeeMutation,
  useBulkImportEmployeesMutation,
  useBulkDeleteEmployeesMutation
} from './hooks/useEmployeesQuery';
import { DataTable } from './components/DataTable';
import { ImportExcelDialog } from './components/ImportExcelDialog';
import { BulkDeleteDialog } from './components/BulkDeleteDialog';
import { getColumns } from './utils/columns';
import { ExcelUtils } from './utils/excelUtils';
import type { Employee, EmployeeFormData } from './types/employee';
import { usePageTitle } from '@/hooks/usePageTitle';
import authUtils from '@/utils/authUtils';
import toast from 'react-hot-toast';

export default function EmployeePage() {
  usePageTitle('Quản lý nhân viên');
  
  const router = useRouter();
  
  // TanStack Query hooks
  const { data: employees = [], isLoading: loading } = useEmployeesQuery();
  const deleteMutation = useDeleteEmployeeMutation();
  const bulkImportMutation = useBulkImportEmployeesMutation();
  const bulkDeleteMutation = useBulkDeleteEmployeesMutation();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  
  // Excel dialog states
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);

  // Check user permissions
  React.useEffect(() => {
    const userData = authUtils.getUserData();
    if (!userData) {
      router.push('/login');
      return;
    }

    const isAdminUser = userData['Phân quyền'] === 'Admin';
    const isManagerUser = userData['Phân quyền'] === 'Quản lý';
    setIsAdmin(isAdminUser);
    setIsManager(isManagerUser);
  }, [router]);


  const existingUsernames = useMemo(() =>
    employees.map(emp => emp.username.toLowerCase()),
    [employees]
  );

  const handleAddNew = useCallback(() => {
    if (!isAdmin && !isManager) {
      toast.error('Bạn không có quyền thực hiện chức năng này!');
      return;
    }
    router.push('/nhanvien/new');
  }, [isAdmin, isManager, router]);

  const handleView = useCallback((employee: Employee) => {
    router.push(`/nhanvien/${encodeURIComponent(employee.username)}`);
  }, [router]);

  const handleEdit = useCallback((employee: Employee) => {
    if (!isAdmin && !isManager) {
      toast.error('Bạn không có quyền thực hiện chức năng này!');
      return;
    }
    router.push(`/nhanvien/${encodeURIComponent(employee.username)}/edit`);
  }, [isAdmin, isManager, router]);

  const handleDelete = useCallback((employee: Employee) => {
    if (!isAdmin && !isManager) {
      toast.error('Bạn không có quyền xóa nhân viên!');
      return;
    }

    if (employee['Phân quyền'] === 'Admin' && !isAdmin) {
      toast.error('Bạn không có quyền xóa Admin!');
      return;
    }

    deleteMutation.mutate(employee.username);
  }, [isAdmin, isManager, deleteMutation]);

  // Excel handlers
  const handleExportExcel = () => {
    const result = ExcelUtils.exportToExcel(employees);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleImportExcel = () => {
    if (!isAdmin && !isManager) {
      toast.error('Bạn không có quyền import dữ liệu!');
      return;
    }
    setImportDialogOpen(true);
  };

  const handleBulkDelete = () => {
    if (!isAdmin && !isManager) {
      toast.error('Bạn không có quyền xóa nhân viên!');
      return;
    }

    if (selectedEmployees.length === 0) {
      toast.error('Vui lòng chọn nhân viên cần xóa!');
      return;
    }

    setBulkDeleteDialogOpen(true);
  };

  const handleBulkDeleteConfirm = async (usernames: string[]) => {
    try {
      await bulkDeleteMutation.mutateAsync(usernames);
      setSelectedEmployees([]);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleImportConfirm = async (employeesToImport: EmployeeFormData[]) => {
    try {
      await bulkImportMutation.mutateAsync(employeesToImport);
    } catch (error) {
      // Error already handled in hook
      throw error;
    }
  };

  // Memoized columns with all handlers
  const columns = useMemo(
    () => getColumns({
      onView: handleView,
      onEdit: handleEdit,
      onDelete: handleDelete,
      isAdmin,
      isManager
    }),
    [isAdmin, isManager, handleView, handleEdit, handleDelete]
  );

  // Memoized lists for form
  const departmentsList = useMemo(() =>
    Array.from(new Set(employees.map(emp => emp['Phòng']).filter(Boolean))),
    [employees]
  );

  const positionsList = useMemo(() =>
    Array.from(new Set(employees.map(emp => emp['Chức vụ']).filter(Boolean))),
    [employees]
  );


  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-pulse space-y-4 w-full max-w-7xl">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-48 sm:w-64 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="h-24 sm:h-32 bg-gray-200 rounded"></div>
            <div className="h-24 sm:h-32 bg-gray-200 rounded"></div>
            <div className="h-24 sm:h-32 bg-gray-200 rounded"></div>
            <div className="h-24 sm:h-32 bg-gray-200 rounded"></div>
          </div>
          <div className="h-64 sm:h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="sm:p-2">
      <div className="mx-auto sm:space-y-6">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center">
            <Users className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              Quản lý nhân viên
            </h1>
          </div>
        </div>


          <DataTable
              columns={columns}
              data={employees}
              departments={departmentsList}
              positions={positionsList}
              onAddNew={handleAddNew}
              onExportExcel={handleExportExcel}
              onImportExcel={handleImportExcel}
              onBulkDelete={handleBulkDelete}
              onSelectionChange={setSelectedEmployees}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isAdmin={isAdmin}
              isManager={isManager}
            />
        
        {/* Import Excel Dialog */}
        <ImportExcelDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          onImport={handleImportConfirm}
          existingUsernames={existingUsernames}
        />

        {/* Bulk Delete Dialog */}
        <BulkDeleteDialog
          open={bulkDeleteDialogOpen}
          onOpenChange={setBulkDeleteDialogOpen}
          employees={selectedEmployees}
          onConfirm={handleBulkDeleteConfirm}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}