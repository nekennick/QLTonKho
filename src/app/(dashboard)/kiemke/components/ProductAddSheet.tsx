'use client';

import React, { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { ProductForm } from '@/app/(dashboard)/kho/danh-muc-hang-hoa/components/ProductForm';
import { useProducts } from '@/app/(dashboard)/kho/danh-muc-hang-hoa/hooks/useProducts';
import { ProductFormData } from '@/app/(dashboard)/kho/danh-muc-hang-hoa/types/product';
import { INITIAL_PRODUCT_FORM_DATA } from '@/app/(dashboard)/kho/danh-muc-hang-hoa/utils/constants';

interface ProductAddSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newProduct: ProductFormData) => void;
    initialData?: Partial<ProductFormData>;
    isAdmin: boolean;
    isManager: boolean;
    existingMaVTList: string[];
}

const ProductAddSheet: React.FC<ProductAddSheetProps> = ({
    isOpen,
    onClose,
    onSuccess,
    initialData = {},
    isAdmin,
    isManager,
    existingMaVTList,
}) => {
    const { addProduct } = useProducts(false);
    const [formData, setFormData] = useState<ProductFormData>({
        ...INITIAL_PRODUCT_FORM_DATA,
        ...initialData,
    });

    // Reset form when opening with new data
    React.useEffect(() => {
        if (isOpen) {
            setFormData({
                ...INITIAL_PRODUCT_FORM_DATA,
                ...initialData,
            });
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (data: ProductFormData) => {
        try {
            await addProduct(data);
            onSuccess(data);
            onClose();
        } catch (error) {
            console.error('Error adding product:', error);
            // Error is handled in addProduct with toast
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-[100%] sm:max-w-[1000px] p-0 overflow-y-auto">
                <SheetHeader className="px-6 py-4 border-b">
                    <SheetTitle>Thêm hàng hóa mới</SheetTitle>
                    <SheetDescription>
                        Thêm hàng hóa mới vào hệ thống để tiếp tục nhập kho.
                    </SheetDescription>
                </SheetHeader>

                <ProductForm
                    product={null}
                    formData={formData}
                    onFormDataChange={setFormData}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    isAdmin={isAdmin}
                    isManager={isManager}
                    existingMaVTList={existingMaVTList}
                    isPageMode={false}
                />
            </SheetContent>
        </Sheet>
    );
};

export default ProductAddSheet;
