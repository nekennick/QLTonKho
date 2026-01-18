'use client';

import React from 'react';
import { Calendar, Building2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/DatePicker';
import { REPORT_PERIODS } from '../types/warehouseReport';
import type { ReportPeriodType } from '../types/warehouseReport';

interface WarehouseReportFiltersProps {
  selectedWarehouse: string;
  onWarehouseChange: (value: string) => void;
  reportPeriod: ReportPeriodType;
  onPeriodChange: (period: ReportPeriodType) => void;
  startDate: Date;
  onStartDateChange: (date: Date) => void;
  endDate: Date;
  onEndDateChange: (date: Date) => void;
  warehouseOptions: { value: string; label: string }[];
  isLoading: boolean;
}

export const WarehouseReportFilters: React.FC<WarehouseReportFiltersProps> = ({
  selectedWarehouse,
  onWarehouseChange,
  reportPeriod,
  onPeriodChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  warehouseOptions,
  isLoading
}) => {
  return (
    <div className="space-y-4">
      {/* Row 1: Warehouse and Period */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Warehouse Selection */}
        <div className="space-y-2">
          <Label htmlFor="warehouse" className="text-sm font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            Chọn kho
          </Label>
          <Select 
            value={selectedWarehouse} 
            onValueChange={onWarehouseChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn kho để xem báo cáo" />
            </SelectTrigger>
            <SelectContent>
              {warehouseOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Period Selection */}
        <div className="space-y-2">
          <Label htmlFor="period" className="text-sm font-medium flex items-center gap-2">
            <Filter className="h-4 w-4 text-green-600" />
            Kỳ báo cáo
          </Label>
          <Select 
            value={reportPeriod} 
            onValueChange={onPeriodChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn kỳ báo cáo" />
            </SelectTrigger>
            <SelectContent>
              {REPORT_PERIODS.map((period) => (
                <SelectItem key={period.type} value={period.type}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            Từ ngày
          </Label>
          <DatePicker
            date={startDate}
            onDateChange={(date) => date && onStartDateChange(date)}
            placeholder="Chọn ngày bắt đầu"
            disabled={isLoading}
          />
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-600" />
            Đến ngày
          </Label>
          <DatePicker
            date={endDate}
            onDateChange={(date) => date && onEndDateChange(date)}
            placeholder="Chọn ngày kết thúc"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Quick Date Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const today = new Date();
            const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
            onStartDateChange(yesterday);
            onEndDateChange(yesterday);
          }}
          disabled={isLoading}
          className="text-xs"
        >
          Hôm qua
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const today = new Date();
            onStartDateChange(today);
            onEndDateChange(today);
          }}
          disabled={isLoading}
          className="text-xs"
        >
          Hôm nay
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const today = new Date();
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            onStartDateChange(weekAgo);
            onEndDateChange(today);
          }}
          disabled={isLoading}
          className="text-xs"
        >
          7 ngày qua
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const today = new Date();
            const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            onStartDateChange(monthAgo);
            onEndDateChange(today);
          }}
          disabled={isLoading}
          className="text-xs"
        >
          30 ngày qua
        </Button>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        <p><strong>Lưu ý:</strong> Báo cáo sẽ hiển thị dữ liệu trong khoảng thời gian đã chọn. 
        Dữ liệu được cập nhật theo thời gian thực từ hệ thống.</p>
      </div>
    </div>
  );
};
