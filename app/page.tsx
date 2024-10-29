'use client'

import React, { useEffect, useState } from 'react';
import { HomePage } from './components/HomePage';
import { Dashboard } from './components/Dashboard';
import { AppShell } from './components/AppShell';
import { FirstAccessModal } from './components/FirstAccessModal';
import { useApp } from './contexts/AppContext';
import Cookies from 'js-cookie';

export default function Home() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [showFirstAccessModal, setShowFirstAccessModal] = useState(false);
  const { updateSettings } = useApp();

  useEffect(() => {
    const checkConfig = () => {
      const config = localStorage.getItem('nightscout_config') || Cookies.get('nightscout_config');
      const hasSeenFirstAccess = localStorage.getItem('has_seen_first_access');
      
      setIsConfigured(!!config);
      if (config && !hasSeenFirstAccess) {
        setShowFirstAccessModal(true);
      }
    };

    checkConfig();
    window.addEventListener('storage', checkConfig);
    
    return () => {
      window.removeEventListener('storage', checkConfig);
    };
  }, []);

  const handleFirstAccessComplete = (settings: { sensorInterval: 1 | 5 }) => {
    updateSettings(settings);
    localStorage.setItem('has_seen_first_access', 'true');
    setShowFirstAccessModal(false);
  };

  if (isConfigured === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isConfigured) {
    return <HomePage onConfigured={() => setIsConfigured(true)} />;
  }

  return (
    <>
      <AppShell>
        <Dashboard />
      </AppShell>
      
      <FirstAccessModal
        isOpen={showFirstAccessModal}
        onClose={() => setShowFirstAccessModal(false)}
        onSave={handleFirstAccessComplete}
      />
    </>
  );
} 