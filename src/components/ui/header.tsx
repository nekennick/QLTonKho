'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuPortal, // Import Portal nếu có
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import authUtils from '@/utils/authUtils';
import {
    Bell,
    LogOut,
    Search,
    Menu,
    ChevronLeft,
    ChevronRight,
    User,
    ChevronDown,
    Package,
    AlertCircle,
    CheckCircle,
    Clock,
    Droplets,
    RotateCcw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clearAllAppCache, cleanupExpiredCache } from '@/utils/cacheUtils';

interface HeaderProps {
    onToggleSidebar: () => void;
    sidebarCollapsed: boolean;
    onMobileMenuToggle: () => void;
    userData?: any; // Thêm prop userData tùy chọn
}

// Mock notifications data
const notifications = [
    {
        id: 1,
        title: 'Phát hiện lỗi',
        message: 'Liên hệ với admin để khắc phục',
        time: '5 phút tr',
        type: 'info',
        icon: AlertCircle,
        unread: true
    },
  
];

export function Header({ onToggleSidebar, sidebarCollapsed, onMobileMenuToggle, userData: propUserData }: HeaderProps) {
    const userData = propUserData || authUtils.getUserDataFromUrlOrStorage();
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

    // Thêm kiểm tra userData ở đầu
    useEffect(() => {
        if (!userData) {
            router.push('/');
        }
    }, [userData, router]);

    // Auto cleanup expired cache khi component mount
    useEffect(() => {
        cleanupExpiredCache();
    }, []);

    // Cập nhật thời gian thực
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleLogout = () => {
        // Kiểm tra nếu user từ URL parameters
        if (authUtils.isUserFromUrlParams()) {
            authUtils.clearTempUserData();
            toast.success('Đã thoát khỏi chế độ xem!');
            window.location.href = '/';
        } else {
            authUtils.logout();
            toast.success('Đăng xuất thành công!');
            window.location.href = '/';
        }
    };

    const handleClearCache = () => {
        try {
            clearAllAppCache();
            toast.success('Đã xóa tất cả cache thành công!');
            
            // Reload trang để áp dụng thay đổi
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Error clearing cache:', error);
            toast.error('Có lỗi khi xóa cache!');
        }
    };

    // Nếu không có userData, return loading hoặc null
    if (!userData) {
        return (
            <div className="h-16 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
                <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">Đang tải...</div>
                </div>
            </div>
        );
    }

    const formatDate = (date: Date) => {
        const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        const dayName = days[date.getDay()];
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${dayName}, ${day}/${month}/${year}`;
    };

    const formatTime = (date: Date) => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'warning':
                return 'text-orange-600 bg-orange-50';
            case 'success':
                return 'text-green-600 bg-green-50';
            case 'info':
                return 'text-blue-600 bg-blue-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <div className="h-16 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
            <div className="flex items-center justify-between h-full px-3">
                {/* Left side */}
                <div className="flex items-center space-x-4">
                    {/* Mobile menu button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onMobileMenuToggle}
                        className="lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    {/* Logo and title */}
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                            <img
                                src="/logo1.png"
                                alt="Goal APP Logo"
                                className="w-10 h-8"
                            />
                        </div>
                        <div>
                            <span className="font-bold text-gray-800">Tồn kho ĐTB</span>
                        </div>
                    </div>
                    {/* Desktop collapse button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleSidebar}
                        className="hidden lg:flex ml-2 transition-all duration-200"
                    >
                        {sidebarCollapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <ChevronLeft className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {/* Right side */}
                <div className="flex items-center space-x-4">
                    {/* Real-time clock */}
                    <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                        <span>{formatDate(currentTime)}</span>
                        <span className="font-mono font-semibold">{formatTime(currentTime)}</span>
                    </div>


                    {/* Notification dropdown */}
                    <DropdownMenu open={notificationDropdownOpen} onOpenChange={setNotificationDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative transition-all duration-200">
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-96 p-0" sideOffset={8}>
                            {/* Header */}
                            <div className="px-4 py-3 border-b bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-800">Thông báo</h3>
                                    <Badge variant="secondary" className="text-xs">
                                        {unreadCount} mới
                                    </Badge>
                                </div>
                            </div>

                            {/* Notifications list - với max height và scroll */}
                            <div className="max-h-80 overflow-y-auto">
                                <div className="p-2">
                                    {notifications.map((notification) => {
                                        const Icon = notification.icon;
                                        return (
                                            <div
                                                key={notification.id}
                                                className={`flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${notification.unread ? 'bg-blue-50/50' : ''
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-lg flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium text-gray-800 truncate">
                                                            {notification.title}
                                                        </p>
                                                        {notification.unread && (
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0"></div>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {notification.time}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-3 border-t bg-gray-50">
                                <Button variant="ghost" size="sm" className="w-full text-center text-sm hover:bg-gray-100 transition-colors duration-150">
                                    Xem tất cả thông báo
                                </Button>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* User dropdown */}
                    <DropdownMenu open={userDropdownOpen} onOpenChange={setUserDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-50 transition-all duration-200">
                                <Avatar className="h-8 w-8 ring-2 ring-gray-100">
                                    <AvatarImage
                                        src={userData?.avatar || userData?.Image || ''}
                                        alt={userData?.username || 'User Avatar'}
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white text-sm font-semibold">
                                        {userData?.username?.charAt(0)?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden lg:block text-left">
                                    <p className="text-sm font-medium text-gray-800">
                                        {userData?.['Họ và Tên'] || 'Người dùng'}
                                    </p>
                                    <p className="text-xs text-gray-500">

                                        {userData?.username || ''}
                                    </p>
                                </div>
                                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-80 p-0 overflow-hidden"
                            sideOffset={8}
                        >
                            {/* User info header */}
                            <div className="px-4 py-3 bg-gray-50 border-b">
                                <div className="flex items-center space-x-3">
                                    <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                                        <AvatarImage
                                            src={userData?.avatar || userData?.Image || ''}
                                            alt={userData?.username || 'User Avatar'}
                                            className="object-cover"
                                        />
                                        <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white text-lg font-semibold">
                                            {userData?.username?.charAt(0)?.toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-800 truncate">
                                            {userData?.['Họ và Tên'] || 'Người dùng'}
                                        </p>
                                        <p className="text-sm text-gray-600 truncate">
                                            {userData?.['Email'] || ''}
                                        </p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <Badge variant="outline" className="text-xs flex-shrink-0">
                                                <User className="h-3 w-3 mr-1" />
                                                {userData?.['Phân quyền'] || 'User'}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 flex-shrink-0">
                                                {userData?.['Chức vụ'] || ''}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Menu items */}
                            <div className="py-2">
                                <DropdownMenuItem
                                    className="mx-2 px-3 py-2 cursor-pointer focus:bg-gray-50 transition-colors duration-150 rounded-md"
                                    onClick={() => router.push('/profile')}
                                >
                                    <User className="h-4 w-4 mr-3 text-gray-500" />
                                    <span>Thông tin cá nhân</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-2" />

                                <DropdownMenuItem
                                    className="mx-2 px-3 py-2 cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 transition-colors duration-150 rounded-md"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4 mr-3" />
                                    <span>Đăng xuất</span>
                                </DropdownMenuItem>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}