import { navigation } from '@/lib/navigation';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
function extractRoutesFromNavigation(): string[] {
  const routes: string[] = [];
  
  navigation.forEach(item => {
    if (item.href && !item.isExternal) {
      routes.push(item.href);
    }
    
    if (item.children) {
      item.children.forEach(child => {
        if (child.href && !child.isExternal) {
          routes.push(child.href);
        }
      });
    }
  });
  
  return routes;
}
const navigationRoutes = extractRoutesFromNavigation();

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Các route công khai (không cần đăng nhập)
  const publicRoutes = [
    '/login',      // Trang login
    '/not-found',  // Trang 404
    '/intro',      // Trang giới thiệu
    '/guide'       // Trang hướng dẫn
  ];
  
  // Các route có thực trong hệ thống CRM
  const validRoutes = [
    // Trang chủ và auth
    '/',
    '/login',
    '/dashboard',
    '/not-found',
    '/intro',
    '/guide',
    '/profile',
    '/tool/luongbcgs',
    // Khách hàng
    '/customers',
    '/thongkesanpharm/tonghopbchn',
    '/leads',
    ...navigationRoutes,
    // Bán hàng
    '/opportunities',
    '/orders',
    '/invoices',
    '/thongkesanpharm/thongkehan',
    // Chăm sóc khách hàng
    '/cskh',
    '/appointments',
    '/campaigns',
    'tool/doi-ten-hinh-anh',
    // Hoạt động
    '/tasks',
    '/calendar',
    '/notes',
    
    // Sản phẩm
    '/products',
    '/pricing',
    
    // Báo cáo
    '/reports-dashboard',
    '/sales-reports',
    '/customer-reports',
    '/TraCuuTinh',
    // Nhóm
    '/team-members',
    '/team-performance',
    '/kyniem',
    // Cài đặt
    '/nhanvien',
    '/kho',
    '/kho/danh-muc-hang-hoa',
    '/kho/kiem-ton',
    '/kho/kiem-ton/lich-su',
    '/kho/xuat-nhap-kho',
    '/kho/duyet-phieu',
    '/kho/bao-cao-kho',
    '/permissions',
                // Cá nhân
            '/personal/tao-phieu-chi',
            '/personal/lich-su-thu-chi',
    '/personal/ca-nhan',
    '/personal/thong-ke-san-pham-keo',
    '/personal/thong-ke-san-pham-han',
    '/personal/lich-su-cham-cong'
  ];
  
  // Kiểm tra token trong cookie
  const authToken = request.cookies.get('authToken')?.value;
  
  // Kiểm tra route có tồn tại không (ngoại trừ static files)
  const isStaticFile = pathname.startsWith('/_next') || 
                      pathname.startsWith('/api') || 
                      pathname.includes('.');
  
  // Kiểm tra các route động (dynamic routes)
  const isDynamicRoute = 
    // Danh mục hàng hóa routes
    pathname.startsWith('/kho/danh-muc-hang-hoa/them-moi') ||
    pathname.startsWith('/kho/danh-muc-hang-hoa/chinh-sua/') ||
    // Nhân viên routes
    pathname.startsWith('/nhanvien/them-moi') ||
    pathname.startsWith('/nhanvien/chinh-sua/') ||
    // Personal routes
    pathname.startsWith('/personal');
  
  // Cho phép tất cả personal routes và dynamic routes (không cần kiểm tra validRoutes)
  if (!isStaticFile && !isDynamicRoute && !validRoutes.includes(pathname)) {
    return NextResponse.rewrite(new URL('/not-found', request.url));
  }
  
  // Redirect từ trang chủ đến trang intro
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/intro', request.url));
  }
  
  // Tự động bảo vệ tất cả route (trừ publicRoutes và static files)
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // Kiểm tra nếu là route personal và có tham số manv, ChucVu
  const isPersonalRoute = pathname.startsWith('/personal');
          const hasManv = request.nextUrl.searchParams.has('manv');
        const hasChucVu = request.nextUrl.searchParams.has('ChucVu');
        
        // Debug log cho 3 trang có vấn đề
        if (isPersonalRoute && (pathname.includes('lich-su-cham-cong') || pathname.includes('thong-ke-san-pham-han') || pathname.includes('thong-ke-san-pham-keo'))) {
          console.log('=== DEBUG MIDDLEWARE ===');
          console.log('Pathname:', pathname);
          console.log('hasManv:', hasManv);
          console.log('hasChucVu:', hasChucVu);
          console.log('authToken exists:', !!authToken);
          console.log('manv value:', request.nextUrl.searchParams.get('manv'));
          console.log('ChucVu value:', request.nextUrl.searchParams.get('ChucVu'));
        }
        
        if (!isStaticFile && !isPublicRoute && !authToken) {
          // Cho phép truy cập personal routes nếu có tham số manv và ChucVu
          if (isPersonalRoute && hasManv && hasChucVu) {
            console.log('Middleware: Allowing access to personal route with parameters');
            return NextResponse.next();
          }
    
    // Redirect về login với returnUrl
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};