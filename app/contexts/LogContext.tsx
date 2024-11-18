'use client'

import React, { createContext, useContext, useState, useCallback } from 'react';

interface Log {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: number;
}

interface LogContextType {
  logs: Log[];
  isOpen: boolean;
  addLog: (type: Log['type'], title: string, message: string) => void;
  clearLogs: () => void;
  toggleLog: () => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export const LogProvider = ({ children }: { children: React.ReactNode }) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addLog = useCallback((type: Log['type'], title: string, message: string) => {
    const newLog: Log = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title,
      message,
      timestamp: Date.now(),
    };

    setLogs(prev => {
      // Verifica se já existe um log idêntico nos últimos 2 segundos
      const recentDuplicate = prev.find(log => 
        log.type === type && 
        log.title === title && 
        log.message === message &&
        Date.now() - log.timestamp < 2000
      );

      if (recentDuplicate) {
        return prev; // Não adiciona logs duplicados recentes
      }

      const newLogs = [newLog, ...prev];
      return newLogs.slice(0, 100); // Mantém apenas os 100 logs mais recentes
    });

    // Abre automaticamente o log viewer quando há um erro
    if (type === 'error') {
      setIsOpen(true);
    }
  }, []); // Removida a dependência de logs

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const toggleLog = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return (
    <LogContext.Provider value={{ logs, isOpen, addLog, clearLogs, toggleLog }}>
      {children}
    </LogContext.Provider>
  );
};

export const useLog = () => {
  const context = useContext(LogContext);
  if (context === undefined) {
    throw new Error('useLog must be used within a LogProvider');
  }
  return context;
};
