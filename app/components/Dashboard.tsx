'use client'

import React, { useState, useEffect } from 'react';
import { DataTable } from './DataTable';
import { DateRangePicker } from './DateRangePicker';
import { useNightscoutData } from '../hooks/useNightscoutData';
import { useRouter } from 'next/navigation';
import { Feedback } from './Feedback';
import { Transition } from './Transition';
import { GlucoseStats } from './GlucoseStats';
import { QuickDateButtons } from '@/app/components';
import { GlobalLoading } from './GlobalLoading';
import type { QuickDateButtonsProps } from '@/app/types/components';
import Cookies from 'js-cookie';
import DailyTabs from './DailyTabs';

export const Dashboard = () => {
  const router = useRouter();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date()
  });
  const [nightscoutUrl, setNightscoutUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data, error: dataError, fetchData, isConfigured } = useNightscoutData();
  const [selectedPeriod, setSelectedPeriod] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);

  useEffect(() => {
    if (!isConfigured) {
      router.push('/');
      return;
    }

    const savedConfig = localStorage.getItem('nightscout_config') || Cookies.get('nightscout_config');
    if (savedConfig) {
      try {
        const { baseUrl } = JSON.parse(savedConfig);
        setNightscoutUrl(baseUrl);

        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 3);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        
        setDateRange({ startDate: start, endDate: end });
        
        // Carregar dados iniciais
        handleSearch({ startDate: start, endDate: end });
      } catch (err) {
        console.error('Erro ao carregar configuração:', err);
        setError('Erro ao carregar configuração. Por favor, configure novamente.');
      }
    }
  }, [isConfigured]);

  const handleDateChange = (dates: { startDate: Date; endDate: Date }) => {
    setDateRange(dates);
  };

  const handlePeriodSelect = (days: number) => {
    setSelectedPeriod(days);
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    const newRange = { startDate: start, endDate: end };
    setDateRange(newRange);
    handleSearch(newRange);
  };

  const handleSearch = async (range: { startDate: Date; endDate: Date }) => {
    setIsLoading(true);
    setError(null);
    setLoadingStep(1);
    
    try {
      // Simula os estágios do loading
      const timer = setInterval(() => {
        setLoadingStep(prev => prev < 5 ? prev + 1 : prev);
      }, 1000);

      await fetchData(range);
      
      clearInterval(timer);
      
      if (dataError) {
        setError(dataError);
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Erro ao buscar dados. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
      setLoadingStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            {nightscoutUrl ? `Conectado a ${nightscoutUrl}` : 'Carregando...'}
          </p>
        </div>

        <div className="mb-8">
          <QuickDateButtons onSelect={handlePeriodSelect} selectedPeriod={selectedPeriod} />
        </div>

        <div className="mb-8">
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onDateChange={handleDateChange}
            onSearch={() => handleSearch(dateRange)}
          />
        </div>

        {error ? (
          <Feedback type="error" message={error} />
        ) : isLoading ? (
          <GlobalLoading step={loadingStep} />
        ) : data ? (
          <>
            <div className="mb-8">
              <GlucoseStats glucoseValues={data.bgs} />
            </div>
            <div className="mb-8">
              <DailyTabs data={data} />
            </div>
            <div>
              <DataTable data={data} />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};