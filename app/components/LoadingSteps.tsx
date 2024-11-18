import React from 'react';
import { Transition } from './Transition';
import { LoadingSpinner } from './LoadingSpinner';
import { ProgressBar } from './ProgressBar';

interface LoadingStepsProps {
  isSearching: boolean;
  currentLoadingStep: number;
  motivationalPhrase: string;
  loadingSteps: Array<{ id: number; message: string }>;
}

export const LoadingSteps: React.FC<LoadingStepsProps> = ({
  isSearching,
  currentLoadingStep,
  motivationalPhrase,
  loadingSteps
}) => {
  if (!isSearching) return null;

  return (
    <Transition>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="flex flex-col items-center space-y-6">
            <LoadingSpinner />
            
            <div className="w-full space-y-4">
              <ProgressBar 
                progress={(currentLoadingStep / loadingSteps.length) * 100} 
              />
              
              <div className="space-y-2">
                {loadingSteps.map((step) => (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-2 ${
                      step.id <= currentLoadingStep
                        ? 'text-blue-600'
                        : 'text-gray-400'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        step.id <= currentLoadingStep
                          ? 'bg-blue-600'
                          : 'bg-gray-300'
                      }`}
                    />
                    <span className="text-sm">{step.message}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-4">
              <p className="text-gray-600 text-sm italic animate-pulse">
                {motivationalPhrase}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
};
