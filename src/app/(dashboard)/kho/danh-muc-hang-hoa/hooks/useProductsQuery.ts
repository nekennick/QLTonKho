'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { Product, ProductFormData } from '../types/product';
import { generateProductCode } from '../utils/constants';
import authUtils from '@/utils/authUtils';
import { queryKeys } from '@/lib/queryKeys';

/**
 * Hook để fetch danh sách hàng hóa sử dụng React Query
 */
export const useProductsQuery = () => {
  return useQuery({
    queryKey: queryKeys.products.lists(),
    queryFn: async () => {
      const response = await authUtils.apiRequest('DMHH', 'Find', {});
      return (response || []) as Product[];
    },
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 30 * 60 * 1000, // 30 phút
  });
};

/**
 * Hook để thêm hàng hóa mới
 */
export const useAddProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: ProductFormData) => {
      // Tự sinh mã vật tư nếu chưa có
      let productData = { ...formData };
      if (!productData.MaVT) {
        const existingProducts = queryClient.getQueryData<Product[]>(queryKeys.products.lists()) || [];
        const existingCodes = existingProducts.map(p => p.MaVT);
        productData.MaVT = generateProductCode(existingCodes);
      }

      // Check for existing MaVT
      const existingProducts = queryClient.getQueryData<Product[]>(queryKeys.products.lists()) || [];
      const exists = existingProducts.some(product =>
        product.MaVT.toLowerCase() === productData.MaVT.toLowerCase()
      );

      if (exists) {
        throw new Error('Mã vật tư này đã tồn tại!');
      }

      await authUtils.apiRequest('DMHH', 'Add', {
        "Rows": [productData]
      });

      return productData as Product;
    },
    onSuccess: (newProduct) => {
      queryClient.setQueryData<Product[]>(queryKeys.products.lists(), (old = []) => [...old, newProduct]);
      toast.success('Thêm hàng hóa mới thành công!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Có lỗi xảy ra khi thêm hàng hóa');
    },
  });
};

/**
 * Hook để cập nhật hàng hóa
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ maVT, formData }: { maVT: string; formData: ProductFormData }) => {
      const existingProducts = queryClient.getQueryData<Product[]>(queryKeys.products.lists()) || [];
      const oldProduct = existingProducts.find(product => product.MaVT === maVT);
      
      if (!oldProduct) {
        throw new Error('Không tìm thấy hàng hóa');
      }

      await authUtils.apiRequest('DMHH', 'Edit', {
        "Rows": [formData]
      });

      return { maVT, formData };
    },
    onSuccess: ({ maVT, formData }) => {
      queryClient.setQueryData<Product[]>(queryKeys.products.lists(), (old = []) =>
        old.map(product =>
          product.MaVT === maVT ? { ...product, ...formData } : product
        )
      );
      toast.success('Cập nhật thông tin hàng hóa thành công!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật hàng hóa');
    },
  });
};

/**
 * Hook để xóa hàng hóa
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (maVT: string) => {
      const existingProducts = queryClient.getQueryData<Product[]>(queryKeys.products.lists()) || [];
      const productName = existingProducts.find(product => product.MaVT === maVT)?.TenVT || '';

      await authUtils.apiRequest('DMHH', 'Delete', {
        "Rows": [{ "MaVT": maVT }]
      });

      return { maVT, productName };
    },
    onMutate: async (maVT) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.products.lists() });
      const previousProducts = queryClient.getQueryData<Product[]>(queryKeys.products.lists());

      queryClient.setQueryData<Product[]>(queryKeys.products.lists(), (old = []) =>
        old.filter(product => product.MaVT !== maVT)
      );

      return { previousProducts };
    },
    onSuccess: ({ productName }) => {
      toast.success(`Xóa hàng hóa "${productName}" thành công!`);
    },
    onError: (error: Error, maVT, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(queryKeys.products.lists(), context.previousProducts);
      }
      toast.error('Có lỗi xảy ra khi xóa hàng hóa');
    },
  });
};

/**
 * Hook để import nhiều hàng hóa
 */
export const useBulkImportProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productsToImport: ProductFormData[]) => {
      await authUtils.apiRequest('DMHH', 'Add', {
        "Rows": productsToImport
      });
      return productsToImport as Product[];
    },
    onSuccess: (newProducts) => {
      queryClient.setQueryData<Product[]>(queryKeys.products.lists(), (old = []) => [...old, ...newProducts]);
      toast.success(`Import thành công ${newProducts.length} hàng hóa!`);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi import hàng hóa');
    },
  });
};

/**
 * Hook để xóa nhiều hàng hóa
 */
export const useBulkDeleteProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (maVTList: string[]) => {
      const deleteRows = maVTList.map(maVT => ({ MaVT: maVT }));
      await authUtils.apiRequest('DMHH', 'Delete', {
        "Rows": deleteRows
      });
      return maVTList;
    },
    onMutate: async (maVTList) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.products.lists() });
      const previousProducts = queryClient.getQueryData<Product[]>(queryKeys.products.lists());

      queryClient.setQueryData<Product[]>(queryKeys.products.lists(), (old = []) =>
        old.filter(product => !maVTList.includes(product.MaVT))
      );

      return { previousProducts };
    },
    onSuccess: (maVTList) => {
      toast.success(`Xóa thành công ${maVTList.length} hàng hóa!`);
    },
    onError: (error: Error, maVTList, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(queryKeys.products.lists(), context.previousProducts);
      }
      toast.error('Có lỗi xảy ra khi xóa hàng hóa');
    },
  });
};

/**
 * Hook tổng hợp để sử dụng tất cả các chức năng hàng hóa
 * Tương thích với API cũ của useProducts
 */
export const useProducts = (useCache: boolean = true) => {
  const { data: products = [], isLoading: loading, refetch } = useProductsQuery();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const bulkImportProducts = useBulkImportProducts();
  const bulkDeleteProducts = useBulkDeleteProducts();

  const fetchProducts = async (forceRefresh: boolean = false) => {
    if (forceRefresh) {
      await refetch();
      toast.success("Đã tải dữ liệu mới nhất");
    }
  };

  return {
    products,
    loading,
    addProduct: async (formData: ProductFormData) => {
      await addProduct.mutateAsync(formData);
    },
    updateProduct: async (maVT: string, formData: ProductFormData) => {
      await updateProduct.mutateAsync({ maVT, formData });
    },
    deleteProduct: async (maVT: string) => {
      await deleteProduct.mutateAsync(maVT);
    },
    bulkImportProducts: async (productsToImport: ProductFormData[]) => {
      await bulkImportProducts.mutateAsync(productsToImport);
    },
    bulkDeleteProducts: async (maVTList: string[]) => {
      await bulkDeleteProducts.mutateAsync(maVTList);
    },
    fetchProducts,
  };
};

