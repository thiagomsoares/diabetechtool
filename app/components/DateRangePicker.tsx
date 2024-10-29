'use client'

import React from 'react';
import { Datepicker, Button } from 'flowbite-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onChange: (dates: { startDate: Date; endDate: Date }) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

export const DateRangePicker = ({ 
  startDate, 
  endDate, 
  onChange, 
  onSearch,
  isLoading = false 
}: DateRangePickerProps) => {
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
          <Button
            key={preset.days}
            onClick={() => handleQuickSelect(preset.days)}
            size="sm"
            color="blue"
            pill
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="mb-1 block">
            <label htmlFor="startDate" className="text-sm font-medium text-gray-900 dark:text-white">
              Data Inicial
            </label>
          </div>
          <Datepicker
            id="startDate"
            title="Data Inicial"
            defaultDate={startDate}
            onSelectedDateChanged={(date: Date) => {
              const newDate = new Date(date);
              newDate.setHours(0, 0, 0, 0);
              onChange({ startDate: newDate, endDate });
            }}
            maxDate={endDate}
            locale={ptBR}
            weekStart={0}
            labelTodayButton="Hoje"
            labelClearButton="Limpar"
            className="w-full"
          />
        </div>

        <div className="flex-1">
          <div className="mb-1 block">
            <label htmlFor="endDate" className="text-sm font-medium text-gray-900 dark:text-white">
              Data Final
            </label>
          </div>
          <Datepicker
            id="endDate"
            title="Data Final"
            defaultDate={endDate}
            onSelectedDateChanged={(date: Date) => {
              const newDate = new Date(date);
              newDate.setHours(23, 59, 59, 999);
              onChange({ startDate, endDate: newDate });
            }}
            minDate={startDate}
            locale={ptBR}
            weekStart={0}
            labelTodayButton="Hoje"
            labelClearButton="Limpar"
            className="w-full"
          />
        </div>

        <div className="flex items-end">
          <Button
            onClick={onSearch}
            isProcessing={isLoading}
            disabled={isLoading}
            color="blue"
          >
            {isLoading ? 'Buscando...' : 'Buscar Informações'}
          </Button>
        </div>
      </div>
    </div>
  );
}; 