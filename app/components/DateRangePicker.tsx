'use client'

import React, { useEffect, useState } from 'react';
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
  // Estados locais para controlar as datas dos pickers
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);
  const [key, setKey] = useState(0); // Chave para forçar re-render do Datepicker

  // Atualiza os estados locais quando as props mudam
  useEffect(() => {
    setLocalStartDate(startDate);
    setLocalEndDate(endDate);
    // Força o re-render dos Datepickers
    setKey(prev => prev + 1);
  }, [startDate, endDate]);

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="mb-1 block">
          <label htmlFor="startDate" className="text-sm font-medium text-gray-900 dark:text-white">
            Data Inicial
          </label>
        </div>
        <Datepicker
          key={`start-${key}`} // Chave única para forçar re-render
          id="startDate"
          title="Data Inicial"
          defaultDate={localStartDate}
          onSelectedDateChanged={(date: Date) => {
            const newDate = new Date(date);
            newDate.setHours(0, 0, 0, 0);
            setLocalStartDate(newDate);
            onChange({ startDate: newDate, endDate: localEndDate });
            onSearch();
          }}
          maxDate={localEndDate}
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
          key={`end-${key}`} // Chave única para forçar re-render
          id="endDate"
          title="Data Final"
          defaultDate={localEndDate}
          onSelectedDateChanged={(date: Date) => {
            const newDate = new Date(date);
            newDate.setHours(23, 59, 59, 999);
            setLocalEndDate(newDate);
            onChange({ startDate: localStartDate, endDate: newDate });
            onSearch();
          }}
          minDate={localStartDate}
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
  );
}; 