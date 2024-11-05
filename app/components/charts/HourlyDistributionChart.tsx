'use client'

import React from 'react';
import dynamic from 'next/dynamic';
import { Layout, Config, Data } from 'plotly.js';
import { useApp } from '@/app/contexts/AppContext';
import { useTimezone } from '@/app/hooks/useTimezone';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface HourlyDistributionProps {
  data: {
    hour: number;
    values: number[];
  }[];
}

export const HourlyDistributionChart = ({ data }: HourlyDistributionProps) => {
  const { settings } = useApp();
  const { glucoseRange } = settings;
  const { timezone } = useTimezone();

  const calculateDistribution = (values: number[]) => {
    const total = values.length;
    if (total === 0) return { below: 0, inRange: 0, above: 0 };

    const below = values.filter(v => v < glucoseRange.min).length;
    const above = values.filter(v => v > glucoseRange.max).length;
    const inRange = total - below - above;

    return {
      below: (below / total) * 100,
      inRange: (inRange / total) * 100,
      above: (above / total) * 100
    };
  };

  const plotData: Partial<Data>[] = [
    {
      x: data.map(d => d.hour),
      y: data.map(d => calculateDistribution(d.values).below),
      name: 'Hipoglicemia',
      type: 'bar',
      marker: { color: '#dc2626' }
    },
    {
      x: data.map(d => d.hour),
      y: data.map(d => calculateDistribution(d.values).inRange),
      name: 'No Alvo',
      type: 'bar',
      marker: { color: '#16a34a' }
    },
    {
      x: data.map(d => d.hour),
      y: data.map(d => calculateDistribution(d.values).above),
      name: 'Hiperglicemia',
      type: 'bar',
      marker: { color: '#ca8a04' }
    }
  ];

  const layout: Partial<Layout> = {
    barmode: 'stack',
    title: 'Distribuição por Hora do Dia',
    height: 600,
    xaxis: {
      title: 'Hora',
      ticktext: data.map(d => `${String(d.hour).padStart(2, '0')}:00`),
      tickvals: data.map(d => d.hour),
      tickfont: { size: 14 },
      titlefont: { size: 16 }
    },
    yaxis: {
      title: 'Porcentagem (%)',
      range: [0, 100],
      tickfont: { size: 14 },
      titlefont: { size: 16 }
    },
    showlegend: true,
    legend: { 
      orientation: 'h',
      y: -0.15,
      font: { size: 14 }
    },
    margin: {
      l: 60,
      r: 30,
      t: 50,
      b: 100
    },
    font: {
      family: 'Inter, sans-serif',
      size: 14
    },
    plot_bgcolor: 'white',
    paper_bgcolor: 'white'
  };

  const config: Partial<Config> = {
    responsive: true,
    displayModeBar: false
  };

  return (
    <div className="w-full">
      <Plot
        data={plotData}
        layout={layout}
        config={config}
        className="w-full"
      />
      <div className="text-sm text-gray-500 mt-2">
        Horários exibidos no fuso: {timezone}
      </div>
    </div>
  );
}; 