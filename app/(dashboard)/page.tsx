'use client'

import { Dashboard } from '@/app/components/Dashboard';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function DashboardPage() {
  const router = useRouter();
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    const config = localStorage.getItem('nightscout_config') || Cookies.get('nightscout_config');
    setIsConfigured(!!config);
    
    if (!config) {
      router.push('/');
    }
  }, [router]);

  if (!isConfigured) return null;

  return <Dashboard />;
} 