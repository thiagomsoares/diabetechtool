'use client'

import React, { useState, ChangeEvent } from 'react';
import Cookies from 'js-cookie';
import { NightscoutConfig } from '@/app/types/nightscout';

interface ConfigFormProps {
  onSubmit: (config: NightscoutConfig) => void;
}

export const ConfigForm = ({ onSubmit }: ConfigFormProps) => {
  const [config, setConfig] = useState({
    baseUrl: '',
    apiSecret: ''
  });
  const [urlError, setUrlError] = useState('');
  const [rememberConfig, setRememberConfig] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  const validateUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const formatUrl = (url: string) => {
    let formattedUrl = url.trim();
    if (!formattedUrl.endsWith('/')) {
      formattedUrl += '/';
    }
    return formattedUrl;
  };

  const formatApiSecret = (secret: string) => {
    const cleanSecret = secret.trim();
    // Remover 'token=' se existir
    return cleanSecret.replace(/^token=/, '');
  };

  const testConnection = async (formattedConfig: { baseUrl: string; apiSecret: string }) => {
    try {
      setTesting(true);
      setTestError(null);

      console.log('Testando conexão com:', {
        url: formattedConfig.baseUrl,
        hasApiSecret: !!formattedConfig.apiSecret
      });

      const response = await fetch('/api/nightscout/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: formattedConfig.baseUrl,
          apiSecret: formattedConfig.apiSecret
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao testar conexão');
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao testar conexão';
      console.error('Erro no teste:', errorMessage);
      setTestError(errorMessage);
      return false;
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUrl(config.baseUrl)) {
      setUrlError('URL inválida. A URL deve começar com https://');
      return;
    }
    
    setUrlError('');

    const formattedConfig = {
      baseUrl: formatUrl(config.baseUrl),
      apiSecret: formatApiSecret(config.apiSecret)
    };

    console.log('Configuração formatada:', {
      baseUrl: formattedConfig.baseUrl,
      hasApiSecret: !!formattedConfig.apiSecret
    });

    // Testar a conexão antes de salvar
    const isConnectionValid = await testConnection(formattedConfig);

    if (!isConnectionValid) {
      return;
    }

    if (rememberConfig) {
      localStorage.setItem('nightscout_config', JSON.stringify(formattedConfig));
    } else {
      Cookies.set('nightscout_config', JSON.stringify(formattedConfig), { expires: 1 });
    }

    onSubmit(formattedConfig);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setRememberConfig(checked);
      return;
    }

    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'baseUrl') {
      setUrlError('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          URL base da API Nightscout
        </label>
        <input
          type="url"
          name="baseUrl"
          value={config.baseUrl}
          onChange={handleChange}
          className={`mt-1 block w-full px-3 py-2 border ${urlError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
          placeholder="https://seusite.nightscout.com/"
          required
        />
        {urlError && (
          <p className="mt-1 text-sm text-red-600">{urlError}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Exemplo: https://seusite.nightscout.com/
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Chave secreta da API
        </label>
        <input
          type="password"
          name="apiSecret"
          value={config.apiSecret}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="rememberConfig"
          checked={rememberConfig}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="rememberConfig" className="ml-2 block text-sm text-gray-900">
          Lembrar configurações (salvar permanentemente)
        </label>
      </div>

      {testError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro na conexão</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{testError}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <button 
        type="submit" 
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
        disabled={testing}
      >
        {testing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Testando conexão...
          </div>
        ) : (
          'Carregar Dados'
        )}
      </button>
    </form>
  );
}; 