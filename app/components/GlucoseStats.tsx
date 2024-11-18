'use client'

import React from 'react';
import { useApp } from '../contexts/AppContext';

interface GlucoseStatsProps {
  glucoseValues: number[];
}

export const GlucoseStats = ({ glucoseValues = [] }: GlucoseStatsProps) => {
  const { settings } = useApp();
  const { glucoseRange } = settings || { glucoseRange: { min: 70, max: 180 } };

  const calculateStats = () => {
    if (!Array.isArray(glucoseValues)) return { hypo: 0, inRange: 0, hyper: 0 };
    
    const total = glucoseValues.length;
    if (total === 0) return { hypo: 0, inRange: 0, hyper: 0 };

    const hypo = glucoseValues.filter(value => value < glucoseRange.min).length;
    const hyper = glucoseValues.filter(value => value > glucoseRange.max).length;
    const inRange = total - hypo - hyper;

    return {
      hypo: (hypo / total) * 100,
      inRange: (inRange / total) * 100,
      hyper: (hyper / total) * 100
    };
  };

  const stats = calculateStats();

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <div className="overflow-hidden rounded-lg bg-red-50 px-4 py-5 shadow sm:p-6">
        <dt className="truncate text-sm font-medium text-red-700">Hipoglicemia</dt>
        <dd className="mt-1 text-3xl font-semibold tracking-tight text-red-900">
          {stats.hypo.toFixed(1)}%
        </dd>
        <p className="mt-1 text-sm text-red-600">
          Abaixo de {glucoseRange.min} mg/dL
        </p>
      </div>

      <div className="overflow-hidden rounded-lg bg-green-50 px-4 py-5 shadow sm:p-6">
        <dt className="truncate text-sm font-medium text-green-700">No Alvo</dt>
        <dd className="mt-1 text-3xl font-semibold tracking-tight text-green-900">
          {stats.inRange.toFixed(1)}%
        </dd>
        <p className="mt-1 text-sm text-green-600">
          Entre {glucoseRange.min} e {glucoseRange.max} mg/dL
        </p>
      </div>

      <div className="overflow-hidden rounded-lg bg-yellow-50 px-4 py-5 shadow sm:p-6">
        <dt className="truncate text-sm font-medium text-yellow-700">Hiperglicemia</dt>
        <dd className="mt-1 text-3xl font-semibold tracking-tight text-yellow-900">
          {stats.hyper.toFixed(1)}%
        </dd>
        <p className="mt-1 text-sm text-yellow-600">
          Acima de {glucoseRange.max} mg/dL
        </p>
      </div>
    </div>
  );
};