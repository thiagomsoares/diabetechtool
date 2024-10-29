'use client'

import React from 'react';
import { Card } from 'flowbite-react';

interface SensitivityRecommendationsProps {
  data: {
    isfDynamic: number[];
    isfProfile: number[];
    deviations: number[];
  };
}

export const SensitivityRecommendations = ({ data }: SensitivityRecommendationsProps) => {
  const calculateRecommendations = () => {
    const avgDeviation = data.deviations.reduce((a, b) => a + b, 0) / data.deviations.length;
    const avgISFDynamic = data.isfDynamic.reduce((a, b) => a + b, 0) / data.isfDynamic.length;
    const avgISFProfile = data.isfProfile.reduce((a, b) => a + b, 0) / data.isfProfile.length;

    const recommendations = [];

    if (Math.abs(avgDeviation) > 20) {
      recommendations.push({
        type: 'warning',
        message: `Desvio médio significativo de ${Math.round(avgDeviation)}%. Considere ajustar o ISF do perfil.`
      });
    }

    if (avgISFDynamic > avgISFProfile * 1.2) {
      recommendations.push({
        type: 'info',
        message: 'ISF dinâmico consistentemente maior que o perfil. Considere aumentar o ISF do perfil.'
      });
    } else if (avgISFDynamic < avgISFProfile * 0.8) {
      recommendations.push({
        type: 'info',
        message: 'ISF dinâmico consistentemente menor que o perfil. Considere diminuir o ISF do perfil.'
      });
    }

    return recommendations;
  };

  const recommendations = calculateRecommendations();

  return (
    <Card>
      <h5 className="text-xl font-bold mb-4">Recomendações</h5>
      <div className="space-y-4">
        {recommendations.length > 0 ? (
          recommendations.map((rec, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg ${
                rec.type === 'warning' ? 'bg-yellow-50 text-yellow-800' : 'bg-blue-50 text-blue-800'
              }`}
            >
              {rec.message}
            </div>
          ))
        ) : (
          <p className="text-gray-500">
            Não há recomendações específicas no momento. Seus ajustes parecem adequados.
          </p>
        )}
      </div>
    </Card>
  );
}; 