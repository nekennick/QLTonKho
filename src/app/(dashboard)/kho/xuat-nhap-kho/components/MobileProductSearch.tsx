'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Package
} from 'lucide-react';

interface MobileProductSearchProps {
  materials: any[];
  materialSearch: string;
  setMaterialSearch: (value: string) => void;
  materialFilter: string;
  setMaterialFilter: (value: string) => void;
  groupFilter: string;
  setGroupFilter: (value: string) => void;
  productOrigins: string[];
  productGroups: string[];
  selectedMaterials: any[];
}

export default function MobileProductSearch({
  materials,
  materialSearch,
  setMaterialSearch,
  materialFilter,
  setMaterialFilter,
  groupFilter,
  setGroupFilter,
  productOrigins,
  productGroups,
  selectedMaterials
}: MobileProductSearchProps) {
  const [showFilters, setShowFilters] = useState(false);

  // Filtered materials count
  const filteredCount = useMemo(() => {
    return materials.filter(material => {
      const matchesSearch = !materialSearch || 
        material.name.toLowerCase().includes(materialSearch.toLowerCase()) ||
        material.code.toLowerCase().includes(materialSearch.toLowerCase()) ||
        material.origin.toLowerCase().includes(materialSearch.toLowerCase());
      
      const matchesNoiSXFilter = materialFilter === 'all' || material.origin === materialFilter;
      const matchesGroupFilter = groupFilter === 'all' || material.group === groupFilter;
      
      return matchesSearch && matchesNoiSXFilter && matchesGroupFilter;
    }).length;
  }, [materials, materialSearch, materialFilter, groupFilter]);

  const hasActiveFilters = materialSearch || materialFilter !== 'all' || groupFilter !== 'all';

  const clearAllFilters = () => {
    setMaterialSearch('');
    setMaterialFilter('all');
    setGroupFilter('all');
  };

  return (
    <div className="space-y-2">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          value={materialSearch}
          onChange={(e) => setMaterialSearch(e.target.value)}
          className="pl-10 pr-10"
        />
        {materialSearch && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMaterialSearch('')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-200"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          <span>Bộ lọc</span>
          {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {filteredCount}/{materials.length}
          </Badge>
          {selectedMaterials.length > 0 && (
            <Badge variant="default" className="text-xs bg-blue-600">
              Đã chọn: {selectedMaterials.length}
            </Badge>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-2 bg-gray-50 rounded-lg space-y-2">
          {/* Origin Filter */}
          <div>
            <Label className="text-sm font-medium">Nơi sản xuất</Label>
            <Select value={materialFilter} onValueChange={setMaterialFilter}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Chọn nơi sản xuất" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {productOrigins.map((origin) => (
                  <SelectItem key={origin} value={origin}>
                    {origin}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Group Filter */}
          <div>
            <Label className="text-sm font-medium">Nhóm vật tư</Label>
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Chọn nhóm vật tư" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả nhóm</SelectItem>
                {productGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Xóa tất cả bộ lọc
            </Button>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Package className="h-3 w-3" />
        <span>
          {filteredCount > 0 
            ? `Hiển thị ${filteredCount} sản phẩm` 
            : 'Không tìm thấy sản phẩm nào'
          }
        </span>
      </div>
    </div>
  );
}
