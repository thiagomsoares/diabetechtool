'use client'

import React, { useState, useEffect } from 'react';
import { LineChart } from './charts/LineChart';
import { DataTable } from './DataTable';
import { DateRangePicker } from './DateRangePicker';
import { useNightscoutData } from '../hooks/useNightscoutData';
import { useRouter } from 'next/navigation';
import { LoadingState } from './LoadingState';
import Cookies from 'js-cookie';
import { Transition } from './Transition';
import { Feedback } from './Feedback';
import { LoadingSpinner } from './LoadingSpinner';
import { ProgressBar } from './ProgressBar';
import { GlucoseStats } from './GlucoseStats';
import { QuickDateButtons } from '@/app/components';
import type { QuickDateButtonsProps } from '@/app/types/components';

const LOADING_STEPS = [
  { id: 1, message: "Conectando ao Nightscout..." },
  { id: 2, message: "Buscando dados do período..." },
  { id: 3, message: "Processando informações..." },
  { id: 4, message: "Calculando estatísticas..." },
  { id: 5, message: "Gerando visualizações..." }
];

const MOTIVATIONAL_PHRASES = [
  "Cada número é uma história, cada dado uma oportunidade de evolução",
  "Conhecimento é a chave para uma vida mais equilibrada",
  "Pequenos ajustes hoje, grandes conquistas amanhã",
  "Seus dados são o mapa para uma jornada de sucesso",
  "A consistência é o caminho para o controle",
  "Entender seus padrões é o primeiro passo para transformá-los",
  "Cada análise nos aproxima do equilíbrio ideal",
  "O autoconhecimento é a base para o autocuidado",
  "Dados são mais que números, são ferramentas de transformação",
  "Sua dedicação diária constrói resultados extraordinários"
];

export const Dashboard = () => {
  const router = useRouter();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date()
  });
  const [nightscoutUrl, setNightscoutUrl] = useState<string | null>(null);

  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { data, loading, error: dataError, fetchData, isConfigured, loadingStats } = useNightscoutData();

  const [selectedPeriod, setSelectedPeriod] = useState(3);

  const [isSearching, setIsSearching] = useState(false);
  const [motivationalPhrase, setMotivationalPhrase] = useState('');

  const [currentLoadingStep, setCurrentLoadingStep] = useState(0);
  const [loadingStepTimer, setLoadingStepTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isConfigured) {
      router.push('/');
      return;
    }

    const savedConfig = localStorage.getItem('nightscout_config') || Cookies.get('nightscout_config');
    if (savedConfig) {
      const { baseUrl } = JSON.parse(savedConfig);
      setNightscoutUrl(baseUrl);

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 3);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      
      setDateRange({ startDate: start, endDate: end });
    }
  }, [isConfigured]);

  useEffect(() => {
    if (isSearching) {
      const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length);
        setMotivationalPhrase(MOTIVATIONAL_PHRASES[randomIndex]);
      }, 3000); // Muda a frase a cada 3 segundos

      return () => clearInterval(interval);
    }
  }, [isSearching]);

  const handleDateChange = (dates: { startDate: Date; endDate: Date }) => {
    setDateRange(dates);
  };

  const simulateLoadingSteps = () => {
    setCurrentLoadingStep(1);
    
    const timer = setInterval(() => {
      setCurrentLoadingStep(prev => {
        if (prev >= LOADING_STEPS.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 1000); // Cada etapa dura 1 segundo

    setLoadingStepTimer(timer);
    return timer;
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setMotivationalPhrase(MOTIVATIONAL_PHRASES[0]);
    const timer = simulateLoadingSteps();

    try {
      await fetchData(dateRange);
    } finally {
      clearInterval(timer);
      setLoadingStepTimer(null);
      setCurrentLoadingStep(0);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    return () => {
      if (loadingStepTimer) {
        clearInterval(loadingStepTimer);
      }
    };
  }, [loadingStepTimer]);

  /**
   * Calcula a média dos valores
   */
  const calculateAverage = (values: number[]): number => {
    if (!values || values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };

  /**
   * Calcula o desvio padrão dos valores
   */
  const calculateStandardDeviation = (values: number[]): number => {
    if (!values || values.length === 0) return 0;
    const mean = calculateAverage(values);
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = calculateAverage(squareDiffs);
    return Math.round(Math.sqrt(avgSquareDiff));
  };

  /**
   * Calcula todas as estatísticas necessárias
   */
  const calculateStats = (data: any) => {
    if (!data?.bgs || data.bgs.length === 0) return {
      mean: 'NaN',
      min: 'NaN',
      max: 'NaN',
      std: 'NaN'
    };

    const values = data.bgs;
    const mean = calculateAverage(values);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const std = calculateStandardDeviation(values);

    return {
      mean,
      min,
      max,
      std
    };
  };

  const renderAlternativeView = () => {
    if (!data) return null;

    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Dados de sensibilidade não encontrados. Mostrando apenas dados de glicose.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Tempo no Alvo
          </h3>
          <GlucoseStats glucoseValues={data.bgs} />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Média Glicemia</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {calculateAverage(data.bgs)} mg/dL
            </dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Glicemia Mínima</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {Math.min(...data.bgs)} mg/dL
            </dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Glicemia Máxima</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {Math.max(...data.bgs)} mg/dL
            </dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Desvio Padrão</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {calculateStandardDeviation(data.bgs)} mg/dL
            </dd>
          </div>
        </div>

        <div className="rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Glicemia vs Tempo</h3>
            <LineChart
              data={{
                timestamps: data.timestamps || [],
                values1: data.bgs || [],
                values2: [],
                title: '',
                yaxis: 'Glicemia (mg/dL)',
                series1Name: 'Glicemia',
                series2Name: ''
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  const handlePeriodSelect = (days: number) => {
    setSelectedPeriod(days);
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    setDateRange({ startDate: start, endDate: end });
  };

  return (
    <div className="space-y-6">
      <Transition>
        <div>
          <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
          <div className="mt-4">
            <QuickDateButtons 
              onSelect={handlePeriodSelect} 
              selectedDays={selectedPeriod} 
            />
            <DateRangePicker
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={handleDateChange}
              onSearch={handleSearch}
              isLoading={isSearching}
            />
          </div>
        </div>
      </Transition>

      {isSearching && (
        <Transition>
          <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-gradient-to-br from-blue-50 to-white rounded-lg shadow-lg">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-8" />
            
            {/* Loading Steps */}
            <div className="w-full max-w-2xl space-y-4 mb-8">
              {LOADING_STEPS.map((step) => (
                <div 
                  key={step.id}
                  className={`flex items-center space-x-3 transition-opacity duration-300
                    ${currentLoadingStep >= step.id ? 'opacity-100' : 'opacity-40'}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center
                    ${currentLoadingStep > step.id ? 'bg-green-500' : 
                      currentLoadingStep === step.id ? 'bg-blue-500 animate-pulse' : 
                      'bg-gray-300'}`}
                  >
                    {currentLoadingStep > step.id && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-base ${currentLoadingStep === step.id ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                    {step.message}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-center max-w-2xl">
              <p className="text-xl font-medium text-gray-800 leading-relaxed animate-pulse">
                {motivationalPhrase}
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Processando seus dados para insights valiosos...
              </p>
            </div>
          </div>
        </Transition>
      )}

      {error && !isSearching && (
        <Transition>
          <Feedback
            type="error"
            message={error}
            onDismiss={() => setError(null)}
          />
        </Transition>
      )}

      {data && !isSearching && (
        <Transition>
          {data.isfDynamic.length > 0 ? (
            <div className="space-y-6">
              {data.bgs.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Tempo no Alvo
                  </h3>
                  <GlucoseStats glucoseValues={data.bgs} />
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Cards de estatísticas */}
                {(() => {
                  const stats = calculateStats(data);
                  return (
                    <>
                      <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                        <dt className="truncate text-sm font-medium text-gray-500">Média Glicemia</dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                          {stats.mean} mg/dL
                        </dd>
                      </div>
                      <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                        <dt className="truncate text-sm font-medium text-gray-500">Glicemia Mínima</dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                          {stats.min} mg/dL
                        </dd>
                      </div>
                      <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                        <dt className="truncate text-sm font-medium text-gray-500">Glicemia Máxima</dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                          {stats.max} mg/dL
                        </dd>
                      </div>
                      <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                        <dt className="truncate text-sm font-medium text-gray-500">Desvio Padrão</dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                          {stats.std} mg/dL
                        </dd>
                      </div>
                    </>
                  );
                })()}
              </div>

              {data.timestamps.length > 0 && data.bgs.length > 0 && (
                <div className="rounded-lg bg-white shadow">
                  <div className="p-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">Glicemia vs Tempo</h3>
                    <LineChart
                      data={{
                        timestamps: data.timestamps,
                        values1: data.bgs,
                        values2: [],
                        title: '',
                        yaxis: 'Glicemia (mg/dL)',
                        series1Name: 'Glicemia',
                        series2Name: ''
                      }}
                      height={400}
                    />
                  </div>
                </div>
              )}

              {data.timestamps.length > 0 && data.isfDynamic.length > 0 && data.isfProfile.length > 0 && (
                <div className="rounded-lg bg-white shadow">
                  <div className="p-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">ISF Dinâmico vs Perfil</h3>
                    <LineChart
                      data={{
                        timestamps: data.timestamps,
                        values1: data.isfDynamic,
                        values2: data.isfProfile,
                        title: '',
                        yaxis: 'ISF (mg/dL/U)',
                        series1Name: 'ISF Dinâmico',
                        series2Name: 'ISF Perfil'
                      }}
                      showTargetRange={false}
                      height={300}
                    />
                  </div>
                </div>
              )}

              {data.tableData.length > 0 && (
                <div className="rounded-lg bg-white shadow">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">Dados Detalhados</h3>
                    <DataTable data={data.tableData} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            renderAlternativeView()
          )}
        </Transition>
      )}
    </div>
  );
}; 