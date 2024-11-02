'use client'

import React, { useEffect, useState } from 'react';
import { Datepicker, Button } from 'flowbite-react';
import { format, differenceInDays, addDays, subDays } from 'date-fns';
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
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setLocalStartDate(startDate);
    setLocalEndDate(endDate);
    setKey(prev => prev + 1);
  }, [startDate, endDate]);

  const validateDateRange = (start: Date, end: Date): boolean => {
    const diffDays = differenceInDays(end, start);
    if (diffDays > 7) {
      setError('O período máximo permitido é de 7 dias');
      return false;
    }
    if (diffDays < 0) {
      setError('A data inicial deve ser anterior à data final');
      return false;
    }
    setError(null);
    return true;
  };

  const handleStartDateChange = (date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    
    // Se a nova data inicial resultar em um período maior que 7 dias,
    // ajusta a data final para 7 dias após a data inicial
    const maxEndDate = addDays(newDate, 7);
    const adjustedEndDate = localEndDate > maxEndDate ? maxEndDate : localEndDate;
    
    if (validateDateRange(newDate, adjustedEndDate)) {
      setLocalStartDate(newDate);
      setLocalEndDate(adjustedEndDate);
      onChange({ startDate: newDate, endDate: adjustedEndDate });
    }
  };

  const handleEndDateChange = (date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    
    // Se a nova data final resultar em um período maior que 7 dias,
    // ajusta a data inicial para 7 dias antes da data final
    const minStartDate = subDays(newDate, 7);
    const adjustedStartDate = localStartDate < minStartDate ? minStartDate : localStartDate;
    
    if (validateDateRange(adjustedStartDate, newDate)) {
      setLocalStartDate(adjustedStartDate);
      setLocalEndDate(newDate);
      onChange({ startDate: adjustedStartDate, endDate: newDate });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="mb-1 block">
            <label htmlFor="startDate" className="text-sm font-medium text-gray-900 dark:text-white">
              Data Inicial
            </label>
          </div>
          <Datepicker
            key={`start-${key}`}
            id="startDate"
            title="Data Inicial"
            defaultDate={localStartDate}
            onSelectedDateChanged={handleStartDateChange}
            maxDate={localEndDate}
            minDate={subDays(localEndDate, 7)}
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
            key={`end-${key}`}
            id="endDate"
            title="Data Final"
            defaultDate={localEndDate}
            onSelectedDateChanged={handleEndDateChange}
            minDate={localStartDate}
            maxDate={addDays(localStartDate, 7)}
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
            disabled={isLoading || !!error}
            color="blue"
          >
            {isLoading ? 'Buscando...' : 'Buscar Informações'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}; 