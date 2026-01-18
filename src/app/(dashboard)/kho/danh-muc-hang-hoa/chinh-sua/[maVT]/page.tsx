'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Package, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductForm } from '../../components/ProductForm';
import { useProducts } from '../../hooks/useProducts';
import type { Product, ProductFormData } from '../../types/product';
import { INITIAL_PRODUCT_FORM_DATA } from '../../utils/constants';
import { usePageTitle } from '@/hooks/usePageTitle';
import authUtils from '@/utils/authUtils';
import toast from 'react-hot-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditProductPage() {
  usePageTitle('Chỉnh sửa hàng hóa');
  
  const router = useRouter();
  const params = useParams();
  const maVT = params?.maVT as string;

  const {
    products,
    updateProduct,
    loading
  } = useProducts(false); // Disable cache for fresh data

  const [formData, setFormData] = useState<ProductFormData>(INITIAL_PRODUCT_FORM_DATA);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);

  // Check user permissions and load product data
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

    // Load product data when products are loaded
    if (!loading && products.length > 0 && maVT) {
      const product = products.find((p: Product) => p.MaVT === maVT);
      if (product) {
        setEditingProduct(product);
        setFormData({
          MaVT: product.MaVT || '',
          TenVT: product.TenVT || '',
          NhomVT: product.NhomVT || '',
          HinhAnh: product.HinhAnh || '',
          ĐVT: product.ĐVT || '',
          NoiSX: product.NoiSX || '',
          ChatLuong: product.ChatLuong || '',
          DonGia: product.DonGia || '',
          GhiChu: product.GhiChu || ''
        });
        setIsLoadingProduct(false);
      } else {
        toast.error('Không tìm thấy hàng hóa!');
        router.push('/kho/danh-muc-hang-hoa');
      }
    } else if (!loading && products.length === 0) {
      setIsLoadingProduct(false);
    }
  }, [router, maVT, products, loading]);

  const existingMaVTList = useMemo(() =>
    products.map((p: Product) => p.MaVT.toLowerCase()),
    [products]
  );

  const handleSubmit = async (data: ProductFormData) => {
    if (!editingProduct) {
      toast.error('Không tìm thấy hàng hóa để cập nhật!');
      return;
    }

    try {
      await updateProduct(editingProduct.MaVT, data);
      // Navigate back to product list after successful update
      router.push('/kho/danh-muc-hang-hoa');
    } catch (error) {
      console.error('Error submitting form:', error);
      // Don't navigate on error, let user fix and retry
    }
  };

  const handleCancel = () => {
    router.push('/kho/danh-muc-hang-hoa');
  };

  if (loading || isLoadingProduct) {
    return (
      <div className="p-0">
        <div className="mx-auto space-y-6">
          <div className="flex items-center gap-4 px-4 sm:px-0">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Card className="mx-4 sm:mx-0">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!editingProduct) {
    return null;
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
                Chỉnh sửa hàng hóa
              </h1>
            </div>
          </div>
        </div>

    
            <ProductForm
              product={editingProduct}
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

