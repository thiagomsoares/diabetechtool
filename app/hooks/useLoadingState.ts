import { useState, useEffect } from 'react';

export const LOADING_STEPS = [
  { id: 1, message: "Conectando ao Nightscout..." },
  { id: 2, message: "Buscando dados do período..." },
  { id: 3, message: "Processando informações..." },
  { id: 4, message: "Calculando estatísticas..." },
  { id: 5, message: "Gerando visualizações..." }
];

export const MOTIVATIONAL_PHRASES = [
  "Cada número é uma história, cada dado uma oportunidade de evolução",
  "Conhecimento é a chave para uma vida mais equilibrada",
  "Pequenos ajustes hoje, grandes conquistas amanhã",
  "Seus dados são o mapa para uma jornada de sucesso",
  "A consistência é o caminho para o controle",
  "Entender seus padrões é o primeiro passo para transformá-los",
  "Cada análise nos aproxima do equilíbrio ideal",
  "O autoconhecimento é a base para o autocuidado",
  "Dados são mais que números, são ferramentas de transformação",
  "Sua dedicação diária constrói resultados extraordinários"
];

export const useLoadingState = (isLoading: boolean) => {
  const [isSearching, setIsSearching] = useState(false);
  const [currentLoadingStep, setCurrentLoadingStep] = useState(0);
  const [motivationalPhrase, setMotivationalPhrase] = useState('');
  const [loadingStepTimer, setLoadingStepTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isSearching) {
      const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length);
        setMotivationalPhrase(MOTIVATIONAL_PHRASES[randomIndex]);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isSearching]);

  const startLoading = () => {
    setIsSearching(true);
    setCurrentLoadingStep(1);
    
    const timer = setInterval(() => {
      setCurrentLoadingStep(prev => {
        if (prev >= LOADING_STEPS.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    setLoadingStepTimer(timer);
  };

  const stopLoading = () => {
    setIsSearching(false);
    setCurrentLoadingStep(0);
    if (loadingStepTimer) {
      clearInterval(loadingStepTimer);
      setLoadingStepTimer(null);
    }
  };

  useEffect(() => {
    if (isLoading) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [isLoading]);

  return {
    isSearching,
    currentLoadingStep,
    motivationalPhrase,
    LOADING_STEPS
  };
};
