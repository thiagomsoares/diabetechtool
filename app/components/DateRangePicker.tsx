'use client'

import React from 'react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onChange: (dates: { startDate: Date; endDate: Date }) => void;
}

export const DateRangePicker = ({ startDate, endDate, onChange }: DateRangePickerProps) => {
  const presets = [
    { label: 'Hoje', days: 0 },
    { label: 'Últimos 3 dias', days: 3 },
    { label: 'Últimos 7 dias', days: 7 },
    { label: 'Últimos 14 dias', days: 14 },
    { label: 'Últimos 30 dias', days: 30 }
  ];

  const handleQuickSelect = (days: number) => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    
    const start = new Date();
    if (days === 0) {
      // Para "Hoje", começa à meia-noite do dia atual
      start.setHours(0, 0, 0, 0);
    } else {
      start.setDate(end.getDate() - days);
      start.setHours(0, 0, 0, 0);
    }
    
    onChange({ startDate: start, endDate: end });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.days}
            onClick={() => handleQuickSelect(preset.days)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md 
                     text-blue-700 bg-blue-50 hover:bg-blue-100 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     transition-colors duration-200"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data
          </label>
          <div className="relative">
            <input
              type="date"
              value={format(startDate, 'yyyy-MM-dd')}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                newDate.setHours(0, 0, 0, 0);
                const endDate = new Date(newDate);
                endDate.setDate(newDate.getDate() + 1);
                endDate.setHours(23, 59, 59, 999);
                onChange({ startDate: newDate, endDate });
              }}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 