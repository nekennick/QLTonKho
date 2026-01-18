'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Package, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductForm } from '../components/ProductForm';
import { useProducts } from '../hooks/useProducts';
import type { Product, ProductFormData } from '../types/product';
import { INITIAL_PRODUCT_FORM_DATA } from '../utils/constants';
import { usePageTitle } from '@/hooks/usePageTitle';
import authUtils from '@/utils/authUtils';
import toast from 'react-hot-toast';

export default function AddProductPage() {
  usePageTitle('Thêm hàng hóa mới');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCopyMode = searchParams.get('copy') === 'true';

  const {
    products,
    addProduct,
    loading
  } = useProducts(false); // Disable cache for fresh data

  const [formData, setFormData] = useState<ProductFormData>(INITIAL_PRODUCT_FORM_DATA);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);

  // Check user permissions and load copied data if in copy mode
  useEffect(() => {
    const userData = authUtils.getUserData();
    if (!userData) {
      router.push('/login');
      return;
    }

    const isAdminUser = userData['Phân quyền'] === 'Admin';
    const isManagerUser = userData['Phân quyền'] === 'Quản lý';
    setIsAdmin(isAdminUser);
    setIsManager(isManagerUser);

    if (!isAdminUser && !isManagerUser) {
      toast.error('Bạn không có quyền thực hiện chức năng này!');
      router.push('/kho/danh-muc-hang-hoa');
      return;
    }

    // Load copied data if in copy mode
    if (isCopyMode) {
      const copiedDataStr = sessionStorage.getItem('copiedProductData');
      if (copiedDataStr) {
        try {
          const copiedData = JSON.parse(copiedDataStr);
          setFormData({
            ...INITIAL_PRODUCT_FORM_DATA,
            ...copiedData,
            MaVT: '' // Always clear MaVT when copying
          });
          sessionStorage.removeItem('copiedProductData'); // Clear after use
        } catch (error) {
          console.error('Error parsing copied product data:', error);
        }
      }
    }
  }, [router, isCopyMode]);

  const existingMaVTList = useMemo(() =>
    products.map((p: Product) => p.MaVT.toLowerCase()),
    [products]
  );

  const handleSubmit = async (data: ProductFormData) => {
    try {
      await addProduct(data);
      // Navigate back to product list after successful add
      router.push('/kho/danh-muc-hang-hoa');
    } catch (error) {
      console.error('Error submitting form:', error);
      // Don't navigate on error, let user fix and retry
    }
  };

  const handleCancel = () => {
    router.push('/kho/danh-muc-hang-hoa');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse space-y-4 w-full max-w-6xl">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-0">
          <div className="flex items-center gap-4">
           
            <div className="flex items-center">
              <Package className="mr-2 h-6 w-6 text-blue-600" />
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                Thêm hàng hóa mới
              </h1>
            </div>
          </div>
        </div>

       
            <ProductForm
              product={null}
              formData={formData}
              onFormDataChange={setFormData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isAdmin={isAdmin}
              isManager={isManager}
              existingMaVTList={existingMaVTList}
              isPageMode={true}
            />
         
      </div>
    </div>
  );
}

