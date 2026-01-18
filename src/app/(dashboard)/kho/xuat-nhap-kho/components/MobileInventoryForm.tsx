'use client';

import { useState, useMemo, useCallback } from 'react';
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
  Loader2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff
} from 'lucide-react';
import { formatDateTimeForAPI } from '../lib/formatters';
import { generateWarehousePrintTemplate, openPrintWindow } from '../utils/Print';
import type { InventoryFormData, InventoryDetailFormData } from '../types/inventory';
import type { Product } from '../../danh-muc-hang-hoa/types/product';
import type { Warehouse } from '../../types/warehouse';
import type { Employee } from '../../../nhanvien/types/employee';
import { 
  sendZaloMessage, 
  generateInventoryCreationMessage
} from '@/utils/notificationUtils';
import { useSettings } from '@/context/SettingsContext';
import toast from 'react-hot-toast';
import MobileProductSearch from './MobileProductSearch';
import MobileProductCard from './MobileProductCard';
import MobileStepIndicator from './MobileStepIndicator';

interface MobileInventoryFormProps {
  // Data hooks
  inventories: any[];
  inventoryDetails: any[];
  loading: boolean;
  addInventory: (inventory: InventoryFormData, details: InventoryDetailFormData[]) => Promise<void>;
  updateInventory: (maPhieu: string, inventory: InventoryFormData, details: InventoryDetailFormData[]) => Promise<void>;
  deleteInventory: (maPhieu: string) => Promise<void>;
  
  // Data sources
  products: Product[];
  warehouses: Warehouse[];
  employees: Employee[];
  
  // Edit mode props
  isEditMode: boolean;
  maPhieu?: string;
  
  // Reload functions
  fetchProducts: (force?: boolean) => Promise<void>;
  fetchWarehouses: (force?: boolean) => Promise<void>;
  fetchEmployees: (force?: boolean) => Promise<void>;
}

export default function MobileInventoryForm({
  inventories,
  inventoryDetails,
  loading,
  addInventory,
  updateInventory,
  products,
  warehouses,
  employees,
  isEditMode,
  maPhieu,
  fetchProducts,
  fetchWarehouses,
  fetchEmployees
}: MobileInventoryFormProps) {
  const { settings } = useSettings();
  
  // State management
  const [currentStep, setCurrentStep] = useState<'form' | 'products' | 'details'>('form');
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
  const [showProductFilters, setShowProductFilters] = useState(false);

  // Transform products data for material catalog
  const materials = useMemo(() => {
    return products.map((product: Product) => ({
      id: product.MaVT,
      name: product.TenVT,
      unit: product.ĐVT,
      code: product.MaVT,
      price: product.DonGia || '0',
      stock: product.TonApp || 0,
      import: 0,
      export: 0,
      type: product.NoiSX?.toLowerCase().includes('cáp') ? 'cap' : 'vattu',
      group: product.NhomVT || 'Khác',
      quality: product.ChatLuong || 'A',
      image: product.HinhAnh || '',
      origin: product.NoiSX || '',
      notes: product.GhiChu || '',
      product: product
    }));
  }, [products]);

  // Get unique origins and groups for filter
  const productOrigins = useMemo(() => {
    const origins = Array.from(new Set(materials.map(m => m.origin))).filter(Boolean);
    return origins.sort();
  }, [materials]);

  const productGroups = useMemo(() => {
    const groups = Array.from(new Set(materials.map(m => m.group))).filter(Boolean);
    return groups.sort();
  }, [materials]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    let filtered = materials.filter(material => {
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

  // Calculate totals for selected materials
  const totals = useMemo(() => {
    const totalItems = selectedMaterials.length;
    const totalQuantity = selectedMaterials.reduce((sum, material) => sum + material.requestedQuantity, 0);
    const totalAmount = selectedMaterials.reduce((sum, material) => {
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
    const [hours, minutes] = time.split(':');
    const dateTime = new Date(date);
    dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return formatDateTimeForAPI(dateTime);
  };

  // Event handlers
  const handleAddMaterial = (material: any) => {
    const existingIndex = selectedMaterials.findIndex(m => m.id === material.id);
    if (existingIndex >= 0) {
      const updated = [...selectedMaterials];
      updated[existingIndex].requestedQuantity += 1;
      setSelectedMaterials(updated);
    } else {
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

  const handleRemoveMaterial = (materialId: string) => {
    setSelectedMaterials(selectedMaterials.filter(m => m.id !== materialId));
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

      if (isEditMode && maPhieu) {
        await updateInventory(maPhieu, inventoryData, inventoryDetails);
        toast.success('Cập nhật phiếu thành công!');
      } else {
        await addInventory(inventoryData, inventoryDetails);
        
        // Send notification for new inventory creation (background)
        if (settings.notifications.zalo.enabled && settings.notifications.zalo.inventoryCreation) {
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
            }
          })();
        }
        
        // Reset form only for new inventory
        setSelectedMaterials([]);
        setSlipCode(`NXT${Date.now()}`);
        setAddress('');
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

  const handleResetForm = () => {
    setSlipCode(`NXT${Date.now()}`);
    setAddress('');
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

    const warehouseDetails = selectedMaterials.map(material => ({
      'MÃ VẬT TƯ': material.code,
      'TÊN VẬT TƯ': material.name,
      'ĐƠN VỊ TÍNH': material.unit,
      'SỐ LƯỢNG YÊU CẦU': material.requestedQuantity,
      'SỐ LƯỢNG THỰC TẾ': material.requestedQuantity,
      'ĐƠN GIÁ': parseFloat(material.price) || 0,
      'THÀNH TIỀN': (parseFloat(material.price) || 0) * material.requestedQuantity
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
  };

  // Product Item Component for mobile - now using MobileProductCard
  const ProductItem = useCallback(({ material }: { material: any }) => {
    const isInSlip = selectedMaterials.some(m => m.id === material.id);
    const slipQuantity = selectedMaterials.find(m => m.id === material.id)?.requestedQuantity || 0;

    return (
      <MobileProductCard
        material={material}
        isInSlip={isInSlip}
        slipQuantity={slipQuantity}
        onAdd={handleAddMaterial}
      />
    );
  }, [selectedMaterials, handleAddMaterial]);

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
      <div className="flex-shrink-0 bg-white border-b px-2 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Package className="h-5 w-5" />
              {isEditMode ? 'Chỉnh Sửa Phiếu' : 'Tạo Phiếu Xuất Nhập'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {currentStep === 'form' && 'Thông tin phiếu'}
              {currentStep === 'products' && 'Chọn sản phẩm'}
              {currentStep === 'details' && 'Chi tiết phiếu'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReload} className="h-8 text-xs">
              <RefreshCw className="h-3 w-3 mr-1" />
              Tải lại
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResetForm} 
              className="h-8 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <MobileStepIndicator
        currentStep={currentStep}
        selectedMaterialsCount={selectedMaterials.length}
        onStepClick={setCurrentStep}
      />

      {/* Action Buttons */}
      {selectedMaterials.length > 0 && (
        <div className="flex-shrink-0 bg-white border-b px-2 py-2">
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintSlip}
              className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Printer className="h-3 w-3 mr-1" />
              In
            </Button>
            <Button 
              size="sm" 
              onClick={handleSaveSlip} 
              disabled={isSaving} 
              className="h-8 text-xs"
            >
              {isSaving ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Save className="h-3 w-3 mr-1" />
              )}
              {isSaving ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Lưu')}
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {currentStep === 'form' && (
          <div className="p-2 space-y-3">
          
                <div>
                  <Label htmlFor="slipCode" className="text-sm">Mã Phiếu</Label>
                  <Input id="slipCode" value={slipCode} readOnly className="mt-1" />
                </div>

                <div>
                  <Label className="text-sm">Loại Phiếu</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={slipType === 'import' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSlipType('import')}
                      className="flex items-center gap-2 flex-1"
                    >
                      <ArrowDown className="h-4 w-4" />
                      Nhập kho
                    </Button>
                    <Button
                      variant={slipType === 'export' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSlipType('export')}
                      className="flex items-center gap-2 flex-1"
                    >
                      <ArrowUp className="h-4 w-4" />
                      Xuất kho
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="fromWarehouse" className="text-sm">Từ Kho</Label>
                  <Select value={fromWarehouse} onValueChange={setFromWarehouse}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouseOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="toWarehouse" className="text-sm">Đến (KHO/NV)</Label>
                  <Select value={toWarehouse} onValueChange={setToWarehouse}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn kho/nhân viên" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="px-2 py-1 text-sm font-semibold text-gray-500">KHO</div>
                      {warehouseOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                      <div className="px-2 py-1 text-sm font-semibold text-gray-500 mt-2">NHÂN VIÊN</div>
                      {employeeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="creator" className="text-sm">Người Tạo</Label>
                  <Input id="creator" value={creator} readOnly className="mt-1" />
                </div>

                <div>
                  <Label className="text-sm">Ngày & Giờ</Label>
                  <div className="flex gap-2 mt-2">
                    <DatePicker
                      date={selectedDate}
                      onDateChange={(date) => date && setSelectedDate(date)}
                      className="flex-1"
                      placeholder="Chọn ngày"
                    />
                    <Input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-24"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm">Địa Chỉ</Label>
                  <Textarea 
                    id="address" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    className="mt-1 resize-none" 
                    rows={2}
                    placeholder="Nhập địa chỉ..."
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm">Ghi Chú</Label>
                  <Textarea 
                    id="notes" 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    className="mt-1 resize-none" 
                    rows={2}
                    placeholder="Nhập ghi chú..."
                  />
                </div>
          
          </div>
        )}

        {currentStep === 'products' && (
          <div className="p-2 space-y-3">
            {/* Search and Filters */}
          
                <CardTitle className="text-base">Tìm Kiếm Sản Phẩm</CardTitle>
             
                <MobileProductSearch
                  materials={materials}
                  materialSearch={materialSearch}
                  setMaterialSearch={setMaterialSearch}
                  materialFilter={materialFilter}
                  setMaterialFilter={setMaterialFilter}
                  groupFilter={groupFilter}
                  setGroupFilter={setGroupFilter}
                  productOrigins={productOrigins}
                  productGroups={productGroups}
                  selectedMaterials={selectedMaterials}
                />
             

            {/* Product List */}
           
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Danh Sách Sản Phẩm</CardTitle>
                  <Badge variant="secondary">{filteredMaterials.length}/{materials.length}</Badge>
                </div>
           
                {filteredMaterials.length > 0 ? (
                  <div className="space-y-3">
                    {filteredMaterials.map((material) => (
                      <ProductItem key={material.id} material={material} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Không tìm thấy sản phẩm</p>
                  </div>
                )}
              
          </div>
        )}

        {currentStep === 'details' && (
          <div className="p-2 space-y-3">
          
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Chi Tiết Phiếu</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {selectedMaterials.length} mặt hàng
                    </Badge>
                    {selectedMaterials.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedMaterials([])}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Xóa tất cả
                      </Button>
                    )}
                  </div>
                </div>
             
                {selectedMaterials.length > 0 ? (
                  <div className="space-y-3">
                    {selectedMaterials.map((material) => (
                      <div key={material.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex gap-3 mb-2">
                          {/* Hình ảnh */}
                          <div className="flex-shrink-0">
                            {material.image ? (
                              <img 
                                src={material.image} 
                                alt={material.name}
                                className="w-16 h-16 object-cover rounded border shadow-sm"
                                onError={(e) => {
                                  e.currentTarget.src = '/images/noimage.svg';
                                  e.currentTarget.alt = 'No Image';
                                }}
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded border flex items-center justify-center shadow-sm">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Thông tin chính */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm leading-relaxed break-words text-gray-900 mb-1">
                              {material.name}
                            </div>
                            <div className="text-sm text-blue-600 font-bold mb-1">
                              {material.code}
                            </div>
                            <div className="text-sm text-gray-500 mb-2">
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
                                  className="h-8 text-sm border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                  min="0"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500">ĐVT:</label>
                                <Badge variant="outline" className="text-sm px-3 py-1 w-full justify-center h-8">
                                  {material.unit}
                                </Badge>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <div>
                                <label className="text-xs text-gray-500">Đơn giá:</label>
                                <div className="text-sm font-medium text-gray-700">
                                  ₫{parseFloat(material.price).toLocaleString('vi-VN')}
                                </div>
                              </div>
                              <div>
                                <label className="text-xs text-gray-500">Thành tiền:</label>
                                <div className="text-sm font-bold text-green-600">
                                  ₫{((parseFloat(material.price) || 0) * material.requestedQuantity).toLocaleString('vi-VN')}
                                </div>
                              </div>
                            </div>

                            {/* Ghi chú */}
                            <div className="mb-2">
                              <label className="text-xs text-gray-500">Ghi chú:</label>
                              <Textarea 
                                className="w-full h-8 text-sm resize-none border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
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
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Minus className="h-3 w-3 mr-1" />
                                Xóa
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-2">Chưa có vật tư nào được thêm</p>
                    <p className="text-xs text-gray-400">Chuyển sang tab "Sản phẩm" để thêm vật tư</p>
                  </div>
                )}
             
            {/* Totals */}
            {selectedMaterials.length > 0 && (
           
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Tổng hàng:</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {totals.totalItems}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Tổng số lượng:</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {totals.totalQuantity}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-bold text-lg text-gray-800">Tổng tiền:</span>
                      <span className="font-bold text-xl text-green-600">
                        ₫{totals.totalAmount.toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
              
            )}
          </div>
        )}
      </div>
    </div>
  );
}
