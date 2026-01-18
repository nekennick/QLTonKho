'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTabContext } from '@/context/TabContext';
import { useRouter, usePathname } from 'next/navigation';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Button } from '@/components/ui/button';
import { 
  X, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Home,
  Plus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export const TabBar: React.FC = () => {
  const { 
    tabs, 
    activeTabId, 
    setActiveTab, 
    closeTab, 
    closeAllTabs, 
    closeOtherTabs 
  } = useTabContext();
  const router = useRouter();
  const isMobile = useIsMobile();
  const pathname = usePathname();
  
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Tối ưu: Chỉ render TabBar trên PC (không render gì trên mobile)
  // Điều này giúp tăng hiệu năng trên mobile

  // Kiểm tra khả năng scroll
  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [tabs]);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleTabClick = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setActiveTab(tabId);
      router.push(tab.path);
    }
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    closeTab(tabId);
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollLeft(scrollContainerRef.current.scrollLeft);
      checkScrollability();
    }
  };

  // Handler cho home button
  const handleHomeClick = () => {
    router.push('/dashboard');
  };

  // Kiểm tra xem có đang ở trang dashboard không
  const isHomePage = pathname === '/dashboard';

  // ✅ Mobile Optimization: Chỉ hiển thị trên PC (≥1024px), ẩn hoàn toàn trên mobile
  // Tối ưu hiệu năng: không render các tab và logic scroll trên mobile
  if (isMobile) {
    return null;
  }

  // ✅ PC Only: Tab browser với đầy đủ tính năng
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm hidden lg:block">
      <div className="flex items-center h-10">
        {/* Home Button - Luôn hiển thị */}
        <div 
          className={cn(
            "flex items-center h-10 px-3 border-r border-gray-200 cursor-pointer transition-colors flex-shrink-0",
            isHomePage 
              ? "bg-blue-50 border-b-2 border-b-blue-500" 
              : "bg-white hover:bg-gray-50"
          )}
          onClick={handleHomeClick}
        >
          <Home className={cn(
            "h-4 w-4",
            isHomePage ? "text-blue-600" : "text-gray-600"
          )} />
        </div>

        {/* Scroll buttons */}
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-8 p-0 hover:bg-gray-100"
            onClick={() => scrollTabs('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Tab container */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 flex overflow-x-auto scrollbar-hide"
          onScroll={handleScroll}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div 
            ref={tabBarRef}
            className="flex min-w-max"
          >
            {tabs.length === 0 ? (
              <div className="flex items-center px-3 py-2 text-sm text-gray-500">
                <span>Chưa có tab nào. Click vào menu để mở trang mới.</span>
              </div>
            ) : (
              tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              
              return (
                <div
                  key={tab.id}
                  className={cn(
                    "flex items-center min-w-0 max-w-48 px-3 py-2 border-r border-gray-200 cursor-pointer group transition-colors",
                    isActive 
                      ? "tab-active border-b-2" 
                      : "bg-white tab-hover text-gray-700"
                  )}
                  onClick={() => handleTabClick(tab.id)}
                >
                  {/* Icon - tạm thời bỏ qua để tránh lỗi */}
                  {/* {tab.icon && (
                    <tab.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                  )} */}
                  
                  {/* Title */}
                  <span className="truncate text-sm font-medium flex-1">
                    {tab.title}
                  </span>
                  
                  {/* Close button */}
                  {tab.closable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-2 opacity-0 group-hover:opacity-100 tab-close flex-shrink-0"
                      onClick={(e) => handleCloseTab(e, tab.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              );
            })
            )}
          </div>
        </div>

        {/* Right scroll button */}
        {canScrollRight && (
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-8 p-0 hover:bg-gray-100"
            onClick={() => scrollTabs('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {/* Tab actions menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-8 p-0 hover:bg-gray-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.location.href = '/dashboard'}>
              <Home className="h-4 w-4 mr-2" />
              Về trang chủ
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => closeOtherTabs(activeTabId!)}>
              Đóng các tab khác
            </DropdownMenuItem>
            <DropdownMenuItem onClick={closeAllTabs}>
              Đóng tất cả tab
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
