'use client'

import React, { useState, useEffect } from 'react';
import { useNightscoutData } from '@/app/hooks/useNightscoutData';
import { DateRangePicker } from '@/app/components/DateRangePicker';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { Feedback } from '@/app/components/Feedback';
import { Transition } from '@/app/components/Transition';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { HourlyDistributionChart } from '@/app/components/charts/HourlyDistributionChart';
import { QuickDateButtons } from '@/app/components';
import type { QuickDateButtonsProps } from '@/app/types/components';
import { useApp } from '@/app/contexts/AppContext';
import { useLoadingState } from '@/app/hooks/useLoadingState';
import { LoadingSteps } from '@/app/components/LoadingSteps';

export default function TimeInRangePage() {
  const { settings } = useApp();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date()
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { data, loading, error, fetchData } = useNightscoutData();
  const { isSearching, currentLoadingStep, motivationalPhrase, LOADING_STEPS } = useLoadingState(loading);
  const [selectedPeriod, setSelectedPeriod] = useState(3);

  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 3);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    setDateRange({ startDate: start, endDate: end });
  }, []);

  const handlePeriodSelect = (days: number) => {
    setSelectedPeriod(days);
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    setDateRange({ startDate: start, endDate: end });
  };

  const handleDateChange = (dates: { startDate: Date; endDate: Date }) => {
    setDateRange(dates);
    setSelectedDate(dates.endDate);
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    if (newDate >= dateRange.startDate) {
      setSelectedDate(newDate);
    }
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    if (newDate <= dateRange.endDate) {
      setSelectedDate(newDate);
    }
  };

  const calculateStats = () => {
    if (!data?.bgs.length) return null;

    const total = data.bgs.length;
    let sum = 0;
    let min = Infinity;
    let max = -Infinity;
    let std = 0;

    // Primeiro passo: calcular média, min e max
    data.bgs.forEach(bg => {
      sum += bg;
      min = Math.min(min, bg);
      max = Math.max(max, bg);
    });
    const mean = sum / total;

    // Segundo passo: calcular desvio padrão
    data.bgs.forEach(bg => {
      std += Math.pow(bg - mean, 2);
    });
    std = Math.sqrt(std / total);

    return {
      mean: Math.round(mean),
      min: Math.round(min),
      max: Math.round(max),
      std: Math.round(std),
      cv: Math.round((std / mean) * 100)
    };
  };

  const calculateDayStats = (glucoseValues: number[], timestamps: string[], date: Date) => {
    if (!glucoseValues.length || !timestamps.length) {
      console.log('Sem dados para calcular estatísticas');
      return { hypo: 0, inRange: 0, hyper: 0 };
    }

    const targetDate = date.toISOString().split('T')[0];
    console.log('Calculando estatísticas para:', targetDate);

    const dayValues = timestamps
      .map((timestamp, index) => ({
        timestamp,
        glucose: glucoseValues[index]
      }))
      .filter(item => item.timestamp.startsWith(targetDate))
      .map(item => item.glucose);

    const total = dayValues.length;
    console.log(`Total de leituras para ${targetDate}:`, total);

    if (total === 0) return { hypo: 0, inRange: 0, hyper: 0 };

    const hypo = dayValues.filter(v => v < settings.glucoseRange.min).length;
    const hyper = dayValues.filter(v => v > settings.glucoseRange.max).length;
    const inRange = total - hypo - hyper;

    console.log('Estatísticas calculadas:', {
      hypo: (hypo / total) * 100,
      inRange: (inRange / total) * 100,
      hyper: (hyper / total) * 100
    });

    return {
      hypo: Math.round((hypo / total) * 100),
      inRange: Math.round((inRange / total) * 100),
      hyper: Math.round((hyper / total) * 100)
    };
  };

  const processSelectedDayData = () => {
    if (!data?.bgs || !data.timestamps) {
      console.log('Dados não disponíveis para processamento');
      return [];
    }

    const targetDate = selectedDate.toISOString().split('T')[0];
    console.log('Processando dados para a data:', targetDate);

    // Agrupar dados por hora
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourData = data.timestamps
        .map((timestamp, index) => ({
          timestamp,
          glucose: data.bgs[index]
        }))
        .filter(item => {
          const itemDate = new Date(item.timestamp);
          return itemDate.toISOString().split('T')[0] === targetDate && 
                 itemDate.getHours() === hour;
        });

      console.log(`Hora ${hour}: ${hourData.length} registros encontrados`);

      return {
        hour,
        values: hourData.map(item => item.glucose)
      };
    });

    // Verificar se temos dados válidos
    const totalReadings = hourlyData.reduce((sum, hour) => sum + hour.values.length, 0);
    console.log('Total de leituras processadas:', totalReadings);

    return hourlyData;
  };

  const stats = calculateStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <LoadingSteps
        isSearching={isSearching}
        currentLoadingStep={currentLoadingStep}
        motivationalPhrase={motivationalPhrase}
        loadingSteps={LOADING_STEPS}
      />

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Tempo no Alvo</h1>
        
        <div className="space-y-4">
          <QuickDateButtons 
            onSelect={handlePeriodSelect} 
            selectedDays={selectedPeriod} 
          />
          
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onDateChange={handleDateChange}
            onSearch={() => fetchData(dateRange)}
            isLoading={loading}
          />

          <div className="flex items-center justify-center space-x-4 mt-4">
            <button
              onClick={goToPreviousDay}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-lg font-medium">
              {format(selectedDate, 'dd/MM/yyyy')}
            </span>
            <button
              onClick={goToNextDay}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <Transition>
          <Feedback
            type="error"
            message={error}
          />
        </Transition>
      )}

      {data && !error && (
        <div className="grid grid-cols-1 gap-6">
          {/* Estatísticas em Destaque */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
              <h3 className="text-lg font-medium mb-2">HbA1c Estimada</h3>
              <p className="text-3xl font-bold">
                {((stats.mean + 46.7) / 28.7).toFixed(1)}%
              </p>
              <p className="text-sm opacity-75 mt-1">Baseada na média glicêmica</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
              <h3 className="text-lg font-medium mb-2">GMI</h3>
              <p className="text-3xl font-bold">
                {(3.31 + (0.02392 * stats.mean)).toFixed(1)}%
              </p>
              <p className="text-sm opacity-75 mt-1">Glucose Management Indicator</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
              <h3 className="text-lg font-medium mb-2">Coeficiente de Variação</h3>
              <p className="text-3xl font-bold">{stats.cv}%</p>
              <p className="text-sm opacity-75 mt-1">Meta: {'<'} 36%</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
              <h3 className="text-lg font-medium mb-2">Desvio Padrão</h3>
              <p className="text-3xl font-bold">{stats.std} mg/dL</p>
              <p className="text-sm opacity-75 mt-1">Variabilidade glicêmica</p>
            </div>
          </div>

          {/* Distribuição por Hora do Dia */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Distribuição por Hora do Dia</h3>
            </div>

            {data.bgs.length > 0 ? (
              <HourlyDistributionChart data={processSelectedDayData()} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                Sem dados disponíveis para este dia
              </div>
            )}

            {/* Resumo do Dia */}
            {data.bgs.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {data && data.bgs && data.timestamps && (
                  <>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <dt className="text-sm font-medium text-red-800">Hipoglicemia</dt>
                      <dd className="mt-1 text-2xl font-semibold text-red-900">
                        {calculateDayStats(data.bgs, data.timestamps, selectedDate).hypo}%
                      </dd>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <dt className="text-sm font-medium text-green-800">No Alvo</dt>
                      <dd className="mt-1 text-2xl font-semibold text-green-900">
                        {calculateDayStats(data.bgs, data.timestamps, selectedDate).inRange}%
                      </dd>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <dt className="text-sm font-medium text-yellow-800">Hiperglicemia</dt>
                      <dd className="mt-1 text-2xl font-semibold text-yellow-900">
                        {calculateDayStats(data.bgs, data.timestamps, selectedDate).hyper}%
                      </dd>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}