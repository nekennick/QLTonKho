'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Search, Plus, X } from 'lucide-react';
import type { InventoryDetailFormData } from '../types/inventory';
import { INVENTORY_QUALITY, DEFAULT_DETAIL_FORM } from '../utils/constants';
import authUtils from '@/utils/authUtils';

interface InventoryDetailFormProps {
  maPhieu: string;
  initialData?: InventoryDetailFormData;
  onSubmit: (data: InventoryDetailFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const InventoryDetailForm = ({ 
  maPhieu,
  initialData, 
  onSubmit, 
  onCancel, 
  loading = false 
}: InventoryDetailFormProps) => {
  const [formData, setFormData] = useState<InventoryDetailFormData>(
    initialData || { ...DEFAULT_DETAIL_FORM, MaPhieu: maPhieu }
  );
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await authUtils.apiRequest('DMHH', 'Find', {});
      setProducts(response || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleInputChange = (field: keyof InventoryDetailFormData, value: string | number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto calculate ThanhTien when SoLuong or DonGia changes
      if (field === 'SoLuong' || field === 'DonGia') {
        const soLuong = field === 'SoLuong' ? Number(value) : prev.SoLuong;
        const donGia = field === 'DonGia' ? Number(value) : prev.DonGia;
        newData.ThanhTien = soLuong * donGia;
      }
      
      return newData;
    });
  };

  const handleProductSelect = (product: any) => {
    setFormData(prev => ({
      ...prev,
      MaVT: product.MaVT,
      TenVT: product.TenVT,
      ĐVT: product.ĐVT,
      ChatLuong: product.ChatLuong || 'A',
      DonGia: parseFloat(product.DonGia) || 0,
      ThanhTien: prev.SoLuong * (parseFloat(product.DonGia) || 0)
    }));
    setShowProductSearch(false);
    setSearchTerm('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const filteredProducts = products.filter(product =>
    product.MaVT?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.TenVT?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {initialData ? 'Chỉnh sửa chi tiết phiếu' : 'Thêm chi tiết phiếu'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Selection */}
          <div className="space-y-2">
            <Label>Vật Tư *</Label>
            <div className="flex gap-2">
              <Input
                value={formData.TenVT}
                placeholder="Chọn vật tư..."
                readOnly
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowProductSearch(true)}
                className="px-3"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Product Search Modal */}
          {showProductSearch && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                  <h3 className="text-lg font-semibold">Chọn vật tư</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowProductSearch(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="p-4 border-b">
                  <Input
                    placeholder="Tìm kiếm vật tư..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-2">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.MaVT}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleProductSelect(product)}
                      >
                        <div>
                          <div className="font-medium">{product.TenVT}</div>
                          <div className="text-sm text-gray-500">
                            {product.MaVT} - {product.ĐVT}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {parseFloat(product.DonGia || 0).toLocaleString('vi-VN')} ₫
                          </div>
                          <div className="text-sm text-gray-500">
                            Tồn: {parseFloat(product.Ton || 0).toLocaleString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maVT">Mã VT</Label>
              <Input
                id="maVT"
                value={formData.MaVT}
                onChange={(e) => handleInputChange('MaVT', e.target.value)}
                placeholder="Mã vật tư"
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dvt">ĐVT</Label>
              <Input
                id="dvt"
                value={formData.ĐVT}
                onChange={(e) => handleInputChange('ĐVT', e.target.value)}
                placeholder="Đơn vị tính"
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="soLuong">Số Lượng *</Label>
              <Input
                id="soLuong"
                type="number"
                value={formData.SoLuong}
                onChange={(e) => handleInputChange('SoLuong', parseFloat(e.target.value) || 0)}
                placeholder="Nhập số lượng"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chatLuong">Chất Lượng</Label>
              <Select
                value={formData.ChatLuong}
                onValueChange={(value) => handleInputChange('ChatLuong', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chất lượng" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(INVENTORY_QUALITY).map((quality) => (
                    <SelectItem key={quality} value={quality}>
                      {quality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="donGia">Đơn Giá</Label>
              <Input
                id="donGia"
                type="number"
                value={formData.DonGia}
                onChange={(e) => handleInputChange('DonGia', parseFloat(e.target.value) || 0)}
                placeholder="Nhập đơn giá"
                min="0"
                step="1000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thanhTien">Thành Tiền</Label>
              <Input
                id="thanhTien"
                type="number"
                value={formData.ThanhTien}
                onChange={(e) => handleInputChange('ThanhTien', parseFloat(e.target.value) || 0)}
                placeholder="Thành tiền"
                min="0"
                step="1000"
                readOnly
                className="bg-gray-50"
              />
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
              rows={2}
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
              disabled={loading || !formData.MaVT || !formData.SoLuong}
              className="min-w-[120px]"
            >
              {loading ? 'Đang xử lý...' : (initialData ? 'Cập nhật' : 'Thêm')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
