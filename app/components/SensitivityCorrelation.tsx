'use client'

import React from 'react';
import { Card } from 'flowbite-react';

interface SensitivityCorrelationProps {
  data: {
    bgs: number[];
    isfDynamic: number[];
  };
}

export const SensitivityCorrelation = ({ data }: SensitivityCorrelationProps) => {
  const ranges = [
    { name: 'Hipoglicemia', min: 0, max: 70 },
    { name: 'Alvo', min: 70, max: 180 },
    { name: 'Hiperglicemia', min: 180, max: Infinity }
  ];

  const calculateRangeStats = () => {
    return ranges.map(range => {
      const rangeData = data.bgs.map((bg, index) => ({
        bg,
        isf: data.isfDynamic[index]
      })).filter(d => d.bg >= range.min && d.bg < range.max);

      const avgISF = rangeData.reduce((sum, d) => sum + d.isf, 0) / rangeData.length || 0;

      return {
        range: range.name,
        avgISF: Math.round(avgISF),
        count: rangeData.length
      };
    });
  };

  const stats = calculateRangeStats();

  return (
    <Card>
      <h5 className="text-xl font-bold mb-4">Correlação com Glicemia</h5>
      <div className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.range} className="flex justify-between items-center">
            <div>
              <p className="font-medium">{stat.range}</p>
              <p className="text-sm text-gray-500">
                {stat.count} registros
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{stat.avgISF}</p>
              <p className="text-sm text-gray-500">ISF Médio</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}; 