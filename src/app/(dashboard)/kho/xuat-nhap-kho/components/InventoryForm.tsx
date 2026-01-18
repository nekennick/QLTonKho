'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Package, User, MapPin, ArrowUpDown } from 'lucide-react';
import type { InventoryFormData } from '../types/inventory';
import { INVENTORY_TYPES, INVENTORY_STATUS, DEFAULT_INVENTORY_FORM } from '../utils/constants';
import authUtils from '@/utils/authUtils';

interface InventoryFormProps {
  initialData?: InventoryFormData;
  onSubmit: (data: InventoryFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const InventoryForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  loading = false 
}: InventoryFormProps) => {
  const [formData, setFormData] = useState<InventoryFormData>(
    initialData || DEFAULT_INVENTORY_FORM
  );
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await authUtils.apiRequest('DSNV', 'Find', {});
      setEmployees(response || []);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleInputChange = (field: keyof InventoryFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getEmployeeOptions = () => {
    return employees
      .filter(emp => emp['Trạng thái'] === 'Còn làm')
      .map(emp => ({
        value: emp['Mã nhân viên'],
        label: `${emp['Mã nhân viên']} - ${emp['Họ và Tên']} (${emp['Phòng']})`
      }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {initialData ? 'Chỉnh sửa phiếu xuất nhập kho' : 'Tạo phiếu xuất nhập kho mới'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maPhieu">Mã Phiếu *</Label>
              <Input
                id="maPhieu"
                value={formData.MaPhieu}
                onChange={(e) => handleInputChange('MaPhieu', e.target.value)}
                placeholder="Nhập mã phiếu"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loaiPhieu">Loại Phiếu *</Label>
              <Select
                value={formData.LoaiPhieu}
                onValueChange={(value) => handleInputChange('LoaiPhieu', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại phiếu" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(INVENTORY_TYPES).map((type) => (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4" />
                        {type}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ngay">Ngày *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="ngay"
                  type="datetime-local"
                  value={formData.Ngay}
                  onChange={(e) => handleInputChange('Ngay', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trangThai">Trạng Thái</Label>
              <Select
                value={formData.TrangThai}
                onValueChange={(value) => handleInputChange('TrangThai', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(INVENTORY_STATUS).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Thông tin địa điểm
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="diaChi">Địa Chỉ</Label>
                <Input
                  id="diaChi"
                  value={formData.DiaChi}
                  onChange={(e) => handleInputChange('DiaChi', e.target.value)}
                  placeholder="Nhập địa chỉ"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tu">Từ</Label>
                <Input
                  id="tu"
                  value={formData.Tu}
                  onChange={(e) => handleInputChange('Tu', e.target.value)}
                  placeholder="Nhập nguồn"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="den">Đến</Label>
                <Input
                  id="den"
                  value={formData.Den}
                  onChange={(e) => handleInputChange('Den', e.target.value)}
                  placeholder="Nhập đích đến"
                />
              </div>
            </div>
          </div>

          {/* Employee Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Thông tin nhân viên
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nhanVienDeNghi">Nhân Viên Đề Nghị *</Label>
                <Select
                  value={formData.NhanVienDeNghi}
                  onValueChange={(value) => handleInputChange('NhanVienDeNghi', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhân viên đề nghị" />
                  </SelectTrigger>
                  <SelectContent>
                    {getEmployeeOptions().map((emp) => (
                      <SelectItem key={emp.value} value={emp.value}>
                        {emp.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nhanVienKho">Nhân Viên Kho</Label>
                <Select
                  value={formData.NhanVienKho}
                  onValueChange={(value) => handleInputChange('NhanVienKho', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhân viên kho" />
                  </SelectTrigger>
                  <SelectContent>
                    {getEmployeeOptions()
                      .filter(emp => emp.label.includes('Kho'))
                      .map((emp) => (
                        <SelectItem key={emp.value} value={emp.value}>
                          {emp.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="ghiChu">Ghi Chú</Label>
            <Textarea
              id="ghiChu"
              value={formData.GhiChu}
              onChange={(e) => handleInputChange('GhiChu', e.target.value)}
              placeholder="Nhập ghi chú..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? 'Đang xử lý...' : (initialData ? 'Cập nhật' : 'Tạo phiếu')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
