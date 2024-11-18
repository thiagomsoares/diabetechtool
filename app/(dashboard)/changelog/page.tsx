'use client'

import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { useLoadingState } from '@/app/hooks/useLoadingState';
import { LoadingSteps } from '@/app/components/LoadingSteps';

interface Release {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  changes: {
    type: 'added' | 'changed' | 'fixed' | 'removed';
    description: string;
  }[];
}

const releases: Release[] = [
  {
    version: '1.2.1',
    date: '2024-03-21',
    type: 'patch',
    changes: [
      {
        type: 'changed',
        description: 'Removidos botões de período de 14 e 30 dias'
      },
      {
        type: 'changed',
        description: 'Simplificação da interface com apenas opções de 3 e 7 dias'
      }
    ]
  },
  {
    version: '1.2.0',
    date: '2024-03-21',
    type: 'minor',
    changes: [
      {
        type: 'added',
        description: 'Página de histórico de atualizações (Changelog)'
      },
      {
        type: 'fixed',
        description: 'Correção na calculadora de perfil para exibir resultados'
      },
      {
        type: 'fixed',
        description: 'Implementação completa do método DPV na calculadora'
      },
      {
        type: 'changed',
        description: 'Melhorias na interface da calculadora de perfil'
      }
    ]
  },
  {
    version: '1.1.0',
    date: '2024-03-20',
    type: 'minor',
    changes: [
      {
        type: 'added',
        description: 'Nova calculadora de perfil com métodos Motol e DPV'
      },
      {
        type: 'added',
        description: 'Configurações para idade e peso do paciente'
      },
      {
        type: 'changed',
        description: 'Período padrão alterado para 3 dias'
      },
      {
        type: 'changed',
        description: 'Simplificação dos botões de período (apenas 3 e 7 dias)'
      },
      {
        type: 'fixed',
        description: 'Otimização no carregamento de fontes'
      },
      {
        type: 'fixed',
        description: 'Correção de bugs na exibição de dados de sensibilidade'
      }
    ]
  },
  {
    version: '1.0.0',
    date: '2024-03-15',
    type: 'major',
    changes: [
      {
        type: 'added',
        description: 'Lançamento inicial do dashboard'
      },
      {
        type: 'added',
        description: 'Análise de tempo no alvo'
      },
      {
        type: 'added',
        description: 'Análise de sensibilidade à insulina'
      },
      {
        type: 'added',
        description: 'Visualização do perfil do Nightscout'
      },
      {
        type: 'added',
        description: 'Configurações personalizáveis'
      }
    ]
  },
  {
    version: '1.3.0',
    date: '2024-03-22',
    type: 'minor',
    changes: [
      {
        type: 'changed',
        description: 'Migração para Bun para melhor performance'
      },
      {
        type: 'fixed',
        description: 'Correção na exibição de dados por período'
      },
      {
        type: 'added',
        description: 'Otimização no carregamento e build do projeto'
      }
    ]
  }
];

export default function ChangelogPage() {
  const [loading, setLoading] = useState(false);
  const { isSearching, currentLoadingStep, motivationalPhrase, LOADING_STEPS } = useLoadingState(loading);

  const getTypeColor = (type: Release['type']) => {
    switch (type) {
      case 'major':
        return 'text-blue-600';
      case 'minor':
        return 'text-green-600';
      case 'patch':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getChangeTypeColor = (type: Release['changes'][0]['type']) => {
    switch (type) {
      case 'added':
        return 'text-green-600';
      case 'changed':
        return 'text-blue-600';
      case 'fixed':
        return 'text-yellow-600';
      case 'removed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getChangeTypeLabel = (type: Release['changes'][0]['type']) => {
    switch (type) {
      case 'added':
        return 'Adicionado';
      case 'changed':
        return 'Alterado';
      case 'fixed':
        return 'Corrigido';
      case 'removed':
        return 'Removido';
      default:
        return type;
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
        <h1 className="text-2xl font-bold mb-4">Histórico de Atualizações</h1>
        <p className="text-gray-600">
          Acompanhe as últimas alterações e melhorias no Diabetech.
        </p>

        <div className="space-y-6">
          {releases.map((release) => (
            <Card key={release.version} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span>Versão {release.version}</span>
                    <span className={`text-sm ${getTypeColor(release.type)}`}>
                      ({release.type})
                    </span>
                  </h3>
                  <p className="text-sm text-gray-500">{release.date}</p>
                </div>
              </div>

              <div className="space-y-4">
                {release.changes.map((change, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className={`text-sm font-medium ${getChangeTypeColor(change.type)}`}>
                      {getChangeTypeLabel(change.type)}:
                    </span>
                    <span className="text-gray-700">{change.description}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}