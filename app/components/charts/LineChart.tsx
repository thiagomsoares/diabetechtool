'use client'

import React from 'react';
import dynamic from 'next/dynamic';
import { Layout, Config, Data } from 'plotly.js';
import { PlotParams } from 'react-plotly.js';

// Importar Plotly dinamicamente para evitar problemas de SSR
const Plot = dynamic<PlotParams>(() => import('react-plotly.js'), { ssr: false });

interface LineChartProps {
  data: {
    timestamps: string[];
    values1: number[];
    values2: number[];
    title: string;
    yaxis: string;
    series1Name: string;
    series2Name: string;
  };
}

type PlotMode = 'lines' | 'markers' | 'text' | 'lines+markers' | 'text+markers' | 'text+lines' | 'text+lines+markers' | 'none';

export const LineChart = ({ data }: LineChartProps) => {
  const layout: Partial<Layout> = {
    title: data.title,
    xaxis: {
      title: 'Data/Hora',
      type: 'date',
      tickformat: '%d/%m %H:%M',
      showgrid: true,
      gridcolor: 'rgba(0,0,0,0.1)',
    },
    yaxis: {
      title: data.yaxis,
      showgrid: true,
      gridcolor: 'rgba(0,0,0,0.1)',
    },
    showlegend: true,
    legend: {
      x: 0,
      y: 1.2,
      orientation: 'h'
    },
    margin: { t: 50, r: 50, l: 50, b: 50 },
    hovermode: 'x unified',
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    font: {
      family: 'Inter, sans-serif'
    }
  };

  const config: Partial<Config> = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false
  };

  const plotData: Partial<Data>[] = [
    {
      x: data.timestamps,
      y: data.values1,
      type: 'scatter' as const,
      mode: 'lines+markers' as PlotMode,
      name: data.series1Name,
      line: { color: '#2563eb', width: 2 },
      marker: { size: 6 }
    },
    ...(data.values2.length > 0 ? [{
      x: data.timestamps,
      y: data.values2,
      type: 'scatter' as const,
      mode: 'lines+markers' as PlotMode,
      name: data.series2Name,
      line: { color: '#dc2626', width: 2 },
      marker: { size: 6 }
    }] : [])
  ];

  return (
    <div className="w-full h-[400px]">
      <Plot
        data={plotData}
        layout={layout}
        config={config}
        className="w-full h-full"
      />
    </div>
  );
}; 