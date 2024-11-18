'use client'

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLog } from '../contexts/LogContext';
import { format } from 'date-fns';

export const LogViewer = () => {
  const { logs, isOpen, toggleLog, clearLogs } = useLog();
  const [filter, setFilter] = React.useState('all'); // all, error, info, warning

  const filteredLogs = React.useMemo(() => {
    if (filter === 'all') return logs;
    return logs.filter(log => log.type === filter);
  }, [logs, filter]);

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-500 dark:text-red-400';
      case 'warning':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'success':
        return 'text-green-500 dark:text-green-400';
      default:
        return 'text-blue-500 dark:text-blue-400';
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Aba do Log */}
      <button
        onClick={toggleLog}
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full 
                 bg-gray-800 text-white px-4 py-2 rounded-t-lg shadow-lg 
                 hover:bg-gray-700 transition-colors"
      >
        Logs {logs.length > 0 && `(${logs.length})`}
      </button>

      {/* Painel de Log */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-2xl"
          >
            {/* Barra de Ferramentas */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">Todos os Logs</option>
                  <option value="error">Erros</option>
                  <option value="warning">Avisos</option>
                  <option value="info">Informações</option>
                  <option value="success">Sucesso</option>
                </select>
                <button
                  onClick={clearLogs}
                  className="text-red-500 hover:text-red-600 text-sm"
                >
                  Limpar Logs
                </button>
              </div>
              <button
                onClick={toggleLog}
                className="text-gray-500 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Lista de Logs */}
            <div className="max-h-64 overflow-y-auto p-4 space-y-2">
              {filteredLogs.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                  Nenhum log disponível
                </div>
              ) : (
                filteredLogs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`p-3 rounded-lg ${
                      log.type === 'error' 
                        ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
                        : 'bg-gray-50 dark:bg-gray-900/20'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <span className="flex-shrink-0 text-lg">
                        {getLogIcon(log.type)}
                      </span>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium ${getLogColor(log.type)}`}>
                            {log.title}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {format(log.timestamp, 'HH:mm:ss')}
                          </span>
                        </div>
                        <div className={`mt-1 text-sm break-words ${
                          log.type === 'error' 
                            ? 'text-red-700 dark:text-red-300' 
                            : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {log.type === 'error' ? (
                            <div className="space-y-2">
                              <div className="font-medium">Detalhes do Erro:</div>
                              <div className="pl-2 border-l-2 border-red-300 dark:border-red-700">
                                {log.message.split('\n').map((line, i) => (
                                  <div key={i} className="py-0.5">
                                    {line || '\u00A0'}
                                  </div>
                                ))}
                              </div>
                              {log.message.includes('Error:') && (
                                <div className="mt-2 text-xs bg-red-100 dark:bg-red-900/40 p-2 rounded">
                                  <span className="font-medium">Erro Técnico:</span>{' '}
                                  {log.message.split('Error:')[1].trim()}
                                </div>
                              )}
                            </div>
                          ) : (
                            log.message
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
