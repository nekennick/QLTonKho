'use client';

import React, { useState } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Employee } from '../types/employee';

interface BulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
  onConfirm: (usernames: string[]) => Promise<void>;
  isAdmin: boolean;
}

export const BulkDeleteDialog: React.FC<BulkDeleteDialogProps> = ({
  open,
  onOpenChange,
  employees,
  onConfirm,
  isAdmin
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  // Phân loại nhân viên có thể xóa và không thể xóa
  const categorizedEmployees = React.useMemo(() => {
    const canDelete: Employee[] = [];
    const cannotDelete: Employee[] = [];

    employees.forEach(emp => {
      if (!isAdmin && emp['Phân quyền'] === 'Admin') {
        cannotDelete.push(emp);
      } else {
        canDelete.push(emp);
      }
    });

    return { canDelete, cannotDelete };
  }, [employees, isAdmin]);

  const handleConfirm = async () => {
    if (categorizedEmployees.canDelete.length === 0) {
      return;
    }

    setIsDeleting(true);
    try {
      const usernames = categorizedEmployees.canDelete.map(emp => emp.username);
      await onConfirm(usernames);
      onOpenChange(false);
    } catch (error) {
      console.error('Error in bulk delete:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Xác nhận xóa nhiều nhân viên
          </DialogTitle>
          <DialogDescription>
            Bạn đang yêu cầu xóa {employees.length} nhân viên. Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                <span className="font-medium">Sẽ bị xóa</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {categorizedEmployees.canDelete.length}
              </p>
            </div>
            
            {categorizedEmployees.cannotDelete.length > 0 && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">Không thể xóa</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {categorizedEmployees.cannotDelete.length}
                </p>
              </div>
            )}
          </div>

          {/* Warning for protected employees */}
          {categorizedEmployees.cannotDelete.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {!isAdmin ? (
                  <p>Bạn không có quyền xóa tài khoản Admin. Những tài khoản này sẽ được bỏ qua.</p>
                ) : (
                  <p>Một số tài khoản không thể xóa do hạn chế hệ thống.</p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Employee List */}
          <div className="flex-1 border rounded-lg overflow-hidden">
            <div className="overflow-auto max-h-96">
              <Table>
                <TableHeader className="sticky top-0 bg-white">
                  <TableRow>
                    <TableHead>Họ và Tên</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Chức vụ</TableHead>
                    <TableHead>Phân quyền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Employees that can be deleted */}
                  {categorizedEmployees.canDelete.map((employee) => (
                    <TableRow key={employee.username} className="hover:bg-gray-50">
                      <TableCell>{employee['Họ và Tên']}</TableCell>
                      <TableCell>{employee.username}</TableCell>
                      <TableCell>{employee['Email']}</TableCell>
                      <TableCell>{employee['Chức vụ']}</TableCell>
                      <TableCell>{employee['Phân quyền']}</TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="text-xs">
                          Sẽ bị xóa
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Employees that cannot be deleted */}
                  {categorizedEmployees.cannotDelete.map((employee) => (
                    <TableRow key={employee.username} className="bg-orange-50 hover:bg-orange-100">
                      <TableCell>{employee['Họ và Tên']}</TableCell>
                      <TableCell>{employee.username}</TableCell>
                      <TableCell>{employee['Email']}</TableCell>
                      <TableCell>{employee['Chức vụ']}</TableCell>
                      <TableCell>{employee['Phân quyền']}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          Được bảo vệ
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting || categorizedEmployees.canDelete.length === 0}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa {categorizedEmployees.canDelete.length} nhân viên
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};