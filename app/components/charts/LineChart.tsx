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
    timestamps: string[];    // Array de timestamps em ISO string
    values1: number[];      // Valores primários (ex: glicemia)
    values2: number[];      // Valores secundários (opcional, ex: ISF)
    title: string;          // Título do gráfico
    yaxis: string;          // Label do eixo Y
    series1Name: string;    // Nome da série primária
    series2Name: string;    // Nome da série secundária
  };
  showTargetRange?: boolean;  // Novo prop para controlar exibição das faixas alvo
  height?: number;  // Nova prop para controlar a altura
}

export const LineChart = ({ data, showTargetRange = true, height = 400 }: LineChartProps) => {
  const { timezone } = useTimezone();
  const { settings } = useApp();

  /**
   * Calcula o range dinâmico do eixo Y baseado nos valores
   * Arredonda para a dezena mais próxima e mantém um mínimo de 40
   */
  const calculateDynamicRange = (values: number[], values2: number[] = []) => {
    if (!values.length && !values2.length) return [0, 400];
    
    // Combina todos os valores para encontrar min e max
    const allValues = [...values, ...values2];
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    
    // Arredonda para a dezena mais próxima
    const floorTo10 = (num: number) => Math.floor(num / 10) * 10;
    const ceilTo10 = (num: number) => Math.ceil((num + 10) / 10) * 10;
    
    return [
      Math.max(40, floorTo10(minValue - 10)),  // Subtrai 10 antes de arredondar para baixo
      ceilTo10(maxValue + 10)                  // Adiciona 10 antes de arredondar para cima
    ];
  };

  /**
   * Normaliza todos os timestamps para um mesmo dia de referência (01/01/2000)
   * Isso permite sobrepor os dados de diferentes dias no mesmo período de 24h
   */
  const normalizeToSameDay = (timestamp: string) => {
    const date = parseISO(timestamp);
    const normalized = setYear(setMonth(setDate(date, 1), 0), 2000);
    return normalized.toISOString();
  };

  /**
   * Agrupa os dados por dia, considerando o timezone do usuário
   * Cada dia terá seus próprios timestamps e valores, normalizados para sobreposição
   */
  const groupDataByDay = () => {
    const groupedData: { [key: string]: { timestamps: string[]; values: number[] } } = {};

    data.timestamps.forEach((timestamp, index) => {
      // Agrupa usando a data local do usuário, não UTC
      const date = formatInTimeZone(parseISO(timestamp), timezone, 'yyyy-MM-dd');
      if (!groupedData[date]) {
        groupedData[date] = {
          timestamps: [],
          values: []
        };
      }
      // Normaliza o timestamp para sobrepor no gráfico
      const normalizedTimestamp = normalizeToSameDay(timestamp);
      groupedData[date].timestamps.push(normalizedTimestamp);
      groupedData[date].values.push(data.values1[index]);
    });

    // Ordena os timestamps dentro de cada dia para garantir a continuidade das linhas
    Object.keys(groupedData).forEach(date => {
      const indices = groupedData[date].timestamps
        .map((_, i) => i)
        .sort((a, b) => new Date(groupedData[date].timestamps[a]).getTime() - 
                        new Date(groupedData[date].timestamps[b]).getTime());
      
      groupedData[date].timestamps = indices.map(i => groupedData[date].timestamps[i]);
      groupedData[date].values = indices.map(i => groupedData[date].values[i]);
    });

    // Retorna array com dados agrupados e formatados
    return Object.entries(groupedData).map(([date, dayData]) => ({
      date: formatInTimeZone(parseISO(date), timezone, 'dd/MM/yyyy'),
      ...dayData
    }));
  };

  /**
   * Calcula o range efetivo dos dados para o eixo X
   * Retorna o primeiro e último horário onde existem dados
   * Adiciona uma margem de 30 minutos antes e depois para melhor visualização
   */
  const calculateTimeRange = (sortedData: ReturnType<typeof groupDataByDay>) => {
    let minTime = '23:59';
    let maxTime = '00:00';

    sortedData.forEach(dayData => {
      dayData.timestamps.forEach(timestamp => {
        const time = formatInTimeZone(parseISO(timestamp), timezone, 'HH:mm');
        if (time < minTime) minTime = time;
        if (time > maxTime) maxTime = time;
      });
    });

    // Converte os horários para objetos Date para poder adicionar/subtrair minutos
    const startDate = new Date(2000, 0, 1, 
      parseInt(minTime.split(':')[0]), 
      parseInt(minTime.split(':')[1])
    );
    const endDate = new Date(2000, 0, 1, 
      parseInt(maxTime.split(':')[0]), 
      parseInt(maxTime.split(':')[1])
    );

    // Subtrai 30 minutos do início e adiciona 30 minutos ao fim
    startDate.setMinutes(startDate.getMinutes() - 30);
    endDate.setMinutes(endDate.getMinutes() + 30);

    // Formata de volta para string
    return {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    };
  };

  const sortedData = groupDataByDay();
  const yAxisRange = calculateDynamicRange(data.values1, data.values2);
  const timeRange = calculateTimeRange(sortedData);

  // Cria uma série para cada dia e adiciona a linha de referência se necessário
  const plotData = [
    // Dados diários
    ...sortedData.map((dayData) => ({
      x: dayData.timestamps,
      y: dayData.values,
      type: 'scatter' as const,
      mode: 'lines+markers' as const,
      name: dayData.date,
      line: { width: 2 },
      connectgaps: true
    })),
    // Linha de referência (ISF do perfil)
    ...(data.values2.length > 0 ? [{
      x: data.timestamps,
      y: data.values2,
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: data.series2Name,
      line: { 
        width: 2,
        dash: 'dot' as const,
        color: '#9333ea'
      }
    }] : [])
  ];

  // Configuração do layout do gráfico
  const layout: Partial<Layout> = {
    title: data.title,
    yaxis: { 
      title: data.yaxis,
      range: yAxisRange,
      gridcolor: '#f0f0f0',
      fixedrange: false,
      tickmode: 'linear',
      dtick: 10,  // Força ticks a cada 10 unidades
      tickformat: 'd'  // Força números inteiros
    },
    xaxis: {
      title: 'Horário',
      tickformat: '%H:%M',
      gridcolor: '#f0f0f0',
      range: [timeRange.start, timeRange.end],
      tickmode: 'array',
      ticktext: Array.from({ length: 24 }, (_, i) => 
        formatInTimeZone(
          new Date(2000, 0, 1, i, 0), 
          timezone, 
          'HH:mm'
        )
      ),
      tickvals: Array.from({ length: 24 }, (_, i) => 
        new Date(2000, 0, 1, i, 0).toISOString()
      ),
      fixedrange: false
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
      t: 60, 
      r: 150,  // Margem maior à direita para a legenda
      l: 50, 
      b: 40 
    },
    height,  // Usa a altura passada por prop
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    hovermode: 'x unified',  // Mostra todos os valores do mesmo horário
    // Linhas de referência para o range alvo
    shapes: showTargetRange ? [
      {
        type: 'line',
        x0: timeRange.start,
        x1: timeRange.end,
        y0: settings.glucoseRange.min,
        y1: settings.glucoseRange.min,
        line: {
          color: 'red',
          width: 1,
          dash: 'dash'
        }
      },
      {
        type: 'line',
        x0: timeRange.start,
        x1: timeRange.end,
        y0: settings.glucoseRange.max,
        y1: settings.glucoseRange.max,
        line: {
          color: 'red',
          width: 1,
          dash: 'dash'
        }
      }
    ] : []  // Se showTargetRange for false, não mostra as linhas de alvo
  };

  // Configurações de interatividade do gráfico
  const config: Partial<Config> = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false,
    scrollZoom: true,
    doubleClick: 'reset'
  };

  return (
    <div className="relative">
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