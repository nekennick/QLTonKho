'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { Employee, EmployeeFormData } from '../types/employee';
import authUtils from '@/utils/authUtils';
import { queryKeys } from '@/lib/queryKeys';
import { STALE_TIME, handleMutationSuccess, handleMutationError, optimisticUpdate, rollbackOptimisticUpdate } from '@/lib/queryUtils';

/**
 * Fetch employees từ API
 */
const fetchEmployees = async (): Promise<Employee[]> => {
  const response = await authUtils.apiRequest('DSNV', 'Find', {});
  return response || [];
};

/**
 * Hook query để fetch danh sách nhân viên
 * @param enabled - Có tự động fetch hay không (mặc định: true)
 * @param refetchOnMount - Có refetch khi mount hay không (mặc định: true)
 */
export const useEmployeesQuery = (enabled: boolean = true, refetchOnMount: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.employees.lists(),
    queryFn: fetchEmployees,
    enabled,
    staleTime: STALE_TIME.MEDIUM, // Cache 5 phút
    refetchOnMount,
    refetchOnWindowFocus: true,
    meta: {
      errorMessage: 'Lỗi khi tải danh sách nhân viên',
    },
  });
};

/**
 * Hook mutation để thêm nhân viên mới
 */
export const useAddEmployeeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    onMutate: async (newEmployee) => {
      // Check for existing username BEFORE optimistic update
      const existingEmployees = queryClient.getQueryData<Employee[]>(queryKeys.employees.lists()) || [];
      const exists = existingEmployees.some(emp =>
        emp.username.toLowerCase() === newEmployee.username.toLowerCase()
      );

      if (exists) {
        throw new Error('Tên đăng nhập này đã tồn tại!');
      }

      // Optimistic update
      const context = await optimisticUpdate<Employee[]>(
        queryClient,
        queryKeys.employees.lists(),
        (old) => [...(old || []), newEmployee as Employee]
      );
      return context;
    },
    mutationFn: async (formData: EmployeeFormData) => {
      const employeeData = { ...formData };

      await authUtils.apiRequest('DSNV', 'Add', {
        "Rows": [employeeData]
      });

      return employeeData as Employee;
    },
    onSuccess: () => {
      handleMutationSuccess('Thêm nhân viên mới thành công!');
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        rollbackOptimisticUpdate(queryClient, queryKeys.employees.lists(), context.previousData);
      }
      handleMutationError(error, 'Có lỗi xảy ra khi thêm nhân viên');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    },
  });
};

/**
 * Hook mutation để cập nhật nhân viên
 */
export const useUpdateEmployeeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ username, formData }: { username: string; formData: EmployeeFormData }) => {
      const existingEmployees = queryClient.getQueryData<Employee[]>(queryKeys.employees.lists()) || [];
      const oldEmployee = existingEmployees.find(emp => emp.username === username);
      
      if (!oldEmployee) {
        throw new Error('Không tìm thấy nhân viên');
      }

      await authUtils.apiRequest('DSNV', 'Edit', {
        "Rows": [formData]
      });

      return { username, updatedData: formData };
    },
    onMutate: async ({ username, formData }) => {
      // Optimistic update
      const context = await optimisticUpdate<Employee[]>(
        queryClient,
        queryKeys.employees.lists(),
        (old) => (old || []).map(emp =>
          emp.username === username ? { ...emp, ...formData } : emp
        )
      );
      return context;
    },
    onSuccess: () => {
      handleMutationSuccess('Cập nhật thông tin nhân viên thành công!');
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        rollbackOptimisticUpdate(queryClient, queryKeys.employees.lists(), context.previousData);
      }
      handleMutationError(error, 'Có lỗi xảy ra khi cập nhật nhân viên');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    },
  });
};


/**
 * Hook mutation để xóa nhân viên
 */
export const useDeleteEmployeeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      await authUtils.apiRequest('DSNV', 'Delete', {
        "Rows": [{ "username": username }]
      });
      return username;
    },
    onMutate: async (username) => {
      const existingEmployees = queryClient.getQueryData<Employee[]>(queryKeys.employees.lists()) || [];
      const employeeName = existingEmployees.find(emp => emp.username === username)?.[' Họ và Tên'] || '';

      // Optimistic update
      const context = await optimisticUpdate<Employee[]>(
        queryClient,
        queryKeys.employees.lists(),
        (old) => (old || []).filter(emp => emp.username !== username)
      );

      return { ...context, employeeName };
    },
    onSuccess: (username, variables, context) => {
      handleMutationSuccess(`Xóa nhân viên "${context?.employeeName}" thành công!`);
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        rollbackOptimisticUpdate(queryClient, queryKeys.employees.lists(), context.previousData);
      }
      handleMutationError(error, 'Có lỗi xảy ra khi xóa nhân viên');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    },
  });
};

/**
 * Hook mutation để import hàng loạt nhân viên
 */
export const useBulkImportEmployeesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employeesToImport: EmployeeFormData[]) => {
      const toastId = toast.loading(`Đang import ${employeesToImport.length} nhân viên...`);
      
      await authUtils.apiRequest('DSNV', 'Add', {
        "Rows": employeesToImport
      });

      toast.dismiss(toastId);
      return employeesToImport as Employee[];
    },
    onMutate: async (newEmployees) => {
      // Optimistic update
      const context = await optimisticUpdate<Employee[]>(
        queryClient,
        queryKeys.employees.lists(),
        (old) => [...(old || []), ...newEmployees as Employee[]]
      );
      return context;
    },
    onSuccess: (data) => {
      handleMutationSuccess(`Import thành công ${data.length} nhân viên!`);
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        rollbackOptimisticUpdate(queryClient, queryKeys.employees.lists(), context.previousData);
      }
      handleMutationError(error, 'Có lỗi xảy ra khi import nhân viên');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    },
  });
};

/**
 * Hook mutation để xóa hàng loạt nhân viên
 */
export const useBulkDeleteEmployeesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (usernames: string[]) => {
      const toastId = toast.loading(`Đang xóa ${usernames.length} nhân viên...`);

      const deleteRows = usernames.map(username => ({ username }));
      await authUtils.apiRequest('DSNV', 'Delete', {
        "Rows": deleteRows
      });

      toast.dismiss(toastId);
      return usernames;
    },
    onMutate: async (usernames) => {
      // Optimistic update
      const context = await optimisticUpdate<Employee[]>(
        queryClient,
        queryKeys.employees.lists(),
        (old) => (old || []).filter(emp => !usernames.includes(emp.username))
      );
      return context;
    },
    onSuccess: (data) => {
      handleMutationSuccess(`Xóa thành công ${data.length} nhân viên!`);
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        rollbackOptimisticUpdate(queryClient, queryKeys.employees.lists(), context.previousData);
      }
      handleMutationError(error, 'Có lỗi xảy ra khi xóa nhân viên');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    },
  });
};

