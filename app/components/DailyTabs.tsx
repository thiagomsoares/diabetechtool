'use client'

import React, { useState } from 'react';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart } from './charts/LineChart';
import { useTimezone } from '@/app/hooks/useTimezone';
import { parseISO } from 'date-fns';

interface DailyTabsProps {
  data: {
    timestamps: string[];
    bgs: number[];
    isfDynamic: number[];
    isfProfile: number[];
  };
}

interface DailyData {
  timestamps: string[];
  bgs: (number | null)[];
  isfDynamic: (number | null)[];
  isfProfile: number[];
}

const DailyTabs: React.FC<DailyTabsProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const { timezone, convertToUserTime, formatInUserTimezone } = useTimezone();

  // Agrupa os dados por dia no fuso horário do usuário
  const dailyData = data.timestamps.reduce<{ [key: string]: DailyData }>((acc, timestamp, idx) => {
    // Converter o timestamp UTC para o fuso horário do usuário
    const userTime = convertToUserTime(timestamp);
    const date = formatInUserTimezone(parseISO(timestamp), 'yyyy-MM-dd');

    if (!acc[date]) {
      // Gerar timestamps para o dia inteiro no fuso horário do usuário
      const dayStart = parseISO(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = parseISO(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const timestamps: string[] = [];
      const isfProfileValues: number[] = [];
      const bgs: (number | null)[] = [];
      const isfDynamic: (number | null)[] = [];
      
      let currentTime = dayStart;
      
      while (currentTime <= dayEnd) {
        // Converter para string ISO no fuso horário do usuário
        timestamps.push(formatInUserTimezone(currentTime, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"));
        
        // Encontrar o valor do ISF Profile mais próximo
        const nearestIndex = data.timestamps.reduce((nearest, t, i) => {
          const currentUserTime = parseISO(convertToUserTime(currentTime));
          const dataUserTime = parseISO(convertToUserTime(t));
          const currentDiff = Math.abs(currentUserTime.getTime() - dataUserTime.getTime());
          const nearestDiff = Math.abs(currentUserTime.getTime() - parseISO(convertToUserTime(data.timestamps[nearest])).getTime());
          return currentDiff < nearestDiff ? i : nearest;
        }, 0);
        
        isfProfileValues.push(data.isfProfile[nearestIndex]);
        bgs.push(null);
        isfDynamic.push(null);
        
        // Avançar 5 minutos
        currentTime = new Date(currentTime.getTime() + 5 * 60000);
      }

      acc[date] = {
        timestamps,
        bgs,
        isfDynamic,
        isfProfile: isfProfileValues
      };
    }
    
    // Adicionar dados reais no timestamp mais próximo
    const timeIndex = acc[date].timestamps.findIndex(t => {
      const currentTime = parseISO(t);
      const dataTime = parseISO(userTime);
      const diff = Math.abs(currentTime.getTime() - dataTime.getTime());
      return diff <= 2.5 * 60000; // 2.5 minutos de tolerância
    });
    
    if (timeIndex !== -1) {
      acc[date].bgs[timeIndex] = data.bgs[idx];
      acc[date].isfDynamic[timeIndex] = data.isfDynamic[idx];
    }
    
    return acc;
  }, {});

  const days = Object.keys(dailyData).sort();

  const prepareChartData = (dayData: DailyData) => {
    // Filtrar timestamps e valores onde há dados reais para glicemia
    const bgData = {
      timestamps: dayData.timestamps.filter((_, i) => dayData.bgs[i] !== null),
      values1: dayData.bgs.filter(bg => bg !== null) as number[],
      title: 'Glicemia ao Longo do Tempo',
      yaxis: 'mg/dL',
      series1Name: 'Glicemia',
    };

    // Para o ISF, manter todos os timestamps para o perfil e filtrar para o dinâmico
    const isfData = {
      timestamps: dayData.timestamps,
      values1: dayData.isfDynamic.filter(isf => isf !== null) as number[],
      values2: dayData.isfProfile,
      title: 'Fator de Sensibilidade à Insulina',
      yaxis: 'ISF',
      series1Name: 'ISF Dinâmico',
      series2Name: 'ISF Perfil',
      timestamps1: dayData.timestamps.filter((_, i) => dayData.isfDynamic[i] !== null), // timestamps para ISF Dinâmico
      timestamps2: dayData.timestamps // timestamps para ISF Profile
    };

    return { bgData, isfData };
  };

  return (
    <div className="mt-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
          {days.map((day, index) => {
            const formattedDate = format(parseISO(day), "EEE, dd 'de' MMM", { locale: ptBR });
            return (
              <button
                key={day}
                onClick={() => setActiveTab(index)}
                className={`
                  whitespace-nowrap py-2 px-3 border-b-2 font-medium text-sm
                  ${activeTab === index
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {formattedDate}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-4">
        {days.map((day, index) => {
          const chartData = prepareChartData(dailyData[day]);
          return (
            <div
              key={day}
              className={`${activeTab === index ? 'block' : 'hidden'} space-y-6`}
            >
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Glicemia ao Longo do Tempo</h3>
                <LineChart data={chartData.bgData} showTargetRange={true} />
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Fator de Sensibilidade à Insulina</h3>
                <LineChart data={chartData.isfData} showTargetRange={false} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyTabs;
