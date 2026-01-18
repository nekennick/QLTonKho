'use client';

import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ProductOption } from '../utils/constants';
import authUtils from '@/utils/authUtils';

export const useProductOptions = () => {
  const [productGroups, setProductGroups] = useState<ProductOption[]>([]);
  const [productUnits, setProductUnits] = useState<ProductOption[]>([]);
  const [productQualities, setProductQualities] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch unique values from existing products
  const fetchOptionsFromProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Lấy danh sách sản phẩm hiện có
      const response = await authUtils.apiRequest('DMHH', 'Find', {});
      const products = response || [];

      // Extract unique values
      const uniqueGroups = Array.from(new Set(products.map((p: any) => p.NhomVT).filter(Boolean)))
        .map(group => ({ value: group, label: group }));
      
      const uniqueUnits = Array.from(new Set(products.map((p: any) => p.ĐVT).filter(Boolean)))
        .map(unit => ({ value: unit, label: unit }));
      
      const uniqueQualities = Array.from(new Set(products.map((p: any) => p.ChatLuong).filter(Boolean)))
        .map(quality => ({ value: quality, label: quality }));

      // Set only unique values from API
      setProductGroups(uniqueGroups);
      setProductUnits(uniqueUnits);
      setProductQualities(uniqueQualities);

    } catch (error) {
      console.error('Error fetching product options:', error);
      toast.error('Lỗi khi tải danh sách tùy chọn');
      
      // Fallback to empty arrays
      setProductGroups([]);
      setProductUnits([]);
      setProductQualities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new option
  const addNewGroup = useCallback((newGroup: string) => {
    if (newGroup && !productGroups.some(g => g.value === newGroup)) {
      setProductGroups(prev => [...prev, { value: newGroup, label: newGroup }]);
      toast.success(`Đã thêm nhóm vật tư "${newGroup}"`);
    }
  }, [productGroups]);

  const addNewUnit = useCallback((newUnit: string) => {
    if (newUnit && !productUnits.some(u => u.value === newUnit)) {
      setProductUnits(prev => [...prev, { value: newUnit, label: newUnit }]);
      toast.success(`Đã thêm đơn vị tính "${newUnit}"`);
    }
  }, [productUnits]);

  const addNewQuality = useCallback((newQuality: string) => {
    if (newQuality && !productQualities.some(q => q.value === newQuality)) {
      setProductQualities(prev => [...prev, { value: newQuality, label: newQuality }]);
      toast.success(`Đã thêm chất lượng "${newQuality}"`);
    }
  }, [productQualities]);

  // Refresh options
  const refreshOptions = useCallback(() => {
    fetchOptionsFromProducts();
  }, [fetchOptionsFromProducts]);

  useEffect(() => {
    fetchOptionsFromProducts();
  }, [fetchOptionsFromProducts]);

  return {
    productGroups,
    productUnits,
    productQualities,
    loading,
    addNewGroup,
    addNewUnit,
    addNewQuality,
    refreshOptions
  };
};
