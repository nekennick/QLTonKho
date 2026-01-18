'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeSettings } from './ThemeContext';

export interface NotificationSettings {
  zalo: {
    enabled: boolean;
    botToken: string;
    chatId: string;
    inventoryCreation: boolean;
    inventoryApproval: boolean;
    inventoryRejection: boolean;
  };
  telegram: {
    enabled: boolean;
    botToken: string;
    chatId: string;
    inventoryCreation: boolean;
    inventoryApproval: boolean;
    inventoryRejection: boolean;
  };
}

export interface FontSettings {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
}

export interface SystemSettings {
  notifications: NotificationSettings;
  fonts: FontSettings;
  theme: ThemeSettings;
}

interface SettingsContextType {
  settings: SystemSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  updateFontSettings: (settings: Partial<FontSettings>) => void;
  updateThemeSettings: (settings: Partial<ThemeSettings>) => void;
  resetToDefaults: () => void;
  saveSettings: () => void;
  loadSettings: () => void;
}

const defaultSettings: SystemSettings = {
  notifications: {
    zalo: {
      enabled: false,
      botToken: '',
      chatId: '',
      inventoryCreation: true,
      inventoryApproval: true,
      inventoryRejection: true,
    },
    telegram: {
      enabled: false,
      botToken: '',
      chatId: '',
      inventoryCreation: true,
      inventoryApproval: true,
      inventoryRejection: true,
    },
  },
  fonts: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: 'normal',
  },
  theme: {
    color: 'blue',
    customColor: undefined,
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Apply font settings to document
  useEffect(() => {
    const { fontFamily, fontSize, fontWeight } = settings.fonts;
    
    // Set CSS custom properties
    document.documentElement.style.setProperty('--font-family', fontFamily);
    document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
    document.documentElement.style.setProperty('--font-weight', fontWeight);
    
    // Also apply directly to body for immediate effect
    document.body.style.fontFamily = fontFamily;
    document.body.style.fontSize = `${fontSize}px`;
    document.body.style.fontWeight = fontWeight;
    
    // Apply to html element as well
    document.documentElement.style.fontFamily = fontFamily;
    document.documentElement.style.fontSize = `${fontSize}px`;
    document.documentElement.style.fontWeight = fontWeight;
    
  }, [settings.fonts]);

  // Apply theme settings to document
  useEffect(() => {
    const { color } = settings.theme;
    
    // Remove old theme classes
    document.documentElement.classList.remove('blue', 'green', 'purple', 'orange', 'red', 'pink', 'indigo', 'teal');
    
    // Add new theme class
    document.documentElement.classList.add(color);
    
  }, [settings.theme]);

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('systemSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prevSettings => ({
          ...prevSettings,
          ...parsedSettings,
          // Merge with defaults to ensure all properties exist
          notifications: {
            ...prevSettings.notifications,
            ...parsedSettings.notifications,
            zalo: {
              ...prevSettings.notifications.zalo,
              ...parsedSettings.notifications?.zalo,
            },
            telegram: {
              ...prevSettings.notifications.telegram,
              ...parsedSettings.notifications?.telegram,
            },
          },
          fonts: {
            ...prevSettings.fonts,
            ...parsedSettings.fonts,
          },
          theme: {
            ...prevSettings.theme,
            ...parsedSettings.theme,
          },
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = () => {
    try {
      localStorage.setItem('systemSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const updateNotificationSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      notifications: {
        ...prevSettings.notifications,
        ...newSettings,
      },
    }));
  };

  const updateFontSettings = (newSettings: Partial<FontSettings>) => {
    setSettings(prevSettings => {
      const updatedSettings = {
        ...prevSettings,
        fonts: {
          ...prevSettings.fonts,
          ...newSettings,
        },
      };
      
      // Auto-save font settings immediately for better UX
      try {
        localStorage.setItem('systemSettings', JSON.stringify(updatedSettings));
      } catch (error) {
        console.error('Error auto-saving font settings:', error);
      }
      
      return updatedSettings;
    });
  };

  const updateThemeSettings = (newSettings: Partial<ThemeSettings>) => {
    setSettings(prevSettings => {
      const updatedSettings = {
        ...prevSettings,
        theme: {
          ...prevSettings.theme,
          ...newSettings,
        },
      };
      
      // Auto-save theme settings immediately for better UX
      try {
        localStorage.setItem('systemSettings', JSON.stringify(updatedSettings));
      } catch (error) {
        console.error('Error auto-saving theme settings:', error);
      }
      
      return updatedSettings;
    });
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('systemSettings');
  };

  const value: SettingsContextType = {
    settings,
    updateNotificationSettings,
    updateFontSettings,
    updateThemeSettings,
    resetToDefaults,
    saveSettings,
    loadSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
