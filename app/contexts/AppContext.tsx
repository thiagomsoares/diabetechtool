'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { LoadingStats, NightscoutData } from '@/app/types/nightscout';

interface AppSettings {
  darkMode: boolean;
  sensorInterval: 1 | 5;
  autoRefresh: boolean;
  refreshInterval: number;
  glucoseRange: {
    min: number;
    max: number;
  };
  timezone: string;
}

interface AppContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  calculateDataPoints: (startDate: Date, endDate: Date) => number;
  loadingStats?: LoadingStats;
  data: NightscoutData | null;
  setData: (data: NightscoutData | null) => void;
}

const defaultSettings: AppSettings = {
  darkMode: false,
  sensorInterval: 5,
  autoRefresh: true,
  refreshInterval: 5,
  glucoseRange: {
    min: 70,
    max: 180
  },
  timezone: 'UTC'
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [data, setData] = useState<NightscoutData | null>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
      
      // Aplicar modo escuro se necessário
      if (parsedSettings.darkMode) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('app_settings', JSON.stringify(updated));
      
      // Atualizar modo escuro
      if ('darkMode' in newSettings) {
        document.documentElement.classList.toggle('dark', newSettings.darkMode);
      }
      
      return updated;
    });
  };

  const calculateDataPoints = (startDate: Date, endDate: Date) => {
    const diffMinutes = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60));
    return Math.ceil(diffMinutes / settings.sensorInterval);
  };

  return (
    <AppContext.Provider value={{ 
      settings, 
      updateSettings, 
      calculateDataPoints,
      data,
      setData 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 