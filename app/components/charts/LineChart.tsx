'use client'

import React from 'react';
import dynamic from 'next/dynamic';
import { Layout, Config, Data } from 'plotly.js';
import { PlotParams } from 'react-plotly.js';
import { format } from 'date-fns';

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
type Dash = 'solid' | 'dot' | 'dash' | 'longdash' | 'dashdot' | 'longdashdot';

export const LineChart = ({ data }: LineChartProps) => {
  // Organizar dados por dia
  const dayGroups = data.timestamps.reduce((groups: { [key: string]: number[] }, timestamp, index) => {
    const day = timestamp.split('T')[0];
    if (!groups[day]) {
      groups[day] = [];
    }
    groups[day].push(index);
    return groups;
  }, {});

  const days = Object.keys(dayGroups).sort();

  const colors = [
    '#2563eb', // azul
    '#16a34a', // verde
    '#ea580c', // laranja
    '#9333ea', // roxo
    '#0891b2', // ciano
    '#db2777', // rosa
  ];

  // Criar array de ticks para o eixo X (a cada 2 horas)
  const tickVals = Array.from({ length: 13 }, (_, i) => i * 120); // 0, 120, 240, ..., 1440
  const tickText = Array.from({ length: 13 }, (_, i) => `${(i * 2).toString().padStart(2, '0')}:00`);

  const layout: Partial<Layout> = {
    title: 'Comparação de ISF Dinâmica e ISF Perfil por Horário (Sobreposição de Dias)',
    xaxis: {
      title: 'Horário do Dia (Minutos)',
      tickmode: 'array',
      tickvals: tickVals,
      ticktext: tickText,
      showgrid: true,
      gridcolor: 'rgba(0,0,0,0.1)',
      range: [0, 1440], // 24 horas em minutos
      zeroline: false
    },
    yaxis: {
      title: 'ISF',
      showgrid: true,
      gridcolor: 'rgba(0,0,0,0.1)',
      zeroline: false
    },
    showlegend: true,
    legend: {
      title: { text: 'Legenda' },
      x: 1.05,
      y: 1,
      xanchor: 'left'
    },
    margin: { t: 50, r: 150, l: 50, b: 50 },
    hovermode: 'x unified',
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    font: {
      family: 'Inter, sans-serif',
      size: 12
    }
  };

  const config: Partial<Config> = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false
  };

  const getPlotData = (): Partial<Data>[] => {
    // Dados do ISF dinâmico por dia
    const dynamicLines = days.map((day, index) => ({
      x: dayGroups[day].map(i => {
        const date = new Date(data.timestamps[i]);
        return date.getHours() * 60 + date.getMinutes();
      }),
      y: dayGroups[day].map(i => data.values1[i]),
      type: 'scatter' as const,
      mode: 'lines+markers' as PlotMode,
      name: `${data.series1Name} - ${format(new Date(day), 'dd/MM')}`,
      line: { color: colors[index % colors.length], width: 1.5 },
      marker: { size: 3 },
      hovertemplate: '%{y:.1f}<extra>%{fullData.name}</extra>'
    }));

    // Organizar dados do perfil por minuto do dia
    const getProfileData = () => {
      const profileData = data.timestamps.map((timestamp, index) => ({
        minute: new Date(timestamp).getHours() * 60 + new Date(timestamp).getMinutes(),
        value: data.values2[index]
      }));

      profileData.sort((a, b) => a.minute - b.minute);

      return {
        x: profileData.map(d => d.minute),
        y: profileData.map(d => d.value)
      };
    };

    // Linha do ISF do perfil (referência)
    const profileData = getProfileData();
    const profileLine = {
      x: profileData.x,
      y: profileData.y,
      type: 'scatter' as const,
      mode: 'lines' as PlotMode,
      name: data.series2Name,
      line: { 
        color: '#dc2626', 
        width: 2, 
        dash: 'dot' as Dash 
      },
      hovertemplate: '%{y:.1f}<extra>%{fullData.name}</extra>'
    };

    return [...dynamicLines, profileLine];
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