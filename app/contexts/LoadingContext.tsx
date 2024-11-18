'use client'

import React, { createContext, useContext, useState, useCallback } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  message: string;
  startLoading: (message: string) => void;
  stopLoading: () => void;
  updateMessage: (message: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const startLoading = useCallback((message: string) => {
    setIsLoading(true);
    setMessage(message);
  }, []);

  const stopLoading = useCallback(() => {
    // Pequeno delay para garantir que as animações terminem
    setTimeout(() => {
      setIsLoading(false);
      setMessage('');
    }, 500);
  }, []);

  const updateMessage = useCallback((message: string) => {
    setMessage(message);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, message, startLoading, stopLoading, updateMessage }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
