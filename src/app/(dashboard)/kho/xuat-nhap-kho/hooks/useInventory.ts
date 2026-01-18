'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import authUtils from '@/utils/authUtils';
import type { NXKHO, NXKHODE, InventoryFormData, InventoryDetailFormData, InventoryWithDetails } from '../types/inventory';

// File này được giữ lại để đảm bảo tương thích ngược
export const useInventory = (editMode: boolean = false, maPhieu?: string) => {
  const [inventories, setInventories] = useState<NXKHO[]>([]);
  const [inventoryDetails, setInventoryDetails] = useState<NXKHODE[]>([]);
  const [loading, setLoading] = useState(false);

  // Only fetch data if in edit mode
  useEffect(() => {
    if (editMode && maPhieu) {
      fetchInventoryForEdit(maPhieu);
    }
  }, [editMode, maPhieu]);

  // Fetch specific inventory for edit mode
  const fetchInventoryForEdit = useCallback(async (maPhieu: string) => {
    try {
      setLoading(true);
      
      // Fetch inventory data
      const inventoryResponse = await authUtils.apiRequest('NXKHO', 'Find', {});
      const inventory = inventoryResponse.find((item: any) => item.MaPhieu === maPhieu);
      
      // Fetch inventory details
      const detailsResponse = await authUtils.apiRequest('NXKHODE', 'Find', {});
      const details = detailsResponse.filter((item: any) => item.MaPhieu === maPhieu);
      
      setInventories(inventory ? [inventory] : []);
      setInventoryDetails(details);
      
      console.log('Loaded inventory for edit:', { inventory, details });
    } catch (error) {
      console.error('Error fetching inventory for edit:', error);
      toast.error('Lỗi khi tải dữ liệu phiếu để chỉnh sửa');
    } finally {
      setLoading(false);
    }
  }, []);

  // Legacy methods - kept for compatibility but not used in create mode
  const fetchInventories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authUtils.apiRequest('NXKHO', 'Find', {});
      setInventories(response || []);
    } catch (error) {
      console.error('Error fetching inventory list:', error);
      toast.error('Lỗi khi tải danh sách phiếu xuất nhập kho');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInventoryDetails = useCallback(async () => {
    try {
      const response = await authUtils.apiRequest('NXKHODE', 'Find', {});
      setInventoryDetails(response || []);
    } catch (error) {
      console.error('Error fetching inventory details:', error);
      toast.error('Lỗi khi tải chi tiết phiếu xuất nhập kho');
    }
  }, []);

  const addInventory = useCallback(async (formData: InventoryFormData, details: InventoryDetailFormData[]) => {
    try {
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

      // Only update state if in edit mode (for immediate UI feedback)
      if (editMode) {
        setInventories(prev => [...prev, formData as NXKHO]);
        setInventoryDetails(prev => [...prev, ...(details as NXKHODE[])]);
      }
      
      toast.success('Tạo phiếu xuất nhập kho thành công!');
    } catch (error) {
      console.error('Error adding inventory:', error);
      toast.error('Có lỗi xảy ra khi tạo phiếu xuất nhập kho');
    }
  }, [editMode]);

  const updateInventory = useCallback(async (maPhieu: string, formData: InventoryFormData, details: InventoryDetailFormData[]) => {
    try {
      // Cập nhật phiếu chính
      await authUtils.apiRequest('NXKHO', 'Edit', {
        "Rows": [formData]
      });

      // Xóa chi tiết cũ
      const oldDetails = inventoryDetails.filter(detail => detail.MaPhieu === maPhieu);
      if (oldDetails.length > 0) {
        await authUtils.apiRequest('NXKHODE', 'Delete', {
          "Rows": oldDetails
        });
      }

      // Thêm chi tiết mới
      if (details.length > 0) {
        await authUtils.apiRequest('NXKHODE', 'Add', {
          "Rows": details
        });
      }

      setInventories(prev => prev.map(inv =>
        inv.MaPhieu === maPhieu ? { ...inv, ...formData } : inv
      ));
      
      setInventoryDetails(prev => [
        ...prev.filter(detail => detail.MaPhieu !== maPhieu),
        ...(details as NXKHODE[])
      ]);
      
      toast.success('Cập nhật phiếu xuất nhập kho thành công!');
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast.error('Có lỗi xảy ra khi cập nhật phiếu xuất nhập kho');
    }
  }, [inventoryDetails]);

  const deleteInventory = useCallback(async (maPhieu: string) => {
    const originalInventories = inventories;
    const originalDetails = inventoryDetails;
    const inventoryName = inventories.find(inv => inv.MaPhieu === maPhieu)?.MaPhieu || '';

    try {
      // Optimistic update
      setInventories(prev => prev.filter(inv => inv.MaPhieu !== maPhieu));
      setInventoryDetails(prev => prev.filter(detail => detail.MaPhieu !== maPhieu));
      
      const toastId = toast.loading('Đang xóa phiếu xuất nhập kho...');
      
      // Xóa chi tiết trước
      const detailsToDelete = inventoryDetails.filter(detail => detail.MaPhieu === maPhieu);
      if (detailsToDelete.length > 0) {
        await authUtils.apiRequest('NXKHODE', 'Delete', {
          "Rows": detailsToDelete
        });
      }

      // Xóa phiếu chính
      await authUtils.apiRequest('NXKHO', 'Delete', {
        "Rows": [{ "MaPhieu": maPhieu }]
      });

      toast.success(`Xóa phiếu "${inventoryName}" thành công!`, { id: toastId });
    } catch (error) {
      // Rollback on error
      setInventories(originalInventories);
      setInventoryDetails(originalDetails);
      console.error('Error deleting inventory:', error);
      toast.error('Có lỗi xảy ra khi xóa phiếu xuất nhập kho');
    }
  }, [inventories, inventoryDetails]);

  // Bulk import inventories
  const bulkImportInventories = useCallback(async (inventoriesToImport: InventoryFormData[], detailsToImport: InventoryDetailFormData[]) => {
    try {
      const toastId = toast.loading(`Đang import ${inventoriesToImport.length} phiếu xuất nhập kho...`);
      
      // Import phiếu chính
      await authUtils.apiRequest('NXKHO', 'Add', {
        "Rows": inventoriesToImport
      });

      // Import chi tiết
      if (detailsToImport.length > 0) {
        await authUtils.apiRequest('NXKHODE', 'Add', {
          "Rows": detailsToImport
        });
      }

      // Add to state
      setInventories(prev => [...prev, ...(inventoriesToImport as NXKHO[])]);
      setInventoryDetails(prev => [...prev, ...(detailsToImport as NXKHODE[])]);
      
      toast.success(`Import thành công ${inventoriesToImport.length} phiếu xuất nhập kho!`, { id: toastId });
    } catch (error) {
      console.error('Error bulk importing inventories:', error);
      toast.error('Có lỗi xảy ra khi import phiếu xuất nhập kho');
      throw error;
    }

    
  }, []);

  // Bulk delete inventories
  const bulkDeleteInventories = useCallback(async (maPhieuList: string[]) => {
    const originalInventories = inventories;
    const originalDetails = inventoryDetails;
    
    try {
      // Optimistic update
      setInventories(prev => prev.filter(inv => !maPhieuList.includes(inv.MaPhieu)));
      setInventoryDetails(prev => prev.filter(detail => !maPhieuList.includes(detail.MaPhieu)));
      
      const toastId = toast.loading(`Đang xóa ${maPhieuList.length} phiếu xuất nhập kho...`);

      // Xóa chi tiết trước
      const detailsToDelete = inventoryDetails.filter(detail => maPhieuList.includes(detail.MaPhieu));
      if (detailsToDelete.length > 0) {
        await authUtils.apiRequest('NXKHODE', 'Delete', {
          "Rows": detailsToDelete
        });
      }

      // Xóa phiếu chính
      const deleteRows = maPhieuList.map(maPhieu => ({ MaPhieu: maPhieu }));
      await authUtils.apiRequest('NXKHO', 'Delete', {
        "Rows": deleteRows
      });

      toast.success(`Xóa thành công ${maPhieuList.length} phiếu xuất nhập kho!`, { id: toastId });
    } catch (error) {
      // Rollback on error
      setInventories(originalInventories);
      setInventoryDetails(originalDetails);
      console.error('Error bulk deleting inventories:', error);
      toast.error('Có lỗi xảy ra khi xóa phiếu xuất nhập kho');
      throw error;
    }
  }, [inventories, inventoryDetails]);

  // Get inventory with details
  const getInventoryWithDetails = useCallback((maPhieu: string): InventoryWithDetails | null => {
    const inventory = inventories.find(inv => inv.MaPhieu === maPhieu);
    if (!inventory) return null;

    const details = inventoryDetails.filter(detail => detail.MaPhieu === maPhieu);
    return { ...inventory, details };
  }, [inventories, inventoryDetails]);

  // Get all inventories with details
  const getAllInventoriesWithDetails = useCallback((): InventoryWithDetails[] => {
    return inventories.map(inventory => ({
      ...inventory,
      details: inventoryDetails.filter(detail => detail.MaPhieu === inventory.MaPhieu)
    }));
  }, [inventories, inventoryDetails]);

  return {
    inventories,
    inventoryDetails,
    loading,
    addInventory,
    updateInventory,
    deleteInventory,
    bulkImportInventories,
    bulkDeleteInventories,
    fetchInventories,
    fetchInventoryDetails,
    getInventoryWithDetails,
    getAllInventoriesWithDetails
  };
};
