'use client';

// Re-export từ hook mới sử dụng React Query
// File này được giữ lại để đảm bảo tương thích ngược
export { useInventoryApproval } from './useInventoryApprovalQuery';

export const useInventoryApproval = () => {
  const [inventories, setInventories] = useState<NXKHO[]>([]);
  const [inventoryDetails, setInventoryDetails] = useState<NXKHODE[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all inventories
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
  }, []); // Không có dependencies để tránh tạo lại function

  // Fetch all inventory details
  const fetchInventoryDetails = useCallback(async () => {
    try {
      const response = await authUtils.apiRequest('NXKHODE', 'Find', {});
      setInventoryDetails(response || []);
    } catch (error) {
      console.error('Error fetching inventory details:', error);
      toast.error('Lỗi khi tải chi tiết phiếu xuất nhập kho');
    }
  }, []); // Không có dependencies để tránh tạo lại function

  // Approve inventory
  const approveInventory = useCallback(async (maPhieu: string, notes?: string) => {
    try {
      // Get current user data
      const currentUser = authUtils.getUserData();
      const currentUsername = currentUser?.username || 'Unknown';

      // Update inventory status to approved
      const updatedInventory: InventoryFormData = {
        MaPhieu: maPhieu,
        TrangThai: 'Đã duyệt',
        NhanVienKho: currentUsername,
        LichSu: notes ? `[${new Date().toLocaleString('vi-VN')}] Đã duyệt bởi ${currentUsername}: ${notes}` : 
                       `[${new Date().toLocaleString('vi-VN')}] Đã duyệt bởi ${currentUsername}`
      };

      await authUtils.apiRequest('NXKHO', 'Edit', {
        "Rows": [updatedInventory]
      });

      // Update local state
      setInventories(prev => prev.map(inv =>
        inv.MaPhieu === maPhieu ? { ...inv, ...updatedInventory } : inv
      ));

      toast.success('Duyệt phiếu thành công!');
    } catch (error) {
      console.error('Error approving inventory:', error);
      toast.error('Có lỗi xảy ra khi duyệt phiếu');
      throw error;
    }
  }, []); // Remove inventories dependency

  // Reject inventory
  const rejectInventory = useCallback(async (maPhieu: string, notes?: string) => {
    try {
      // Get current user data
      const currentUser = authUtils.getUserData();
      const currentUsername = currentUser?.username || 'Unknown';

      // Update inventory status to rejected
      const updatedInventory: InventoryFormData = {
        MaPhieu: maPhieu,
        TrangThai: 'Từ chối',
        NhanVienKho: currentUsername,
        LichSu: notes ? `[${new Date().toLocaleString('vi-VN')}] Từ chối bởi ${currentUsername}: ${notes}` : 
                       `[${new Date().toLocaleString('vi-VN')}] Từ chối bởi ${currentUsername}`
      };

      await authUtils.apiRequest('NXKHO', 'Edit', {
        "Rows": [updatedInventory]
      });

      // Update local state
      setInventories(prev => prev.map(inv =>
        inv.MaPhieu === maPhieu ? { ...inv, ...updatedInventory } : inv
      ));

      toast.success('Từ chối phiếu thành công!');
    } catch (error) {
      console.error('Error rejecting inventory:', error);
      toast.error('Có lỗi xảy ra khi từ chối phiếu');
      throw error;
    }
  }, []); // Remove inventories dependency

  // Get inventory with details
  const getInventoryWithDetails = useCallback((maPhieu: string) => {
    const inventory = inventories.find(inv => inv.MaPhieu === maPhieu);
    if (!inventory) return null;

    const details = inventoryDetails.filter(detail => detail.MaPhieu === maPhieu);
    return { ...inventory, details };
  }, [inventories, inventoryDetails]);

  // Get all inventories with details
  const getAllInventoriesWithDetails = useCallback(() => {
    return inventories.map(inventory => ({
      ...inventory,
      details: inventoryDetails.filter(detail => detail.MaPhieu === inventory.MaPhieu)
    }));
  }, [inventories, inventoryDetails]);

  // Bulk approve inventories
  const bulkApproveInventories = useCallback(async (maPhieuList: string[], notes?: string) => {
    try {
      const toastId = toast.loading(`Đang duyệt ${maPhieuList.length} phiếu...`);

      // Get current user data
      const currentUser = authUtils.getUserData();
      const currentUsername = currentUser?.username || 'Unknown';

      const inventoriesToUpdate = maPhieuList.map(maPhieu => ({
        MaPhieu: maPhieu,
        TrangThai: 'Đã duyệt',
        NhanVienKho: currentUsername,
        LichSu: notes ? `[${new Date().toLocaleString('vi-VN')}] Đã duyệt bởi ${currentUsername}: ${notes}` : 
                       `[${new Date().toLocaleString('vi-VN')}] Đã duyệt bởi ${currentUsername}`
      }));

      await authUtils.apiRequest('NXKHO', 'Edit', {
        "Rows": inventoriesToUpdate
      });

      // Update local state
      setInventories(prev => prev.map(inv => {
        const updated = inventoriesToUpdate.find(updated => updated.MaPhieu === inv.MaPhieu);
        return updated ? { ...inv, ...updated } : inv;
      }));

      toast.success(`Duyệt thành công ${maPhieuList.length} phiếu!`, { id: toastId });
    } catch (error) {
      console.error('Error bulk approving inventories:', error);
      toast.error('Có lỗi xảy ra khi duyệt phiếu');
      throw error;
    }
  }, []); // Remove inventories dependency

  // Bulk reject inventories
  const bulkRejectInventories = useCallback(async (maPhieuList: string[], notes?: string) => {
    try {
      const toastId = toast.loading(`Đang từ chối ${maPhieuList.length} phiếu...`);

      // Get current user data
      const currentUser = authUtils.getUserData();
      const currentUsername = currentUser?.username || 'Unknown';

      const inventoriesToUpdate = maPhieuList.map(maPhieu => ({
        MaPhieu: maPhieu,
        TrangThai: 'Từ chối',
        NhanVienKho: currentUsername,
        LichSu: notes ? `[${new Date().toLocaleString('vi-VN')}] Từ chối bởi ${currentUsername}: ${notes}` : 
                       `[${new Date().toLocaleString('vi-VN')}] Từ chối bởi ${currentUsername}`
      }));

      await authUtils.apiRequest('NXKHO', 'Edit', {
        "Rows": inventoriesToUpdate
      });

      // Update local state
      setInventories(prev => prev.map(inv => {
        const updated = inventoriesToUpdate.find(updated => updated.MaPhieu === inv.MaPhieu);
        return updated ? { ...inv, ...updated } : inv;
      }));

      toast.success(`Từ chối thành công ${maPhieuList.length} phiếu!`, { id: toastId });
    } catch (error) {
      console.error('Error bulk rejecting inventories:', error);
      toast.error('Có lỗi xảy ra khi từ chối phiếu');
      throw error;
    }
  }, []); // Remove inventories dependency

  // Delete inventory
  const deleteInventory = useCallback(async (maPhieu: string) => {
    try {
      // Xóa chi tiết trước
      await authUtils.apiRequest('NXKHODE', 'Delete', {
        "Rows": [{ "MaPhieu": maPhieu }]
      });

      // Xóa phiếu chính
      await authUtils.apiRequest('NXKHO', 'Delete', {
        "Rows": [{ "MaPhieu": maPhieu }]
      });

      // Update local state
      setInventories(prev => prev.filter(inv => inv.MaPhieu !== maPhieu));
      setInventoryDetails(prev => prev.filter(detail => detail.MaPhieu !== maPhieu));

      toast.success(`Xóa phiếu "${maPhieu}" thành công!`);
    } catch (error) {
      console.error('Error deleting inventory:', error);
      toast.error('Có lỗi xảy ra khi xóa phiếu');
      throw error;
    }
  }, []); // Remove dependencies

  return {
    inventories,
    inventoryDetails,
    loading,
    fetchInventories,
    fetchInventoryDetails,
    approveInventory,
    rejectInventory,
    deleteInventory,
    getInventoryWithDetails,
    getAllInventoriesWithDetails,
    bulkApproveInventories,
    bulkRejectInventories
  };
};
