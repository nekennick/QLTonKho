'use client';

import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { Employee, EmployeeFormData } from '../types/employee';
import authUtils from '@/utils/authUtils';
import { EmployeeUtils } from '../utils/employeeUtils';
import { saveToCache, getFromCache, clearCache, CACHE_KEYS, CACHE_DURATION } from '@/utils/cacheUtils';

export const useEmployees = (useCache: boolean = true) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch employees on mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      
      // Try to get from cache first (only if useCache is enabled)
      const cachedData = useCache ? getFromCache(CACHE_KEYS.EMPLOYEES) : null;
      console.log('Employees cache check:', { cachedData: !!cachedData, forceRefresh, useCache });
      
      if (cachedData && !forceRefresh && useCache) {
        console.log('Using cached employees data');
        setEmployees(cachedData);
        setLoading(false);
        return;
      }

      // Only fetch from API if force refresh or no cache
      console.log('Fetching employees from API');
      const response = await authUtils.apiRequest('DSNV', 'Find', {});
      const employeesData = response || [];
      
      setEmployees(employeesData);
      
      // Save to cache (only if useCache is enabled)
      if (useCache) {
        saveToCache(CACHE_KEYS.EMPLOYEES, employeesData, CACHE_DURATION.EMPLOYEES);
        console.log('Employees data saved to cache');
      }
      
      if (forceRefresh) {
        toast.success("Đã tải dữ liệu mới nhất");
      }
    } catch (error) {
      console.error('Error fetching employee list:', error);
      
      // Try to use cached data as fallback (only if useCache is enabled)
      if (useCache) {
        const cachedData = getFromCache(CACHE_KEYS.EMPLOYEES);
        if (cachedData) {
          setEmployees(cachedData);
          if (forceRefresh) {
            toast("Sử dụng dữ liệu đã lưu (có thể không cập nhật)", { icon: '⚠️' });
          }
        } else {
          toast.error('Lỗi khi tải danh sách nhân viên');
        }
      } else {
        toast.error('Lỗi khi tải danh sách nhân viên');
      }
    } finally {
      setLoading(false);
    }
  }, []); // Loại bỏ useCache dependency để tránh tạo lại function
  const addEmployee = useCallback(async (formData: EmployeeFormData) => {
    try {
      let employeeData = { ...formData };

      // Check for existing username
      const exists = employees.some(emp =>
        emp.username.toLowerCase() === employeeData.username.toLowerCase()
      );

      if (exists) {
        toast.error('Tên đăng nhập này đã tồn tại!');
        return;
      }

      // Tạo lịch sử
      const currentUser = authUtils.getUserData();
      const createdBy = currentUser?.['Họ và Tên'] || 'Hệ thống';
      employeeData['Lịch sử'] = EmployeeUtils.createHistoryEntry(
        {},
        employeeData,
        createdBy,
        'create'
      );

      await authUtils.apiRequest('DSNV', 'Add', {
        "Rows": [employeeData]
      });

      setEmployees(prev => [...prev, employeeData as Employee]);
      toast.success('Thêm nhân viên mới thành công!');
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error('Có lỗi xảy ra khi thêm nhân viên');
    }
  }, [employees]);


  // Cập nhật updateEmployee để lưu lịch sử
  const updateEmployee = useCallback(async (username: string, formData: EmployeeFormData) => {
    try {
      const oldEmployee = employees.find(emp => emp.username === username);
      if (!oldEmployee) {
        toast.error('Không tìm thấy nhân viên');
        return;
      }

      const currentUser = authUtils.getUserData();
      const changedBy = currentUser?.['Họ và Tên'] || 'Hệ thống';

      // Tạo lịch sử thay đổi
      const historyEntry = EmployeeUtils.createHistoryEntry(
        oldEmployee,
        formData,
        changedBy,
        'update'
      );

      const updatedData = {
        ...formData,
        'Lịch sử': historyEntry || formData['Lịch sử'] || ''
      };

      await authUtils.apiRequest('DSNV', 'Edit', {
        "Rows": [updatedData]
      });

      setEmployees(prev => prev.map(emp =>
        emp.username === username ? { ...emp, ...updatedData } : emp
      ));
      toast.success('Cập nhật thông tin nhân viên thành công!');
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Có lỗi xảy ra khi cập nhật nhân viên');
    }
  }, [employees]);
 const changeSalaryLevel = useCallback(async (
    username: string, 
    newSalaryLevel: string, 
    reason: string = ''
  ) => {
    const employee = employees.find(emp => emp.username === username);
    if (!employee) {
      toast.error('Không tìm thấy nhân viên');
      return;
    }

    const currentUser = authUtils.getUserData();
    const changedBy = currentUser?.['Họ và Tên'] || 'Hệ thống';

    try {
      // Tạo lịch sử thay đổi
      const oldData = { ...employee };
      const newData = { ...employee, 'Bậc lương': newSalaryLevel };
      
      let historyEntry = EmployeeUtils.createHistoryEntry(
        oldData,
        newData,
        changedBy,
        'salary_change'
      );

      // Thêm lý do nếu có
      if (reason.trim()) {
        historyEntry += ` - Lý do: ${reason.trim()}`;
      }

      const updatedEmployee = {
        ...employee,
        'Bậc lương': newSalaryLevel,
        'Lịch sử': historyEntry
      };

      await authUtils.apiRequest('DSNV', 'Edit', {
        "Rows": [updatedEmployee]
      });

      // Update state
      setEmployees(prev => prev.map(emp =>
        emp.username === username ? updatedEmployee : emp
      ));

      toast.success(`Cập nhật bậc lương thành công cho "${employee['Họ và Tên']}"`);
    } catch (error) {
      console.error('Error changing salary level:', error);
      toast.error('Có lỗi xảy ra khi thay đổi bậc lương');
    }
  }, [employees]);
  const deleteEmployee = useCallback(async (username: string) => {
    // Store original state for potential rollback
    const originalEmployees = employees;
    const employeeName = employees.find(emp => emp.username === username)?.['Họ và Tên'] || '';

    try {
      // Optimistic update
      setEmployees(prev => prev.filter(emp => emp.username !== username));
      
      const toastId = toast.loading('Đang xóa nhân viên...');
      
      await authUtils.apiRequest('DSNV', 'Delete', {
        "Rows": [{ "username": username }]
      });

      toast.success(`Xóa nhân viên "${employeeName}" thành công!`, { id: toastId });
    } catch (error) {
      // Rollback on error
      setEmployees(originalEmployees);
      console.error('Error deleting employee:', error);
      toast.error('Có lỗi xảy ra khi xóa nhân viên');
    }
  }, [employees]);

  // Bulk import employees
  const bulkImportEmployees = useCallback(async (employeesToImport: EmployeeFormData[]) => {
    try {
      const toastId = toast.loading(`Đang import ${employeesToImport.length} nhân viên...`);
      
      // Import from API
      await authUtils.apiRequest('DSNV', 'Add', {
        "Rows": employeesToImport
      });

      // Add to state
      setEmployees(prev => [...prev, ...(employeesToImport as Employee[])]);
      
      toast.success(`Import thành công ${employeesToImport.length} nhân viên!`, { id: toastId });
    } catch (error) {
      console.error('Error bulk importing employees:', error);
      toast.error('Có lỗi xảy ra khi import nhân viên');
      throw error;
    }
  }, []);

  // Bulk delete employees
  const bulkDeleteEmployees = useCallback(async (usernames: string[]) => {
    const originalEmployees = employees;
    
    try {
      // Optimistic update
      setEmployees(prev => prev.filter(emp => !usernames.includes(emp.username)));
      
      const toastId = toast.loading(`Đang xóa ${usernames.length} nhân viên...`);

      // Delete from API
      const deleteRows = usernames.map(username => ({ username }));
      await authUtils.apiRequest('DSNV', 'Delete', {
        "Rows": deleteRows
      });

      toast.success(`Xóa thành công ${usernames.length} nhân viên!`, { id: toastId });
    } catch (error) {
      // Rollback on error
      setEmployees(originalEmployees);
      console.error('Error bulk deleting employees:', error);
      toast.error('Có lỗi xảy ra khi xóa nhân viên');
      throw error;
    }
  }, [employees]);

  return {
    employees,
    loading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    bulkImportEmployees,
    bulkDeleteEmployees,
    changeSalaryLevel,
    fetchEmployees
  };
};