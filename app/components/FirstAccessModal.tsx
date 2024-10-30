'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Target, X } from 'lucide-react';

interface FirstAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: { 
    sensorInterval: 1 | 5;
    glucoseRange: {
      min: number;
      max: number;
    };
  }) => void;
}

export const FirstAccessModal = ({ isOpen, onClose, onSave }: FirstAccessModalProps) => {
  const [sensorInterval, setSensorInterval] = useState<1 | 5>(5);
  const [glucoseRange, setGlucoseRange] = useState({
    min: 70,
    max: 180
  });

  const handleSave = () => {
    onSave({ 
      sensorInterval,
      glucoseRange
    });
    onClose();
  };

  const handleRangeChange = (type: 'min' | 'max', value: number) => {
    setGlucoseRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
            >
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                  onClick={onClose}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">
                    Configuração Inicial
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Para melhorar sua experiência, precisamos saber alguns detalhes sobre seu sensor de glicose.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                {/* Intervalo do Sensor */}
                <div>
                  <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Intervalo de Leitura do Sensor
                  </label>
                  <div className="mt-2 space-y-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="1min"
                        name="sensorInterval"
                        value="1"
                        checked={sensorInterval === 1}
                        onChange={() => setSensorInterval(1)}
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="1min" className="ml-3 block text-sm font-medium text-gray-700">
                        A cada 1 minuto
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="5min"
                        name="sensorInterval"
                        value="5"
                        checked={sensorInterval === 5}
                        onChange={() => setSensorInterval(5)}
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="5min" className="ml-3 block text-sm font-medium text-gray-700">
                        A cada 5 minutos
                      </label>
                    </div>
                  </div>
                </div>

                {/* Range de Glicose */}
                <div>
                  <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Faixa Alvo de Glicose (mg/dL)
                  </label>
                  <div className="mt-4 space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-500">Mínimo: {glucoseRange.min} mg/dL</span>
                        <span className="text-sm text-gray-500">Máximo: {glucoseRange.max} mg/dL</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <input
                            type="range"
                            min="40"
                            max="120"
                            value={glucoseRange.min}
                            onChange={(e) => handleRangeChange('min', Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div>
                          <input
                            type="range"
                            min="120"
                            max="250"
                            value={glucoseRange.max}
                            onChange={(e) => handleRangeChange('max', Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        Arraste os controles para definir sua faixa alvo de glicose
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                >
                  Salvar e Continuar
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}; 