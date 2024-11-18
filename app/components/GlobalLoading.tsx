'use client'

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '../contexts/LoadingContext';

const LOADING_STEPS = [
  { id: 1, message: "Conectando ao Nightscout..." },
  { id: 2, message: "Buscando registros de glicose..." },
  { id: 3, message: "Obtendo status do dispositivo..." },
  { id: 4, message: "Carregando perfis..." },
  { id: 5, message: "Processando dados..." }
];

const INSPIRATIONAL_MESSAGES = [
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

export const GlobalLoading = () => {
  const { isLoading, message } = useLoading();
  const [messageIndex, setMessageIndex] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState(1);

  React.useEffect(() => {
    if (!isLoading) {
      setCurrentStep(1);
      return;
    }

    // Atualiza o passo baseado na mensagem atual
    if (message.includes("Conectando")) setCurrentStep(1);
    else if (message.includes("Buscando")) setCurrentStep(2);
    else if (message.includes("status")) setCurrentStep(3);
    else if (message.includes("perfis")) setCurrentStep(4);
    else if (message.includes("Processando")) setCurrentStep(5);

  }, [isLoading, message]);

  React.useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % INSPIRATIONAL_MESSAGES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  const progress = Math.min((currentStep / LOADING_STEPS.length) * 100, 100);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 overflow-hidden"
        >
          {/* Efeito de borda animada */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(45deg, #3B82F6, #10B981, #6366F1, #3B82F6)',
              backgroundSize: '400% 400%',
              filter: 'blur(15px)',
              opacity: 0.15,
            }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear',
            }}
          />

          {/* Conteúdo */}
          <div className="space-y-8 relative">
            {/* Mensagem Inspiracional */}
            <AnimatePresence mode="wait">
              <motion.div
                key={messageIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center px-4 py-6"
              >
                <p className="text-xl md:text-2xl font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                  {INSPIRATIONAL_MESSAGES[messageIndex]}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Barra de Progresso e Status */}
            <div className="space-y-4">
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{
                    background: 'linear-gradient(90deg, #3B82F6, #10B981)',
                    backgroundSize: '200% 100%',
                  }}
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${progress}%`,
                    backgroundPosition: ['0% 0%', '100% 0%'],
                  }}
                  transition={{
                    width: { duration: 0.5 },
                    backgroundPosition: {
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }
                  }}
                />
              </div>
              
              {/* Mensagem de Status */}
              <motion.p 
                className="text-sm text-gray-600 dark:text-gray-400 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {message || "Carregando..."}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
