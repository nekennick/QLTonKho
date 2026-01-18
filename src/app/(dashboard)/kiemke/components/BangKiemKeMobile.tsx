'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Save, ChevronLeft, ChevronRight, X, Search, Calendar, RefreshCw, Menu, Package, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/DatePicker';
import { KiemKeItem } from '../types/kiemke';
import { parseFormattedNumber, formatNumber } from '../utils/kiemKeUtils';
import html2canvas from 'html2canvas';

interface BangKiemKeMobileProps {
  kiemKeData: KiemKeItem[];
  setKiemKeData: (updater: KiemKeItem[] | ((prev: KiemKeItem[]) => KiemKeItem[])) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
  selectedDate: Date;
  search: string;
  setSearch: (value: string) => void;
  onDateChange: (date: Date | undefined) => void;
}

// Component bàn phím số tùy chỉnh
const NumericKeypad = ({
  isVisible,
  onClose,
  onInput,
  currentValue = '',
  fieldName,
  onSave,
  onNext,
  onPrev,
  currentIndex = 0,
  totalItems = 0,
  productName = ''
}: {
  isVisible: boolean;
  onClose: () => void;
  onInput: (value: any) => void;
  currentValue: any;
  fieldName: string;
  onSave: (value: any) => void;
  onNext: () => void;
  onPrev: () => void;
  currentIndex: number;
  totalItems: number;
  productName: string;
}) => {
  const [inputValue, setInputValue] = useState(currentValue?.toString() || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isVisible) {
      const numValue = typeof currentValue === 'string'
        ? parseFormattedNumber(currentValue)
        : (typeof currentValue === 'number' ? currentValue : 0);
      setInputValue(numValue > 0 ? String(numValue) : '');
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isVisible, currentIndex, fieldName, currentValue]);

  const handleKeyPress = (key: string) => {
    if (key === 'backspace') {
      setInputValue((prev: string) => prev.slice(0, -1));
    } else if (key === 'next') {
      const value = parseFormattedNumber(inputValue) || 0;
      onSave(value);
      onNext();
    } else if (key === 'prev') {
      const value = parseFormattedNumber(inputValue) || 0;
      onSave(value);
      onPrev();
    } else if (key === '.' || key === ',') {
      if (!inputValue.includes('.') && !inputValue.includes(',')) {
        setInputValue((prev: string) => prev + '.');
      }
    } else {
      setInputValue((prev: string) => prev + key);
    }
  };

  if (!isVisible) return null;

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'backspace']
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 bg-white border-t-2 border-gray-300 shadow-2xl z-50 animate-slide-up">
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-sm font-medium">{fieldName}</div>
            <div className="text-xs opacity-90 truncate">{productName}</div>
            <div className="text-xs opacity-75">
              {currentIndex + 1} / {totalItems}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Input Display */}
      <div className="p-4 bg-gray-50">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full p-3 text-2xl font-mono text-center bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          inputMode="decimal"
        />
      </div>

      {/* Keypad */}
      <div className="p-4 max-h-[50vh] overflow-y-auto">
        {keys.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-2 mb-2">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={`flex-1 h-14 rounded-lg text-lg font-medium transition-colors ${key === 'backspace'
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
              >
                {key === 'backspace' ? '⌫' : key}
              </button>
            ))}
          </div>
        ))}

        {/* Action buttons */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => handleKeyPress('prev')}
            className="flex-1 h-12 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            ← Trước
          </button>
          <button
            onClick={() => {
              const value = parseFormattedNumber(inputValue) || 0;
              onSave(value);
            }}
            className="flex-1 h-12 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Lưu
          </button>
          <button
            onClick={() => handleKeyPress('next')}
            className="flex-1 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Tiếp →
          </button>
        </div>
      </div>
    </div>
  );
};

// Component view danh sách sản phẩm với layout mobile
const ProductListView = ({
  items,
  onItemClick,
  currentIndex = 0,
  search = ''
}: {
  items: KiemKeItem[];
  onItemClick: (index: number) => void;
  currentIndex: number;
  search: string;
}) => {
  const filteredItems = items.filter(item =>
    item.TenVT?.toLowerCase().includes(search.toLowerCase()) ||
    item.MaVT?.toLowerCase().includes(search.toLowerCase()) ||
    item.NhomVT?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="grid gap-1 p-2 text-xs font-medium text-gray-600 grid-cols-3">
          <div className="col-span-1">Tên hàng</div>
          <div className="text-center">Số lượng</div>
          <div className="text-center">Ghi chú</div>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="divide-y divide-gray-100">
        {filteredItems.map((item, filteredIndex) => {
          const indexInOriginal = items.findIndex(i => i.MaVT === item.MaVT);
          const actualIndex = indexInOriginal >= 0 ? indexInOriginal : filteredIndex;
          const isHighlighted = currentIndex === actualIndex;

          const soLuong = item.SoLuong || 0;
          const numValue = typeof soLuong === 'string'
            ? parseFormattedNumber(String(soLuong))
            : (typeof soLuong === 'number' ? soLuong : 0);

          return (
            <div
              key={filteredIndex}
              id={`list-item-${actualIndex}`}
              className={`grid gap-1 p-2 transition-all duration-200 ${isHighlighted
                ? 'bg-blue-50 border-l-4 border-blue-500'
                : 'hover:bg-gray-50'
                } grid-cols-3`}
              onClick={() => onItemClick(actualIndex)}
            >
              {/* Tên hàng */}
              <div className="col-span-1">
                <div className="font-medium text-sm text-gray-900 break-words leading-tight">
                  {item.TenVT}
                </div>
                <div className="text-xs text-gray-500">
                  {item.ĐVT} | {item.MaVT}
                </div>
              </div>

              {/* Cột Số lượng */}
              <div className="text-center">
                <div
                  className={`p-2 rounded border transition-colors cursor-pointer ${isHighlighted
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                    }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onItemClick(actualIndex);
                  }}
                >
                  <div className="text-sm font-medium text-gray-900">
                    {formatNumber(numValue) || '0'}
                  </div>
                  <div className="text-xs text-blue-600">Số lượng</div>
                </div>
              </div>

              {/* Cột Ghi chú */}
              <div className="text-center">
                <div
                  className={`p-2 rounded border transition-colors cursor-pointer ${isHighlighted
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                    }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onItemClick(actualIndex);
                  }}
                >
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {item.GhiChu || '...'}
                  </div>
                  <div className="text-xs text-orange-600">Ghi chú</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BangKiemKeMobile: React.FC<BangKiemKeMobileProps> = ({
  kiemKeData,
  setKiemKeData,
  onSave,
  isSaving,
  selectedDate,
  search,
  setSearch,
  onDateChange
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [keypadState, setKeypadState] = useState({
    isVisible: false,
    currentIndex: 0,
    currentField: 'SoLuong',
    currentValue: 0 as string | number
  });

  const [isCapturing, setIsCapturing] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const handleCapture = async () => {
    if (!captureRef.current) return;

    try {
      setIsCapturing(true);
      setShowMobileMenu(false); // Close menu if open

      // Wait for a brief moment to ensure rendering or just proceed
      // Since it's a hidden div updated by React, we might need a small timeout 
      // but usually if data is there, it's fine.
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(captureRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      const dateStr = selectedDate.toLocaleDateString('vi-VN').replace(/\//g, '-');
      link.href = image;
      link.download = `KiemKe-${dateStr}.png`;
      link.click();

    } catch (err) {
      console.error("Lỗi khi chụp ảnh:", err);
      // You could use toast here if available, but console for now
      alert("Có lỗi khi tạo ảnh. Vui lòng thử lại.");
    } finally {
      setIsCapturing(false);
    }
  };

  const filteredData = useMemo(() => {
    return kiemKeData.filter(item =>
      item.TenVT?.toLowerCase().includes(search.toLowerCase()) ||
      item.MaVT?.toLowerCase().includes(search.toLowerCase()) ||
      item.NhomVT?.toLowerCase().includes(search.toLowerCase())
    );
  }, [kiemKeData, search]);

  // Xử lý click vào item
  const handleItemClick = (index: number, field: 'SoLuong' | 'GhiChu' = 'SoLuong') => {
    const item = filteredData[index];
    if (!item) return;

    const value = item[field] || (field === 'SoLuong' ? 0 : '');
    setKeypadState({
      isVisible: true,
      currentIndex: index,
      currentField: field,
      currentValue: value
    });
  };

  // Xử lý lưu giá trị từ keypad
  const handleSaveValue = (value: string | number) => {
    const item = filteredData[keypadState.currentIndex];
    if (!item) return;

    setKiemKeData(prev => {
      const updatedData = [...prev];
      const itemIndex = updatedData.findIndex(i => i.MaVT === item.MaVT);

      if (itemIndex >= 0) {
        if (keypadState.currentField === 'SoLuong') {
          updatedData[itemIndex] = {
            ...updatedData[itemIndex],
            SoLuong: typeof value === 'string' ? parseFormattedNumber(value) || 0 : value
          };
        } else if (keypadState.currentField === 'GhiChu') {
          updatedData[itemIndex] = {
            ...updatedData[itemIndex],
            GhiChu: String(value)
          };
        }
      }
      return updatedData;
    });
  };

  // Chuyển đến item trước
  const handlePrev = () => {
    if (keypadState.currentIndex > 0) {
      const newIndex = keypadState.currentIndex - 1;
      const item = filteredData[newIndex];
      if (item) {
        const value = item[keypadState.currentField as 'SoLuong' | 'GhiChu'] || (keypadState.currentField === 'SoLuong' ? 0 : '');
        setKeypadState(prev => ({
          ...prev,
          currentIndex: newIndex,
          currentValue: value
        }));
      }
    }
  };

  // Chuyển đến item tiếp theo
  const handleNext = () => {
    if (keypadState.currentIndex < filteredData.length - 1) {
      const newIndex = keypadState.currentIndex + 1;
      const item = filteredData[newIndex];
      if (item) {
        const value = item[keypadState.currentField as 'SoLuong' | 'GhiChu'] || (keypadState.currentField === 'SoLuong' ? 0 : '');
        setKeypadState(prev => ({
          ...prev,
          currentIndex: newIndex,
          currentValue: value
        }));
      }
    }
  };

  // Đóng keypad
  const handleCloseKeypad = () => {
    setKeypadState(prev => ({ ...prev, isVisible: false }));
  };

  const currentItem = filteredData[keypadState.currentIndex];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b px-2 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Kiểm Kê Kho
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {selectedDate.toLocaleDateString('vi-VN')}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="h-8 text-xs"
          >
            <Menu className="h-3 w-3 mr-1" />
            Menu
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="flex-shrink-0 bg-white border-b px-2 py-2 space-y-2">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">📅 Chọn ngày</Label>
            <DatePicker
              date={selectedDate}
              onDateChange={onDateChange}
              placeholder="Chọn ngày"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold">🔍 Tìm kiếm</Label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm..."
                className="pl-8 h-8 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCapture}
              disabled={isCapturing}
              className="flex-1 h-8 text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              {isCapturing ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-700 mr-1"></div>
              ) : (
                <Camera className="h-3 w-3 mr-1" />
              )}
              {isCapturing ? 'Đang tạo...' : 'Chụp ảnh'}
            </Button>
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 mr-1" />
                  Lưu
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Product List */}
      <div className="flex-1 overflow-y-auto">
        <ProductListView
          items={filteredData}
          onItemClick={(index) => handleItemClick(index, 'SoLuong')}
          currentIndex={keypadState.currentIndex}
          search={search}
        />
      </div>

      {/* Numeric Keypad */}
      <NumericKeypad
        isVisible={keypadState.isVisible && keypadState.currentField === 'SoLuong'}
        onClose={handleCloseKeypad}
        onInput={handleSaveValue}
        currentValue={keypadState.currentValue}
        fieldName="Số Lượng"
        onSave={handleSaveValue}
        onNext={handleNext}
        onPrev={handlePrev}
        currentIndex={keypadState.currentIndex}
        totalItems={filteredData.length}
        productName={currentItem?.TenVT || ''}
      />

      {/* Hidden container for HTML2Canvas */}
      <div
        ref={captureRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          width: '800px', // Fixed width for consistent image
          backgroundColor: 'white',
          zIndex: -1
        }}
      >
        <div className="p-4 border-b bg-blue-600 text-white">
          <h1 className="text-xl font-bold uppercase">Bảng Kiểm Kê Kho</h1>
          <div className="flex justify-between mt-2 text-sm opacity-90">
            <p>Ngày: {selectedDate.toLocaleDateString('vi-VN')}</p>
            <p>Tổng số mặt hàng: {filteredData.length}</p>
          </div>
          {search && <p className="text-xs mt-1">Lọc theo: "{search}"</p>}
        </div>
        <ProductListView
          items={filteredData}
          onItemClick={() => { }}
          currentIndex={-1}
          search="" // Pass empty search to render all items provided in 'items'
        />
        <div className="p-4 border-t text-center text-gray-400 text-xs">
          Được tạo lúc {new Date().toLocaleString('vi-VN')}
        </div>
      </div>
    </div>
  );
};

export default BangKiemKeMobile;
