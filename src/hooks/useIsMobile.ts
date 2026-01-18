'use client';

import { useState, useEffect } from 'react';

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      // Kiểm tra kích thước màn hình - tối ưu cho responsive
      const isMobileSize = window.innerWidth < 1024; // lg breakpoint (1024px)
      
      // Kiểm tra user agent để phát hiện thiết bị di động chính xác hơn
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      // Kiểm tra touch screen - thiết bị di động thường có touch
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Kết hợp các điều kiện để phát hiện mobile chính xác
      setIsMobile(isMobileSize || (isMobileUserAgent && hasTouchScreen));
    };
    
    // Kiểm tra lần đầu
    checkIsMobile();

    // Lắng nghe thay đổi kích thước màn hình với throttle để tối ưu hiệu năng
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkIsMobile, 150); // Throttle 150ms
    };

    window.addEventListener('resize', handleResize);
    
    // Lắng nghe thay đổi orientation trên mobile
    window.addEventListener('orientationchange', checkIsMobile);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', checkIsMobile);
    };
  }, []);

  return isMobile;
};
