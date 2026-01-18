'use client';

import { useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';

interface MobileProductCardProps {
  material: any;
  isInSlip: boolean;
  slipQuantity: number;
  onAdd: (material: any) => void;
}

export default function MobileProductCard({
  material,
  isInSlip,
  slipQuantity,
  onAdd
}: MobileProductCardProps) {
  const handleClick = useCallback(() => {
    onAdd(material);
  }, [material, onAdd]);

  return (
    <div 
      className={`bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer ${
        isInSlip ? 'bg-blue-50 border-blue-300 shadow-sm' : ''
      }`} 
      onClick={handleClick}
    >
        <div className="flex gap-2">
        {/* Product Image */}
        <div className="flex-shrink-0">
          {material.image ? (
            <img 
              src={material.image} 
              alt={material.name}
              className="w-14 h-14 object-cover rounded-lg border border-gray-200 shadow-sm"
              onError={(e) => {
                e.currentTarget.src = '/images/noimage.svg';
                e.currentTarget.alt = 'No Image';
              }}
            />
          ) : (
            <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border border-gray-200 flex items-center justify-center shadow-sm">
              <Package className="h-6 w-6 text-gray-500" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          {/* Product Name */}
          <h4 className="font-medium text-sm text-gray-900 leading-tight mb-1 break-words line-clamp-2">
            {material.name}
          </h4>

          {/* Product Code */}
          <div className="text-sm font-bold text-blue-600 mb-1 font-mono">
            {material.code}
          </div>

          {/* Origin/NoiSX */}
          <div className="text-sm text-gray-600 font-medium mb-1">
            {material.origin}
          </div>

          {/* Price and Stock */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900">
              ₫{parseFloat(material.price).toLocaleString('vi-VN')}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              material.stock < 0 
                ? 'bg-red-100 text-red-700 border border-red-200' 
                : material.stock < 10
                ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                : 'bg-green-100 text-green-700 border border-green-200'
            }`}>
              Tồn: {material.stock}
            </span>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-1 flex-wrap">
            <Badge variant="outline" className="text-xs px-2 py-1 bg-gray-50 text-gray-700 border-gray-300">
              {material.unit}
            </Badge>
            <Badge 
              variant="secondary" 
              className={`text-xs px-2 py-1 ${
                material.quality === 'A' ? 'bg-green-100 text-green-800 border-green-200' :
                material.quality === 'B' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                'bg-red-100 text-red-800 border-red-200'
              }`}
            >
              {material.quality}
            </Badge>
            {isInSlip && (
              <Badge variant="default" className="text-xs px-2 py-1 bg-blue-600 text-white font-bold">
                {slipQuantity}
              </Badge>
            )}
          </div>

          {/* Stock Warning */}
          {material.stock < 0 && (
            <div className="mt-1 text-xs text-red-600 font-medium">
              ⚠️ Hết hàng
            </div>
          )}
          {material.stock >= 0 && material.stock < 10 && (
            <div className="mt-1 text-xs text-yellow-600 font-medium">
              ⚠️ Sắp hết hàng
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
