'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search,
  Package, 
  CheckCircle,
  XCircle,
  Eye,
  Printer,
  RefreshCw,
  Filter,
  X,
  Loader2,
  Clock,
  User,
  Calendar,
  FileText
} from 'lucide-react';
import { useOptimizedDataLoading } from './hooks/useOptimizedDataLoading';
import { useMobileDetection } from '../xuat-nhap-kho/hooks/useMobileDetection';
import MobileApprovalForm from './components/MobileApprovalForm';
import { generateWarehousePrintTemplate, openPrintWindow } from '../xuat-nhap-kho/utils/Print';
import { DataTable } from '../xuat-nhap-kho/components/DataTable';
import { DataTableToolbar } from '../xuat-nhap-kho/components/DataTableToolbar';
import { ApprovalDialog, InventoryDetailDialog } from './components';
import { columns } from './utils/columns';
import type { NXKHO, NXKHODE } from '../xuat-nhap-kho/types/inventory';
import { 
  sendZaloMessage, 
  generateInventoryApprovalMessage
} from '@/utils/notificationUtils';
import { useSettings } from '@/context/SettingsContext';
import { useTabContext } from '@/context/TabContext';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageTitle } from '@/hooks/usePageTitle';
import toast from 'react-hot-toast';

export default function DuyetPhieuPage() {
  usePageTitle('Duyệt phiếu xuất nhập kho');
  
  const { settings } = useSettings();
  const { addTab, setActiveTab, tabs } = useTabContext();
  const router = useRouter();
  
  // Mobile detection
  const { isMobile } = useMobileDetection();
  
  const {
    // Data
    products,
    warehouses,
    employees,
    inventories,
    inventoryDetails,
    
    // Loading states
    loading,
    productsLoading,
    warehousesLoading,
    employeesLoading,
    inventoryLoading,
    isInitialized,
    
    // Functions
    fetchProducts,
    fetchWarehouses,
    fetchEmployees,
    fetchInventories,
    fetchInventoryDetails,
    reloadData,
    approveInventory,
    rejectInventory,
    deleteInventory,
    getInventoryWithDetails
  } = useOptimizedDataLoading();

  // State management
  const [searchValue, setSearchValue] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedInventories, setSelectedInventories] = useState<string[]>([]);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<NXKHO | null>(null);
  const [selectedInventoryDetails, setSelectedInventoryDetails] = useState<NXKHODE[]>([]);

  // Data loading is now handled by useOptimizedDataLoading hook
  // No need for manual useEffect here

  // Filter inventories based on search and filters
  const filteredInventories = useMemo(() => {
    let filtered = inventories.filter(inventory => {
      const matchesSearch = !searchValue || 
        inventory.MaPhieu.toLowerCase().includes(searchValue.toLowerCase()) ||
        inventory.NhanVienDeNghi.toLowerCase().includes(searchValue.toLowerCase()) ||
        inventory.Tu.toLowerCase().includes(searchValue.toLowerCase()) ||
        inventory.Den.toLowerCase().includes(searchValue.toLowerCase());
      
      const matchesTypeFilter = !typeFilter || inventory.LoaiPhieu === typeFilter;
      const matchesStatusFilter = !statusFilter || inventory.TrangThai === statusFilter;
      
      return matchesSearch && matchesTypeFilter && matchesStatusFilter;
    });
    
    return filtered;
  }, [inventories, searchValue, typeFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = inventories.length;
    const pending = inventories.filter(inv => inv.TrangThai === 'Chờ xác nhận').length;
    const approved = inventories.filter(inv => inv.TrangThai === 'Đã duyệt').length;
    const rejected = inventories.filter(inv => inv.TrangThai === 'Từ chối').length;
    
    return { total, pending, approved, rejected };
  }, [inventories]);

  // Event handlers
  const handleViewDetails = useCallback((inventory: NXKHO) => {
    const details = inventoryDetails.filter(detail => detail.MaPhieu === inventory.MaPhieu);
    setSelectedInventory(inventory);
    setSelectedInventoryDetails(details);
    setDetailDialogOpen(true);
  }, [inventoryDetails]);

  const handleApprove = useCallback((inventory: NXKHO) => {
    const details = inventoryDetails.filter(detail => detail.MaPhieu === inventory.MaPhieu);
    setSelectedInventory(inventory);
    setSelectedInventoryDetails(details);
    setApprovalDialogOpen(true);
  }, [inventoryDetails]);

  const handleReject = useCallback((inventory: NXKHO) => {
    const details = inventoryDetails.filter(detail => detail.MaPhieu === inventory.MaPhieu);
    setSelectedInventory(inventory);
    setSelectedInventoryDetails(details);
    setApprovalDialogOpen(true);
  }, [inventoryDetails]);

  const handlePrintSlip = useCallback((inventory: NXKHO) => {
    const details = inventoryDetails.filter(detail => detail.MaPhieu === inventory.MaPhieu);
    
    if (details.length === 0) {
      toast.error('Không có chi tiết phiếu để in!');
      return;
    }

    // Prepare form data for print template
    const formData = {
      'LOẠI PHIẾU': inventory.LoaiPhieu === 'Nhập kho' ? 'Phiếu nhập' : 'Phiếu xuất',
      'MÃ PHIẾU': inventory.MaPhieu,
      'NHÂN VIÊN ĐỀ NGHỊ': inventory.NhanVienDeNghi,
      'NGÀY': inventory.Ngay,
      'GIỜ': new Date(inventory.Ngay).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      'ĐỊA CHỈ': inventory.DiaChi,
      'MÃ TRẠM': '',
      'TÊN KẾ HOẠCH': '',
      'HỢP ĐỒNG': '',
      'MÃ CÔNG TRÌNH': '',
      'TỪ': inventory.Tu,
      'ĐẾN': inventory.Den,
      'GHI CHÚ': inventory.GhiChu
    };

    // Prepare warehouse details for print template
    const warehouseDetails = details.map(detail => ({
      'MÃ VẬT TƯ': detail.MaVT,
      'TÊN VẬT TƯ': detail.TenVT,
      'ĐƠN VỊ TÍNH': detail.ĐVT,
      'SỐ LƯỢNG YÊU CẦU': detail.SoLuong,
      'SỐ LƯỢNG THỰC TẾ': detail.SoLuong,
      'ĐƠN GIÁ': detail.DonGia,
      'THÀNH TIỀN': detail.ThanhTien
    }));

    // Generate print template
    const printContent = generateWarehousePrintTemplate(formData, warehouseDetails, {
      showCompanyInfo: true,
      showSignatures: true,
      showTotals: true,
      paperSize: 'A4'
    });

    // Open print window
    openPrintWindow(
      printContent,
      (message: string) => toast.success(message),
      (error: string) => toast.error(error)
    );
  }, [inventoryDetails]);

  const handleEditSlip = useCallback((inventory: NXKHO) => {
    // Chỉ cho phép sửa phiếu chưa duyệt
    if (inventory.TrangThai !== 'Chờ xác nhận') {
      toast.error('Chỉ có thể sửa phiếu chưa duyệt!');
      return;
    }

    // Tạo URL chỉnh sửa
    const editUrl = `/kho/xuat-nhap-kho?edit=true&maPhieu=${encodeURIComponent(inventory.MaPhieu)}`;
    const tabTitle = `Sửa phiếu ${inventory.MaPhieu}`;
    
    // Kiểm tra xem tab đã tồn tại chưa
    const existingTab = tabs.find(tab => tab.path === editUrl);
    
    if (existingTab) {
      // Nếu tab đã tồn tại, chuyển sang tab đó
      setActiveTab(existingTab.id);
      router.push(editUrl);
      toast.success('Đã mở tab chỉnh sửa phiếu!');
    } else {
      // Tạo tab mới
      addTab({
        title: tabTitle,
        path: editUrl,
        closable: true,
      });
      router.push(editUrl);
      toast.success('Đã mở tab mới để chỉnh sửa phiếu!');
    }
  }, [router, addTab, setActiveTab, tabs]);

  const handleReload = async () => {
    try {
      const toastId = toast.loading('Đang tải dữ liệu mới nhất...');
      
      // Use optimized reload function
      await reloadData();
      
      toast.success('Đã cập nhật dữ liệu mới nhất!', { id: toastId });
    } catch (error) {
      console.error('Error reloading data:', error);
      toast.error('Có lỗi xảy ra khi tải lại dữ liệu');
    }
  };

  const handleClearFilters = () => {
    setSearchValue('');
    setTypeFilter('');
    setStatusFilter('');
    toast.success('Đã xóa tất cả bộ lọc!');
  };

  const handleApprovalSubmit = async (action: 'approve' | 'reject', notes?: string) => {
    if (!selectedInventory) return;

    try {
      if (action === 'approve') {
        await approveInventory(selectedInventory.MaPhieu, notes);
        toast.success('Duyệt phiếu thành công!');
      } else {
        await rejectInventory(selectedInventory.MaPhieu, notes);
        toast.success('Từ chối phiếu thành công!');
      }

      // Send notification for approval/rejection (background)
      const shouldSendNotification = 
        (action === 'approve' && settings.notifications.zalo.enabled && settings.notifications.zalo.inventoryApproval) ||
        (action === 'reject' && settings.notifications.zalo.enabled && settings.notifications.zalo.inventoryRejection);
        
      if (shouldSendNotification) {
        // Chạy thông báo ngầm, không đợi kết quả
        (async () => {
          try {
            console.log('🚀 Starting background Zalo notification process...');
            const approver = 'Admin'; // TODO: Get actual approver name from auth context
            const notificationMessage = generateInventoryApprovalMessage(
              selectedInventory.MaPhieu,
              action,
              approver,
              notes
            );

            console.log('📝 Generated notification message:', notificationMessage);

            // Send text message
            const messageResult = await sendZaloMessage(
              {
                botToken: settings.notifications.zalo.botToken,
                chatId: settings.notifications.zalo.chatId
              },
              notificationMessage
            );

            console.log('✅ Background notification sent successfully for inventory', action);
          } catch (error) {
            console.error('❌ Background notification failed:', error);
            // Không ảnh hưởng đến chức năng chính
          }
        })();
      }
      
      setApprovalDialogOpen(false);
      setSelectedInventory(null);
    } catch (error) {
      console.error('Error processing approval:', error);
      toast.error('Có lỗi xảy ra khi xử lý phiếu!');
    }
  };

  const handleDeleteSlip = async (inventory: NXKHO) => {
    if (inventory.TrangThai !== 'Chờ xác nhận') {
      toast.error('Chỉ có thể xóa phiếu chưa duyệt!');
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa phiếu "${inventory.MaPhieu}"?`)) {
      try {
        await deleteInventory(inventory.MaPhieu);
        setDetailDialogOpen(false);
        setSelectedInventory(null);
        setSelectedInventoryDetails([]);
      } catch (error) {
        console.error('Error deleting inventory:', error);
        toast.error('Có lỗi xảy ra khi xóa phiếu!');
      }
    }
  };

  const handleAddNew = useCallback(() => {
    // Tạo URL cho trang tạo phiếu mới
    const newUrl = '/kho/xuat-nhap-kho';
    const tabTitle = 'Tạo phiếu xuất nhập kho';
    
    // Kiểm tra xem tab đã tồn tại chưa
    const existingTab = tabs.find(tab => tab.path === newUrl);
    
    if (existingTab) {
      // Nếu tab đã tồn tại, chuyển sang tab đó
      setActiveTab(existingTab.id);
      router.push(newUrl);
      toast.success('Đã mở tab tạo phiếu!');
    } else {
      // Tạo tab mới
      addTab({
        title: tabTitle,
        path: newUrl,
        closable: true,
      });
      router.push(newUrl);
      toast.success('Đã mở tab mới để tạo phiếu!');
    }
  }, [router, addTab, setActiveTab, tabs]);

  // Skeleton loading component for immediate display
  const SkeletonForm = () => (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 border rounded">
                <Skeleton className="h-8 w-8" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Hiển thị skeleton khi đang loading
  if (loading) {
    return <SkeletonForm />;
  }

  // Render mobile view if on mobile device
  if (isMobile) {
    return (
        <MobileApprovalForm
          inventories={inventories}
          inventoryDetails={inventoryDetails}
          loading={loading}
          fetchInventories={fetchInventories}
          fetchInventoryDetails={fetchInventoryDetails}
          approveInventory={approveInventory}
          rejectInventory={rejectInventory}
          deleteInventory={deleteInventory}
          products={products}
          warehouses={warehouses}
          employees={employees}
          fetchProducts={fetchProducts}
          fetchWarehouses={fetchWarehouses}
          fetchEmployees={fetchEmployees}
          reloadData={reloadData}
        />
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle className="h-6 w-6" />
            Duyệt Phiếu Xuất Nhập Kho
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý và duyệt các phiếu xuất nhập kho
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReload}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tải lại
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng phiếu</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Từ chối</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Phiếu Xuất Nhập Kho</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTableToolbar
            onAddNew={handleAddNew}
            onImport={() => {}}
            onExport={() => {}}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onClearFilters={handleClearFilters}
          />
          
          <DataTable
            columns={columns({
              onViewDetails: handleViewDetails,
              onApprove: handleApprove,
              onReject: handleReject,
              onPrint: handlePrintSlip,
              onEdit: handleEditSlip
            })}
            data={filteredInventories}
            searchKey="MaPhieu"
            searchPlaceholder="Tìm kiếm theo mã phiếu, nhân viên..."
          />
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <ApprovalDialog
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
        inventory={selectedInventory}
        inventoryDetails={selectedInventoryDetails}
        onSubmit={handleApprovalSubmit}
      />

      {/* Detail Dialog */}
      <InventoryDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        inventory={selectedInventory}
        details={selectedInventoryDetails}
        onPrint={handlePrintSlip}
        onDelete={handleDeleteSlip}
      />
    </div>
  );
}
