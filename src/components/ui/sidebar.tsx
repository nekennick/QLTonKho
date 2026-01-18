'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { navigation, NavigationItem } from '@/lib/navigation';
import authUtils from '@/utils/authUtils';
import { useTabNavigation } from '@/hooks/useTabNavigation';

interface SidebarProps {
    collapsed: boolean;
    mobileOpen: boolean;
    onMobileClose: () => void;
    className?: string;
}

export function Sidebar({ collapsed, mobileOpen, onMobileClose, className }: SidebarProps) {
    const pathname = usePathname();
    const [userPermissions, setUserPermissions] = useState<string[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [clickedGroup, setClickedGroup] = useState<string | null>(null);
    const { openInTab } = useTabNavigation();
    
    useEffect(() => {
        const loadUserPermissions = () => {
            try {
                // Kiểm tra URL parameters trước
                const urlParams = new URLSearchParams(window.location.search);
                const manv = urlParams.get('manv');
                const chucVu = urlParams.get('ChucVu');
                
                // Nếu có URL parameters, sử dụng thông tin từ đó
                if (manv && chucVu) {
                    const tempUserData = {
                        manv: manv,
                        ChucVu: chucVu,
                        username: manv,
                        'Phân quyền': chucVu, // Sử dụng ChucVu làm phân quyền
                        'Quyền View': 'Cá nhân,Tạo phiếu chi,Lịch sử thu chi,Lịch sử chấm công,Thống kê sản phẩm kéo,Thống kê sản phẩm hạn' // Quyền mặc định cho personal access
                    };
                    
                    // Lưu vào localStorage để các component khác có thể sử dụng
                    localStorage.setItem('tempUserData', JSON.stringify(tempUserData));
                    
                    setIsAdmin(chucVu === 'Admin');
                    
                    // Set permissions dựa trên chức vụ từ URL
                    const permissionList = tempUserData['Quyền View'].split(',')
                        .map((item: string) => item.trim())
                        .filter(Boolean);
                    setUserPermissions(permissionList);
                } else {
                    // Sử dụng userData từ localStorage hoặc tempUserData (đăng nhập thông thường)
                    const userData = authUtils.getUserDataFromUrlOrStorage();
                    if (userData) {
                        const permissions = userData['Quyền View'] || '';
                        const userRole = userData['Phân quyền'] || userData['Chức vụ'] || '';
                        
                        setIsAdmin(userRole === 'Admin');
                        
                        if (userRole === 'Admin') {
                            // Admin có quyền xem tất cả
                            const allItems = getAllNavigationItems(navigation);
                            setUserPermissions(allItems.map(item => item.name));
                        } else {
                            // Người dùng khác chỉ xem theo quyền được cấp
                            const permissionList = permissions.split(',')
                                .map((item: string) => item.trim())
                                .filter(Boolean);
                            setUserPermissions(permissionList);
                        }
                    } else {
                        // Nếu không có userData, set permissions rỗng
                        setUserPermissions([]);
                        setIsAdmin(false);
                    }
                }
            } catch (error) {
                console.error('Error loading user permissions:', error);
                setUserPermissions([]);
                setIsAdmin(false);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserPermissions();
    }, []);

    // Auto-expand groups that contain active item
    useEffect(() => {
        const activeGroup = navigation.find(item => 
            item.isGroup && item.children?.some(child => child.href === pathname)
        );
        
        if (activeGroup && !collapsed) {
            setExpandedGroups(prev => new Set([...prev, activeGroup.name]));
        }
    }, [pathname, collapsed]);

    // Đóng tooltip khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (clickedGroup && !(event.target as Element).closest('.sidebar-group-tooltip')) {
                setClickedGroup(null);
            }
        };

        if (clickedGroup) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [clickedGroup]);

    // Hàm lấy tất cả items (bao gồm cả children)
    const getAllNavigationItems = (items: NavigationItem[]): NavigationItem[] => {
        const allItems: NavigationItem[] = [];
        items.forEach(item => {
            if (!item.isGroup) {
                allItems.push(item);
            }
            if (item.children) {
                allItems.push(...getAllNavigationItems(item.children));
            }
        });
        return allItems;
    };

    // Hàm kiểm tra user có quyền xem item không
    const hasPermission = (item: NavigationItem): boolean => {
        if (isAdmin) return true;
        if (!item.name) return false;
        
        // Kiểm tra phân quyền theo chức vụ cho Group Cá nhân
        if (item.allowedRoles && item.allowedRoles.length > 0) {
            // Kiểm tra URL parameters trước
            const urlParams = new URLSearchParams(window.location.search);
            const chucVu = urlParams.get('ChucVu');
            
            if (chucVu) {
                // Nếu có URL parameters, sử dụng chức vụ từ đó
                return item.allowedRoles.includes(chucVu);
            } else {
                // Nếu không có, sử dụng userData từ localStorage hoặc tempUserData
                const userData = authUtils.getUserDataFromUrlOrStorage();
                const userRole = userData?.['Chức vụ'] || userData?.['Phân quyền'] || '';
                return item.allowedRoles.includes(userRole);
            }
        }
        
        // Kiểm tra phân quyền theo tên menu (cho các menu khác)
        return userPermissions.includes(item.name);
    };

    // Lọc navigation items
    const filterNavigationItems = (items: NavigationItem[]): NavigationItem[] => {
        if (isLoading) return [];
        
        return items
            .filter(item => {
                if (!item.sidebar) return false;
                
                if (item.isGroup && item.children) {
                    // Kiểm tra xem group có children được phép xem không
                    const filteredChildren = item.children.filter(child => 
                        child.sidebar && hasPermission(child)
                    );
                    return filteredChildren.length > 0;
                }
                
                return hasPermission(item);
            })
            .map(item => {
                if (item.isGroup && item.children) {
                    return {
                        ...item,
                        children: item.children.filter(child => 
                            child.sidebar && hasPermission(child)
                        )
                    };
                }
                return item;
            });
    };

    const sidebarItems = filterNavigationItems(navigation);

    const toggleGroup = (groupName: string, event?: React.MouseEvent) => {
        if (collapsed) {
            // Khi collapsed, toggle tooltip hiển thị và tính toán vị trí
            if (event) {
                const button = event.currentTarget as HTMLElement;
                const rect = button.getBoundingClientRect();
                const top = rect.top + rect.height / 2;
                
                // Lưu vị trí vào item để sử dụng trong tooltip
                const item = navigation.find(nav => nav.name === groupName);
                if (item) {
                    (item as any)._tooltipTop = `${top}px`;
                }
            }
            setClickedGroup(prev => prev === groupName ? null : groupName);
        } else {
            // Khi không collapsed, toggle expand/collapse như bình thường
            setExpandedGroups(prev => {
                const newExpanded = new Set(prev);
                if (newExpanded.has(groupName)) {
                    newExpanded.delete(groupName);
                } else {
                    newExpanded.add(groupName);
                }
                return newExpanded;
            });
            // Đóng tooltip khi mở rộng sidebar
            setClickedGroup(null);
        }
    };

    // Component để render link (internal hoặc external)
    const LinkComponent = ({ item, children, className: linkClassName, ...props }: {
        item: NavigationItem;
        children: React.ReactNode;
        className?: string;
        onClick?: () => void;
        title?: string;
    }) => {
        // Kiểm tra nếu là personal route và có URL parameters
        const isPersonalRoute = item.href?.startsWith('/personal');
        let finalHref = item.href || '#';
        
        if (isPersonalRoute) {
            // Lấy URL parameters từ localStorage hoặc current URL
            const urlParams = new URLSearchParams(window.location.search);
            const manv = urlParams.get('manv');
            const chucVu = urlParams.get('ChucVu');
            
            // Nếu không có trong URL, thử lấy từ localStorage
            if (!manv || !chucVu) {
                const tempUserData = localStorage.getItem('tempUserData');
                if (tempUserData) {
                    try {
                        const userData = JSON.parse(tempUserData);
                        if (userData.manv && userData.ChucVu) {
                            const params = new URLSearchParams();
                            params.set('manv', userData.manv);
                            params.set('ChucVu', userData.ChucVu);
                            finalHref = `${item.href}?${params.toString()}`;
                        }
                    } catch (error) {
                        console.error('Error parsing tempUserData:', error);
                    }
                }
            } else {
                // Nếu có trong URL, thêm vào link
                const params = new URLSearchParams();
                params.set('manv', manv);
                params.set('ChucVu', chucVu);
                finalHref = `${item.href}?${params.toString()}`;
            }
        }
        
        if (item.isExternal) {
            return (
                <a
                    href={finalHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClassName}
                    {...props}
                >
                    {children}
                </a>
            );
        }
        
        // Sử dụng tab navigation cho các link nội bộ
        const handleClick = (e: React.MouseEvent) => {
            e.preventDefault();
            if (props.onClick) {
                props.onClick();
            }
            openInTab(item);
        };
        
        return (
            <button
                onClick={handleClick}
                className={linkClassName}
                title={props.title}
            >
                {children}
            </button>
        );
    };

    const renderNavigationItem = (item: NavigationItem, level = 0) => {
        if (!item.icon) return null;
        
        const Icon = item.icon;
        
        if (item.isGroup && item.children && item.children.length > 0) {
            const isExpanded = expandedGroups.has(item.name);
            const showChildren = !collapsed && isExpanded;
            const hasActiveChild = item.children.some(child => 
                child.href === pathname || (child.isExternal && false) // External links không có active state
            );
            
            return (
                <div key={item.name} className="relative">
                    {/* Group Header */}
                    <button
                        onClick={(e) => toggleGroup(item.name, e)}
                        className={cn(
                            "w-full flex items-center rounded-lg text-sm font-medium transition-all duration-200 ease-in-out group relative",
                            collapsed ? "px-2 py-2 justify-center" : "px-3 py-2 space-x-3",
                            hasActiveChild 
                                ? "bg-primary/10 text-primary" 
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                            collapsed && "cursor-pointer"
                        )}
                        title={collapsed ? item.name : undefined}
                    >
                        <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                            <Icon className={cn(
                                "h-4 w-4 transition-colors duration-200",
                                hasActiveChild ? "text-primary" : ""
                            )} />
                        </div>
                        
                        {!collapsed && (
                            <>
                                <span className="flex-1 text-left whitespace-nowrap">
                                    {item.name}
                                </span>
                                <div className="flex-shrink-0">
                                    {isExpanded ? (
                                        <ChevronDown className="h-3 w-3 transition-transform duration-200" />
                                    ) : (
                                        <ChevronRight className="h-3 w-3 transition-transform duration-200" />
                                    )}
                                </div>
                            </>
                        )}
                    </button>

                    {/* Group Children */}
                    {showChildren && (
                        <div className="ml-4 space-y-1 mt-1 animate-in slide-in-from-top-1 duration-200">
                            {item.children.map(child => renderNavigationItem(child, level + 1))}
                        </div>
                    )}

                    {/* Tooltip for collapsed group */}
                    {collapsed && (
                        <>
                            {/* Hover tooltip */}
                            <div 
                                data-tooltip={item.name}
                                className={cn(
                                    "sidebar-group-tooltip absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg border border-border transition-all duration-300 z-[9999] shadow-xl min-w-max max-w-xs pointer-events-none",
                                    "opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto"
                                )}
                            >
                                <div className="font-medium mb-2 text-foreground">{item.name}</div>
                                {item.children && item.children.length > 0 && (
                                    <div className="space-y-1">
                                        {item.children.map(child => (
                                            <div
                                                key={child.name}
                                                className="flex items-center text-xs py-1 px-2 rounded hover:bg-accent transition-colors cursor-pointer pointer-events-auto text-muted-foreground"
                                            >
                                                <child.icon className="h-3 w-3 mr-2 flex-shrink-0 text-muted-foreground" />
                                                <span className="flex-1">{child.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-popover"></div>
                            </div>

                            {/* Click tooltip with Portal */}
                            {clickedGroup === item.name && typeof window !== 'undefined' && createPortal(
                                <div 
                                    className="sidebar-group-tooltip fixed left-16 ml-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg border border-border transition-all duration-300 z-[99999] shadow-xl min-w-max max-w-xs pointer-events-auto"
                                    style={{
                                        top: `${(item as any)._tooltipTop || '50%'}`,
                                        transform: 'translateY(-50%)'
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-medium text-foreground">{item.name}</div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setClickedGroup(null);
                                            }}
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                    {item.children && item.children.length > 0 && (
                                        <div className="space-y-1">
                                            {item.children.map(child => (
                                                <LinkComponent
                                                    key={child.name}
                                                    item={child}
                                                    onClick={onMobileClose}
                                                    className={cn(
                                                        "flex items-center text-xs py-1 px-2 rounded transition-colors cursor-pointer pointer-events-auto",
                                                        pathname === child.href && !child.isExternal
                                                            ? "bg-primary text-primary-foreground" 
                                                            : "text-muted-foreground hover:bg-accent"
                                                    )}
                                                >
                                                    <child.icon className={cn(
                                                        "h-3 w-3 mr-2 flex-shrink-0",
                                                        pathname === child.href && !child.isExternal
                                                            ? "text-primary-foreground" 
                                                            : "text-muted-foreground"
                                                    )} />
                                                    <span className="flex-1">{child.name}</span>
                                                    <div className="flex items-center space-x-1">
                                                        {child.badge && (
                                                            <span className="px-1.5 py-0.5 text-xs bg-destructive text-destructive-foreground rounded-full">
                                                                {child.badge}
                                                            </span>
                                                        )}
                                                        {child.isExternal && (
                                                            <ExternalLink className="h-2.5 w-2.5 flex-shrink-0 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                </LinkComponent>
                                            ))}
                                        </div>
                                    )}
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-popover"></div>
                                </div>,
                                document.body
                            )}
                        </>
                    )}
                </div>
            );
        }

        // Regular menu item
        if (!item.href) return null;
        
        // Kiểm tra active state dựa trên pathname hoặc tab đang active
        const isActive = pathname === item.href && !item.isExternal;
        
        return (
            <div key={item.name} className="relative">
                <LinkComponent
                    item={item}
                    onClick={onMobileClose}
                    className={cn(
                        "flex items-center rounded-lg text-sm font-medium transition-all duration-200 ease-in-out group relative",
                        collapsed ? "px-2 py-2 justify-center" : "px-3 py-2 space-x-3",
                        level > 0 && !collapsed ? "ml-2 pl-4" : "", // Tăng padding cho sub-items
                        isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    title={collapsed ? item.name : undefined}
                >
                    <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                        <Icon className={cn(
                            "h-4 w-4 transition-colors duration-200",
                            isActive ? "text-primary-foreground" : ""
                        )} />
                    </div>
                    
                    {!collapsed && (
                        <div className="flex-1 flex items-center justify-between">
                            <span className="whitespace-nowrap">
                                {item.name}
                            </span>
                            <div className="flex items-center space-x-1">
                                {item.badge && (
                                    <span className={cn(
                                        "px-1.5 py-0.5 text-xs rounded-full",
                                        isActive 
                                            ? "bg-primary-foreground text-primary" 
                                            : "bg-destructive text-destructive-foreground"
                                    )}>
                                        {item.badge}
                                    </span>
                                )}
                                {item.isExternal && (
                                    <ExternalLink className={cn(
                                        "h-3 w-3 flex-shrink-0",
                                        isActive ? "text-primary-foreground" : "text-muted-foreground"
                                    )} />
                                )}
                            </div>
                        </div>
                    )}
                </LinkComponent>

                {/* Tooltip for collapsed item */}
                {collapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg border border-border whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] pointer-events-none shadow-xl">
                        <div className="flex items-center">
                            <span className="text-foreground">{item.name}</span>
                            <div className="flex items-center ml-2 space-x-1">
                                {item.badge && (
                                    <span className="px-1.5 py-0.5 text-xs bg-destructive text-destructive-foreground rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                                {item.isExternal && (
                                    <ExternalLink className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                                )}
                            </div>
                        </div>
                        {item.description && (
                            <div className="mt-1 text-xs text-muted-foreground">
                                {item.description}
                            </div>
                        )}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-white"></div>
                    </div>
                )}
            </div>
        );
    };

    // Loading state
    if (isLoading) {
        return (
            <div
                className={cn(
                    "fixed top-16 left-0 bottom-0 z-30 flex flex-col bg-background border-r border-border shadow-sm transition-all duration-300 ease-in-out",
                    collapsed ? "w-16" : "w-64",
                    mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                    className
                )}
            >
                <div className="p-4 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={onMobileClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    "fixed top-16 left-0 bottom-0 z-40 flex flex-col bg-background border-r border-border shadow-sm transition-all duration-300 ease-in-out",
                    collapsed ? "w-16" : "w-64",
                    mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                    className
                )}
            >
                {/* Mobile close button */}
                <div className="lg:hidden absolute top-4 right-4 z-40">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onMobileClose}
                        className="h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className={cn(
                    "flex-1 p-4 space-y-1",
                    "overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                )}>
                    {sidebarItems.length > 0 ? (
                        sidebarItems.map(item => renderNavigationItem(item))
                    ) : (
                        <div className="text-center text-muted-foreground text-sm py-8">
                            {collapsed ? (
                                <div className="flex justify-center">
                                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                                        <X className="h-4 w-4" />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="text-muted-foreground mb-2">Không có menu</div>
                                    <div className="text-xs text-muted-foreground">
                                        Bạn chưa được cấp quyền truy cập
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </nav>
            </div>
        </>
    );
}