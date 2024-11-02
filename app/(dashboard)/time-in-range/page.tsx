'use client'

import React, { useState, useEffect } from 'react';
import { useNightscoutData } from '@/app/hooks/useNightscoutData';
import { DateRangePicker } from '@/app/components/DateRangePicker';
import { GlucoseStats } from '@/app/components/GlucoseStats';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { Feedback } from '@/app/components/Feedback';
import { Transition } from '@/app/components/Transition';
import { HourlyDistributionChart } from '@/app/components/charts/HourlyDistributionChart';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export default function TimeInRangePage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date()
  });

  const { data, loading, error, fetchData } = useNightscoutData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Função para atualizar todas as datas de uma vez
  const updateAllDates = (start: Date, end: Date) => {
    const newDateRange = { startDate: start, endDate: end };
    setDateRange(newDateRange);
    setSelectedDate(end); // Atualiza a data selecionada para o último dia
    fetchData(newDateRange); // Busca os dados automaticamente
  };

  // Handler para os botões de período
  const handlePeriodSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    if (days === 0) {
      // Para "Hoje", define início e fim como hoje
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else {
      // Para outros períodos, subtrai os dias da data atual
      start.setDate(end.getDate() - days);
    }
    updateAllDates(start, end);
  };

  // Handler para o DateRangePicker
  const handleDateRangeChange = (dates: { startDate: Date; endDate: Date }) => {
    updateAllDates(dates.startDate, dates.endDate);
  };

  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 3); // 3 dias atrás
    start.setHours(0, 0, 0, 0); // Início do dia
    end.setHours(23, 59, 59, 999); // Fim do dia
    
    setDateRange({ startDate: start, endDate: end });
  }, []);

  // Funções de navegação do calendário diário
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

  // Função para calcular a HbA1c estimada
  const calculateEstimatedA1c = (meanGlucose: number) => {
    // Fórmula: (MG + 46.7) / 28.7
    return ((meanGlucose + 46.7) / 28.7).toFixed(1);
  };

  // Função para calcular GMI (Glucose Management Indicator)
  const calculateGMI = (meanGlucose: number) => {
    // Fórmula: 3.31 + (0.02392 × MG)
    return (3.31 + (0.02392 * meanGlucose)).toFixed(1);
  };

  // Função para processar dados por hora
  const processHourlyData = (glucoseData: number[], timestamps: string[]) => {
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      values: [] as number[]
    }));

    timestamps.forEach((timestamp, index) => {
      const hour = new Date(timestamp).getHours();
      hourlyData[hour].values.push(glucoseData[index]);
    });

    return hourlyData;
  };

  const calculateStats = () => {
    if (!data?.bgs.length) return null;

    const total = data.bgs.length;
    let sum = 0;
    let min = Infinity;
    let max = -Infinity;
    let std = 0;
    const sortedValues = [...data.bgs].sort((a, b) => a - b);
    const median = total % 2 === 0 
      ? (sortedValues[total/2 - 1] + sortedValues[total/2]) / 2
      : sortedValues[Math.floor(total/2)];

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
      median: Math.round(median),
      min: Math.round(min),
      max: Math.round(max),
      std: Math.round(std),
      cv: Math.round((std / mean) * 100)
    };
  };

  const stats = calculateStats();

  // Função para processar dados de um dia específico
  const processSelectedDayData = (glucoseData: number[], timestamps: string[]) => {
    const targetDate = selectedDate.toISOString().split('T')[0];
    const dayData = timestamps.map((timestamp, index) => ({
      timestamp,
      glucose: glucoseData[index]
    })).filter(item => item.timestamp.startsWith(targetDate));

    return Array.from({ length: 24 }, (_, hour) => {
      const hourData = dayData.filter(item => {
        const itemHour = new Date(item.timestamp).getHours();
        return itemHour === hour;
      });

      return {
        hour,
        values: hourData.map(item => item.glucose)
      };
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Tempo no Alvo</h2>
        
        {/* Botões de período - apenas um conjunto */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => handlePeriodSelect(0)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Hoje
          </button>
          <button
            onClick={() => handlePeriodSelect(3)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Últimos 3 dias
          </button>
          <button
            onClick={() => handlePeriodSelect(7)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Últimos 7 dias
          </button>
          <button
            onClick={() => handlePeriodSelect(14)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Últimos 14 dias
          </button>
          <button
            onClick={() => handlePeriodSelect(30)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Últimos 30 dias
          </button>
        </div>

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

      {data && !loading && (
        <Transition>
          <div className="space-y-6">
            {/* Estatísticas em Destaque */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
                <h3 className="text-lg font-medium mb-2">HbA1c Estimada</h3>
                <p className="text-3xl font-bold">
                  {calculateEstimatedA1c(stats?.mean || 0)}%
                </p>
                <p className="text-sm opacity-75 mt-1">Baseada na média glicêmica</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
                <h3 className="text-lg font-medium mb-2">GMI</h3>
                <p className="text-3xl font-bold">
                  {calculateGMI(stats?.mean || 0)}%
                </p>
                <p className="text-sm opacity-75 mt-1">Glucose Management Indicator</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
                <h3 className="text-lg font-medium mb-2">Coeficiente de Variação</h3>
                <p className="text-3xl font-bold">{stats?.cv}%</p>
                <p className="text-sm opacity-75 mt-1">Meta: {'<'} 36%</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
                <h3 className="text-lg font-medium mb-2">Desvio Padrão</h3>
                <p className="text-3xl font-bold">{stats?.std} mg/dL</p>
                <p className="text-sm opacity-75 mt-1">Variabilidade glicêmica</p>
              </div>
            </div>

            {/* Tempo no Alvo */}
            <GlucoseStats glucoseValues={data.bgs} />

            {/* Navegação por Dia */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Distribuição por Hora do Dia</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={goToPreviousDay}
                    disabled={selectedDate <= new Date(dateRange.startDate)}
                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="text-sm font-medium">
                    {format(selectedDate, 'dd/MM/yyyy')}
                  </div>
                  <button
                    onClick={goToNextDay}
                    disabled={selectedDate >= new Date(dateRange.endDate)}
                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Gráfico de Distribuição */}
              <HourlyDistributionChart 
                data={processSelectedDayData(data.bgs, data.timestamps)}
              />

              {/* Resumo do Dia */}
              <div className="mt-4 grid grid-cols-3 gap-4">
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
              </div>
            </div>

            {/* Estatísticas Detalhadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Métricas Avançadas</h3>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Média Glicêmica</dt>
                    <dd className="mt-1 text-2xl font-semibold">{stats?.mean} mg/dL</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Mediana</dt>
                    <dd className="mt-1 text-2xl font-semibold">
                      {stats?.median} mg/dL
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Glicemia Mínima</dt>
                    <dd className="mt-1 text-2xl font-semibold">{stats?.min} mg/dL</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Glicemia Máxima</dt>
                    <dd className="mt-1 text-2xl font-semibold">{stats?.max} mg/dL</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Recomendações</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Tempo no Alvo</h4>
                    <p className="mt-1">Meta: {'>'} 70% ({'>'} 16.8 horas/dia)</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Tempo em Hipoglicemia</h4>
                    <p className="mt-1">Meta: {'<'} 4% ({'<'} 1 hora/dia)</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Coeficiente de Variação</h4>
                    <p className="mt-1">Meta: {'<'} 36%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      )}
    </div>
  );
}

// Função auxiliar para calcular estatísticas do dia
function calculateDayStats(glucoseData: number[], timestamps: string[], selectedDate: Date) {
  const targetDate = selectedDate.toISOString().split('T')[0];
  const dayData = timestamps.map((timestamp, index) => ({
    timestamp,
    glucose: glucoseData[index]
  })).filter(item => item.timestamp.startsWith(targetDate));

  const total = dayData.length;
  if (total === 0) return { hypo: 0, inRange: 0, hyper: 0 };

  const hypo = dayData.filter(item => item.glucose < 70).length;
  const hyper = dayData.filter(item => item.glucose > 180).length;
  const inRange = total - hypo - hyper;

  return {
    hypo: Math.round((hypo / total) * 100),
    inRange: Math.round((inRange / total) * 100),
    hyper: Math.round((hyper / total) * 100)
  };
} 