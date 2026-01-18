'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { Warehouse, WarehouseFormData } from '../types/warehouse';
import { generateWarehouseCode } from '../utils/constants';
import authUtils from '@/utils/authUtils';
import { queryKeys } from '@/lib/queryKeys';

/**
 * Hook để fetch danh sách kho sử dụng React Query
 */
export const useWarehousesQuery = () => {
  return useQuery({
    queryKey: queryKeys.warehouses.lists(),
    queryFn: async () => {
      const response = await authUtils.apiRequest('KHO', 'Find', {});
      return (response || []) as Warehouse[];
    },
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 60 * 60 * 1000, // 1 giờ
  });
};

/**
 * Hook để thêm kho mới
 */
export const useAddWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: WarehouseFormData) => {
      // Tự sinh mã kho nếu chưa có
      let warehouseData = { ...formData };
      if (!warehouseData.MaKho) {
        const existingWarehouses = queryClient.getQueryData<Warehouse[]>(queryKeys.warehouses.lists()) || [];
        const existingCodes = existingWarehouses.map(w => w.MaKho);
        warehouseData.MaKho = generateWarehouseCode(existingCodes);
      }

      // Check for existing MaKho
      const existingWarehouses = queryClient.getQueryData<Warehouse[]>(queryKeys.warehouses.lists()) || [];
      const exists = existingWarehouses.some(warehouse =>
        warehouse.MaKho.toLowerCase() === warehouseData.MaKho.toLowerCase()
      );

      if (exists) {
        throw new Error('Mã kho này đã tồn tại!');
      }

      await authUtils.apiRequest('KHO', 'Add', {
        "Rows": [warehouseData]
      });

      return warehouseData as Warehouse;
    },
    onSuccess: (newWarehouse) => {
      // Cập nhật cache
      queryClient.setQueryData<Warehouse[]>(queryKeys.warehouses.lists(), (old = []) => [...old, newWarehouse]);
      toast.success('Thêm kho mới thành công!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Có lỗi xảy ra khi thêm kho');
    },
  });
};

/**
 * Hook để cập nhật kho
 */
export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ maKho, formData }: { maKho: string; formData: WarehouseFormData }) => {
      const existingWarehouses = queryClient.getQueryData<Warehouse[]>(queryKeys.warehouses.lists()) || [];
      const oldWarehouse = existingWarehouses.find(warehouse => warehouse.MaKho === maKho);
      
      if (!oldWarehouse) {
        throw new Error('Không tìm thấy kho');
      }

      await authUtils.apiRequest('KHO', 'Edit', {
        "Rows": [formData]
      });

      return { maKho, formData };
    },
    onSuccess: ({ maKho, formData }) => {
      // Cập nhật cache
      queryClient.setQueryData<Warehouse[]>(queryKeys.warehouses.lists(), (old = []) =>
        old.map(warehouse =>
          warehouse.MaKho === maKho ? { ...warehouse, ...formData } : warehouse
        )
      );
      toast.success('Cập nhật thông tin kho thành công!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật kho');
    },
  });
};

/**
 * Hook để xóa kho
 */
export const useDeleteWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (maKho: string) => {
      const existingWarehouses = queryClient.getQueryData<Warehouse[]>(queryKeys.warehouses.lists()) || [];
      const warehouseName = existingWarehouses.find(warehouse => warehouse.MaKho === maKho)?.TenKho || '';

      await authUtils.apiRequest('KHO', 'Delete', {
        "Rows": [{ "MaKho": maKho }]
      });

      return { maKho, warehouseName };
    },
    onMutate: async (maKho) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.warehouses.lists() });

      // Snapshot previous value
      const previousWarehouses = queryClient.getQueryData<Warehouse[]>(queryKeys.warehouses.lists());

      // Optimistically update
      queryClient.setQueryData<Warehouse[]>(queryKeys.warehouses.lists(), (old = []) =>
        old.filter(warehouse => warehouse.MaKho !== maKho)
      );

      return { previousWarehouses };
    },
    onSuccess: ({ warehouseName }) => {
      toast.success(`Xóa kho "${warehouseName}" thành công!`);
    },
    onError: (error: Error, maKho, context) => {
      // Rollback on error
      if (context?.previousWarehouses) {
        queryClient.setQueryData(queryKeys.warehouses.lists(), context.previousWarehouses);
      }
      toast.error('Có lỗi xảy ra khi xóa kho');
    },
  });
};

/**
 * Hook để import nhiều kho
 */
export const useBulkImportWarehouses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (warehousesToImport: WarehouseFormData[]) => {
      await authUtils.apiRequest('KHO', 'Add', {
        "Rows": warehousesToImport
      });
      return warehousesToImport as Warehouse[];
    },
    onSuccess: (newWarehouses) => {
      queryClient.setQueryData<Warehouse[]>(queryKeys.warehouses.lists(), (old = []) => [...old, ...newWarehouses]);
      toast.success(`Import thành công ${newWarehouses.length} kho!`);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi import kho');
    },
  });
};

/**
 * Hook để xóa nhiều kho
 */
export const useBulkDeleteWarehouses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (maKhoList: string[]) => {
      const deleteRows = maKhoList.map(maKho => ({ MaKho: maKho }));
      await authUtils.apiRequest('KHO', 'Delete', {
        "Rows": deleteRows
      });
      return maKhoList;
    },
    onMutate: async (maKhoList) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.warehouses.lists() });
      const previousWarehouses = queryClient.getQueryData<Warehouse[]>(queryKeys.warehouses.lists());

      queryClient.setQueryData<Warehouse[]>(queryKeys.warehouses.lists(), (old = []) =>
        old.filter(warehouse => !maKhoList.includes(warehouse.MaKho))
      );

      return { previousWarehouses };
    },
    onSuccess: (maKhoList) => {
      toast.success(`Xóa thành công ${maKhoList.length} kho!`);
    },
    onError: (error: Error, maKhoList, context) => {
      if (context?.previousWarehouses) {
        queryClient.setQueryData(queryKeys.warehouses.lists(), context.previousWarehouses);
      }
      toast.error('Có lỗi xảy ra khi xóa kho');
    },
  });
};

/**
 * Hook tổng hợp để sử dụng tất cả các chức năng kho
 * Tương thích với API cũ của useWarehouses
 */
export const useWarehouses = (useCache: boolean = true) => {
  const { data: warehouses = [], isLoading: loading, refetch } = useWarehousesQuery();
  const addWarehouse = useAddWarehouse();
  const updateWarehouse = useUpdateWarehouse();
  const deleteWarehouse = useDeleteWarehouse();
  const bulkImportWarehouses = useBulkImportWarehouses();
  const bulkDeleteWarehouses = useBulkDeleteWarehouses();

  const fetchWarehouses = async (forceRefresh: boolean = false) => {
    if (forceRefresh) {
      await refetch();
      toast.success("Đã tải dữ liệu mới nhất");
    }
  };

  return {
    warehouses,
    loading,
    addWarehouse: async (formData: WarehouseFormData) => {
      await addWarehouse.mutateAsync(formData);
    },
    updateWarehouse: async (maKho: string, formData: WarehouseFormData) => {
      await updateWarehouse.mutateAsync({ maKho, formData });
    },
    deleteWarehouse: async (maKho: string) => {
      await deleteWarehouse.mutateAsync(maKho);
    },
    bulkImportWarehouses: async (warehousesToImport: WarehouseFormData[]) => {
      await bulkImportWarehouses.mutateAsync(warehousesToImport);
    },
    bulkDeleteWarehouses: async (maKhoList: string[]) => {
      await bulkDeleteWarehouses.mutateAsync(maKhoList);
    },
    fetchWarehouses,
  };
};

