'use client'

import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronDownIcon, ChevronUpIcon, ArrowUpDownIcon } from 'lucide-react';
import { formatTimestampWithTimezone } from '@/app/utils/timezone';
import { useApp } from '@/app/contexts/AppContext';
import { NightscoutData } from '@/app/types/nightscout';

interface DataTableProps {
  data: NightscoutData['tableData'];
}

export const DataTable = ({ data = [] }: DataTableProps) => {
  const { settings } = useApp();
  const timezone = settings?.timezone || 'UTC';

  const [sortConfig, setSortConfig] = useState<{
    key: keyof DataTableProps['data'][0];
    direction: 'asc' | 'desc';
  } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortedData = React.useMemo(() => {
    if (!Array.isArray(data)) return [];
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      if (!a || !b) return 0;
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const validData = Array.isArray(sortedData) ? sortedData : [];
  const paginatedData = validData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(validData.length / itemsPerPage);

  const requestSort = (key: keyof DataTableProps['data'][0]) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName: keyof DataTableProps['data'][0]) => {
    if (!sortConfig || sortConfig.key !== columnName) {
      return <ArrowUpDownIcon className="w-4 h-4 ml-1" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUpIcon className="w-4 h-4 ml-1" /> : 
      <ChevronDownIcon className="w-4 h-4 ml-1" />;
  };

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum dado disponível
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['timestamp', 'bg', 'isfDynamic', 'isfProfile', 'deviation'].map((column) => (
                <th
                  key={column}
                  onClick={() => requestSort(column as keyof DataTableProps['data'][0])}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    {column === 'timestamp' ? 'Data/Hora' :
                     column === 'bg' ? 'Glicemia' :
                     column === 'isfDynamic' ? 'ISF Dinâmico' :
                     column === 'isfProfile' ? 'ISF Perfil' :
                     'Desvio %'}
                    {getSortIcon(column as keyof DataTableProps['data'][0])}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatTimestampWithTimezone(row.timestamp, timezone, 'dd/MM/yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.bg} mg/dL
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.isfDynamic?.toFixed(2) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.isfProfile?.toFixed(2) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.deviation?.toFixed(2) || '-'}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
};