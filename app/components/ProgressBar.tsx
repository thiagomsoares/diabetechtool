'use client'

import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  total: number;
  label?: string;
}

export const ProgressBar = ({ progress, total, label }: ProgressBarProps) => {
  const percentage = Math.round((progress / total) * 100);

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>{label}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-blue-500 rounded-full"
        />
      </div>
      <div className="text-xs text-gray-500 text-center">
        {progress} de {total} registros
      </div>
    </div>
  );
}; 