'use client'

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Layout, Config, Data } from 'plotly.js';
import { useTimezone } from '@/app/hooks/useTimezone';
import { format } from 'date-fns';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface DayData {
  date: string;
  values: number[];
  timestamps: string[];
}

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

export const LineChart = ({ data }: LineChartProps) => {
  const { timezone } = useTimezone();
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [daysData, setDaysData] = useState<DayData[]>([]);

  useEffect(() => {
    // Agrupar dados por dia
    const groupedData = data.timestamps.reduce((acc: { [key: string]: DayData }, timestamp, index) => {
      const date = timestamp.split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          values: Array(24).fill(null),
          timestamps: Array(24).fill(null)
        };
      }
      const hour = new Date(timestamp).getHours();
      acc[date].values[hour] = data.values1[index];
      acc[date].timestamps[hour] = timestamp;
      return acc;
    }, {});

    setDaysData(Object.values(groupedData));
    // Selecionar o dia mais recente por padrão
    const mostRecentDate = Object.keys(groupedData).sort().pop();
    if (mostRecentDate) {
      setSelectedDays(new Set([mostRecentDate]));
    }
  }, [data]);

  const plotData: Partial<Data>[] = Array.from(selectedDays).map(date => {
    const dayData = daysData.find(d => d.date === date);
    if (!dayData) return null;

    // Criar array de 24 horas
    const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    
    return {
      x: hours,
      y: dayData.values,
      type: 'scatter',
      mode: 'lines',
      name: format(new Date(date), 'dd/MM/yyyy'),
      line: { width: 2 },
      connectgaps: true // Conecta pontos mesmo com valores null
    };
  }).filter(Boolean) as Partial<Data>[];

  const layout: Partial<Layout> = {
    title: data.title,
    yaxis: { 
      title: data.yaxis,
      range: [40, 400],
      gridcolor: '#f0f0f0'
    },
    xaxis: {
      title: 'Horário',
      tickformat: '%H:%M',
      gridcolor: '#f0f0f0',
      range: ['00:00', '23:59'],
      tickmode: 'array',
      ticktext: Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`),
      tickvals: Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)
    },
    showlegend: true,
    legend: { 
      x: 1.1,
      y: 1,
      xanchor: 'left',
      bgcolor: 'rgba(255, 255, 255, 0.8)',
      bordercolor: '#E2E8F0',
      borderwidth: 1
    },
    margin: { 
      t: 40, 
      r: 150,
      l: 50, 
      b: 40 
    },
    height: 400,
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    hovermode: 'x unified',
    shapes: [
      // Linha para hipo
      {
        type: 'line',
        x0: '00:00',
        x1: '23:59',
        y0: 70,
        y1: 70,
        line: {
          color: 'red',
          width: 1,
          dash: 'dash'
        }
      },
      // Linha para hiper
      {
        type: 'line',
        x0: '00:00',
        x1: '23:59',
        y0: 180,
        y1: 180,
        line: {
          color: 'red',
          width: 1,
          dash: 'dash'
        }
      }
    ]
  };

  const config: Partial<Config> = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false
  };

  return (
    <div className="relative">
      <div className="absolute right-0 top-0 w-40 bg-white shadow-lg rounded-lg p-4 z-10">
        <h4 className="text-sm font-medium mb-2">Selecionar Dias</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {daysData.map((day) => (
            <label key={day.date} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedDays.has(day.date)}
                onChange={(e) => {
                  const newSelected = new Set(selectedDays);
                  if (e.target.checked) {
                    newSelected.add(day.date);
                  } else {
                    newSelected.delete(day.date);
                  }
                  setSelectedDays(newSelected);
                }}
                className="rounded border-gray-300"
              />
              <span className="text-sm">
                {format(new Date(day.date), 'dd/MM/yyyy')}
              </span>
            </label>
          ))}
        </div>
      </div>
      <Plot
        data={plotData}
        layout={layout}
        config={config}
        className="w-full h-full"
        onError={(err) => console.error('Plotly error:', err)}
      />
      <div className="text-sm text-gray-500 mt-2">
        Horários exibidos no fuso: {timezone}
      </div>
    </div>
  );
}; 