'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import QRCode from 'qrcode';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, Printer, Download } from 'lucide-react';
import type { Product } from '../types/product';

interface PrintCodesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export const PrintCodesDialog: React.FC<PrintCodesDialogProps> = ({
  open,
  onOpenChange,
  product
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Generate QR Code
  useEffect(() => {
    if (product && open) {
      generateQRCode();
    }
  }, [product, open]);

  const generateQRCode = async () => {
    if (!product) return;

    setLoading(true);
    try {
      // Create QR code data with product information
      const qrData = JSON.stringify({
        maVT: product.MaVT,
        tenVT: product.TenVT,
        nhomVT: product.NhomVT,
        dvt: product.ĐVT,
        donGia: product.DonGia,
        timestamp: new Date().toISOString()
      });

      const qrCodeURL = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeDataURL(qrCodeURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Mã QR - ${product?.TenVT || 'Sản phẩm'}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
      }
    `,
  });

  // Generate barcode (simple text-based representation)
  const generateBarcode = (text: string) => {
    // Simple barcode representation using characters
    const bars = text.split('').map(char => {
      const code = char.charCodeAt(0);
      return code.toString(2).padStart(8, '0');
    }).join('');
    
    return bars.replace(/0/g, '|').replace(/1/g, ' ');
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-blue-600" />
            In mã QR và Barcode
          </DialogTitle>
          <DialogDescription>
            In mã QR và barcode cho hàng hóa: {product.TenVT}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div ref={printRef} className="bg-white p-6 space-y-6">
            {/* Header */}
            <div className="text-center border-b pb-4">
              <h2 className="text-xl font-bold text-gray-800">THÔNG TIN HÀNG HÓA</h2>
              <p className="text-sm text-gray-600 mt-1">Mã QR Code & Barcode</p>
            </div>

            {/* Product Information */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Mã vật tư:</span>
                <p className="text-gray-900">{product.MaVT}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Tên vật tư:</span>
                <p className="text-gray-900">{product.TenVT}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Nhóm:</span>
                <p className="text-gray-900">{product.NhomVT || 'Chưa phân loại'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Đơn vị:</span>
                <p className="text-gray-900">{product.ĐVT || 'Chưa có'}</p>
              </div>
              {product.DonGia && (
                <div className="col-span-2">
                  <span className="font-medium text-gray-700">Đơn giá:</span>
                  <p className="text-gray-900">{product.DonGia} VNĐ</p>
                </div>
              )}
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">MÃ QR CODE</h3>
                {loading ? (
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : qrCodeDataURL ? (
                  <img
                    src={qrCodeDataURL}
                    alt="QR Code"
                    className="w-48 h-48 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Không thể tạo QR Code</span>
                  </div>
                )}
                <p className="text-xs text-gray-600 mt-2">
                  Quét mã QR để xem thông tin chi tiết
                </p>
              </div>
            </div>

            {/* Barcode */}
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">MÃ BARCODE</h3>
              <div className="bg-white border border-gray-300 rounded-lg p-4">
                <div className="font-mono text-lg tracking-wider break-all bg-white text-black p-2 border">
                  {generateBarcode(product.MaVT)}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Mã: {product.MaVT}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 border-t pt-4">
              <p>Được tạo lúc: {new Date().toLocaleString('vi-VN')}</p>
              <p>Hệ thống quản lý kho - ENV-INV</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
          <Button
            onClick={handlePrint}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <Printer className="h-4 w-4" />
            In mã QR
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
