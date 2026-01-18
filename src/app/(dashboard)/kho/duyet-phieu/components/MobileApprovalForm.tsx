'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search,
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
  FileText,
  Package,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { generateWarehousePrintTemplate, openPrintWindow } from '../../xuat-nhap-kho/utils/Print';
import { ApprovalDialog, InventoryDetailDialog } from './';
import MobileApprovalCard from './MobileApprovalCard';
import MobileApprovalStats from './MobileApprovalStats';
import type { NXKHO, NXKHODE } from '../../xuat-nhap-kho/types/inventory';
import { 
  sendZaloMessage, 
  generateInventoryApprovalMessage
} from '@/utils/notificationUtils';
import { useSettings } from '@/context/SettingsContext';
import toast from 'react-hot-toast';

interface MobileApprovalFormProps {
  // Data hooks
  inventories: NXKHO[];
  inventoryDetails: NXKHODE[];
  loading: boolean;
  fetchInventories: () => Promise<void>;
  fetchInventoryDetails: () => Promise<void>;
  approveInventory: (maPhieu: string, notes?: string) => Promise<void>;
  rejectInventory: (maPhieu: string, notes?: string) => Promise<void>;
  deleteInventory: (maPhieu: string) => Promise<void>;
  
  // Data sources
  products: any[];
  warehouses: any[];
  employees: any[];
  
  // Reload functions
  fetchProducts: (force?: boolean) => Promise<void>;
  fetchWarehouses: (force?: boolean) => Promise<void>;
  fetchEmployees: (force?: boolean) => Promise<void>;
  reloadData: () => Promise<void>;
}

export default function MobileApprovalForm({
  inventories,
  inventoryDetails,
  loading,
  fetchInventories,
  fetchInventoryDetails,
  approveInventory,
  rejectInventory,
  deleteInventory,
  products,
  warehouses,
  employees,
  fetchProducts,
  fetchWarehouses,
  fetchEmployees,
  reloadData
}: MobileApprovalFormProps) {
  const { settings } = useSettings();
  const router = useRouter();
  
  // State management
  const [currentTab, setCurrentTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchValue, setSearchValue] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<NXKHO | null>(null);
  const [selectedInventoryDetails, setSelectedInventoryDetails] = useState<NXKHODE[]>([]);

  // Note: Data loading is handled by the parent component (page.tsx)
  // This component only receives the data as props to avoid duplicate loading

  // Statistics
  const stats = useMemo(() => {
    const total = inventories.length;
    const pending = inventories.filter(inv => inv.TrangThai === 'Chờ xác nhận').length;
    const approved = inventories.filter(inv => inv.TrangThai === 'Đã duyệt').length;
    const rejected = inventories.filter(inv => inv.TrangThai === 'Từ chối').length;
    
    return { total, pending, approved, rejected };
  }, [inventories]);

  // Filter inventories based on current tab, search and filters
  const filteredInventories = useMemo(() => {
    if (!inventories || inventories.length === 0) return [];
    
    let filtered = inventories.filter(inventory => {
      // Tab filter
      const matchesTab = 
        currentTab === 'all' ||
        (currentTab === 'pending' && inventory.TrangThai === 'Chờ xác nhận') ||
        (currentTab === 'approved' && inventory.TrangThai === 'Đã duyệt') ||
        (currentTab === 'rejected' && inventory.TrangThai === 'Từ chối');
      
      // Search filter
      const matchesSearch = !searchValue || 
        inventory.MaPhieu.toLowerCase().includes(searchValue.toLowerCase()) ||
        inventory.NhanVienDeNghi.toLowerCase().includes(searchValue.toLowerCase()) ||
        inventory.Tu.toLowerCase().includes(searchValue.toLowerCase()) ||
        inventory.Den.toLowerCase().includes(searchValue.toLowerCase());
      
      // Type filter
      const matchesTypeFilter = !typeFilter || inventory.LoaiPhieu === typeFilter;
      
      // Status filter
      const matchesStatusFilter = !statusFilter || inventory.TrangThai === statusFilter;
      
      return matchesTab && matchesSearch && matchesTypeFilter && matchesStatusFilter;
    });
    
    return filtered;
  }, [inventories, currentTab, searchValue, typeFilter, statusFilter]);

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

    const warehouseDetails = details.map(detail => ({
      'MÃ VẬT TƯ': detail.MaVT,
      'TÊN VẬT TƯ': detail.TenVT,
      'ĐƠN VỊ TÍNH': detail.ĐVT,
      'SỐ LƯỢNG YÊU CẦU': detail.SoLuong,
      'SỐ LƯỢNG THỰC TẾ': detail.SoLuong,
      'ĐƠN GIÁ': detail.DonGia,
      'THÀNH TIỀN': detail.ThanhTien
    }));

    const printContent = generateWarehousePrintTemplate(formData, warehouseDetails, {
      showCompanyInfo: true,
      showSignatures: true,
      showTotals: true,
      paperSize: 'A4'
    });

    openPrintWindow(
      printContent,
      (message: string) => toast.success(message),
      (error: string) => toast.error(error)
    );
  }, [inventoryDetails]);

  const handleEditSlip = useCallback((inventory: NXKHO) => {
    if (inventory.TrangThai !== 'Chờ xác nhận') {
      toast.error('Chỉ có thể sửa phiếu chưa duyệt!');
      return;
    }

    const editUrl = `/kho/xuat-nhap-kho?edit=true&maPhieu=${encodeURIComponent(inventory.MaPhieu)}`;
    router.push(editUrl);
    
    toast.success('Đang chuyển đến trang chỉnh sửa phiếu...');
  }, [router]);

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

      const shouldSendNotification = 
        (action === 'approve' && settings.notifications.zalo.enabled && settings.notifications.zalo.inventoryApproval) ||
        (action === 'reject' && settings.notifications.zalo.enabled && settings.notifications.zalo.inventoryRejection);
        
      if (shouldSendNotification) {
        (async () => {
          try {
            const approver = 'Admin';
            const notificationMessage = generateInventoryApprovalMessage(
              selectedInventory.MaPhieu,
              action,
              approver,
              notes
            );

            await sendZaloMessage(
              {
                botToken: settings.notifications.zalo.botToken,
                chatId: settings.notifications.zalo.chatId
              },
              notificationMessage
            );

            console.log('✅ Background notification sent successfully for inventory', action);
          } catch (error) {
            console.error('❌ Background notification failed:', error);
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

  const handleAddNew = () => {
    router.push('/kho/xuat-nhap-kho');
    toast.success('Đang chuyển đến trang tạo phiếu xuất nhập kho...');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse space-y-4 w-full max-w-md">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b  py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Duyệt Phiếu
            </h1>
          
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReload} className="h-8 text-xs">
              <RefreshCw className="h-3 w-3 mr-1" />
              Tải lại
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="flex-shrink-0 bg-white border-b  py-2">
        <MobileApprovalStats
          total={stats.total}
          pending={stats.pending}
          approved={stats.approved}
          rejected={stats.rejected}
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex-shrink-0 bg-white border-b  py-2">
        <div className="flex items-center gap-1">
          <Button
            variant={currentTab === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentTab('all')}
            className="h-8 text-xs flex-1"
          >
            Tất cả 
          </Button>
          <Button
            variant={currentTab === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentTab('pending')}
            className="h-8 text-xs flex-1"
          >
            Chờ duyệt 
          </Button>
          <Button
            variant={currentTab === 'approved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentTab('approved')}
            className="h-8 text-xs flex-1"
          >
            Đã duyệt 
          </Button>
          <Button
            variant={currentTab === 'rejected' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentTab('rejected')}
            className="h-8 text-xs flex-1"
          >
            Từ chối 
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex-shrink-0 bg-white border-b  py-2">
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm phiếu..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchValue('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-200"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 flex-1"
            >
              <Filter className="h-4 w-4" />
              <span>Bộ lọc</span>
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddNew}
              className="h-8 text-xs"
            >
              <Package className="h-3 w-3 mr-1" />
              Tạo mới
            </Button>
          </div>

          {showFilters && (
            <div className="p-2 bg-gray-50 rounded-lg space-y-2">
              <div>
                <label className="text-sm font-medium">Loại phiếu</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-300 rounded text-sm"
                >
                  <option value="">Tất cả loại</option>
                  <option value="Nhập kho">Nhập kho</option>
                  <option value="Xuất kho">Xuất kho</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Trạng thái</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-300 rounded text-sm"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="Chờ xác nhận">Chờ xác nhận</option>
                  <option value="Đã duyệt">Đã duyệt</option>
                  <option value="Từ chối">Từ chối</option>
                </select>
              </div>

              {(searchValue || typeFilter || statusFilter) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Xóa tất cả bộ lọc
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-2">
          {filteredInventories.length > 0 ? (
            filteredInventories.map((inventory) => (
              <MobileApprovalCard
                key={inventory.MaPhieu}
                inventory={inventory}
                onViewDetails={handleViewDetails}
                onApprove={handleApprove}
                onReject={handleReject}
                onPrint={handlePrintSlip}
                onEdit={handleEditSlip}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Không có phiếu nào</p>
            </div>
          )}
        </div>
      </div>

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
