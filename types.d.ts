/// <reference types="react" />
/// <reference types="node" />
/// <reference types="js-cookie" />
/// <reference types="plotly.js" />

import 'react';
import { Chart as ChartJS } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { PlotParams } from 'react-plotly.js';

declare module 'chart.js';
declare module 'react-chartjs-2';
declare module 'next';
declare module 'next/font/google';
declare module 'js-cookie';
declare module 'react-plotly.js' {
  export interface PlotParams {
    data: any[];
    layout?: Partial<Plotly.Layout>;
    config?: Partial<Plotly.Config>;
    className?: string;
  }
  export default class Plot extends React.Component<PlotParams> {}
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

interface ChangeEvent<T = Element> {
  target: EventTarget & T;
}

interface EventTarget {
  value: string;
} 