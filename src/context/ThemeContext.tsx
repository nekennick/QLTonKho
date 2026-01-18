'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type ColorTheme = 'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue' | 'purple' | 'pink' | 'black' | 'gray' | 'slate' | 'teal' | 'custom';

export interface ThemeSettings {
  color: ColorTheme;
  customColor?: string;
}

interface ThemeContextType {
  colorTheme: ColorTheme;
  themeSettings: ThemeSettings;
  setColorTheme: (color: ColorTheme) => void;
  setThemeSettings: (settings: ThemeSettings) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    color: 'blue',
    customColor: undefined
  });
  const [mounted, setMounted] = useState(false);

  // Đảm bảo component đã được mount trước khi access localStorage
  useEffect(() => {
    setMounted(true);
    const savedThemeSettings = localStorage.getItem('themeSettings');
    if (savedThemeSettings) {
      try {
        const parsed = JSON.parse(savedThemeSettings);
        setThemeSettings(parsed);
      } catch (error) {
        console.error('Error parsing theme settings:', error);
        setThemeSettings({
          color: 'blue',
          customColor: undefined
        });
      }
    } else {
      setThemeSettings({
        color: 'blue',
        customColor: undefined
      });
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // Remove old theme classes
    root.classList.remove('red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink', 'black', 'gray', 'slate', 'teal', 'custom');
    
    // Add new theme class
    root.classList.add(themeSettings.color);
    
    // Apply custom color if it's a custom theme
    if (themeSettings.color === 'custom' && themeSettings.customColor) {
      root.style.setProperty('--primary-color', themeSettings.customColor);
      root.style.setProperty('--primary-foreground', '#ffffff');
    } else {
      // Reset custom CSS variables for predefined themes
      root.style.removeProperty('--primary-color');
      root.style.removeProperty('--primary-foreground');
    }
    
    // Save to localStorage
    localStorage.setItem('themeSettings', JSON.stringify(themeSettings));
    
  }, [themeSettings, mounted]);

  const handleSetColorTheme = (newColor: ColorTheme) => {
    setThemeSettings(prev => ({
      ...prev,
      color: newColor
    }));
  };

  const handleSetThemeSettings = (newSettings: ThemeSettings) => {
    setThemeSettings(newSettings);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className="opacity-0">{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ 
      colorTheme: themeSettings.color,
      themeSettings,
      setColorTheme: handleSetColorTheme,
      setThemeSettings: handleSetThemeSettings
    }}>
      {children}
    </ThemeContext.Provider>
  );
}