'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import authUtils from '@/utils/authUtils';
import { navigation, NavigationItem } from '@/lib/navigation';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  Clock,
  Search,
  Star,
  Grid3X3,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GroupedNavigationItem extends NavigationItem {
  children: NavigationItem[];
}

type ViewMode = 'grid';

const DashboardPage = () => {
  usePageTitle('Dashboard');
  
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [favoriteApps, setFavoriteApps] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      if (!authUtils.isAuthenticated()) {
        router.push('/login?returnUrl=/dashboard');
        return;
      }

      const user = authUtils.getUserData();
      if (user) {
        setUserData(user);
        const permissions = user['Quyền View'] || '';
        const userRole = user['Phân quyền'] || '';

        setIsAdmin(userRole === 'Admin');

        if (userRole === 'Admin') {
          const allItems = getAllNavigationItems(navigation);
          setUserPermissions(allItems.map(nav => nav.name));
        } else {
          const permissionList = permissions.split(',')
            .map((item: string) => item.trim())
            .filter(Boolean);
          setUserPermissions(permissionList);
        }

        const savedFavorites = localStorage.getItem(`favorites_${user.id || user.email}`);
        if (savedFavorites) {
          setFavoriteApps(JSON.parse(savedFavorites));
        }

        const savedViewMode = localStorage.getItem(`view_mode_${user.id || user.email}`);
        if (savedViewMode) {
          setViewMode(savedViewMode as ViewMode);
        } else {
          // Set default view mode
          setViewMode('grid');
        }
      }

      setLoading(false);
    };

    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  const getAllNavigationItems = (items: NavigationItem[]): NavigationItem[] => {
    const allItems: NavigationItem[] = [];
    items.forEach(item => {
      if (!item.isGroup) {
        allItems.push(item);
      }
      if (item.children) {
        allItems.push(...item.children);
      }
    });
    return allItems;
  };

  // Lấy tất cả items dạng flat (cho list và table view)
  const getAllFlatItems = useMemo(() => {
    const flatItems: (NavigationItem & { groupName?: string })[] = [];

    navigation.forEach(item => {
      if (item.isGroup && item.children) {
        item.children.forEach(child => {
          if (child.dashboard && (isAdmin || userPermissions.includes(child.name))) {
            flatItems.push({
              ...child,
              groupName: item.name
            });
          }
        });
      } else if (item.dashboard && !item.isGroup && (isAdmin || userPermissions.includes(item.name))) {
        flatItems.push({
          ...item,
          groupName: 'Trang chủ'
        });
      }
    });

    return flatItems;
  }, [isAdmin, userPermissions]);

  // Lấy grouped data (cho group view)
  const getGroupedNavigationData = useMemo(() => {
    const groupedData: { singleItems: NavigationItem[], groups: GroupedNavigationItem[] } = {
      singleItems: [],
      groups: []
    };

    navigation.forEach(item => {
      if (item.isGroup && item.children) {
        const filteredChildren = item.children.filter(child =>
          child.dashboard && (isAdmin || userPermissions.includes(child.name))
        );

        if (filteredChildren.length > 0) {
          groupedData.groups.push({
            ...item,
            children: filteredChildren
          });
        }
      } else if (item.dashboard && !item.isGroup && (isAdmin || userPermissions.includes(item.name))) {
        groupedData.singleItems.push(item);
      }
    });

    return groupedData;
  }, [isAdmin, userPermissions]);

  // Filter data based on search and favorites
  const getFilteredData = () => {
    const { singleItems, groups } = getGroupedNavigationData;

    // Grid view - show only selected group or all items
    if (selectedGroup) {
      const selectedGroupData = groups.find(group => group.name === selectedGroup);
      if (selectedGroupData) {
        let filteredChildren = selectedGroupData.children;
        
        if (showOnlyFavorites) {
          filteredChildren = filteredChildren.filter(child => favoriteApps.includes(child.name));
        }
        
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          filteredChildren = filteredChildren.filter(child =>
            child.name.toLowerCase().includes(searchLower) ||
            (child.description && child.description.toLowerCase().includes(searchLower))
          );
        }
        
        return { type: 'single-group', data: { group: selectedGroupData, children: filteredChildren } };
      }
    }
    
    // Show all items in flat list
    let allItems = [...singleItems];
    groups.forEach(group => {
      allItems = allItems.concat(group.children);
    });
    
    if (showOnlyFavorites) {
      allItems = allItems.filter(item => favoriteApps.includes(item.name));
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      allItems = allItems.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        (item.description && item.description.toLowerCase().includes(searchLower))
      );
    }
    
    return { type: 'flat', data: allItems };
  };


  const toggleFavorite = (itemName: string) => {
    const newFavorites = favoriteApps.includes(itemName)
      ? favoriteApps.filter(name => name !== itemName)
      : [...favoriteApps, itemName];

    setFavoriteApps(newFavorites);

    if (userData) {
      localStorage.setItem(`favorites_${userData.id || userData.email}`, JSON.stringify(newFavorites));
    }
  };

  const setViewModeAndSave = (mode: ViewMode) => {
    setViewMode(mode);
    if (userData) {
      localStorage.setItem(`view_mode_${userData.id || userData.email}`, mode);
    }
    // Close mobile filters when changing view mode
    setShowMobileFilters(false);
  };

  // Render functions
  // Render App Card
  const renderAppCard = (item: NavigationItem, isFavorite = false) => {
    const Icon = item.icon;

    const cardClasses =
      "w-full flex flex-col items-center p-2 sm:p-3 bg-white rounded-lg border border-gray-200 md:hover:shadow-md transition-all duration-200 min-h-[80px] sm:min-h-[90px]";

    const cardContent = (
      <>
        <div
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-1 sm:mb-2 md:group-hover:scale-105 transition-transform relative"
          style={{ backgroundColor: item.color || '#6B7280' }}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          {item.badge && (
            <span className="absolute -top-1 -right-1 px-1 py-0.5 text-xs bg-red-500 text-white rounded-full min-w-[16px] text-center">
              {item.badge}
            </span>
          )}
          {item.isExternal && (
            <ExternalLink className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 text-white bg-gray-600 rounded-full p-0.5" />
          )}
        </div>
        <span className="text-[10px] sm:text-xs font-medium text-gray-700 text-center leading-tight px-1">
          {item.name}
        </span>
      </>
    );

    const renderCardBody = () => {
      if (!item.href) {
        return (
          <div className={`${cardClasses} cursor-default`}>
            {cardContent}
          </div>
        );
      }

      if (item.isExternal) {
        return (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${cardClasses} cursor-pointer`}
          >
            {cardContent}
          </a>
        );
      }

      return (
        <Link
          href={item.href}
          className={`${cardClasses} cursor-pointer`}
        >
          {cardContent}
        </Link>
      );
    };

    return (
      <div key={`${item.name}-${item.href}`} className="relative group">
        {renderCardBody()}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(item.name);
          }}
          className={cn(
            "absolute top-1 right-1 p-1 rounded transition-all opacity-0 md:group-hover:opacity-100 sm:opacity-0 md:group-hover:pointer-events-auto pointer-events-none",
            isFavorite && "opacity-100",
            isFavorite
              ? "text-yellow-500"
              : "text-gray-400 hover:text-yellow-500"
          )}
        >
          <Star className={cn("w-3 h-3", isFavorite && "fill-current")} />
        </button>
      </div>
    );
  };


  if (loading) {
    return (
      <div className="h-[calc(100vh-2rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredData = getFilteredData();
  const totalApps = (() => {
    if (filteredData.type === 'single-group' && typeof filteredData.data === 'object' && 'children' in filteredData.data) {
      return filteredData.data.children?.length || 0;
    } else if (filteredData.type === 'flat' && Array.isArray(filteredData.data)) {
      return filteredData.data.length;
    }
    return 0;
  })();

  // Debug log
  console.log('Debug Dashboard:', {
    viewMode,
    filteredData,
    totalApps,
    isAdmin,
    userPermissions,
    getGroupedNavigationData
  });

  return (
    <div className="p-0 sm:p-2 lg:p-3 space-y-4 sm:space-y-6">
      {/* Header and Controls */}
      <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        <div>
      
          <p className="text-sm text-gray-500">
            {totalApps} ứng dụng
            {!isAdmin && (
              <span className="ml-2 text-xs text-blue-600">
                (theo quyền của bạn)
              </span>
            )}
          </p>
        </div>

        {/* Desktop Controls */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-48"
            />
          </div>

          {/* Favorite Filter */}
          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              showOnlyFavorites
                ? "bg-yellow-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            )}
            title="Chỉ hiện yêu thích"
          >
            <Star className={cn("w-4 h-4", showOnlyFavorites && "fill-current")} />
          </button>

        </div>

        {/* Mobile Controls */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 mr-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
              />
            </div>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {showMobileFilters ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

          {/* Mobile Filter Panel */}
          {showMobileFilters && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Chỉ hiện yêu thích</span>
                <button
                  onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    showOnlyFavorites
                      ? "bg-yellow-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Star className={cn("w-4 h-4", showOnlyFavorites && "fill-current")} />
                </button>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {totalApps > 0 ? (
        <div>
          {/* Grid View */}
          <div className="flex flex-col lg:flex-row gap-6">
              {/* Sidebar - Group Selection */}
              <div className="hidden lg:block lg:w-64 flex-shrink-0">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Chọn nhóm</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:space-y-2 lg:gap-0">
                    <button
                      onClick={() => setSelectedGroup(null)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedGroup === null
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-lg bg-gray-600 flex items-center justify-center flex-shrink-0">
                          <Grid3X3 className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-medium truncate">Tất cả</span>
                      </div>
                    </button>
                    
                    {getGroupedNavigationData.groups.map(group => (
                      <button
                        key={group.name}
                        onClick={() => setSelectedGroup(group.name)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedGroup === group.name
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: group.color || '#6B7280' }}
                          >
                            <group.icon className="w-3 h-3 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium block truncate">{group.name}</span>
                            <span className="text-xs text-gray-500 hidden lg:block">{group.children.length} ứng dụng</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1">
                {filteredData.type === 'single-group' && typeof filteredData.data === 'object' && 'group' in filteredData.data && 'children' in filteredData.data && (
                  <div>
                    <div className="flex items-center space-x-3 mb-6">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: filteredData.data.group?.color || '#6B7280' }}
                      >
                        {filteredData.data.group?.icon && (() => {
                          const IconComponent = filteredData.data.group.icon;
                          return <IconComponent className="w-4 h-4 text-white" />;
                        })()}
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">{filteredData.data.group?.name}</h2>
                      <span className="text-sm text-gray-500">({filteredData.data.children?.length || 0} ứng dụng)</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3">
                      {filteredData.data.children?.map(item => renderAppCard(item, favoriteApps.includes(item.name)))}
                    </div>
            </div>
          )}

                {filteredData.type === 'flat' && Array.isArray(filteredData.data) && (
                  <div>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 rounded-lg bg-gray-600 flex items-center justify-center">
                        <Grid3X3 className="w-4 h-4 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Tất cả ứng dụng</h2>
                      <span className="text-sm text-gray-500">({filteredData.data.length} ứng dụng)</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3">
                      {filteredData.data.map(item => renderAppCard(item, favoriteApps.includes(item.name)))}
                    </div>
                  </div>
                )}
              </div>
            </div>
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12">
          <div className="text-gray-400 mb-4">
            {searchTerm ? <Search className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" /> : <Clock className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />}
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            {searchTerm || showOnlyFavorites ? 'Không tìm thấy ứng dụng' : 'Không có ứng dụng nào'}
          </h3>
          <p className="text-gray-500 text-sm px-4">
            {searchTerm
              ? `Không có ứng dụng nào khớp với "${searchTerm}"`
              : showOnlyFavorites
                ? 'Bạn chưa có ứng dụng yêu thích nào'
                : 'Bạn chưa có quyền truy cập vào ứng dụng nào.'
            }
          </p>
          {(searchTerm || showOnlyFavorites) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setShowOnlyFavorites(false);
                setShowMobileFilters(false);
              }}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              Xem tất cả
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;