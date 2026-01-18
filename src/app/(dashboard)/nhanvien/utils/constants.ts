import { Shield, Briefcase, User, Users } from 'lucide-react';
import type { EmployeeFormData } from '../types/employee';

export const EMPLOYEE_ROLES = [
  { value: 'Admin', label: 'Admin', icon: Shield },
  { value: 'Giám đốc', label: 'Giám đốc', icon: Briefcase },
  { value: 'Quản lý', label: 'Quản lý', icon: Users },
  { value: 'Nhân viên', label: 'Nhân viên', icon: User }
];

export const EMPLOYEE_STATUS = [
  { value: 'Đang làm việc', label: 'Đang làm việc' },
  { value: 'Tạm nghỉ', label: 'Tạm nghỉ' },
  { value: 'Đã nghỉ việc', label: 'Đã nghỉ việc' },
  { value: 'Thử việc', label: 'Thử việc' }
];

export const SALARY_LEVELS = [
  { value: 'A1', label: 'A1' },
  { value: 'A2', label: 'A2' },
  { value: 'A3', label: 'A3' },
  { value: 'HV', label: 'Học việc' },
];

export const INITIAL_FORM_DATA: EmployeeFormData = {
  username: '',
  password: '123',
  'Họ và Tên': '',
  'Chức vụ': '',
  'Phòng': '',
  'Phân quyền': 'Nhân viên',
  'Email': '',
  'Image': '',
  'Quyền View': '',
  'Số điện thoại': '',
  'Địa chỉ': '',
  'Ngày sinh': '',
  'Ngày vào làm': '',
  'Ghi chú': ''
};