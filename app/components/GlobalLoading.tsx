'use client'

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '../contexts/LoadingContext';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

// Movido para fora do componente para evitar recriação
const LOADING_STEPS = [
  { id: 1, message: "Conectando ao Nightscout" },
  { id: 2, message: "Buscando registros de glicose" },
  { id: 3, message: "Obtendo status do dispositivo" },
  { id: 4, message: "Carregando perfis" },
  { id: 5, message: "Processando dados" }
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

// Componente de passo memoizado
const LoadingStep = memo(({ 
  step, 
  currentStep 
}: { 
  step: { id: number; message: string }; 
  currentStep: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: step.id * 0.1 }}
    className={`flex items-center space-x-3 ${
      step.id === currentStep
        ? 'text-blue-600 dark:text-blue-400'
        : step.id < currentStep
        ? 'text-green-600 dark:text-green-400'
        : 'text-gray-400 dark:text-gray-500'
    }`}
  >
    {step.id < currentStep ? (
      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
    ) : step.id === currentStep ? (
      <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" />
    ) : (
      <Circle className="w-5 h-5 flex-shrink-0" />
    )}
    <span className={`text-sm ${
      step.id === currentStep
        ? 'font-medium'
        : step.id < currentStep
        ? 'text-gray-600 dark:text-gray-300'
        : 'text-gray-400 dark:text-gray-500'
    }`}>
      {step.message}
    </span>
  </motion.div>
));

LoadingStep.displayName = 'LoadingStep';

// Componente de progresso memoizado
const ProgressBar = memo(({ progress }: { progress: number }) => (
  <div className="space-y-2">
    <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
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
    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
      {Math.round(progress)}% Concluído
    </p>
  </div>
));

ProgressBar.displayName = 'ProgressBar';

export const GlobalLoading = () => {
  const { isLoading, message } = useLoading();
  const [messageIndex, setMessageIndex] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState(1);
  const messageIntervalRef = React.useRef<NodeJS.Timeout>();

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
    if (!isLoading) {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
      }
      return;
    }

    messageIntervalRef.current = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % INSPIRATIONAL_MESSAGES.length);
    }, 3000);

    return () => {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
      }
    };
  }, [isLoading]);

  if (!isLoading) return null;

  const progress = Math.min((currentStep / LOADING_STEPS.length) * 100, 100);

  return (
    <AnimatePresence mode="wait">
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
          <div className="space-y-6 relative">
            {/* Mensagem Inspiracional */}
            <AnimatePresence mode="wait">
              <motion.div
                key={messageIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center px-4 py-4"
              >
                <p className="text-lg md:text-xl font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                  {INSPIRATIONAL_MESSAGES[messageIndex]}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Barra de Progresso */}
            <ProgressBar progress={progress} />

            {/* Lista de Passos */}
            <div className="space-y-3 pt-2">
              {LOADING_STEPS.map((step) => (
                <LoadingStep
                  key={step.id}
                  step={step}
                  currentStep={currentStep}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
