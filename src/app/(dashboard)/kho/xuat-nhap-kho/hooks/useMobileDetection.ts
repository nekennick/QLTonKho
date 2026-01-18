'use client';

import { useState, useEffect } from 'react';

interface MobileDetectionResult {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
}

export function useMobileDetection(): MobileDetectionResult {
  const [detection, setDetection] = useState<MobileDetectionResult>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 0,
    screenHeight: 0,
  });

  useEffect(() => {
    const updateDetection = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Breakpoints
      const isMobile = width < 768; // md breakpoint
      const isTablet = width >= 768 && width < 1024; // lg breakpoint
      const isDesktop = width >= 1024;
      
      setDetection({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
      });
    };

    // Initial detection
    updateDetection();

    // Listen for resize events
    window.addEventListener('resize', updateDetection);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDetection);
    };
  }, []);

  return detection;
}

// Hook for responsive breakpoints
export function useResponsive() {
  const { isMobile, isTablet, isDesktop, screenWidth } = useMobileDetection();
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    screenWidth,
    // Common breakpoint checks
    isSmallMobile: screenWidth < 480,
    isLargeMobile: screenWidth >= 480 && screenWidth < 768,
    isSmallTablet: screenWidth >= 768 && screenWidth < 900,
    isLargeTablet: screenWidth >= 900 && screenWidth < 1024,
    isSmallDesktop: screenWidth >= 1024 && screenWidth < 1280,
    isLargeDesktop: screenWidth >= 1280,
  };
}
