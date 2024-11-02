'use client'

import React, { useState, useEffect } from 'react';
import { useNightscoutData } from '@/app/hooks/useNightscoutData';
import { DateRangePicker } from '@/app/components/DateRangePicker';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { Feedback } from '@/app/components/Feedback';
import { Transition } from '@/app/components/Transition';
import dynamic from 'next/dynamic';
import { Layout, Config, Data } from 'plotly.js';
import { QuickDateButtons } from '@/app/components/QuickDateButtons';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function SensitivityPage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date()
  });

  const { data, loading, error, fetchData } = useNightscoutData();

  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 3); // 3 dias atrás
    start.setHours(0, 0, 0, 0); // Início do dia
    end.setHours(23, 59, 59, 999); // Fim do dia
    
    setDateRange({ startDate: start, endDate: end });
  }, []);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchData(dateRange);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  const calculateStats = () => {
    if (!data?.isfDynamic?.length) return null;

    const dynamicISF = data.isfDynamic;
    const profileISF = data.isfProfile;

    const avgDynamicISF = Math.round(dynamicISF.reduce((a, b) => a + b, 0) / dynamicISF.length);
    const avgProfileISF = Math.round(profileISF.reduce((a, b) => a + b, 0) / profileISF.length);
    const maxDynamicISF = Math.round(Math.max(...dynamicISF));
    const minDynamicISF = Math.round(Math.min(...dynamicISF));
    const deviationAvg = Math.round(data.deviations.reduce((a, b) => a + b, 0) / data.deviations.length);

    return {
      avgDynamicISF,
      avgProfileISF,
      maxDynamicISF,
      minDynamicISF,
      deviationAvg
    };
  };

  const renderISFDistributionChart = () => {
    if (!data?.isfDynamic) return null;

    const trace: Partial<Data> = {
      x: data.isfDynamic,
      type: 'histogram' as const,
      name: 'ISF Dinâmico',
      marker: {
        color: '#2563eb'
      }
    };

    const layout: Partial<Layout> = {
      title: 'Distribuição do ISF Dinâmico',
      xaxis: { title: 'ISF (mg/dL/U)' },
      yaxis: { title: 'Frequência' },
      showlegend: false,
      bargap: 0.1
    };

    return (
      <Plot
        data={[trace]}
        layout={layout}
        config={{ responsive: true }}
      />
    );
  };

  const stats = calculateStats();

  const handlePeriodSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    if (days === 0) {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else {
      start.setDate(end.getDate() - days);
      start.setHours(0, 0, 0, 0);
    }
    setDateRange({ startDate: start, endDate: end });
    fetchData({ startDate: start, endDate: end });
  };

  const handleDateRangeChange = (dates: { startDate: Date; endDate: Date }) => {
    setDateRange(dates);
    fetchData(dates);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Análise de Sensibilidade</h2>
        <QuickDateButtons onSelect={handlePeriodSelect} />
        <DateRangePicker
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onChange={handleDateRangeChange}
          onSearch={() => fetchData(dateRange)}
          isLoading={loading}
        />
      </div>

      {loading && (
        <Transition>
          <div className="flex justify-center">
            <LoadingSpinner size="lg" message="Carregando dados..." />
          </div>
        </Transition>
      )}

      {error && (
        <Transition>
          <Feedback
            type="error"
            message={error}
          />
        </Transition>
      )}

      {data && stats && !loading && (
        <Transition>
          <div className="space-y-6">
            {/* Métricas em Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">ISF Dinâmico Médio</h3>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {stats.avgDynamicISF} mg/dL/U
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  vs {stats.avgProfileISF} mg/dL/U do perfil
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Variação do ISF</h3>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {stats.minDynamicISF} - {stats.maxDynamicISF}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  mg/dL/U (min - max)
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Desvio Médio</h3>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {stats.deviationAvg}%
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  do ISF do perfil
                </p>
              </div>
            </div>

            {/* Gráfico de Distribuição */}
            <div className="bg-white rounded-lg shadow p-6">
              {renderISFDistributionChart()}
            </div>

            {/* Comparação Temporal */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-4">ISF Dinâmico vs Perfil</h3>
              <Plot
                data={[
                  {
                    x: data.timestamps,
                    y: data.isfDynamic,
                    type: 'scatter',
                    mode: 'lines',
                    name: 'ISF Dinâmico',
                    line: { color: '#2563eb' }
                  },
                  {
                    x: data.timestamps,
                    y: data.isfProfile,
                    type: 'scatter',
                    mode: 'lines',
                    name: 'ISF Perfil',
                    line: { color: '#9333ea' }
                  }
                ]}
                layout={{
                  yaxis: { title: 'ISF (mg/dL/U)' },
                  showlegend: true,
                  legend: { orientation: 'h', y: -0.2 }
                }}
                config={{ responsive: true }}
              />
            </div>
          </div>
        </Transition>
      )}
    </div>
  );
} 