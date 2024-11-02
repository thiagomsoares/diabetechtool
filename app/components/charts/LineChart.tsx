'use client'

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Layout, Config, Data } from 'plotly.js';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

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
  // Validação dos dados
  useEffect(() => {
    console.log('LineChart data:', {
      timestamps: data.timestamps.length,
      values1: data.values1.length,
      values2: data.values2.length,
      hasMismatch: data.timestamps.length !== data.values1.length || 
                   data.timestamps.length !== data.values2.length
    });
  }, [data]);

  // Verificar se temos dados válidos
  if (!data.timestamps.length || !data.values1.length) {
    console.warn('LineChart: Dados insuficientes para renderizar o gráfico');
    return null;
  }

  // Verificar se os arrays têm o mesmo tamanho
  if (data.timestamps.length !== data.values1.length || 
      (data.values2.length && data.timestamps.length !== data.values2.length)) {
    console.error('LineChart: Arrays de dados têm tamanhos diferentes');
    return null;
  }

  const plotData: Partial<Data>[] = [
    {
      x: data.timestamps,
      y: data.values1,
      type: 'scatter',
      mode: 'lines',
      name: data.series1Name,
      line: { color: '#2563eb' }
    }
  ];

  if (data.values2.length > 0) {
    plotData.push({
      x: data.timestamps,
      y: data.values2,
      type: 'scatter',
      mode: 'lines',
      name: data.series2Name,
      line: { color: '#dc2626' }
    });
  }

  const layout: Partial<Layout> = {
    title: data.title,
    yaxis: { title: data.yaxis },
    showlegend: true,
    legend: { orientation: 'h', y: -0.2 },
    margin: { t: 40, r: 20, l: 50, b: 40 },
    height: 400,
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    hovermode: 'x unified'
  };

  const config: Partial<Config> = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false
  };

  return (
    <div className="w-full h-[400px]">
      <Plot
        data={plotData}
        layout={layout}
        config={config}
        className="w-full h-full"
        onError={(err) => console.error('Plotly error:', err)}
        onInitialized={(figure) => console.log('Plotly initialized:', figure)}
      />
    </div>
  );
}; 