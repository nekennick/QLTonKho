'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import authUtils from '@/utils/authUtils';
import { Header } from '@/components/ui/header';
import { Sidebar } from '@/components/ui/sidebar';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
// import { RouteProgress } from '@/components/ui/route-progress'; // Đã bỏ loading
import { SettingsProvider } from '@/context/SettingsContext';
import { TabProvider } from '@/context/TabContext';
import { TabDataProvider } from '@/context/TabDataContext';
import { TabBar, TabContent } from '@/components/ui/tab-browser';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      // Kiểm tra nếu là personal route và có URL parameters
      if (pathname.startsWith('/personal')) {
        const urlParams = new URLSearchParams(window.location.search);
        const manv = urlParams.get('manv');
        const chucVu = urlParams.get('ChucVu');
        
        // Debug log cho 3 trang có vấn đề
        if (pathname.includes('lich-su-cham-cong') || pathname.includes('thong-ke-san-pham-han') || pathname.includes('thong-ke-san-pham-keo')) {
        }
        
        if (manv && chucVu) {
          // Tạo tempUserData và lưu vào localStorage
          const tempUserData = {
            manv: manv,
            ChucVu: chucVu,
            username: manv,
          };
          localStorage.setItem('tempUserData', JSON.stringify(tempUserData));
          setUserData(tempUserData);
          
          // Cho phép truy cập personal routes với URL parameters
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        } else {
          // Kiểm tra xem có tempUserData trong localStorage không
          const tempUserData = localStorage.getItem('tempUserData');
          if (tempUserData) {
            try {
              const userData = JSON.parse(tempUserData);
              if (userData.manv && userData.ChucVu) {
                setUserData(userData);
                setIsAuthenticated(true);
                setIsLoading(false);
                return;
              }
            } catch (error) {
              console.error('Error parsing tempUserData:', error);
            }
          }
        }
      }
      
      if (!authUtils.isAuthenticated(pathname)) {
        const loginUrl = new URL('/', window.location.origin);
        loginUrl.searchParams.set('returnUrl', pathname);
        router.push(loginUrl.toString());
        return;
      }
      
      // Lấy userData từ localStorage
      const storedUserData = authUtils.getUserDataFromUrlOrStorage();
      setUserData(storedUserData);
      setIsAuthenticated(true);
      setIsLoading(false);
    };

    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router, pathname]);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  // Bỏ loading state để hiển thị ngay lập tức
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
  //     </div>
  //   );
  // }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SettingsProvider>
      <TabProvider>
        <TabDataProvider>
          <div className="min-h-screen overflow-hidden">
          <Header 
            onToggleSidebar={handleToggleSidebar}
            sidebarCollapsed={sidebarCollapsed}
            onMobileMenuToggle={handleMobileMenuToggle}
            userData={userData}
          />
          {/* Thanh tiến độ đã bỏ để tăng tốc độ */}
          
          <Sidebar 
            collapsed={sidebarCollapsed}
            mobileOpen={mobileMenuOpen}
            onMobileClose={handleMobileMenuClose}
          />
          <div 
            className={cn(
              "pt-16 transition-all duration-300 ease-in-out",
              sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
            )}
            style={{ height: '100vh', overflow: 'hidden' }}
          >
            {/* Tab Bar */}
            <TabBar />
            
            <main 
              className="h-full overflow-auto"
              style={{ 
                height: isMobile 
                  ? 'calc(100vh - 64px)' 
                  : 'calc(100vh - 64px - 40px)' 
              }}
              data-scroll-container
            >
              <TabContent className="p-6">
                {children}
              </TabContent>
            </main>
          </div>
          
          <ScrollToTop />
          </div>
        </TabDataProvider>
      </TabProvider>
    </SettingsProvider>
  );
}