'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { NXKHO, NXKHODE, InventoryFormData } from '../../xuat-nhap-kho/types/inventory';
import authUtils from '@/utils/authUtils';
import { queryKeys } from '@/lib/queryKeys';

/**
 * Hook để fetch danh sách phiếu xuất nhập kho sử dụng React Query
 */
export const useInventoriesQuery = () => {
  return useQuery({
    queryKey: queryKeys.inventoryApproval.inventories(),
    queryFn: async () => {
      const response = await authUtils.apiRequest('NXKHO', 'Find', {});
      return (response || []) as NXKHO[];
    },
    staleTime: 2 * 60 * 1000, // 2 phút (dữ liệu thay đổi thường xuyên)
    gcTime: 10 * 60 * 1000, // 10 phút
  });
};

/**
 * Hook để fetch chi tiết phiếu xuất nhập kho
 */
export const useInventoryDetailsQuery = () => {
  return useQuery({
    queryKey: queryKeys.inventoryApproval.inventoryDetails(),
    queryFn: async () => {
      const response = await authUtils.apiRequest('NXKHODE', 'Find', {});
      return (response || []) as NXKHODE[];
    },
    staleTime: 2 * 60 * 1000, // 2 phút
    gcTime: 10 * 60 * 1000, // 10 phút
  });
};

/**
 * Hook để duyệt phiếu
 */
export const useApproveInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ maPhieu, notes }: { maPhieu: string; notes?: string }) => {
      const currentUser = authUtils.getUserData();
      const currentUsername = currentUser?.username || 'Unknown';

      const updatedInventory: InventoryFormData = {
        MaPhieu: maPhieu,
        TrangThai: 'Đã duyệt',
        NhanVienKho: currentUsername,
        LichSu: notes ? `[${new Date().toLocaleString('vi-VN')}] Đã duyệt bởi ${currentUsername}: ${notes}` : 
                       `[${new Date().toLocaleString('vi-VN')}] Đã duyệt bởi ${currentUsername}`
      } as InventoryFormData;

      await authUtils.apiRequest('NXKHO', 'Edit', {
        "Rows": [updatedInventory]
      });

      return { maPhieu, updatedInventory };
    },
    onSuccess: ({ maPhieu, updatedInventory }) => {
      queryClient.setQueryData<NXKHO[]>(queryKeys.inventoryApproval.inventories(), (old = []) =>
        old.map(inv =>
          inv.MaPhieu === maPhieu ? { ...inv, ...updatedInventory } : inv
        )
      );
      toast.success('Duyệt phiếu thành công!');
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi duyệt phiếu');
    },
  });
};

/**
 * Hook để từ chối phiếu
 */
export const useRejectInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ maPhieu, notes }: { maPhieu: string; notes?: string }) => {
      const currentUser = authUtils.getUserData();
      const currentUsername = currentUser?.username || 'Unknown';

      const updatedInventory: InventoryFormData = {
        MaPhieu: maPhieu,
        TrangThai: 'Từ chối',
        NhanVienKho: currentUsername,
        LichSu: notes ? `[${new Date().toLocaleString('vi-VN')}] Từ chối bởi ${currentUsername}: ${notes}` : 
                       `[${new Date().toLocaleString('vi-VN')}] Từ chối bởi ${currentUsername}`
      } as InventoryFormData;

      await authUtils.apiRequest('NXKHO', 'Edit', {
        "Rows": [updatedInventory]
      });

      return { maPhieu, updatedInventory };
    },
    onSuccess: ({ maPhieu, updatedInventory }) => {
      queryClient.setQueryData<NXKHO[]>(queryKeys.inventoryApproval.inventories(), (old = []) =>
        old.map(inv =>
          inv.MaPhieu === maPhieu ? { ...inv, ...updatedInventory } : inv
        )
      );
      toast.success('Từ chối phiếu thành công!');
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi từ chối phiếu');
    },
  });
};

/**
 * Hook để xóa phiếu
 */
export const useDeleteInventoryApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (maPhieu: string) => {
      // Xóa chi tiết trước
      await authUtils.apiRequest('NXKHODE', 'Delete', {
        "Rows": [{ "MaPhieu": maPhieu }]
      });

      // Xóa phiếu chính
      await authUtils.apiRequest('NXKHO', 'Delete', {
        "Rows": [{ "MaPhieu": maPhieu }]
      });

      return maPhieu;
    },
    onMutate: async (maPhieu) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.inventoryApproval.inventories() });
      await queryClient.cancelQueries({ queryKey: queryKeys.inventoryApproval.inventoryDetails() });
      
      const previousInventories = queryClient.getQueryData<NXKHO[]>(queryKeys.inventoryApproval.inventories());
      const previousDetails = queryClient.getQueryData<NXKHODE[]>(queryKeys.inventoryApproval.inventoryDetails());

      queryClient.setQueryData<NXKHO[]>(queryKeys.inventoryApproval.inventories(), (old = []) =>
        old.filter(inv => inv.MaPhieu !== maPhieu)
      );
      queryClient.setQueryData<NXKHODE[]>(queryKeys.inventoryApproval.inventoryDetails(), (old = []) =>
        old.filter(detail => detail.MaPhieu !== maPhieu)
      );

      return { previousInventories, previousDetails };
    },
    onSuccess: (maPhieu) => {
      toast.success(`Xóa phiếu "${maPhieu}" thành công!`);
    },
    onError: (error: Error, maPhieu, context) => {
      if (context?.previousInventories) {
        queryClient.setQueryData(queryKeys.inventoryApproval.inventories(), context.previousInventories);
      }
      if (context?.previousDetails) {
        queryClient.setQueryData(queryKeys.inventoryApproval.inventoryDetails(), context.previousDetails);
      }
      toast.error('Có lỗi xảy ra khi xóa phiếu');
    },
  });
};

/**
 * Hook tổng hợp để sử dụng tất cả các chức năng duyệt phiếu
 * Tương thích với API cũ của useInventoryApproval
 */
export const useInventoryApproval = () => {
  const { data: inventories = [], isLoading: inventoriesLoading, refetch: refetchInventories } = useInventoriesQuery();
  const { data: inventoryDetails = [], isLoading: detailsLoading, refetch: refetchDetails } = useInventoryDetailsQuery();
  const approveInventory = useApproveInventory();
  const rejectInventory = useRejectInventory();
  const deleteInventory = useDeleteInventoryApproval();

  const loading = inventoriesLoading || detailsLoading;

  const fetchInventories = async () => {
    await refetchInventories();
  };

  const fetchInventoryDetails = async () => {
    await refetchDetails();
  };

  const getInventoryWithDetails = (maPhieu: string) => {
    const inventory = inventories.find(inv => inv.MaPhieu === maPhieu);
    if (!inventory) return null;

    const details = inventoryDetails.filter(detail => detail.MaPhieu === maPhieu);
    return { ...inventory, details };
  };

  const getAllInventoriesWithDetails = () => {
    return inventories.map(inventory => ({
      ...inventory,
      details: inventoryDetails.filter(detail => detail.MaPhieu === inventory.MaPhieu)
    }));
  };

  return {
    inventories,
    inventoryDetails,
    loading,
    fetchInventories,
    fetchInventoryDetails,
    approveInventory: async (maPhieu: string, notes?: string) => {
      await approveInventory.mutateAsync({ maPhieu, notes });
    },
    rejectInventory: async (maPhieu: string, notes?: string) => {
      await rejectInventory.mutateAsync({ maPhieu, notes });
    },
    deleteInventory: async (maPhieu: string) => {
      await deleteInventory.mutateAsync(maPhieu);
    },
    getInventoryWithDetails,
    getAllInventoriesWithDetails,
  };
};

