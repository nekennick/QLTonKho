'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { NXKHO, NXKHODE, InventoryFormData, InventoryDetailFormData, InventoryWithDetails } from '../types/inventory';
import authUtils from '@/utils/authUtils';
import { queryKeys } from '@/lib/queryKeys';

/**
 * Hook để fetch danh sách phiếu xuất nhập kho sử dụng React Query
 */
export const useInventoriesQuery = () => {
  return useQuery({
    queryKey: queryKeys.inventoryTransaction.inventories(),
    queryFn: async () => {
      const response = await authUtils.apiRequest('NXKHO', 'Find', {});
      return (response || []) as NXKHO[];
    },
    staleTime: 2 * 60 * 1000, // 2 phút
    gcTime: 10 * 60 * 1000, // 10 phút
  });
};

/**
 * Hook để fetch chi tiết phiếu xuất nhập kho
 */
export const useInventoryDetailsQuery = () => {
  return useQuery({
    queryKey: queryKeys.inventoryTransaction.inventoryDetails(),
    queryFn: async () => {
      const response = await authUtils.apiRequest('NXKHODE', 'Find', {});
      return (response || []) as NXKHODE[];
    },
    staleTime: 2 * 60 * 1000, // 2 phút
    gcTime: 10 * 60 * 1000, // 10 phút
  });
};

/**
 * Hook để fetch một phiếu cụ thể cho edit mode
 */
export const useInventoryForEditQuery = (maPhieu?: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: queryKeys.inventoryTransaction.inventory(maPhieu || ''),
    queryFn: async () => {
      if (!maPhieu) return null;

      // Fetch inventory data
      const inventoryResponse = await authUtils.apiRequest('NXKHO', 'Find', {});
      const inventory = inventoryResponse.find((item: any) => item.MaPhieu === maPhieu);
      
      // Fetch inventory details
      const detailsResponse = await authUtils.apiRequest('NXKHODE', 'Find', {});
      const details = detailsResponse.filter((item: any) => item.MaPhieu === maPhieu);
      
      return {
        inventory: inventory as NXKHO | undefined,
        details: details as NXKHODE[]
      };
    },
    enabled: enabled && !!maPhieu,
    staleTime: 1 * 60 * 1000, // 1 phút
    gcTime: 5 * 60 * 1000, // 5 phút
  });
};

/**
 * Hook để thêm phiếu xuất nhập kho
 */
export const useAddInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formData, details }: { formData: InventoryFormData; details: InventoryDetailFormData[] }) => {
      // Tạo phiếu chính
      await authUtils.apiRequest('NXKHO', 'Add', {
        "Rows": [formData]
      });

      // Tạo chi tiết phiếu
      if (details.length > 0) {
        await authUtils.apiRequest('NXKHODE', 'Add', {
          "Rows": details
        });
      }

      return { formData, details };
    },
    onSuccess: ({ formData, details }) => {
      // Invalidate queries để refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.inventoryTransaction.inventories() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventoryTransaction.inventoryDetails() });
      toast.success('Tạo phiếu xuất nhập kho thành công!');
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi tạo phiếu xuất nhập kho');
    },
  });
};

/**
 * Hook để cập nhật phiếu xuất nhập kho
 */
export const useUpdateInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ maPhieu, formData, details }: { maPhieu: string; formData: InventoryFormData; details: InventoryDetailFormData[] }) => {
      // Cập nhật phiếu chính
      await authUtils.apiRequest('NXKHO', 'Edit', {
        "Rows": [formData]
      });

      // Lấy chi tiết cũ
      const oldDetails = queryClient.getQueryData<NXKHODE[]>(queryKeys.inventoryTransaction.inventoryDetails()) || [];
      const detailsToDelete = oldDetails.filter(detail => detail.MaPhieu === maPhieu);
      
      // Xóa chi tiết cũ
      if (detailsToDelete.length > 0) {
        await authUtils.apiRequest('NXKHODE', 'Delete', {
          "Rows": detailsToDelete
        });
      }

      // Thêm chi tiết mới
      if (details.length > 0) {
        await authUtils.apiRequest('NXKHODE', 'Add', {
          "Rows": details
        });
      }

      return { maPhieu, formData, details };
    },
    onSuccess: () => {
      // Invalidate queries để refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.inventoryTransaction.inventories() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventoryTransaction.inventoryDetails() });
      toast.success('Cập nhật phiếu xuất nhập kho thành công!');
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi cập nhật phiếu xuất nhập kho');
    },
  });
};

/**
 * Hook để xóa phiếu xuất nhập kho
 */
export const useDeleteInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (maPhieu: string) => {
      // Lấy chi tiết cần xóa
      const details = queryClient.getQueryData<NXKHODE[]>(queryKeys.inventoryTransaction.inventoryDetails()) || [];
      const detailsToDelete = details.filter(detail => detail.MaPhieu === maPhieu);
      
      // Xóa chi tiết trước
      if (detailsToDelete.length > 0) {
        await authUtils.apiRequest('NXKHODE', 'Delete', {
          "Rows": detailsToDelete
        });
      }

      // Xóa phiếu chính
      await authUtils.apiRequest('NXKHO', 'Delete', {
        "Rows": [{ "MaPhieu": maPhieu }]
      });

      return maPhieu;
    },
    onMutate: async (maPhieu) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.inventoryTransaction.inventories() });
      await queryClient.cancelQueries({ queryKey: queryKeys.inventoryTransaction.inventoryDetails() });
      
      const previousInventories = queryClient.getQueryData<NXKHO[]>(queryKeys.inventoryTransaction.inventories());
      const previousDetails = queryClient.getQueryData<NXKHODE[]>(queryKeys.inventoryTransaction.inventoryDetails());

      queryClient.setQueryData<NXKHO[]>(queryKeys.inventoryTransaction.inventories(), (old = []) =>
        old.filter(inv => inv.MaPhieu !== maPhieu)
      );
      queryClient.setQueryData<NXKHODE[]>(queryKeys.inventoryTransaction.inventoryDetails(), (old = []) =>
        old.filter(detail => detail.MaPhieu !== maPhieu)
      );

      return { previousInventories, previousDetails };
    },
    onSuccess: (maPhieu) => {
      toast.success(`Xóa phiếu "${maPhieu}" thành công!`);
    },
    onError: (error: Error, maPhieu, context) => {
      if (context?.previousInventories) {
        queryClient.setQueryData(queryKeys.inventoryTransaction.inventories(), context.previousInventories);
      }
      if (context?.previousDetails) {
        queryClient.setQueryData(queryKeys.inventoryTransaction.inventoryDetails(), context.previousDetails);
      }
      toast.error('Có lỗi xảy ra khi xóa phiếu xuất nhập kho');
    },
  });
};

/**
 * Hook tổng hợp để sử dụng tất cả các chức năng xuất nhập kho
 * Tương thích với API cũ của useInventory
 */
export const useInventory = (editMode: boolean = false, maPhieu?: string) => {
  const { data: inventories = [], isLoading: inventoriesLoading, refetch: refetchInventories } = useInventoriesQuery();
  const { data: inventoryDetails = [], isLoading: detailsLoading, refetch: refetchDetails } = useInventoryDetailsQuery();
  const { data: editData, isLoading: editLoading } = useInventoryForEditQuery(maPhieu, editMode);
  
  const addInventory = useAddInventory();
  const updateInventory = useUpdateInventory();
  const deleteInventory = useDeleteInventory();

  const loading = editMode ? editLoading : (inventoriesLoading || detailsLoading);

  // Nếu ở edit mode, sử dụng data từ edit query
  const finalInventories = editMode && editData?.inventory ? [editData.inventory] : inventories;
  const finalDetails = editMode && editData?.details ? editData.details : inventoryDetails;

  const fetchInventories = async () => {
    await refetchInventories();
  };

  const fetchInventoryDetails = async () => {
    await refetchDetails();
  };

  const getInventoryWithDetails = (maPhieu: string): InventoryWithDetails | null => {
    const inventory = finalInventories.find(inv => inv.MaPhieu === maPhieu);
    if (!inventory) return null;

    const details = finalDetails.filter(detail => detail.MaPhieu === maPhieu);
    return { ...inventory, details };
  };

  const getAllInventoriesWithDetails = (): InventoryWithDetails[] => {
    return finalInventories.map(inventory => ({
      ...inventory,
      details: finalDetails.filter(detail => detail.MaPhieu === inventory.MaPhieu)
    }));
  };

  return {
    inventories: finalInventories,
    inventoryDetails: finalDetails,
    loading,
    addInventory: async (formData: InventoryFormData, details: InventoryDetailFormData[]) => {
      await addInventory.mutateAsync({ formData, details });
    },
    updateInventory: async (maPhieu: string, formData: InventoryFormData, details: InventoryDetailFormData[]) => {
      await updateInventory.mutateAsync({ maPhieu, formData, details });
    },
    deleteInventory: async (maPhieu: string) => {
      await deleteInventory.mutateAsync(maPhieu);
    },
    fetchInventories,
    fetchInventoryDetails,
    getInventoryWithDetails,
    getAllInventoriesWithDetails
  };
};

