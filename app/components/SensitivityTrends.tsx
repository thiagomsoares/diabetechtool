'use client'

import React from 'react';
import { Card } from 'flowbite-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SensitivityTrendsProps {
  data: {
    timestamps: string[];
    isfDynamic: number[];
    isfProfile: number[];
  };
}

export const SensitivityTrends = ({ data }: SensitivityTrendsProps) => {
  const calculateDailyStats = () => {
    const dailyData: { [key: string]: number[] } = {};
    
    data.timestamps.forEach((timestamp, index) => {
      const date = format(new Date(timestamp), 'yyyy-MM-dd');
      if (!dailyData[date]) {
        dailyData[date] = [];
      }
      dailyData[date].push(data.isfDynamic[index]);
    });

    return Object.entries(dailyData).map(([date, values]) => ({
      date,
      avgISF: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      count: values.length
    }));
  };

  const stats = calculateDailyStats();
  const trend = stats.length > 1 
    ? stats[stats.length - 1].avgISF - stats[0].avgISF 
    : 0;

  return (
    <Card>
      <h5 className="text-xl font-bold mb-4">Análise de Tendências</h5>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="font-medium">Tendência Geral</p>
          <p className={`text-lg font-bold ${
            trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-500'
          }`}>
            {trend > 0 ? '+' : ''}{trend} ISF
          </p>
        </div>
        <div className="space-y-2">
          {stats.map((stat) => (
            <div key={stat.date} className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {format(new Date(stat.date), 'dd/MM (EEEE)', { locale: ptBR })}
              </p>
              <p className="font-medium">{stat.avgISF}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}; 