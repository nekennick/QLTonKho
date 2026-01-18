'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Warehouse, X, Plus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProducts } from './hooks/useProducts';
import { DataTable } from './components/DataTable';
import { ProductMobileGrid } from './components/ProductMobileGrid';
import { ImportExcelDialog } from './components/ImportExcelDialog';
import { BulkDeleteDialog } from './components/BulkDeleteDialog';
import { PrintCodesDialog } from './components/PrintCodesDialog';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { getColumns } from './utils/columns';
import { ExcelUtils } from './utils/excelUtils';
import type { Product, ProductFormData } from './types/product';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageTitle } from '@/hooks/usePageTitle';
import authUtils from '@/utils/authUtils';
import toast from 'react-hot-toast';

export default function ProductPage() {
  usePageTitle('Danh mục hàng hóa');
  
  const router = useRouter();
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    bulkImportProducts,
    bulkDeleteProducts,
    loading
  } = useProducts(false); // Disable cache for danh-muc-hang-hoa

  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobilePage, setMobilePage] = useState(1);
  const [mobileItemsPerPage] = useState(10);

  // Excel dialog states
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  
  // Print codes dialog state
  const [printCodesDialogOpen, setPrintCodesDialogOpen] = useState(false);
  const [selectedProductForPrint, setSelectedProductForPrint] = useState<Product | null>(null);

  // Check user permissions
  React.useEffect(() => {
    const userData = authUtils.getUserData();
    if (!userData) {
      router.push('/login');
      return;
    }

    const isAdminUser = userData['Phân quyền'] === 'Admin';
    const isManagerUser = userData['Phân quyền'] === 'Quản lý';
    setIsAdmin(isAdminUser);
    setIsManager(isManagerUser);
  }, [router]);

  // Check if mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const existingMaVTList = useMemo(() =>
    products.map((p: Product) => p.MaVT.toLowerCase()),
    [products]
  );

  const handleAddNew = () => {
    if (!isAdmin && !isManager) {
      toast.error('Bạn không có quyền thực hiện chức năng này!');
      return;
    }
    router.push('/kho/danh-muc-hang-hoa/them-moi');
  };

  const handleEdit = (product: Product) => {
    if (!isAdmin && !isManager) {
      toast.error('Bạn không có quyền thực hiện chức năng này!');
      return;
    }
    router.push(`/kho/danh-muc-hang-hoa/chinh-sua/${encodeURIComponent(product.MaVT)}`);
  };

  const handleDelete = (product: Product) => {
    if (!isAdmin && !isManager) {
      toast.error('Bạn không có quyền xóa hàng hóa!');
      return;
    }
    deleteProduct(product.MaVT);
  };

  const handleCopy = (product: Product) => {
    if (!isAdmin && !isManager) {
      toast.error('Bạn không có quyền sao chép hàng hóa!');
      return;
    }

    // Store copied product data in sessionStorage to pass to new page
    const copiedData = {
      TenVT: product.TenVT || '',
      NhomVT: product.NhomVT || '',
      HinhAnh: product.HinhAnh || '',
      ĐVT: product.ĐVT || '',
      NoiSX: product.NoiSX || '',
      ChatLuong: product.ChatLuong || '',
      DonGia: product.DonGia || '',
      GhiChu: product.GhiChu || ''
    };
    sessionStorage.setItem('copiedProductData', JSON.stringify(copiedData));
    router.push('/kho/danh-muc-hang-hoa/them-moi?copy=true');
    toast.success('Đã sao chép thông tin hàng hóa. Vui lòng tạo mã vật tư mới!');
  };

  const handleView = (product: Product) => {
    // Có thể mở dialog xem chi tiết hoặc navigate đến trang chi tiết
    console.log('View product:', product);
    // TODO: Implement view functionality
  };

  // Mobile pagination logic
  const mobileTotalPages = Math.ceil(products.length / mobileItemsPerPage);
  const mobileStartIndex = (mobilePage - 1) * mobileItemsPerPage;
  const mobileEndIndex = mobileStartIndex + mobileItemsPerPage;
  const mobileProducts = products.slice(mobileStartIndex, mobileEndIndex);

  const handleMobilePageChange = (page: number) => {
    setMobilePage(page);
  };

  // Temporarily hidden
  // const handlePrintCodes = (product: Product) => {
  //   setSelectedProductForPrint(product);
  //   setPrintCodesDialogOpen(true);
  // };

  // Excel handlers
  const handleExportExcel = () => {
    const result = ExcelUtils.exportToExcel(products);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleImportExcel = () => {
    if (!isAdmin && !isManager) {
      toast.error('Bạn không có quyền import dữ liệu!');
      return;
    }
    setImportDialogOpen(true);
  };

  const handleBulkDelete = () => {
    if (!isAdmin && !isManager) {
      toast.error('Bạn không có quyền xóa hàng hóa!');
      return;
    }

    if (selectedProducts.length === 0) {
      toast.error('Vui lòng chọn hàng hóa cần xóa!');
      return;
    }

    setBulkDeleteDialogOpen(true);
  };

  const handleBulkDeleteConfirm = async (maVTList: string[]) => {
    try {
      await bulkDeleteProducts(maVTList);
      setSelectedProducts([]);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleImportConfirm = async (productsToImport: ProductFormData[]) => {
    try {
      await bulkImportProducts(productsToImport);
      // Refresh the page to get updated options
      window.location.reload();
    } catch (error) {
      // Error already handled in hook
      throw error;
    }
  };

  // Memoized columns with all handlers
  const columns = useMemo(
    () => getColumns({
      onEdit: handleEdit,
      onDelete: handleDelete,
      onCopy: handleCopy,
      onPrintCodes: () => {}, // Temporarily disabled
      isAdmin,
      isManager
    }),
    [isAdmin, isManager]
  );

  // Skeleton loading component for immediate display
  const SkeletonForm = () => (
    <div className="p-0">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 border rounded">
                <Skeleton className="h-8 w-8" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Hiển thị skeleton khi đang loading
  if (loading) {
    return <SkeletonForm />;
  }

  return (
    <div className="p-0">
      <div className="mx-auto space-y-3 sm:space-y-6">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-4 sm:px-0">
          <div className="flex items-center">
            <Package className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800">
              Quản lý hàng hóa
            </h1>
          </div>
        </div>

        {/* Optimized Stats Cards */}
        <div className="grid grid-cols-4 gap-2 px-2 sm:px-0">
          {/* Basic Stats - Enhanced */}
          <Card className="shadow-sm border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-md transition-shadow">
            <CardContent className="p-2">
              <div className="flex flex-col items-center text-center">
                <div className="p-1 bg-blue-500 rounded-lg mb-1">
                  <Package className="h-3 w-3 text-white" />
                </div>
                <div className="text-sm font-bold text-blue-800">{products.length}</div>
                <div className="text-xs text-blue-600">Tổng HH</div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-green-100 bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-md transition-shadow">
            <CardContent className="p-2">
              <div className="flex flex-col items-center text-center">
                <div className="p-1 bg-green-500 rounded-lg mb-1">
                  <Warehouse className="h-3 w-3 text-white" />
                </div>
                <div className="text-sm font-bold text-green-800">
                  {new Set(products.map((p: Product) => p.NhomVT)).size}
                </div>
                <div className="text-xs text-green-600">Nhóm HH</div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-purple-100 bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-md transition-shadow">
            <CardContent className="p-2">
              <div className="flex flex-col items-center text-center">
                <div className="p-1 bg-purple-500 rounded-lg mb-1">
                  <Package className="h-3 w-3 text-white" />
                </div>
                <div className="text-sm font-bold text-purple-800">
                  {products.filter((p: Product) => p.ChatLuong === 'A').length}
                </div>
                <div className="text-xs text-purple-600">Chất lượng A</div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-orange-100 bg-gradient-to-br from-orange-50 to-orange-100/50 hover:shadow-md transition-shadow">
            <CardContent className="p-2">
              <div className="flex flex-col items-center text-center">
                <div className="p-1 bg-orange-500 rounded-lg mb-1">
                  <Package className="h-3 w-3 text-white" />
                </div>
                <div className="text-sm font-bold text-orange-800">
                  {products.filter((p: Product) => p.HinhAnh && p.HinhAnh.trim() !== '').length}
                </div>
                <div className="text-xs text-orange-600">Có ảnh</div>
              </div>
            </CardContent>
          </Card>

        </div>


        {/* Data Table - Responsive */}
        {isMobile ? (
          <div className="space-y-3">
            {/* Mobile Toolbar */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tìm kiếm hàng hóa..."
                  className="flex-1 h-9 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => {
                    // TODO: Implement search functionality
                  }}
                />
                {(isAdmin || isManager) && (
                  <Button onClick={handleAddNew} size="sm" className="h-9">
                    <Package className="mr-1 h-4 w-4" />
                    Thêm
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportExcel}
                  className="flex-1 h-9"
                >
                  Xuất Excel
                </Button>
                {(isAdmin || isManager) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleImportExcel}
                    className="flex-1 h-9"
                  >
                    Import Excel
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile Grid */}
            <ProductMobileGrid
              products={mobileProducts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              onCopy={handleCopy}
              isAdmin={isAdmin}
              isManager={isManager}
              currentPage={mobilePage}
              totalPages={mobileTotalPages}
              onPageChange={handleMobilePageChange}
              itemsPerPage={mobileItemsPerPage}
            />
          </div>
        ) : (
         
              <DataTable
                columns={columns}
                data={products}
                onAddNew={handleAddNew}
                onExportExcel={handleExportExcel}
                onImportExcel={handleImportExcel}
                onBulkDelete={handleBulkDelete}
                onSelectionChange={setSelectedProducts}
                isAdmin={isAdmin}
                isManager={isManager}
              />
         
        )}

        {/* Import Excel Dialog */}
        <ImportExcelDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          onImport={handleImportConfirm}
          existingMaVTList={existingMaVTList}
        />

        {/* Bulk Delete Dialog */}
        <BulkDeleteDialog
          open={bulkDeleteDialogOpen}
          onOpenChange={setBulkDeleteDialogOpen}
          products={selectedProducts}
          onConfirm={handleBulkDeleteConfirm}
          isAdmin={isAdmin}
        />

        {/* Print Codes Dialog - Temporarily hidden */}
        {/* <PrintCodesDialog
          open={printCodesDialogOpen}
          onOpenChange={setPrintCodesDialogOpen}
          product={selectedProductForPrint}
        /> */}
      </div>
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
