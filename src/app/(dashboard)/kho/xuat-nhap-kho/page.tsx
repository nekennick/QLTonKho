'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/DatePicker';
import { 
  Search,
  Package, 
  Plus, 
  Minus,
  ArrowUp,
  ArrowDown,
  Calendar,
  Printer,
  Save,
  RotateCcw,
  RefreshCw,
  Info,
  Filter,
  X,
  Loader2
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useInventory } from './hooks/useInventory';
import { useProducts } from '../danh-muc-hang-hoa/hooks/useProducts';
import { useWarehouses } from '../hooks/useWarehouses';
import { useEmployees } from '../../nhanvien/hooks/useEmployees';
import { useMobileDetection } from './hooks/useMobileDetection';
import MobileInventoryForm from './components/MobileInventoryForm';
import { formatDateTimeForAPI } from './lib/formatters';
import { generateWarehousePrintTemplate, openPrintWindow } from './utils/Print';
import type { InventoryFormData, InventoryDetailFormData } from './types/inventory';
import type { Product } from '../danh-muc-hang-hoa/types/product';
import type { Warehouse } from '../types/warehouse';
import type { Employee } from '../../nhanvien/types/employee';
import { 
  sendZaloMessage, 
  generateInventoryCreationMessage
} from '@/utils/notificationUtils';
import { useSettings } from '@/context/SettingsContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import toast from 'react-hot-toast';

export default function XuatNhapKhoPage() {
  usePageTitle('Tạo phiếu xuất nhập kho');
  const { settings } = useSettings();
  
  // Mobile detection
  const { isMobile } = useMobileDetection();
  
  // Check if we're in edit mode from URL parameters
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  const maPhieu = searchParams.get('maPhieu') || undefined;

  const {
    inventories,
    inventoryDetails,
    loading,
    addInventory,
    updateInventory,
    deleteInventory,
    bulkDeleteInventories,
    bulkImportInventories,
    getAllInventoriesWithDetails
  } = useInventory(isEditMode, maPhieu);

  const {
    products,
    loading: productsLoading,
    fetchProducts
  } = useProducts(false); // Disable cache - cần dữ liệu tồn cập nhật đúng

  const {
    warehouses,
    loading: warehousesLoading,
    fetchWarehouses
  } = useWarehouses(false); // Disable cache - cần dữ liệu tồn cập nhật đúng

  const {
    employees,
    loading: employeesLoading,
    fetchEmployees
  } = useEmployees(false); // Disable cache - cần dữ liệu tồn cập nhật đúng

  // State management
  const [materialSearch, setMaterialSearch] = useState('');
  const [materialFilter, setMaterialFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [slipType, setSlipType] = useState<'import' | 'export'>('export');
  const [slipCode, setSlipCode] = useState(`NXT${Date.now()}`); // Tạo mã phiếu unique với timestamp
  const [address, setAddress] = useState('');
  const [stationCode, setStationCode] = useState('');
  const [planName, setPlanName] = useState('');
  const [contract, setContract] = useState('');
  const [constructionCode, setConstructionCode] = useState('');
  const [notes, setNotes] = useState('');
  const [creator, setCreator] = useState('NZ - Admin app');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  });
  const [fromWarehouse, setFromWarehouse] = useState('KHO AP');
  const [toWarehouse, setToWarehouse] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showProductList, setShowProductList] = useState(false);

  // Populate form when in edit mode and data is loaded
  useMemo(() => {
    if (isEditMode && inventories.length > 0 && inventoryDetails.length > 0) {
      const inventory = inventories[0];
      const details = inventoryDetails;
      
      // Populate form fields
      setSlipCode(inventory.MaPhieu);
      setSlipType(inventory.LoaiPhieu === 'Nhập kho' ? 'import' : 'export');
      setAddress(inventory.DiaChi || '');
      setNotes(inventory.GhiChu || '');
      setCreator(inventory.NhanVienDeNghi || 'NZ - Admin app');
      setFromWarehouse(inventory.Tu || 'KHO AP');
      setToWarehouse(inventory.Den || '');
      
      // Parse date and time
      if (inventory.Ngay) {
        const date = new Date(inventory.Ngay);
        setSelectedDate(date);
        setSelectedTime(date.toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }));
      }
      
      // Transform inventory details to selected materials
      const materials = details.map((detail: InventoryDetailFormData) => {
        // Find corresponding product
        const product = products.find((p: Product) => p.MaVT === detail.MaVT);
        
        return {
          id: detail.MaVT,
          name: detail.TenVT,
          unit: detail.ĐVT,
          code: detail.MaVT,
          price: detail.DonGia?.toString() || '0',
          stock: product?.TonApp || 0, // TODO: Get actual stock
          import: 0, // TODO: Get actual import data
          export: 0, // TODO: Get actual export data
          type: product?.NoiSX?.toLowerCase().includes('cáp') ? 'cap' : 'vattu',
          group: product?.NhomVT || 'Khác',
          quality: detail.ChatLuong || 'A',
          image: product?.HinhAnh || '',
          origin: product?.NoiSX || '',
          notes: detail.GhiChu || '',
          product: product,
          quantity: detail.SoLuong,
          requestedQuantity: detail.SoLuong,
          actualQuantity: detail.SoLuong
        };
      });
      
      setSelectedMaterials(materials);
      
      console.log('Form populated with edit data:', { inventory, details, materials });
    }
  }, [isEditMode, inventories, inventoryDetails, products]);

  // Transform products data for material catalog
  const materials = useMemo(() => {
    return products.map((product: Product) => ({
      id: product.MaVT,
      name: product.TenVT,
      unit: product.ĐVT,
      code: product.MaVT,
      price: product.DonGia || '0',
      stock: product.TonApp || 0, // TODO: Get actual stock from inventory
      import: 0, // TODO: Get actual import data
      export: 0, // TODO: Get actual export data
      type: product.NoiSX?.toLowerCase().includes('cáp') ? 'cap' : 'vattu',
      group: product.NhomVT || 'Khác',
      quality: product.ChatLuong || 'A',
      image: product.HinhAnh || '',
      origin: product.NoiSX || '',
      notes: product.GhiChu || '',
      product: product // Keep reference to original product
    }));
  }, [products]);

  // Get unique origins (NoiSX) for filter
  const productOrigins = useMemo(() => {
    const origins = Array.from(new Set(materials.map((m: any) => m.origin))).filter(Boolean);
    return origins.sort();
  }, [materials]);

  // Get unique groups for filter
  const productGroups = useMemo(() => {
    const groups = Array.from(new Set(materials.map((m: any) => m.group))).filter(Boolean);
    return groups.sort();
  }, [materials]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    let filtered = materials.filter((material: any) => {
      const matchesSearch = !materialSearch || 
        material.name.toLowerCase().includes(materialSearch.toLowerCase()) ||
        material.code.toLowerCase().includes(materialSearch.toLowerCase()) ||
        material.origin.toLowerCase().includes(materialSearch.toLowerCase());
      
      const matchesNoiSXFilter = materialFilter === 'all' || material.origin === materialFilter;
      const matchesGroupFilter = groupFilter === 'all' || material.group === groupFilter;
      
      return matchesSearch && matchesNoiSXFilter && matchesGroupFilter;
    });
    
    return filtered;
  }, [materials, materialSearch, materialFilter, groupFilter]);

  // Statistics
  const materialStats = useMemo(() => {
    const total = materials.length;
    const vattu = materials.filter((m: any) => m.type === 'vattu').length;
    const cap = materials.filter((m: any) => m.type === 'cap').length;
    
    return { total, vattu, cap };
  }, [materials]);

  // Calculate totals for selected materials
  const totals = useMemo(() => {
    const totalItems = selectedMaterials.length;
    const totalQuantity = selectedMaterials.reduce((sum: number, material: any) => sum + material.requestedQuantity, 0);
    const totalAmount = selectedMaterials.reduce((sum: number, material: any) => {
      const price = parseFloat(material.price) || 0;
      return sum + (price * material.requestedQuantity);
    }, 0);
    
    return {
      totalItems,
      totalQuantity,
      totalAmount
    };
  }, [selectedMaterials]);

  // Warehouse options for dropdowns
  const warehouseOptions = useMemo(() => {
    return warehouses.map((warehouse: Warehouse) => ({
      value: warehouse.MaKho,
      label: `${warehouse.TenKho} (${warehouse.MaKho})`
    }));
  }, [warehouses]);

  // Employee options for dropdowns
  const employeeOptions = useMemo(() => {
    return employees.map((employee: Employee) => ({
      value: employee.username,
      label: `${employee['Họ và Tên']} - ${employee['Chức vụ']}`
    }));
  }, [employees]);

  // Helper functions
  const formatDateTime = (date: Date, time: string) => {
    // Combine date and time into a proper Date object for API
    const [hours, minutes] = time.split(':');
    const dateTime = new Date(date);
    dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return formatDateTimeForAPI(dateTime);
  };


  // Event handlers
  const handleAddMaterial = (material: any) => {
    const existingIndex = selectedMaterials.findIndex(m => m.id === material.id);
    if (existingIndex >= 0) {
      // Nếu sản phẩm đã có trong phiếu, tăng số lượng lên 1
      const updated = [...selectedMaterials];
      updated[existingIndex].requestedQuantity += 1;
      setSelectedMaterials(updated);
      } else {
      // Nếu sản phẩm chưa có, thêm mới với số lượng 1
      setSelectedMaterials([...selectedMaterials, { 
        ...material, 
        quantity: 1, 
        requestedQuantity: 1, 
        actualQuantity: 0,
        notes: '',
        quality: material.quality || material.product?.ChatLuong || 'A'
      }]);
    }
  };

  // Product Item Component
  const ProductItem = useCallback(({ index }: { index: number; style?: React.CSSProperties }) => {
    const material = filteredMaterials[index];
    if (!material) return null;

    const isInSlip = selectedMaterials.some((m: any) => m.id === material.id);
    const slipQuantity = selectedMaterials.find(m => m.id === material.id)?.requestedQuantity || 0;

    return (
      <div 
        className={`bg-white border border-gray-200 rounded-md p-2 hover:shadow-sm hover:border-blue-300 transition-all duration-200 cursor-pointer ${
          isInSlip ? 'bg-blue-50 border-blue-300' : ''
        }`} 
        onClick={() => handleAddMaterial(material)}
      >
        <div className="flex gap-2">
          {/* Product Image */}
          <div className="flex-shrink-0">
            {material.image ? (
              <img 
                src={material.image} 
                alt={material.name}
                className="w-12 h-12 object-cover rounded border border-gray-200"
                onError={(e) => {
                  e.currentTarget.src = '/images/noimage.svg';
                  e.currentTarget.alt = 'No Image';
                }}
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded border border-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">No Image</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            {/* Product Name */}
            <h4 className="font-medium text-xs text-gray-900 leading-tight mb-1 break-words">
              {material.name}
            </h4>

            {/* Product Code */}
            <div className="text-xs font-bold text-gray-700 mb-1 font-mono">
              {material.code}
            </div>

            {/* Origin/NoiSX */}
            <div className="text-xs text-blue-600 font-medium mb-1">
              {material.origin}
            </div>

            {/* Price and Stock */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-gray-900">
                ₫{parseFloat(material.price).toLocaleString('vi-VN')}
              </span>
              <span className={`text-xs px-1 py-0.5 rounded font-medium ${
                material.stock < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
                Tồn: {material.stock}
              </span>
            </div>


            {/* Badges */}
            <div className="flex items-center gap-1 flex-wrap">
              <Badge variant="outline" className="text-xs px-1 py-0 bg-gray-50 text-gray-700 border-gray-300">
                {material.unit}
              </Badge>
              <Badge 
                variant="secondary" 
                className={`text-xs px-1 py-0 ${
                  material.quality === 'A' ? 'bg-green-100 text-green-800 border-green-200' :
                  material.quality === 'B' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                  'bg-red-100 text-red-800 border-red-200'
                }`}
              >
                {material.quality}
              </Badge>
              {isInSlip && (
                <Badge variant="default" className="text-xs px-1 py-0 bg-blue-600 text-white">
                  {slipQuantity}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }, [filteredMaterials, selectedMaterials, handleAddMaterial]);

  const handleRemoveMaterial = (materialId: string) => {
    setSelectedMaterials(selectedMaterials.filter((m: any) => m.id !== materialId));
  };

  const handleUpdateQuantity = (materialId: string, field: 'quantity' | 'requestedQuantity' | 'actualQuantity' | 'notes', value: number | string) => {
    setSelectedMaterials(selectedMaterials.map(m => 
      m.id === materialId ? { ...m, [field]: value } : m
    ));
  };

  const handleSaveSlip = async () => {
    if (selectedMaterials.length === 0) {
      toast.error('Vui lòng thêm ít nhất một vật tư!');
      return;
    }

    setIsSaving(true);
    try {
      // Prepare inventory data for NXKHO table
      const inventoryData: InventoryFormData = {
        MaPhieu: slipCode,
        LoaiPhieu: slipType === 'import' ? 'Nhập kho' : 'Xuất kho',
        DiaChi: address,
        Ngay: formatDateTime(selectedDate, selectedTime),
        NhanVienDeNghi: creator,
        Tu: fromWarehouse,
        Den: toWarehouse,
        GhiChu: notes,
        LichSu: '',
        TrangThai: 'Chờ xác nhận',
        NhanVienKho: ''
      };

      // Prepare inventory details for NXKHODE table
      const inventoryDetails = selectedMaterials.map(material => ({
        MaPhieuDe: `${slipCode}_${material.id}`,
        MaPhieu: slipCode,
        MaVT: material.id,
        TenVT: material.name,
        ĐVT: material.unit,
        SoLuong: material.requestedQuantity,
        ChatLuong: material.quality || material.product?.ChatLuong || 'A',
        DonGia: parseFloat(material.price) || 0,
        ThanhTien: (parseFloat(material.price) || 0) * material.requestedQuantity,
        GhiChu: material.notes || ''
      }));

      // Add or update inventory with details
      if (isEditMode && maPhieu) {
        await updateInventory(maPhieu, inventoryData, inventoryDetails);
        toast.success('Cập nhật phiếu thành công!');
      } else {
        await addInventory(inventoryData, inventoryDetails);
        
        // Send notification for new inventory creation (background)
        if (settings.notifications.zalo.enabled && settings.notifications.zalo.inventoryCreation) {
          // Chạy thông báo ngầm, không đợi kết quả
          (async () => {
            try {
              const notificationMessage = generateInventoryCreationMessage(
                slipCode,
                slipType,
                creator,
                fromWarehouse,
                toWarehouse,
                selectedMaterials.length,
                totals.totalAmount,
                selectedMaterials.map(material => ({
                  code: material.code,
                  name: material.name,
                  quantity: material.requestedQuantity,
                  unit: material.unit,
                  price: parseFloat(material.price) || 0,
                  total: (parseFloat(material.price) || 0) * material.requestedQuantity
                }))
              );

              // Send text message
              await sendZaloMessage(
                {
                  botToken: settings.notifications.zalo.botToken,
                  chatId: settings.notifications.zalo.chatId
                },
                notificationMessage
              );

              console.log('✅ Background notification sent successfully for inventory creation');
            } catch (error) {
              console.error('❌ Background notification failed:', error);
              // Không ảnh hưởng đến chức năng chính
            }
          })();
        }
        
        // Reset form only for new inventory
        setSelectedMaterials([]);
        setSlipCode(`NXT${Date.now()}`);
        setAddress('');
        setStationCode('');
        setPlanName('');
        setContract('');
        setConstructionCode('');
        setNotes('');
        setToWarehouse('');
        setSelectedDate(new Date());
        setSelectedTime(() => {
          const now = new Date();
          return now.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
        });
        
        toast.success('Lưu phiếu thành công!');
      }
    } catch (error) {
      console.error('Error saving slip:', error);
      toast.error('Có lỗi xảy ra khi lưu phiếu!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReload = async () => {
    try {
      const toastId = toast.loading('Đang tải dữ liệu mới nhất...');
      
      // Refresh all data sources in parallel
      await Promise.all([
        fetchProducts(true),
        fetchWarehouses(true),
        fetchEmployees(true)
      ]);
      
      toast.success('Đã cập nhật dữ liệu mới nhất!', { id: toastId });
    } catch (error) {
      console.error('Error reloading data:', error);
      toast.error('Có lỗi xảy ra khi tải lại dữ liệu');
    }
  };

  const handleClearFilters = () => {
    setMaterialSearch('');
    setMaterialFilter('all');
    setGroupFilter('all');
    toast.success('Đã xóa tất cả bộ lọc!');
  };

  const handleResetForm = () => {
    // Reset all form fields to initial state
    setSlipCode(`NXT${Date.now()}`);
    setAddress('');
    setStationCode('');
    setPlanName('');
    setContract('');
    setConstructionCode('');
    setNotes('');
    setCreator('NZ - Admin app');
    setSelectedDate(new Date());
    setSelectedTime(() => {
      const now = new Date();
      return now.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    });
    setFromWarehouse('KHO AP');
    setToWarehouse('');
    setSelectedMaterials([]);
    setSlipType('export');
    
    // Clear filters
    setMaterialSearch('');
    setMaterialFilter('all');
    setGroupFilter('all');
    
    toast.success('Đã reset toàn bộ form!');
  };

  const handlePrintSlip = () => {
    if (selectedMaterials.length === 0) {
      toast.error('Vui lòng thêm ít nhất một vật tư để in phiếu!');
      return;
    }

    // Prepare form data for print template
    const formData = {
      'LOẠI PHIẾU': slipType === 'import' ? 'Phiếu nhập' : 'Phiếu xuất',
      'MÃ PHIẾU': slipCode,
      'NHÂN VIÊN ĐỀ NGHỊ': creator,
      'NGÀY': formatDateTime(selectedDate, selectedTime),
      'GIỜ': selectedTime,
      'ĐỊA CHỈ': address,
      'MÃ TRẠM': stationCode,
      'TÊN KẾ HOẠCH': planName,
      'HỢP ĐỒNG': contract,
      'MÃ CÔNG TRÌNH': constructionCode,
      'TỪ': fromWarehouse,
      'ĐẾN': toWarehouse,
      'GHI CHÚ': notes
    };

    // Prepare warehouse details for print template
    const warehouseDetails = selectedMaterials.map(material => ({
      'MÃ VẬT TƯ': material.code,
      'TÊN VẬT TƯ': material.name,
      'ĐƠN VỊ TÍNH': material.unit,
      'SỐ LƯỢNG YÊU CẦU': material.requestedQuantity,
      'SỐ LƯỢNG THỰC TẾ': material.requestedQuantity,
      'ĐƠN GIÁ': parseFloat(material.price) || 0,
      'THÀNH TIỀN': (parseFloat(material.price) || 0) * material.requestedQuantity
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
  };

  // Skeleton loading component for immediate display
  const SkeletonForm = () => (
    <div className="flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 12vh)' }}>
      {/* Header skeleton */}
      <div className="flex-shrink-0 px-3 py-1 border-b bg-white">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </div>

      {/* Form skeleton */}
      <div className="flex-1 overflow-auto p-3 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-8 w-full" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-28" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-full" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products list skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-7 w-7" />
                <Skeleton className="h-7 w-7" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2 border rounded">
                  <Skeleton className="h-8 w-8" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-6" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Hiển thị skeleton khi đang loading nhưng vẫn render form
  if (loading || productsLoading || warehousesLoading || employeesLoading) {
    return <SkeletonForm />;
  }

  // Render mobile view if on mobile device
  if (isMobile) {
    return (
      <MobileInventoryForm
        inventories={inventories}
        inventoryDetails={inventoryDetails}
        loading={loading}
        addInventory={addInventory}
        updateInventory={updateInventory}
        deleteInventory={deleteInventory}
        products={products}
        warehouses={warehouses}
        employees={employees}
        isEditMode={isEditMode}
        maPhieu={maPhieu}
        fetchProducts={fetchProducts}
        fetchWarehouses={fetchWarehouses}
        fetchEmployees={fetchEmployees}
      />
    );
  }

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 12vh)' }}>
      {/* Header - Compact */}
      <div className="flex-shrink-0 px-3 py-1 border-b bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold flex items-center gap-2">
              <Package className="h-4 w-4" />
              {isEditMode ? 'Chỉnh Sửa Phiếu Xuất Nhập Kho' : 'Tạo Phiếu Xuất Nhập Kho'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowProductList(!showProductList)}
              className="h-6 text-xs lg:hidden"
            >
              <Package className="h-3 w-3 mr-1" />
              {showProductList ? 'Ẩn sản phẩm' : 'Chọn sản phẩm'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleReload} className="h-6 text-xs">
              <RefreshCw className="h-3 w-3 mr-1" />
              Tải lại
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResetForm} 
              className="h-6 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrintSlip} 
              disabled={selectedMaterials.length === 0}
              className="h-6 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Printer className="h-3 w-3 mr-1" />
              In phiếu
            </Button>
            <Button 
              size="sm" 
              onClick={handleSaveSlip} 
              disabled={selectedMaterials.length === 0 || isSaving} 
              className="h-6 text-xs"
            >
              {isSaving ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Save className="h-3 w-3 mr-1" />
              )}
              {isSaving ? 'Đang lưu...' : (isEditMode ? 'Cập nhật phiếu' : 'Lưu phiếu')}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Product List Overlay */}
      {showProductList && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-semibold text-sm">Chọn Sản Phẩm</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProductList(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {filteredMaterials.length > 0 ? (
                <div className="space-y-2">
                  {filteredMaterials.map((material: any, index: number) => (
                    <ProductItem 
                      key={material.id} 
                      index={index} 
                      style={{}} 
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full p-4">
                  <div className="text-center">
                    <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Không tìm thấy sản phẩm</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Product List (20% on desktop, hidden on mobile) */}
        <div className="hidden lg:flex w-1/5 border-r bg-white flex-col">
          <div className="p-2 border-b flex-shrink-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-sm">Danh Sách Sản Phẩm</h3>
              <Badge variant="secondary" className="text-xs">{filteredMaterials.length}/{materialStats.total}</Badge>
            </div>
            
            {/* Search */}
            <div className="relative mb-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm..."
                value={materialSearch}
                onChange={(e) => setMaterialSearch(e.target.value)}
                className="pl-7 pr-8 h-7 text-xs"
              />
              {(materialSearch || materialFilter !== 'all' || groupFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-5 w-5 p-0 hover:bg-gray-200"
                  title="Xóa tất cả bộ lọc"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </Button>
              )}
            </div>

            {/* NoiSX Filter */}
            <div className="mb-1">
              <div 
                className="flex gap-1 overflow-x-auto scrollbar-hide pb-1 cursor-grab active:cursor-grabbing select-none drag-scroll"
                onMouseDown={(e) => {
                  const container = e.currentTarget;
                  const startX = e.pageX - container.offsetLeft;
                  const scrollLeft = container.scrollLeft;
                  
                  const handleMouseMove = (e: MouseEvent) => {
                    e.preventDefault();
                    const x = e.pageX - container.offsetLeft;
                    const walk = (x - startX) * 2; // Tăng tốc độ scroll
                    container.scrollLeft = scrollLeft - walk;
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                    container.style.cursor = 'grab';
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                  container.style.cursor = 'grabbing';
                }}
                onWheel={(e) => {
                  e.preventDefault();
                  e.currentTarget.scrollLeft += e.deltaY;
                }}
              >
                <Button
                  variant={materialFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMaterialFilter('all');
                  }}
                  className="text-xs px-2 py-1 h-6 flex-shrink-0 pointer-events-auto"
                >
                  Tất cả
                </Button>
                {productOrigins.map((origin) => (
                  <Button
                    key={origin as string}
                    variant={materialFilter === origin ? 'default' : 'outline'}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMaterialFilter(origin as string);
                    }}
                    className="text-xs px-2 py-1 h-6 flex-shrink-0 pointer-events-auto"
                  >
                    {origin as string}
                  </Button>
                ))}
              </div>
            </div>

            {/* Group Filter */}
            <div className="mb-1">
              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Chọn nhóm vật tư" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">Tất cả nhóm</SelectItem>
                  {productGroups.map((group) => (
                    <SelectItem key={group as string} value={group as string} className="text-xs">
                      {group as string}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {filteredMaterials.length > 0 ? (
              <div className="space-y-2">
                {filteredMaterials.map((material: any, index: number) => (
                  <ProductItem 
                    key={material.id} 
                    index={index} 
                    style={{}} 
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full p-4">
                <div className="text-center">
                  <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Không tìm thấy sản phẩm</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Form and Table (80% on desktop, 100% on mobile) */}
        <div className="flex-1 flex flex-col">
          {/* Form Section - Compact */}
          <div className="flex-shrink-0 border-b bg-white p-2">
            <h3 className="font-semibold mb-1 text-sm">Thông Tin Phiếu</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2">
              <div>
                <Label htmlFor="slipCode" className="text-xs">Mã Phiếu</Label>
                <Input id="slipCode" value={slipCode} readOnly className="h-7 text-xs" />
              </div>
              <div>
                <Label htmlFor="toWarehouse" className="text-xs">Đến (KHO/NV)</Label>
                <Select value={toWarehouse} onValueChange={setToWarehouse}>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Chọn kho/nhân viên" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500">KHO</div>
                    {warehouseOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 mt-2">NHÂN VIÊN</div>
                    {employeeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Loại Phiếu</Label>
                <div className="flex gap-1 mt-1">
                  <Button
                    variant={slipType === 'import' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSlipType('import')}
                    className="flex items-center gap-1 h-7 text-xs px-2"
                  >
                    <ArrowDown className="h-3 w-3" />
                    Nhập
                  </Button>
                  <Button
                    variant={slipType === 'export' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSlipType('export')}
                    className="flex items-center gap-1 h-7 text-xs px-2"
                  >
                    <ArrowUp className="h-3 w-3" />
                    Xuất
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="creator" className="text-xs">Người Tạo</Label>
                <Input id="creator" value={creator} readOnly className="h-8 text-xs" />
              </div>
              <div>
                <Label htmlFor="fromWarehouse" className="text-xs">Từ Kho</Label>
                <Select value={fromWarehouse} onValueChange={setFromWarehouse}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouseOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Ngày & Giờ</Label>
                <div className="flex gap-1">
                  <DatePicker
                    date={selectedDate}
                    onDateChange={(date) => date && setSelectedDate(date)}
                    className="flex-1 [&_button]:h-8 [&_button]:text-xs"
                    placeholder="Chọn ngày"
                  />
                  <Input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="h-8 text-xs w-20"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
              <div>
                <Label htmlFor="address" className="text-xs">Địa Chỉ</Label>
                <Textarea 
                  id="address" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  className="h-12 text-xs resize-none" 
                  rows={1}
                  placeholder="Nhập địa chỉ..."
                />
              </div>
              <div>
                <Label htmlFor="notes" className="text-xs">Ghi Chú</Label>
                <Textarea 
                  id="notes" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  className="h-12 text-xs resize-none" 
                  rows={1}
                  placeholder="Nhập ghi chú..."
                />
              </div>
            </div>
          </div>

          {/* Table Section - Main content area */}
          <div className="flex-1 bg-white p-2 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <h3 className="font-semibold text-sm">Chi Tiết Phiếu</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                {selectedMaterials.length} mặt hàng
              </Badge>
                {selectedMaterials.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedMaterials([])}
                    className="h-6 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Xóa tất cả
                  </Button>
                )}
              </div>
            </div>
            
            {selectedMaterials.length > 0 ? (
              <div className="border rounded-lg overflow-hidden flex-1 flex flex-col min-h-0 bg-white shadow-sm">
                {/* Fixed Header */}
                <div className="bg-gray-50 border-b flex-shrink-0">
                  <div className="hidden md:grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-gray-700">
                    <div className="col-span-1 text-center">HÌNH ẢNH</div>
                    <div className="col-span-3 text-left">TÊN VẬT TƯ</div>
                    <div className="col-span-1 text-center">SỐ LƯỢNG</div>
                    <div className="col-span-1 text-center">ĐVT</div>
                    <div className="col-span-1 text-center">ĐƠN GIÁ</div>
                    <div className="col-span-2 text-center">THÀNH TIỀN</div>
                    <div className="col-span-2 text-center">GHI CHÚ</div>
                    <div className="col-span-1 text-center">THAO TÁC</div>
                  </div>
                  <div className="md:hidden px-3 py-2 text-xs font-medium text-gray-700 text-center">
                    CHI TIẾT VẬT TƯ
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto min-h-0">
                  <div className="divide-y divide-gray-100">
                    {selectedMaterials.map((material, index) => (
                      <div key={material.id}>
                        {/* Desktop Layout */}
                        <div className="hidden md:grid grid-cols-12 gap-2 px-3 py-3 hover:bg-gray-50 transition-colors">
                          {/* Hình ảnh */}
                          <div className="col-span-1 flex justify-center">
                              {material.image ? (
                                <img 
                                  src={material.image} 
                                  alt={material.name}
                                className="w-10 h-10 object-cover rounded border shadow-sm"
                                  onError={(e) => {
                                    e.currentTarget.src = '/images/noimage.svg';
                                    e.currentTarget.alt = 'No Image';
                                  }}
                                />
                              ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded border flex items-center justify-center shadow-sm">
                                <Package className="h-4 w-4 text-gray-400" />
                                </div>
                              )}
                            </div>

                          {/* Tên vật tư */}
                          <div className="col-span-3">
                            <div className="font-medium text-xs leading-relaxed break-words text-gray-900">
                              {material.name}
                            </div>
                            <div className="text-xs text-blue-600 font-bold mt-1">
                              {material.code}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {material.origin}
                            </div>
                          </div>

                          {/* Số lượng */}
                          <div className="col-span-1 flex justify-center">
                            <Input
                              type="number"
                              value={material.requestedQuantity}
                              onChange={(e) => handleUpdateQuantity(material.id, 'requestedQuantity', parseInt(e.target.value) || 0)}
                              className="w-16 h-8 text-center text-xs border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              min="0"
                            />
                          </div>

                          {/* ĐVT */}
                          <div className="col-span-1 flex items-center justify-center">
                            <Badge variant="outline" className="text-xs px-2 py-1">
                              {material.unit}
                            </Badge>
                          </div>

                          {/* Đơn giá */}
                          <div className="col-span-1 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-700">
                              ₫{parseFloat(material.price).toLocaleString('vi-VN')}
                            </span>
                          </div>

                          {/* Thành tiền */}
                          <div className="col-span-2 flex items-center justify-center">
                            <span className="text-xs font-bold text-green-600">
                              ₫{((parseFloat(material.price) || 0) * material.requestedQuantity).toLocaleString('vi-VN')}
                            </span>
                          </div>

                          {/* Ghi chú */}
                          <div className="col-span-2">
                            <Textarea 
                              className="w-full h-8 text-xs resize-none border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                              placeholder="Ghi chú..."
                              value={material.notes || ''}
                              onChange={(e) => handleUpdateQuantity(material.id, 'notes', e.target.value)}
                              rows={1}
                            />
                          </div>

                          {/* Thao tác */}
                          <div className="col-span-1 flex items-center justify-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveMaterial(material.id)}
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                              title="Xóa khỏi phiếu"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Mobile Layout */}
                        <div className="md:hidden p-3 hover:bg-gray-50 transition-colors">
                          <div className="flex gap-3">
                            {/* Hình ảnh */}
                            <div className="flex-shrink-0">
                              {material.image ? (
                                <img 
                                  src={material.image} 
                                  alt={material.name}
                                  className="w-12 h-12 object-cover rounded border shadow-sm"
                                  onError={(e) => {
                                    e.currentTarget.src = '/images/noimage.svg';
                                    e.currentTarget.alt = 'No Image';
                                  }}
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded border flex items-center justify-center shadow-sm">
                                  <Package className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>

                            {/* Thông tin chính */}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm leading-relaxed break-words text-gray-900 mb-1">
                                {material.name}
                              </div>
                              <div className="text-xs text-blue-600 font-bold mb-1">
                                {material.code}
                              </div>
                              <div className="text-xs text-gray-500 mb-2">
                                {material.origin}
                              </div>

                              {/* Thông tin chi tiết */}
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                <div>
                                  <label className="text-xs text-gray-500">Số lượng:</label>
                                  <Input
                                    type="number"
                                    value={material.requestedQuantity}
                                    onChange={(e) => handleUpdateQuantity(material.id, 'requestedQuantity', parseInt(e.target.value) || 0)}
                                    className="h-7 text-xs border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    min="0"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">ĐVT:</label>
                                  <Badge variant="outline" className="text-xs px-2 py-1 w-full justify-center">
                                    {material.unit}
                                  </Badge>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 mb-2">
                                <div>
                                  <label className="text-xs text-gray-500">Đơn giá:</label>
                                  <div className="text-xs font-medium text-gray-700">
                                    ₫{parseFloat(material.price).toLocaleString('vi-VN')}
                                  </div>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">Thành tiền:</label>
                                  <div className="text-xs font-bold text-green-600">
                                    ₫{((parseFloat(material.price) || 0) * material.requestedQuantity).toLocaleString('vi-VN')}
                                  </div>
                                </div>
                              </div>

                              {/* Ghi chú */}
                              <div className="mb-2">
                                <label className="text-xs text-gray-500">Ghi chú:</label>
                                <Textarea 
                                  className="w-full h-8 text-xs resize-none border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                  placeholder="Ghi chú..."
                                  value={material.notes || ''}
                                  onChange={(e) => handleUpdateQuantity(material.id, 'notes', e.target.value)}
                                  rows={1}
                                />
                              </div>

                              {/* Thao tác */}
                              <div className="flex justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRemoveMaterial(material.id)}
                                  className="h-8 px-3 text-xs hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                                >
                                  <Minus className="h-3 w-3 mr-1" />
                                  Xóa
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Fixed Footer with totals */}
                <div className="border-t bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-3 flex-shrink-0">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Tổng hàng:</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {totals.totalItems}
                        </Badge>
                    </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Tổng số lượng:</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {totals.totalQuantity}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base md:text-lg text-gray-800">Tổng tiền:</span>
                      <span className="font-bold text-lg md:text-xl text-green-600">
                        ₫{totals.totalAmount.toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center flex-1 flex items-center justify-center bg-gray-50">
                <div>
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Chưa có vật tư nào được thêm</h3>
                  <p className="text-sm text-gray-500 mb-4">Chọn vật tư từ danh sách bên trái để thêm vào phiếu</p>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Info className="h-4 w-4" />
                    <span>Nhấp vào sản phẩm để thêm vào phiếu</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
