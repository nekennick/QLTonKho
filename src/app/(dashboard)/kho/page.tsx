'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Package, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWarehouses } from './hooks/useWarehouses';
import { DataTable } from './components/DataTable';
import { WarehouseMobileGrid } from './components/WarehouseMobileGrid';
import { WarehouseForm } from './components/WarehouseForm';
import { ImportExcelDialog } from './components/ImportExcelDialog';
import { BulkDeleteDialog } from './components/BulkDeleteDialog';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { getColumns } from './utils/columns';
import { ExcelUtils } from './utils/excelUtils';
import type { Warehouse, WarehouseFormData } from './types/warehouse';
import { INITIAL_WAREHOUSE_FORM_DATA } from './utils/constants';
import { usePageTitle } from '@/hooks/usePageTitle';
import authUtils from '@/utils/authUtils';
import toast from 'react-hot-toast';

export default function WarehousePage() {
  usePageTitle('Quản lý kho');

  const router = useRouter();
  const {
    warehouses,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
    bulkImportWarehouses,
    bulkDeleteWarehouses,
    loading
  } = useWarehouses();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState<WarehouseFormData>(INITIAL_WAREHOUSE_FORM_DATA);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Excel dialog states
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedWarehouses, setSelectedWarehouses] = useState<Warehouse[]>([]);

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

  // Check if mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const existingMaKhoList = useMemo(() =>
    warehouses.map(warehouse => warehouse.MaKho.toLowerCase()),
    [warehouses]
  );

  const resetForm = () => {
    setFormData(INITIAL_WAREHOUSE_FORM_DATA);
    setEditingWarehouse(null);
    setIsDialogOpen(false);
  };

  const handleAddNew = () => {
    if (!isAdmin && !isManager) {
      toast.error('Bạn không có quyền thực hiện chức năng này!');
      return;
    }
    setEditingWarehouse(null);
    setFormData(INITIAL_WAREHOUSE_FORM_DATA);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: WarehouseFormData) => {
    try {
      if (editingWarehouse) {
        await updateWarehouse(editingWarehouse.MaKho, data);
      } else {
        await addWarehouse(data);
      }
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleEdit = (warehouse: Warehouse) => {
    if (!isAdmin && !isManager) {
      toast.error('Bạn không có quyền thực hiện chức năng này!');
      return;
    }

    setEditingWarehouse(warehouse);
    setFormData({
      MaKho: warehouse.MaKho || '',
      TenKho: warehouse.TenKho || '',
      DiaChi: warehouse.DiaChi || '',
      HinhAnh: warehouse.HinhAnh || '',
      GhiChu: warehouse.GhiChu || '',
      ThuKho: warehouse.ThuKho || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (warehouse: Warehouse) => {
    if (!isAdmin && !isManager) {
      toast.error('Bạn không có quyền xóa kho!');
      return;
    }

    deleteWarehouse(warehouse.MaKho);
  };

  const handleView = (warehouse: Warehouse) => {
    // Có thể mở dialog xem chi tiết hoặc navigate đến trang chi tiết
    console.log('View warehouse:', warehouse);
    // TODO: Implement view functionality
  };

  // Excel handlers
  const handleExportExcel = () => {
    const result = ExcelUtils.exportToExcel(warehouses);
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
      toast.error('Bạn không có quyền xóa kho!');
      return;
    }

    if (selectedWarehouses.length === 0) {
      toast.error('Vui lòng chọn kho cần xóa!');
      return;
    }

    setBulkDeleteDialogOpen(true);
  };

  const handleBulkDeleteConfirm = async (maKhoList: string[]) => {
    try {
      await bulkDeleteWarehouses(maKhoList);
      setSelectedWarehouses([]);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleImportConfirm = async (warehousesToImport: WarehouseFormData[]) => {
    try {
      await bulkImportWarehouses(warehousesToImport);
    } catch (error) {
      // Error already handled in hook
      throw error;
    }
  };

  // Memoized columns with all handlers
  const columns = useMemo(
    () => getColumns({
      onEdit: handleEdit,
      onDelete: handleDelete,
      isAdmin,
      isManager
    }),
    [isAdmin, isManager]
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-pulse space-y-4 w-full max-w-7xl">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-48 sm:w-64 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
    <div className="p-0">
      <div className="mx-auto space-y-3 sm:space-y-6">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-4 sm:px-0">
          <div className="flex items-center">
            <Building2 className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800">
              Quản lý kho
            </h1>
          </div>

          {/* Add Warehouse Dialog */}
          <Dialog
            open={isDialogOpen}
            onOpenChange={(isOpen) => {
              if (!isOpen) resetForm();
              setIsDialogOpen(isOpen);
            }}
          >
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
              <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  {editingWarehouse ? 'Cập nhật thông tin kho' : 'Thêm kho mới'}
                </DialogTitle>
                <DialogDescription>
                  {editingWarehouse ? 'Chỉnh sửa thông tin kho hiện tại' : 'Điền thông tin để tạo kho mới'}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto">
                <WarehouseForm
                  warehouse={editingWarehouse}
                  formData={formData}
                  onFormDataChange={setFormData}
                  onSubmit={handleSubmit}
                  onCancel={resetForm}
                  isAdmin={isAdmin}
                  isManager={isManager}
                  existingMaKhoList={existingMaKhoList}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards - Compact Design */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 px-2 sm:px-0">

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-500 rounded-lg">
                <Building2 className="h-3 w-3 text-white" />
              </div>
              <div>
                <div className="text-xs font-medium text-blue-800">Tổng số kho</div>
                <div className="text-xs text-blue-600 hidden sm:block">Trong hệ thống</div>
              </div>
            </div>
            <div className="text-xl font-bold text-blue-700">{warehouses.length}</div>
          </div>



          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-green-500 rounded-lg">
                <Package className="h-3 w-3 text-white" />
              </div>
              <div>
                <div className="text-xs font-medium text-green-800">Có thủ kho</div>
                <div className="text-xs text-green-600 hidden sm:block">Được quản lý</div>
              </div>
            </div>
            <div className="text-xl font-bold text-green-700">
              {warehouses.filter(w => w.ThuKho && w.ThuKho.trim()).length}
            </div>
          </div>



          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-purple-500 rounded-lg">
                <TrendingUp className="h-3 w-3 text-white" />
              </div>
              <div>
                <div className="text-xs font-medium text-purple-800">Có hình ảnh</div>
                <div className="text-xs text-purple-600 hidden sm:block">Minh họa</div>
              </div>
            </div>
            <div className="text-xl font-bold text-purple-700">
              {warehouses.filter(w => w.HinhAnh && w.HinhAnh.trim()).length}
            </div>
          </div>

        </div>

        {/* Data Table - Responsive */}
        {isMobile ? (
          <div className="space-y-3">
            {/* Mobile Toolbar */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tìm kiếm kho..."
                  className="flex-1 h-9 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => {
                    // TODO: Implement search functionality
                  }}
                />
                {(isAdmin || isManager) && (
                  <Button onClick={handleAddNew} size="sm" className="h-9">
                    <Building2 className="mr-1 h-4 w-4" />
                    Thêm
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportExcel}
                  className="flex-1 h-9"
                >
                  Xuất Excel
                </Button>
                {(isAdmin || isManager) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleImportExcel}
                    className="flex-1 h-9"
                  >
                    Import Excel
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile Grid */}
            <WarehouseMobileGrid
              warehouses={warehouses}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              isAdmin={isAdmin}
              isManager={isManager}
            />
          </div>
        ) : (

          <DataTable
            columns={columns}
            data={warehouses}
            onAddNew={handleAddNew}
            onExportExcel={handleExportExcel}
            onImportExcel={handleImportExcel}
            onBulkDelete={handleBulkDelete}
            onSelectionChange={setSelectedWarehouses}
            isAdmin={isAdmin}
            isManager={isManager}
          />

        )}

        {/* Import Excel Dialog */}
        <ImportExcelDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          onImport={handleImportConfirm}
          existingMaKhoList={existingMaKhoList}
        />

        {/* Bulk Delete Dialog */}
        <BulkDeleteDialog
          open={bulkDeleteDialogOpen}
          onOpenChange={setBulkDeleteDialogOpen}
          warehouses={selectedWarehouses}
          onConfirm={handleBulkDeleteConfirm}
          isAdmin={isAdmin}
        />
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
