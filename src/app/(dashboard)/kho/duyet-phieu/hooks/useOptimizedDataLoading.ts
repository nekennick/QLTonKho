'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useProducts } from '../../danh-muc-hang-hoa/hooks/useProducts';
import { useWarehouses } from '../../hooks/useWarehouses';
import { useEmployees } from '../../../nhanvien/hooks/useEmployees';
import { useInventoryApproval } from './useInventoryApprovalQuery';

// Global loading state to prevent duplicate API calls
let globalLoadingState = {
  products: false,
  warehouses: false,
  employees: false,
  inventories: false,
  inventoryDetails: false
};

export const useOptimizedDataLoading = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationRef = useRef(false);

  // Use hooks with cache enabled
  const {
    products,
    loading: productsLoading,
    fetchProducts
  } = useProducts(true);

  const {
    warehouses,
    loading: warehousesLoading,
    fetchWarehouses
  } = useWarehouses(true);

  const {
    employees,
    loading: employeesLoading,
    fetchEmployees
  } = useEmployees(true);

  const {
    inventories,
    inventoryDetails,
    loading: inventoryLoading,
    fetchInventories,
    fetchInventoryDetails,
    approveInventory,
    rejectInventory,
    deleteInventory,
    getInventoryWithDetails
  } = useInventoryApproval();

  // Optimized data loading - only load what's needed
  const loadEssentialData = useCallback(async () => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    try {
      console.log('🚀 Starting optimized data loading...');
      
      // Only load inventory data if not already loaded
      if (!globalLoadingState.inventories && inventories.length === 0) {
        globalLoadingState.inventories = true;
        await fetchInventories();
        globalLoadingState.inventories = false;
      }

      if (!globalLoadingState.inventoryDetails && inventoryDetails.length === 0) {
        globalLoadingState.inventoryDetails = true;
        await fetchInventoryDetails();
        globalLoadingState.inventoryDetails = false;
      }

      console.log('✅ Essential data loaded successfully');
      setIsInitialized(true);
    } catch (error) {
      console.error('❌ Error loading essential data:', error);
      initializationRef.current = false;
    }
  }, [inventories.length, inventoryDetails.length, fetchInventories, fetchInventoryDetails]);

  // Load data on mount
  useEffect(() => {
    loadEssentialData();
  }, [loadEssentialData]);

  // Optimized reload function
  const reloadData = useCallback(async () => {
    try {
      console.log('🔄 Reloading essential data...');
      
      // Only reload inventory data
      await Promise.all([
        fetchInventories(),
        fetchInventoryDetails()
      ]);
      
      console.log('✅ Data reloaded successfully');
    } catch (error) {
      console.error('❌ Error reloading data:', error);
      throw error;
    }
  }, [fetchInventories, fetchInventoryDetails]);

  // Check if all data is loaded
  const isDataReady = isInitialized && 
    !productsLoading && 
    !warehousesLoading && 
    !employeesLoading && 
    !inventoryLoading;

  return {
    // Data
    products,
    warehouses,
    employees,
    inventories,
    inventoryDetails,
    
    // Loading states
    loading: !isDataReady,
    productsLoading,
    warehousesLoading,
    employeesLoading,
    inventoryLoading,
    isInitialized,
    
    // Functions
    fetchProducts,
    fetchWarehouses,
    fetchEmployees,
    fetchInventories,
    fetchInventoryDetails,
    reloadData,
    approveInventory,
    rejectInventory,
    deleteInventory,
    getInventoryWithDetails
  };
};
