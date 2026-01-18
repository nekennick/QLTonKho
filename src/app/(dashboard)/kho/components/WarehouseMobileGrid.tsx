'use client';

import React from 'react';
import { Building2, MapPin, User, Image, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Warehouse } from '../types/warehouse';

interface WarehouseMobileGridProps {
  warehouses: Warehouse[];
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (warehouse: Warehouse) => void;
  onView: (warehouse: Warehouse) => void;
  isAdmin: boolean; 
  isManager: boolean;
}

export function WarehouseMobileGrid({
  warehouses,
  onEdit,
  onDelete,
  onView,
  isAdmin,
  isManager
}: WarehouseMobileGridProps) {
  const canEdit = isAdmin || isManager;

  return (
    <div className="grid grid-cols-1 gap-3">
      {warehouses.map((warehouse) => (
        <Card key={warehouse.MaKho} className="shadow-sm border border-gray-200 bg-white">
          <CardContent className="p-4">
            {/* Header với tên kho và mã kho */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-1">
                  <Building2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <h3 className="font-semibold text-gray-900 leading-tight">
                    {warehouse.TenKho}
                  </h3>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {warehouse.MaKho}
                </Badge>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(warehouse)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {canEdit && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(warehouse)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(warehouse)}
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
              {/* Địa chỉ */}
              {warehouse.DiaChi && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 line-clamp-2">
                    {warehouse.DiaChi}
                  </span>
                </div>
              )}

              {/* Thủ kho */}
              {warehouse.ThuKho && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600">
                    Thủ kho: {warehouse.ThuKho}
                  </span>
                </div>
              )}

              {/* Hình ảnh */}
              {warehouse.HinhAnh && (
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-500">
                    Có hình ảnh
                  </span>
                </div>
              )}

              {/* Ghi chú */}
              {warehouse.GhiChu && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {warehouse.GhiChu}
                  </p>
                </div>
              )}
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap gap-1 mt-3">
              {warehouse.ThuKho && (
                <Badge variant="outline" className="text-xs">
                  Có thủ kho
                </Badge>
              )}
              {warehouse.HinhAnh && (
                <Badge variant="outline" className="text-xs">
                  Có hình ảnh
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
