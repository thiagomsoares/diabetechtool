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
      const start = new Date(end);
      start.setHours(start.getHours() - 24);
      
      setDateRange({ startDate: start, endDate: end });
    }
  }, [isConfigured]);

  useEffect(() => {
    if (isConfigured && dateRange.startDate && dateRange.endDate) {
      console.log('Buscando dados para o período:', dateRange);
      fetchData(dateRange);
    }
  }, [dateRange.startDate, dateRange.endDate, isConfigured]);

  useEffect(() => {
    if (dataError) {
      setError(dataError);
    }
  }, [dataError]);

  const handleDateChange = (dates: { startDate: Date; endDate: Date }) => {
    console.log('Datas alteradas:', dates);
    setDateRange(dates);
  };

  const handleSearch = () => {
    console.log('Buscando dados para o período:', dateRange);
    fetchData(dateRange);
    setLoadingMessage('Buscando dados...');
  };

  const calculateAverage = (values: number[]) => {
    if (!values || values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };

  const calculateAverageISF = (values: number[]) => {
    if (!values || values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
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

  const calculateStandardDeviation = (values: number[]) => {
    const mean = calculateAverage(values);
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = calculateAverage(squareDiffs);
    return Math.round(Math.sqrt(avgSquareDiff));
  };

  return (
    <div className="space-y-6">
      <Transition>
        <div>
          <h2 className="text-base font-semibold leading-7 text-gray-900">Configurações</h2>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            {nightscoutUrl && `Conectado a: ${nightscoutUrl}`}
          </p>
          <div className="mt-4">
            <DateRangePicker
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={handleDateChange}
              onSearch={handleSearch}
              isLoading={loading}
            />
          </div>
        </div>
      </Transition>

      {loading && (
        <Transition>
          <div className="space-y-4">
            <LoadingSpinner size="lg" message="Carregando dados..." />
            {loadingStats && (
              <ProgressBar
                progress={loadingStats.current}
                total={loadingStats.total}
                label="Processando registros"
              />
            )}
          </div>
        </Transition>
      )}

      {error && (
        <Transition>
          <Feedback
            type="error"
            message={error}
            onDismiss={() => setError(null)}
          />
        </Transition>
      )}

      {data && !loading && (
        <Transition>
          {data.isfDynamic.length > 0 ? (
            // Renderização normal com dados de sensibilidade
            <div className="space-y-6">
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
                  <dt className="truncate text-sm font-medium text-gray-500">Média ISF Dinâmico</dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                    {calculateAverage(data.isfDynamic)}
                  </dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                  <dt className="truncate text-sm font-medium text-gray-500">Média ISF Perfil</dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                    {calculateAverageISF(data.isfProfile)}
                  </dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                  <dt className="truncate text-sm font-medium text-gray-500">Desvio Médio</dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                    {calculateAverage(data.deviations)}%
                  </dd>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                <div className="rounded-lg bg-white shadow">
                  <div className="p-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">ISF Dinâmico vs Perfil</h3>
                    <LineChart
                      data={{
                        timestamps: data.timestamps || [],
                        values1: data.isfDynamic || [],
                        values2: data.isfProfile || [],
                        title: '',
                        yaxis: 'ISF',
                        series1Name: 'ISF Dinâmico',
                        series2Name: 'ISF Perfil'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white shadow">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">Dados Detalhados</h3>
                  <DataTable data={data.tableData || []} />
                </div>
              </div>
            </div>
          ) : (
            // Renderização alternativa apenas com dados de glicose
            renderAlternativeView()
          )}
        </Transition>
      )}
    </div>
  );
}; 