'use client';

import React, { useState } from 'react';
import { usePageData } from '@/hooks/usePageData';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Palette, Type, Monitor, Bell, Save, RotateCcw, Hash } from 'lucide-react';

// Mock API function cho settings (chỉ dùng cho cache test)
const fetchSettingsData = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    lastUpdated: new Date().toLocaleTimeString(),
  };
};

// Định nghĩa màu sắc cho các theme
const themeColors = {
  red: { name: 'Đỏ', color: '#ef4444', bg: 'bg-red-500' },
  orange: { name: 'Cam', color: '#f97316', bg: 'bg-orange-500' },
  yellow: { name: 'Vàng', color: '#eab308', bg: 'bg-yellow-500' },
  green: { name: 'Xanh lá', color: '#10b981', bg: 'bg-green-500' },
  cyan: { name: 'Xanh cyan', color: '#06b6d4', bg: 'bg-cyan-500' },
  blue: { name: 'Xanh dương', color: '#3b82f6', bg: 'bg-blue-500' },
  purple: { name: 'Tím', color: '#8b5cf6', bg: 'bg-purple-500' },
  pink: { name: 'Hồng', color: '#ec4899', bg: 'bg-pink-500' },
  black: { name: 'Đen', color: '#000000', bg: 'bg-black' },
  gray: { name: 'Xám', color: '#6b7280', bg: 'bg-gray-500' },
  slate: { name: 'Xám đậm', color: '#475569', bg: 'bg-slate-600' },
  teal: { name: 'Xanh ngọc', color: '#14b8a6', bg: 'bg-teal-500' },
};

export default function SettingsPage() {
  usePageTitle('Cài đặt hệ thống');
  
  const { settings, updateFontSettings, updateThemeSettings, updateNotificationSettings } = useSettings();
  const [customColor, setCustomColor] = useState('');
  
  const { 
    data, 
    loading, 
    error, 
    refreshData, 
    clearCache, 
    hasCachedData 
  } = usePageData('settings-data', fetchSettingsData);

  const handleCustomColorChange = (hexColor: string) => {
    setCustomColor(hexColor);
    if (hexColor.match(/^#[0-9A-F]{6}$/i)) {
      // Nếu là mã hex hợp lệ, áp dụng màu tùy chỉnh
      updateThemeSettings({ color: 'custom', customColor: hexColor });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Cài đặt hệ thống</h1>
          <p className="text-gray-600">Quản lý cài đặt giao diện, font chữ và tùy chọn hệ thống</p>
      </div>

        {/* Giao diện và Theme */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Giao diện & Theme
              </CardTitle>
            </CardHeader>
          <CardContent className="space-y-6">
            {/* Màu có sẵn */}
                  <div className="space-y-3">
              <Label>Màu có sẵn</Label>
              <div className="flex flex-wrap gap-3">
                {Object.entries(themeColors).map(([key, theme]) => (
                    <button
                    key={key}
                    onClick={() => updateThemeSettings({ color: key as any })}
                    className={`relative flex flex-col items-center p-2 transition-all hover:scale-105 ${
                      settings.theme.color === key 
                        ? 'ring-2 ring-gray-900 ring-offset-2' 
                        : 'hover:ring-1 hover:ring-gray-300'
                    }`}
                  >
                    <div 
                      className={`w-12 h-8 rounded-full ${theme.bg} mb-1 shadow-sm`}
                      style={{ backgroundColor: theme.color }}
                    ></div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                      {theme.name}
                    </span>
                    {settings.theme.color === key && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

            {/* Màu tùy chỉnh */}
            <div className="space-y-3">
              <Label htmlFor="custom-color" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Màu tùy chỉnh
              </Label>
              
              {/* Color Picker */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label htmlFor="color-picker" className="text-sm font-medium text-gray-700">
                    Chọn màu:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="color-picker"
                      type="color"
                      value={customColor.match(/^#[0-9A-F]{6}$/i) ? customColor : '#3b82f6'}
                      onChange={(e) => handleCustomColorChange(e.target.value)}
                      className="w-12 h-8 rounded-full border-2 border-gray-200 cursor-pointer"
                    />
                    <div 
                      className="w-12 h-8 rounded-full border-2 border-gray-200 shadow-sm"
                      style={{ 
                        backgroundColor: customColor.match(/^#[0-9A-F]{6}$/i) ? customColor : '#f3f4f6' 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Hex Input */}
                <div className="flex gap-2">
                  <Input
                    id="custom-color"
                    type="text"
                    placeholder="#3b82f6"
                    value={customColor}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
                      handleCustomColorChange(randomColor);
                    }}
                    className="px-3"
                  >
                    🎲
                  </Button>
                </div>
              </div>
              
              <p className="text-xs text-gray-500">
                Sử dụng color picker hoặc nhập mã hex để tùy chỉnh màu chủ đạo
              </p>
            </div>

            {/* Màu hiện tại */}
                <div className="space-y-2">
              <Label>Màu hiện tại</Label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div 
                  className="w-12 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                  style={{ 
                    backgroundColor: settings.theme.color === 'custom' && settings.theme.customColor 
                      ? settings.theme.customColor 
                      : themeColors[settings.theme.color as keyof typeof themeColors]?.color || '#3b82f6'
                  }}
                ></div>
                <div>
                  <div className="font-medium text-sm">
                    {settings.theme.color === 'custom' 
                      ? `Màu tùy chỉnh: ${settings.theme.customColor || 'Chưa chọn'}`
                      : themeColors[settings.theme.color as keyof typeof themeColors]?.name || 'Chưa chọn'
                    }
                  </div>
                  <div className="text-xs text-gray-500">
                    {settings.theme.color === 'custom' 
                      ? settings.theme.customColor || ''
                      : themeColors[settings.theme.color as keyof typeof themeColors]?.color || ''
                    }
                  </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        {/* Font chữ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Font chữ
              </CardTitle>
            </CardHeader>
          <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="font-family">Font chữ</Label>
                <Select
                  value={settings.fonts.fontFamily}
                onValueChange={(value) => updateFontSettings({ fontFamily: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn font chữ" />
                  </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                  <SelectItem value="Open Sans">Open Sans</SelectItem>
                  <SelectItem value="Lato">Lato</SelectItem>
                  <SelectItem value="Poppins">Poppins</SelectItem>
                  <SelectItem value="Nunito">Nunito</SelectItem>
                  <SelectItem value="system-ui">System UI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
              <Label htmlFor="font-size">Cỡ chữ: {settings.fonts.fontSize}px</Label>
              <Input
                type="range"
                min="12"
                max="20"
                step="1"
                value={settings.fonts.fontSize}
                onChange={(e) => updateFontSettings({ fontSize: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>12px</span>
                <span>20px</span>
              </div>
              </div>

              <div className="space-y-2">
              <Label htmlFor="font-weight">Độ đậm chữ</Label>
                <Select
                  value={settings.fonts.fontWeight}
                onValueChange={(value) => updateFontSettings({ fontWeight: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn độ đậm" />
                  </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="300">Mỏng (300)</SelectItem>
                  <SelectItem value="400">Bình thường (400)</SelectItem>
                  <SelectItem value="500">Trung bình (500)</SelectItem>
                  <SelectItem value="600">Đậm vừa (600)</SelectItem>
                  <SelectItem value="700">Đậm (700)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
          </CardContent>
        </Card>

        {/* Thông báo Zalo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Thông báo Zalo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="zalo-enabled">Bật thông báo Zalo</Label>
                <p className="text-sm text-gray-500">Kích hoạt thông báo qua Zalo</p>
              </div>
              <Switch
                id="zalo-enabled"
                checked={settings.notifications.zalo.enabled}
                onCheckedChange={(checked) => updateNotificationSettings({ 
                  zalo: { ...settings.notifications.zalo, enabled: checked }
                })}
              />
                  </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="zalo-inventory-creation">Thông báo tạo phiếu</Label>
                <p className="text-sm text-gray-500">Thông báo khi tạo phiếu xuất nhập</p>
                  </div>
              <Switch
                id="zalo-inventory-creation"
                checked={settings.notifications.zalo.inventoryCreation}
                onCheckedChange={(checked) => updateNotificationSettings({ 
                  zalo: { ...settings.notifications.zalo, inventoryCreation: checked }
                })}
              />
                  </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="zalo-inventory-approval">Thông báo duyệt phiếu</Label>
                <p className="text-sm text-gray-500">Thông báo khi duyệt phiếu</p>
                </div>
              <Switch
                id="zalo-inventory-approval"
                checked={settings.notifications.zalo.inventoryApproval}
                onCheckedChange={(checked) => updateNotificationSettings({ 
                  zalo: { ...settings.notifications.zalo, inventoryApproval: checked }
                })}
              />
              </div>
            </CardContent>
          </Card>

        <Separator />

        {/* Cache Status - chỉ hiển thị trong development */}
        {process.env.NODE_ENV === 'development' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Cache Status
                <Badge variant={hasCachedData ? 'default' : 'secondary'}>
                  {hasCachedData ? 'Cached' : 'No Cache'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2">
                <Button 
                  onClick={refreshData} 
                  disabled={loading}
                  size="sm"
                >
                  {loading ? 'Loading...' : 'Refresh Data'}
                </Button>
                <Button 
                  onClick={clearCache} 
                  variant="outline"
                  size="sm"
                >
                  Clear Cache
                </Button>
              </div>
              {data && (
                <p className="text-sm text-gray-600 mt-2">
                  Last updated: {data.lastUpdated}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Thông tin hiện tại */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Thông tin hiện tại
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Font chữ:</strong> {settings.fonts.fontFamily}
                </div>
              <div>
                <strong>Cỡ chữ:</strong> {settings.fonts.fontSize}px
              </div>
              <div>
                <strong>Độ đậm:</strong> {settings.fonts.fontWeight}
              </div>
              <div>
                <strong>Màu chủ đạo:</strong> {settings.theme.color}
              </div>
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}