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
    const dynamicLines = days.map((day, index) => {
      const dayData = dayGroups[day].map(i => ({
        timestamp: data.timestamps[i],
        value: data.values1[i]
      }));

      // Converter timestamps para minutos do dia
      const normalizedData = dayData.map(d => {
        const date = new Date(d.timestamp);
        return {
          x: date.getHours() * 60 + date.getMinutes(),
          y: d.value
        };
      });

      // Ordenar por minutos para garantir a linha contínua
      normalizedData.sort((a, b) => a.x - b.x);

      return {
        x: normalizedData.map(d => d.x),
        y: normalizedData.map(d => d.y),
        type: 'scatter',
        mode: 'lines+markers' as PlotMode,
        name: `${data.series1Name} - ${format(new Date(day), 'dd/MM')}`,
        line: { color: colors[index % colors.length], width: 1.5 },
        marker: { size: 3 },
        hovertemplate: '%{y:.1f}<extra>%{fullData.name}</extra>'
      };
    });

    // Linha do ISF do perfil (referência)
    const profileLine = {
      x: tickVals,
      y: Array(tickVals.length).fill(data.values2[0]), // Assumindo que o ISF do perfil é constante
      type: 'scatter',
      mode: 'lines' as PlotMode,
      name: data.series2Name,
      line: { color: '#dc2626', width: 2, dash: 'dot' },
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