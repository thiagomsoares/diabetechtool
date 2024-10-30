'use client'

import React from 'react';

interface QuickDateButtonsProps {
  onSelect: (days: number) => void;
}

export const QuickDateButtons = ({ onSelect }: QuickDateButtonsProps) => {
  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      <button
        onClick={() => onSelect(0)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Hoje
      </button>
      <button
        onClick={() => onSelect(3)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Últimos 3 dias
      </button>
      <button
        onClick={() => onSelect(7)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Últimos 7 dias
      </button>
      <button
        onClick={() => onSelect(14)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Últimos 14 dias
      </button>
      <button
        onClick={() => onSelect(30)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Últimos 30 dias
      </button>
    </div>
  );
}; 