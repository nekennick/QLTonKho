'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import authUtils from '@/utils/authUtils';
import { saveToCache, getFromCache, clearCache, CACHE_KEYS, CACHE_DURATION } from '@/utils/cacheUtils';
import { generateProductCode } from '../utils/constants';
import type { Product, ProductFormData } from '../types/product';

// File này được giữ lại để đảm bảo tương thích ngược
export const useProducts = (useCache: boolean = true) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);

      // Try to get from cache first (only if useCache is enabled)
      const cachedData = useCache ? getFromCache(CACHE_KEYS.PRODUCTS) : null;
      console.log('Products cache check:', { cachedData: !!cachedData, forceRefresh, useCache });

      if (cachedData && !forceRefresh && useCache) {
        console.log('Using cached products data');
        setProducts(cachedData);
        setLoading(false);
        return;
      }

      // Only fetch from API if force refresh or no cache
      console.log('Fetching products from API');

      // Fetch both Products and Inventory Data (TONKHO) in parallel
      const [productsResponse, tonKhoResponse] = await Promise.all([
        authUtils.apiRequest('DMHH', 'Find', {}),
        authUtils.apiRequest('TONKHO', 'Find', {})
      ]);

      const rawProducts = productsResponse || [];
      const tonKhoData = tonKhoResponse || [];

      // Create a map of MaVT -> Latest SoLuong
      const stockMap = new Map<string, number>();

      // Sort TONKHO data by date (newest first) to ensure we get the latest stock
      tonKhoData.sort((a: any, b: any) => {
        const yearA = a.Nam || 0;
        const yearB = b.Nam || 0;
        if (yearA !== yearB) return yearB - yearA;

        const monthA = a.Thang || 0;
        const monthB = b.Thang || 0;
        if (monthA !== monthB) return monthB - monthA;

        // "Ngay" handling: sometimes it's in IDTONKHO, sometimes in column 'Ngay'
        let dayA = a.Ngay || 0;
        let dayB = b.Ngay || 0;

        // Try extracting from IDTONKHO if Ngay is missing (IDs starting with DDMMYYYY...)
        if (!dayA && a.IDTONKHO && String(a.IDTONKHO).length >= 8) {
          dayA = parseInt(String(a.IDTONKHO).substring(0, 2)) || 0;
        }
        if (!dayB && b.IDTONKHO && String(b.IDTONKHO).length >= 8) {
          dayB = parseInt(String(b.IDTONKHO).substring(0, 2)) || 0;
        }

        return dayB - dayA;
      });

      // Iterate and set latest stock for each MaVT (first occurrence in sorted list is latest)
      tonKhoData.forEach((item: any) => {
        const maVTRaw = item.MaVT || '';
        // Also handle potential whitespace or slight mismatches
        const maVTKey = maVTRaw.toLowerCase().trim();

        // Sometimes item.MaVT is missing but embedded in IDTONKHO (8 chars date + MaVT)
        // e.g. 15012024MAVT01
        let derivedMaVT = maVTKey;
        if (!derivedMaVT && item.IDTONKHO && String(item.IDTONKHO).length > 8) {
          derivedMaVT = String(item.IDTONKHO).substring(8).toLowerCase().trim();
        }

        if (derivedMaVT && !stockMap.has(derivedMaVT)) {
          const sl = item.SoLuong;
          // Ensure it's a number
          const numSL = typeof sl === 'string'
            ? parseFloat(sl.replace(/\./g, '').replace(/,/g, '.'))
            : (sl || 0);

          stockMap.set(derivedMaVT, numSL);
        }
      });

      // Merge stock quantity into products
      const mergedProducts = rawProducts.map((p: any) => ({
        ...p,
        SoLuongTon: stockMap.get(p.MaVT?.toLowerCase().trim()) ?? 0
      }));

      setProducts(mergedProducts);

      // Save to cache (only if useCache is enabled)
      if (useCache) {
        saveToCache(CACHE_KEYS.PRODUCTS, mergedProducts, CACHE_DURATION.PRODUCTS);
        console.log('Products data saved to cache');
      }

      if (forceRefresh) {
        toast.success("Đã tải dữ liệu mới nhất");
      }
    } catch (error) {
      console.error('Error fetching product list:', error);

      // Try to use cached data as fallback (only if useCache is enabled)
      if (useCache) {
        const cachedData = getFromCache(CACHE_KEYS.PRODUCTS);
        if (cachedData) {
          setProducts(cachedData);
          if (forceRefresh) {
            toast("Sử dụng dữ liệu đã lưu (có thể không cập nhật)", { icon: '⚠️' });
          }
        } else {
          toast.error('Lỗi khi tải danh sách hàng hóa');
        }
      } else {
        toast.error('Lỗi khi tải danh sách hàng hóa');
      }
    } finally {
      setLoading(false);
    }
  }, []); // Loại bỏ useCache dependency để tránh tạo lại function

  const addProduct = useCallback(async (formData: ProductFormData) => {
    try {
      // Tự sinh mã vật tư nếu chưa có
      let productData = { ...formData };
      if (!productData.MaVT) {
        const existingCodes = products.map(p => p.MaVT);
        productData.MaVT = generateProductCode(existingCodes);
      }

      // Check for existing MaVT
      const exists = products.some(product =>
        product.MaVT.toLowerCase() === productData.MaVT.toLowerCase()
      );

      if (exists) {
        toast.error('Mã vật tư này đã tồn tại!');
        return;
      }

      await authUtils.apiRequest('DMHH', 'Add', {
        "Rows": [productData]
      });

      setProducts(prev => [...prev, productData as Product]);

      // Clear cache to force refresh on next load
      clearCache(CACHE_KEYS.PRODUCTS);

      toast.success('Thêm hàng hóa mới thành công!');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Có lỗi xảy ra khi thêm hàng hóa');
    }
  }, [products]);

  const updateProduct = useCallback(async (maVT: string, formData: ProductFormData) => {
    try {
      const oldProduct = products.find(product => product.MaVT === maVT);
      if (!oldProduct) {
        toast.error('Không tìm thấy hàng hóa');
        return;
      }

      await authUtils.apiRequest('DMHH', 'Edit', {
        "Rows": [formData]
      });

      setProducts(prev => prev.map(product =>
        product.MaVT === maVT ? { ...product, ...formData } : product
      ));

      // Clear cache to force refresh on next load
      clearCache(CACHE_KEYS.PRODUCTS);

      toast.success('Cập nhật thông tin hàng hóa thành công!');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Có lỗi xảy ra khi cập nhật hàng hóa');
    }
  }, [products]);

  const deleteProduct = useCallback(async (maVT: string) => {
    // Store original state for potential rollback
    const originalProducts = products;
    const productName = products.find(product => product.MaVT === maVT)?.TenVT || '';

    try {
      // Optimistic update
      setProducts(prev => prev.filter(product => product.MaVT !== maVT));

      const toastId = toast.loading('Đang xóa hàng hóa...');

      await authUtils.apiRequest('DMHH', 'Delete', {
        "Rows": [{ "MaVT": maVT }]
      });

      // Clear cache to force refresh on next load
      clearCache(CACHE_KEYS.PRODUCTS);

      toast.success(`Xóa hàng hóa "${productName}" thành công!`, { id: toastId });
    } catch (error) {
      // Rollback on error
      setProducts(originalProducts);
      console.error('Error deleting product:', error);
      toast.error('Có lỗi xảy ra khi xóa hàng hóa');
    }
  }, [products]);

  // Bulk import products
  const bulkImportProducts = useCallback(async (productsToImport: ProductFormData[]) => {
    try {
      const toastId = toast.loading(`Đang import ${productsToImport.length} hàng hóa...`);

      // Import from API
      await authUtils.apiRequest('DMHH', 'Add', {
        "Rows": productsToImport
      });

      // Add to state
      setProducts(prev => [...prev, ...(productsToImport as Product[])]);

      toast.success(`Import thành công ${productsToImport.length} hàng hóa!`, { id: toastId });
    } catch (error) {
      console.error('Error bulk importing products:', error);
      toast.error('Có lỗi xảy ra khi import hàng hóa');
      throw error;
    }
  }, []);

  // Bulk delete products
  const bulkDeleteProducts = useCallback(async (maVTList: string[]) => {
    const originalProducts = products;

    try {
      // Optimistic update
      setProducts(prev => prev.filter(product => !maVTList.includes(product.MaVT)));

      const toastId = toast.loading(`Đang xóa ${maVTList.length} hàng hóa...`);

      // Delete from API
      const deleteRows = maVTList.map(maVT => ({ MaVT: maVT }));
      await authUtils.apiRequest('DMHH', 'Delete', {
        "Rows": deleteRows
      });

      toast.success(`Xóa thành công ${maVTList.length} hàng hóa!`, { id: toastId });
    } catch (error) {
      // Rollback on error
      setProducts(originalProducts);
      console.error('Error bulk deleting products:', error);
      toast.error('Có lỗi xảy ra khi xóa hàng hóa');
      throw error;
    }
  }, [products]);

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    bulkImportProducts,
    bulkDeleteProducts,
    fetchProducts
  };
};
