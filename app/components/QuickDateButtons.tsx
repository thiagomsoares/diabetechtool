'use client'

import React from 'react';
import { Button } from './ui/button';
import type { QuickDateButtonsProps } from '@/app/types/components';

export const QuickDateButtons = ({ onSelect, selectedDays }: QuickDateButtonsProps) => {
  const periods = [
    { label: 'Últimos 3 dias', days: 3 },
    { label: 'Últimos 7 dias', days: 7 },
  ];

  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      {periods.map(({ label, days }) => (
        <Button
          key={days}
          variant={selectedDays === days ? 'default' : 'outline'}
          onClick={() => onSelect(days)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}; 