import {
    Users,
    Settings,
    Database,
    BarChart3,
    TrendingUp,
    Home,
    Calculator,
    FileBarChart,
    UserCog,
    Warehouse,
    CreditCard,
    Plus,
    ImageIcon,
    Upload,
    TrendingDown,
    Banknote,
    AppWindow,
    ExternalLink,
    PieChart,
    Package,
    Clock,
    LineChart,
    DollarSign,
    Building2,
    Receipt,
    Target,
    Zap,
    User,
    History,
    FileText,
    Shield,
    ChartBar,
    BarChart,
    ClipboardList,
    CheckSquare,
    Globe,
    BookOpen
} from 'lucide-react';

export interface NavigationItem {
    name: string;
    href?: string;
    icon: React.ElementType;
    dashboard: boolean;
    sidebar: boolean;
    color?: string;
    group?: string;
    children?: NavigationItem[];
    isGroup?: boolean;
    badge?: string;
    description?: string;
    isExternal?: boolean; // Thêm thuộc tính để phân biệt link ngoài
    allowedRoles?: string[]; // Thêm thuộc tính để phân quyền theo chức vụ
}

export const navigation: NavigationItem[] = [
    {
        name: 'Trang chủ',
        href: '/dashboard',
        icon: Home,
        dashboard: false,
        sidebar: true,
        color: '#3B82F6',
        description: 'Tổng quan hệ thống CRM'
    },
    {
        name: 'Giới thiệu',
        href: '/intro',
        icon: Globe,
        dashboard: false,
        sidebar: false,
        color: '#3B82F6',
        description: 'Giới thiệu về hệ thống GoalKho',
        isExternal: true
    },
    {
        name: 'Hướng dẫn',
        href: '/guide',
        icon: BookOpen,
        dashboard: false,
        sidebar: false,
        color: '#10B981',
        description: 'Hướng dẫn sử dụng hệ thống',
        isExternal: true
    },

    // Group: Quản lý kho hàng
    {
        name: 'Quản lý kho hàng',
        icon: Building2,
        dashboard: true,
        sidebar: true,
        isGroup: true,
        children: [
            {
                name: 'Quản lý kho',
                href: '/kho',
                icon: Warehouse,
                dashboard: true,
                sidebar: true,
                color: '#10B981',
                description: 'Quản lý thông tin kho hàng'
            },
            {
                name: 'Danh mục hàng hóa',
                href: '/kho/danh-muc-hang-hoa',
                icon: Package,
                dashboard: true,
                sidebar: true,
                color: '#10B981',
                description: 'Tạo và quản lý danh mục hàng hóa'
            }
        ]
    },

    // Group: Xuất nhập kho
    {
        name: 'Xuất nhập kho',
        icon: TrendingUp,
        dashboard: true,
        sidebar: true,
        isGroup: true,
        children: [
            {
                name: 'Tạo phiếu xuất nhập',
                href: '/kho/xuat-nhap-kho',
                icon: Receipt,
                dashboard: true,
                sidebar: true,
                color: '#06B6D4',
                description: 'Tạo và quản lý phiếu xuất nhập kho'
            },
            {
                name: 'Duyệt phiếu',
                href: '/kho/duyet-phieu',
                icon: Shield,
                dashboard: true,
                sidebar: true,
                color: '#8B5CF6',
                description: 'Duyệt và quản lý phiếu xuất nhập kho',
                allowedRoles: ['Admin', 'Quản lý', 'Thủ kho']
            }
        ]
    },

    // Group: Kiểm kê kho
    {
        name: 'Kiểm kê kho',
        icon: ClipboardList,
        dashboard: true,
        sidebar: true,
        isGroup: true,
        children: [
            {
                name: 'Thực hiện kiểm kê',
                href: '/kiemke',
                icon: CheckSquare,
                dashboard: true,
                sidebar: true,
                color: '#F59E0B',
                description: 'Kiểm kê số lượng tồn kho thực tế',
                allowedRoles: ['Admin', 'Quản lý']
            },
            {
                name: 'Lịch sử kiểm kê',
                href: '/kiemke/lich-su',
                icon: History,
                dashboard: true,
                sidebar: true,
                color: '#8B5CF6',
                description: 'Xem lịch sử các phiên kiểm kê đã thực hiện',
                allowedRoles: ['Admin', 'Quản lý']
            }
        ]
    },

    // Group: Báo cáo & Thống kê
    {
        name: 'Báo cáo & Thống kê',
        icon: BarChart3,
        dashboard: true,
        sidebar: true,
        isGroup: true,
        children: [
            {
                name: 'Báo cáo kho',
                href: '/kho/bao-cao-kho',
                icon: ChartBar,
                dashboard: true,
                sidebar: true,
                color: '#F59E0B',
                description: 'Báo cáo tổng quan tồn kho, xuất nhập trong kỳ'
            }
        ]
    },

    // Group: Nhân sự
    {
        name: 'Nhân sự',
        icon: UserCog,
        dashboard: true,
        sidebar: true,
        isGroup: true,
        children: [
            {
                name: 'Quản lý nhân viên',
                href: '/nhanvien',
                icon: Users,
                dashboard: true,
                sidebar: true,
                color: '#EF4444',
                description: 'Quản lý thông tin nhân viên'
            }
        ]
    },

    // Group: Hệ thống
    {
        name: 'Hệ thống',
        icon: Settings,
        dashboard: true,
        sidebar: true,
        isGroup: true,
        allowedRoles: ['Admin', 'Quản lý'],
        children: [
            {
                name: 'Cài đặt',
                href: '/settings',
                icon: Settings,
                dashboard: true,
                sidebar: true,
                color: '#6B7280',
                description: 'Cài đặt thông báo và giao diện hệ thống',
                allowedRoles: ['Admin', 'Quản lý']
            }
        ]
    }
];

// Helper functions (giữ nguyên)
export const getNavigationByGroup = (groupName: string): NavigationItem[] => {
    const group = navigation.find(item => item.name === groupName && item.isGroup);
    return group?.children || [];
};

export const getDashboardItems = (): NavigationItem[] => {
    const dashboardItems: NavigationItem[] = [];
    navigation.forEach(item => {
        if (item.isGroup && item.children) {
            item.children.forEach(child => {
                if (child.dashboard) {
                    dashboardItems.push(child);
                }
            });
        } else if (item.dashboard) {
            dashboardItems.push(item);
        }
    });
    return dashboardItems;
};

export const getSidebarItems = (): NavigationItem[] => {
    return navigation.filter(item => item.sidebar);
};