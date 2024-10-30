'use client'

import React from 'react';
import dynamic from 'next/dynamic';
import { Layout, Config, Data } from 'plotly.js';
import { PlotParams } from 'react-plotly.js';

const Plot = dynamic<PlotParams>(() => import('react-plotly.js'), { ssr: false });

interface HourlyData {
  hour: number;
  avgDeviation: number;
  avgIsfDynamic: number;
  avgIsfProfile: number;
  count: number;
}

interface HourlyAnalysisChartProps {
  data: {
    hourlyStats: HourlyData[];
    type: 'deviation' | 'isf' | 'comparison';
  };
}

export const HourlyAnalysisChart = ({ data }: HourlyAnalysisChartProps) => {
  const hours = data.hourlyStats.map(d => `${d.hour}:00`);

  const layout: Partial<Layout> = {
    title: data.type === 'deviation' 
      ? 'Desvio Médio (%) por Horário'
      : data.type === 'isf'
      ? 'ISF Dinâmica vs ISF Perfil por Horário'
      : 'Comparação de ISF por Horário',
    xaxis: {
      title: 'Hora do Dia',
      ticktext: hours,
      tickvals: data.hourlyStats.map(d => d.hour),
      showgrid: true,
      gridcolor: 'rgba(0,0,0,0.1)',
    },
    yaxis: {
      title: data.type === 'deviation' ? 'Desvio (%)' : 'ISF (mg/dL/U)',
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

  const getPlotData = (): Partial<Data>[] => {
    switch (data.type) {
      case 'deviation':
        return [{
          x: hours,
          y: data.hourlyStats.map(d => d.avgDeviation),
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Desvio Médio',
          line: { color: '#2563eb', width: 2 },
          marker: { size: 6 }
        }];
      
      case 'isf':
        return [
          {
            x: hours,
            y: data.hourlyStats.map(d => d.avgIsfDynamic),
            type: 'scatter',
            mode: 'lines+markers',
            name: 'ISF Dinâmico',
            line: { color: '#2563eb', width: 2 },
            marker: { size: 6 }
          },
          {
            x: hours,
            y: data.hourlyStats.map(d => d.avgIsfProfile),
            type: 'scatter',
            mode: 'lines+markers',
            name: 'ISF Perfil',
            line: { color: '#dc2626', width: 2 },
            marker: { size: 6 }
          }
        ];
      
      case 'comparison':
        return [
          {
            x: hours,
            y: data.hourlyStats.map(d => d.avgIsfDynamic),
            type: 'box',
            name: 'ISF Dinâmico',
            boxpoints: 'all',
            jitter: 0.3,
            pointpos: -1.8,
            marker: { color: '#2563eb' }
          },
          {
            x: hours,
            y: data.hourlyStats.map(d => d.avgIsfProfile),
            type: 'box',
            name: 'ISF Perfil',
            boxpoints: 'all',
            jitter: 0.3,
            pointpos: -1.8,
            marker: { color: '#dc2626' }
          }
        ];
      
      default:
        return [];
    }
  };

  return (
    <div className="w-full h-[400px]">
      <Plot
        data={getPlotData()}
        layout={layout}
        config={config}
        className="w-full h-full"
      />
    </div>
  );
}; 