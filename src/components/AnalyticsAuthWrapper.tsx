'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle } from 'lucide-react';

interface AnalyticsAuthWrapperProps {
    children: React.ReactNode;
    allowedRoles?: string[];
    currentUserRole?: string;
}

export default function AnalyticsAuthWrapper({ 
    children, 
    allowedRoles = ['Tổng giám đốc', 'Phó giám đốc', 'Kế toán', 'Hồ sơ Dự án', 'Admin'],
    currentUserRole = 'Nhân viên' // Mặc định, sẽ được thay thế bằng context thực tế
}: AnalyticsAuthWrapperProps) {
    const hasAccess = allowedRoles.includes(currentUserRole) || allowedRoles.includes('Admin');

    if (!hasAccess) {
        return (
            <div className="container mx-auto p-6">
                <Card className="max-w-md mx-auto">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <CardTitle className="text-xl text-red-600">Truy cập bị từ chối</CardTitle>
                        <CardDescription>
                            Bạn không có quyền truy cập vào trang này
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-sm text-gray-600">
                            Trang này chỉ dành cho các chức vụ: {allowedRoles.join(', ')}
                        </p>
                        <p className="text-sm text-gray-500">
                            Chức vụ hiện tại của bạn: <span className="font-medium">{currentUserRole}</span>
                        </p>
                        <div className="flex gap-2 justify-center">
                            <Button variant="outline" onClick={() => window.history.back()}>
                                Quay lại
                            </Button>
                            <Button onClick={() => window.location.href = '/dashboard'}>
                                Về trang chủ
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
} 