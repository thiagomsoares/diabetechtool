'use client'

import React from 'react';
import dynamic from 'next/dynamic';
import { Layout, Config } from 'plotly.js';
import { useTimezone } from '@/app/hooks/useTimezone';
import { useApp } from '@/app/contexts/AppContext';
import { format, parseISO, setYear, setMonth, setDate } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

// Importação dinâmica do Plotly para evitar problemas de SSR
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface LineChartProps {
  data: {
    timestamps: string[];      // Array de timestamps para a primeira série
    timestamps1?: string[];    // Array de timestamps específico para values1 (opcional)
    timestamps2?: string[];    // Array de timestamps específico para values2 (opcional)
    values1: number[];        // Valores primários (ex: glicemia)
    values2?: number[];       // Valores secundários (opcional, ex: ISF)
    title: string;           // Título do gráfico
    yaxis: string;           // Label do eixo Y
    series1Name: string;     // Nome da série primária
    series2Name?: string;    // Nome da série secundária (opcional)
  };
  showTargetRange?: boolean;  // Prop para controlar exibição das faixas alvo
  height?: number;           // Prop para controlar a altura
}

export const LineChart = ({ 
  data,
  showTargetRange = true, 
  height = 400 
}: LineChartProps) => {
  const { timezone } = useTimezone();
  const { settings } = useApp();

  // Verifica se os dados são válidos
  if (!data || !Array.isArray(data.values1)) {
    console.error('Dados inválidos para o gráfico:', data);
    return <div className="p-4 text-center text-gray-500">Dados não disponíveis</div>;
  }

  // Verifica se há dados para plotar
  if (data.values1.length === 0) {
    return <div className="p-4 text-center text-gray-500">Nenhum dado disponível para o período selecionado</div>;
  }

  /**
   * Calcula o range dinâmico do eixo Y baseado nos valores
   */
  const calculateDynamicRange = (values: number[], values2: number[] = []) => {
    const allValues = [...values, ...(values2 || [])].filter(v => typeof v === 'number' && !isNaN(v));
    if (!allValues.length) return [0, 400];
    
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    
    // Adiciona margem de 10% acima e abaixo
    const margin = (maxValue - minValue) * 0.1;
    return [
      Math.max(0, Math.floor(minValue - margin)),
      Math.ceil(maxValue + margin)
    ];
  };

  // Configuração do layout
  const layout: Partial<Layout> = {
    height: height,
    margin: { t: 20, r: 20, b: 40, l: 50 },
    xaxis: {
      title: 'Horário',
      type: 'date',
      tickformat: '%H:%M',
      showgrid: true,
      gridcolor: '#f0f0f0',
      tickformatStops: [{
        dtickrange: [null, null],
        value: '%H:%M'
      }],
      hoverformat: '%H:%M',
    },
    yaxis: {
      title: data.yaxis,
      range: calculateDynamicRange(data.values1, data.values2),
      showgrid: true,
      gridcolor: '#f0f0f0',
      zeroline: false,
    },
    showlegend: true,
    legend: {
      x: 0,
      y: 1.1,
      orientation: 'h'
    },
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
  };

  // Configuração do gráfico
  const config: Partial<Config> = {
    displayModeBar: false,
    responsive: true
  };

  // Prepara os dados para o gráfico
  const plotData = [
    {
      x: data.timestamps1 || data.timestamps,
      y: data.values1,
      type: 'scatter',
      mode: 'lines',
      name: data.series1Name,
      line: { color: '#3B82F6', width: 2 },
      hovertemplate: `%{y:.1f} ${data.yaxis}<br>%{x|%H:%M}<extra></extra>`,
    }
  ];

  // Adiciona a segunda série se existir
  if (data.values2 && data.values2.length > 0 && data.series2Name) {
    plotData.push({
      x: data.timestamps2 || data.timestamps,
      y: data.values2,
      type: 'scatter',
      mode: 'lines',
      name: data.series2Name,
      line: { color: '#10B981', width: 2 },
      hovertemplate: `%{y:.1f} ${data.yaxis}<br>%{x|%H:%M}<extra></extra>`,
    });
  }

  // Adiciona as faixas alvo se necessário
  if (showTargetRange && settings.glucoseRange) {
    const { min, max } = settings.glucoseRange;
    // Adiciona área sombreada para a faixa alvo
    plotData.push({
      x: [...data.timestamps, ...data.timestamps.slice().reverse()],
      y: [...Array(data.timestamps.length).fill(max), ...Array(data.timestamps.length).fill(min)].reverse(),
      fill: 'toself',
      fillcolor: 'rgba(147, 197, 253, 0.2)', // Azul claro com transparência
      line: { width: 0 },
      name: `Faixa Alvo (${min}-${max})`,
      showlegend: true,
      hoverinfo: 'skip'
    });

    // Linhas tracejadas nos limites
    plotData.push({
      x: data.timestamps,
      y: Array(data.timestamps.length).fill(min),
      mode: 'lines',
      name: 'Limite Inferior',
      line: { color: '#93C5FD', width: 1, dash: 'dash' },
      showlegend: false,
      hoverinfo: 'skip'
    });
    plotData.push({
      x: data.timestamps,
      y: Array(data.timestamps.length).fill(max),
      mode: 'lines',
      name: 'Limite Superior',
      line: { color: '#93C5FD', width: 1, dash: 'dash' },
      showlegend: false,
      hoverinfo: 'skip'
    });
  }

  return (
    <Plot
      data={plotData}
      layout={layout}
      config={config}
      className="w-full"
    />
  );
};