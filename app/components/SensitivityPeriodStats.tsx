'use client'

import React from 'react';
import { Card } from 'flowbite-react';

interface PeriodStats {
  period: string;
  avgISFDynamic: number;
  avgISFProfile: number;
  avgDeviation: number;
  count: number;
}

interface SensitivityPeriodStatsProps {
  data: {
    timestamps: string[];
    isfDynamic: number[];
    isfProfile: number[];
  };
}

export const SensitivityPeriodStats = ({ data }: SensitivityPeriodStatsProps) => {
  const periods = [
    { name: 'Madrugada', start: 0, end: 5 },
    { name: 'Manhã', start: 6, end: 11 },
    { name: 'Tarde', start: 12, end: 17 },
    { name: 'Noite', start: 18, end: 23 }
  ];

  const calculatePeriodStats = (): PeriodStats[] => {
    return periods.map(period => {
      const periodData = data.timestamps.map((timestamp, index) => ({
        hour: new Date(timestamp).getHours(),
        isfDynamic: data.isfDynamic[index],
        isfProfile: data.isfProfile[index]
      })).filter(d => d.hour >= period.start && d.hour <= period.end);

      const avgISFDynamic = periodData.reduce((sum, d) => sum + d.isfDynamic, 0) / periodData.length;
      const avgISFProfile = periodData.reduce((sum, d) => sum + d.isfProfile, 0) / periodData.length;
      const avgDeviation = ((avgISFDynamic - avgISFProfile) / avgISFProfile) * 100;

      return {
        period: period.name,
        avgISFDynamic: Math.round(avgISFDynamic),
        avgISFProfile: Math.round(avgISFProfile),
        avgDeviation: Math.round(avgDeviation),
        count: periodData.length
      };
    });
  };

  const stats = calculatePeriodStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.period}>
          <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            {stat.period}
          </h5>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              ISF Dinâmico: {stat.avgISFDynamic}
            </p>
            <p className="text-sm text-gray-500">
              ISF Perfil: {stat.avgISFProfile}
            </p>
            <p className={`text-sm font-bold ${
              stat.avgDeviation > 0 ? 'text-red-500' : 'text-green-500'
            }`}>
              Desvio: {stat.avgDeviation}%
            </p>
            <p className="text-xs text-gray-400">
              Baseado em {stat.count} registros
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}; 