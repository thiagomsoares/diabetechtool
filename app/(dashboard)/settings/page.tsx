'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useApp } from '@/app/contexts/AppContext';
import { useLoadingState } from '@/app/hooks/useLoadingState';
import { LoadingSteps } from '@/app/components/LoadingSteps';

interface Settings {
  darkMode: boolean;
  sensorInterval: 1 | 5;
  autoRefresh: boolean;
  refreshInterval: number;
  glucoseRange: {
    min: number;
    max: number;
  };
}

const defaultSettings: Settings = {
  darkMode: false,
  sensorInterval: 5,
  autoRefresh: true,
  refreshInterval: 5,
  glucoseRange: {
    min: 70,
    max: 180
  }
};

export default function SettingsPage() {
  const router = useRouter();
  const { settings: appSettings, updateSettings: updateAppSettings } = useApp();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const { isSearching, currentLoadingStep, motivationalPhrase, LOADING_STEPS } = useLoadingState(loading);

  useEffect(() => {
    const config = localStorage.getItem('nightscout_config') || Cookies.get('nightscout_config');
    if (!config) {
      router.push('/');
      return;
    }

    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings({
        ...defaultSettings,
        ...parsed
      });
    }
  }, [router]);

  const handleSettingChange = (key: keyof Settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('app_settings', JSON.stringify(newSettings));
    updateAppSettings(newSettings);

    if (key === 'darkMode') {
      document.documentElement.classList.toggle('dark', value);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem('app_settings', JSON.stringify(settings));
      updateAppSettings(settings);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <LoadingSteps
        isSearching={isSearching}
        currentLoadingStep={currentLoadingStep}
        motivationalPhrase={motivationalPhrase}
        loadingSteps={LOADING_STEPS}
      />

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Configurações</h1>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium leading-6 text-gray-900 dark:text-white">Modo Escuro</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Ativar tema escuro na interface</p>
            </div>
            <button
              type="button"
              onClick={() => handleSettingChange('darkMode', !settings.darkMode)}
              className={`${
                settings.darkMode ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2`}
            >
              <span
                className={`${
                  settings.darkMode ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>

          <div>
            <h3 className="text-sm font-medium leading-6 text-gray-900 dark:text-white">Intervalo do Sensor</h3>
            <div className="mt-2 space-y-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="1min"
                  name="sensorInterval"
                  checked={settings.sensorInterval === 1}
                  onChange={() => handleSettingChange('sensorInterval', 1)}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="1min" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  A cada 1 minuto
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="5min"
                  name="sensorInterval"
                  checked={settings.sensorInterval === 5}
                  onChange={() => handleSettingChange('sensorInterval', 5)}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="5min" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  A cada 5 minutos
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium leading-6 text-gray-900 dark:text-white">Atualização Automática</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Atualizar dados automaticamente</p>
            </div>
            <button
              type="button"
              onClick={() => handleSettingChange('autoRefresh', !settings.autoRefresh)}
              className={`${
                settings.autoRefresh ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2`}
            >
              <span
                className={`${
                  settings.autoRefresh ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>

          {settings.autoRefresh && (
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                Intervalo de Atualização (minutos)
              </label>
              <select
                value={settings.refreshInterval}
                onChange={(e) => handleSettingChange('refreshInterval', Number(e.target.value))}
                className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
              >
                <option value={1}>1 minuto</option>
                <option value={5}>5 minutos</option>
                <option value={10}>10 minutos</option>
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
              </select>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium leading-6 text-gray-900 dark:text-white">Faixa Alvo de Glicose</h3>
            <div className="mt-2">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Mínimo: {settings.glucoseRange.min} mg/dL</span>
                <span className="text-sm text-gray-500">Máximo: {settings.glucoseRange.max} mg/dL</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="range"
                    min="40"
                    max="120"
                    value={settings.glucoseRange.min}
                    onChange={(e) => handleSettingChange('glucoseRange', {
                      ...settings.glucoseRange,
                      min: Number(e.target.value)
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>
                <div>
                  <input
                    type="range"
                    min="120"
                    max="250"
                    value={settings.glucoseRange.max}
                    onChange={(e) => handleSettingChange('glucoseRange', {
                      ...settings.glucoseRange,
                      max: Number(e.target.value)
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}