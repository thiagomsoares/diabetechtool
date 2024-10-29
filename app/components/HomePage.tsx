'use client'

import React from 'react';
import { ConfigForm } from './ConfigForm';
import { Activity, GitPullRequest, LineChart } from 'lucide-react';

interface HomePageProps {
  onConfigured: () => void;
}

export const HomePage = ({ onConfigured }: HomePageProps) => {
  const features = [
    {
      name: 'Análise de Sensibilidade',
      description: 'Compare a sensibilidade dinâmica do AndroidAPS com seu perfil configurado',
      icon: GitPullRequest,
    },
    {
      name: 'Visualização de Dados',
      description: 'Gráficos interativos para melhor compreensão dos dados',
      icon: LineChart,
    },
    {
      name: 'Monitoramento de Padrões',
      description: 'Identifique padrões e tendências em seus dados',
      icon: Activity,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:text-center mb-16">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Diabetech</h2>
          <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
            Dashboard Inteligente para Diabetes Tipo 1
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Uma ferramenta gratuita para análise avançada dos seus dados do Nightscout
          </p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                        <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{feature.name}</h3>
                    <p className="mt-5 text-base text-gray-500">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="max-w-xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
                Comece agora
              </h2>
              <p className="text-lg text-gray-500 text-center mb-8">
                Configure sua conexão com o Nightscout para começar a análise dos seus dados
              </p>
              <ConfigForm onSubmit={onConfigured} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 