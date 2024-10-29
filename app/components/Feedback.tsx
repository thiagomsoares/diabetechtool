'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface FeedbackProps {
  type: 'success' | 'error' | 'warning';
  message: string;
  onDismiss?: () => void;
}

export const Feedback = ({ type, message, onDismiss }: FeedbackProps) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle
  };

  const colors = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200'
  };

  const Icon = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={`rounded-lg border p-4 ${colors[type]}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className="inline-flex rounded-md bg-transparent p-1.5 hover:bg-white/20 focus:outline-none"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}; 