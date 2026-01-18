'use client';

import React from 'react';
import { Package, Tag, MapPin, Image, Edit, Trash2, Eye, Copy, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Product } from '../types/product';

interface ProductMobileGridProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onView: (product: Product) => void;
  onCopy: (product: Product) => void;
  isAdmin: boolean;
  isManager: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  itemsPerPage?: number;
}

export function ProductMobileGrid({
  products,
  onEdit,
  onDelete,
  onView,
  onCopy,
  isAdmin,
  isManager,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  itemsPerPage = 10
}: ProductMobileGridProps) {
  const canEdit = isAdmin || isManager;

  const formatPrice = (price: string) => {
    if (!price) return 'N/A';
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return price;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(numPrice);
  };

  return (
    <div className="space-y-3">
      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-3">
        {products.map((product) => (
          <Card key={product.MaVT} className="shadow-sm border border-gray-200 bg-white">
            <CardContent className="p-4">
              {/* Header với tên hàng hóa và mã vật tư */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    <Package className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <h3 className="font-semibold text-gray-900 leading-tight">
                      {product.TenVT}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {product.MaVT}
                    </Badge>
                    {product.NhomVT && (
                      <Badge variant="outline" className="text-xs">
                        {product.NhomVT}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(product)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {canEdit && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(product)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCopy(product)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(product)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Thông tin chi tiết */}
              <div className="space-y-2">
                {/* Đơn vị tính và đơn giá */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600">
                      {product.ĐVT || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      {formatPrice(product.DonGia)}
                    </span>
                  </div>
                </div>

                {/* Số lượng tồn kho */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Số lượng tồn</span>
                  </div>
                  <Badge
                    variant={product.SoLuongTon && product.SoLuongTon > 0 ? "outline" : "destructive"}
                    className="text-sm"
                  >
                    {product.SoLuongTon?.toLocaleString('vi-VN') || 0}
                  </Badge>
                </div>


                {/* Nơi sản xuất */}
                {product.NoiSX && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600 truncate">
                      {product.NoiSX}
                    </span>
                  </div>
                )}

                {/* Hình ảnh */}
                {product.HinhAnh && (
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-500">
                      Có hình ảnh
                    </span>
                  </div>
                )}

                {/* Ghi chú */}
                {product.GhiChu && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {product.GhiChu}
                    </p>
                  </div>
                )}
              </div>

              {/* Status badges */}
              <div className="flex flex-wrap gap-1 mt-3">
                {product.ChatLuong && (
                  <Badge
                    variant={product.ChatLuong === 'A' ? 'default' : 'outline'}
                    className={`text-xs ${product.ChatLuong === 'A'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : ''
                      }`}
                  >
                    Chất lượng {product.ChatLuong}
                  </Badge>
                )}
                {product.HinhAnh && (
                  <Badge variant="outline" className="text-xs">
                    Có hình ảnh
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-500">
            Trang {currentPage} / {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-8 w-8 p-0"
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-8 w-8 p-0"
            >
              →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
