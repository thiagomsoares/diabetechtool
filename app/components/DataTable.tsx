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

export const DataTable = ({ data }: DataTableProps) => {
  const { settings } = useApp();

  const [sortConfig, setSortConfig] = useState<{
    key: keyof DataTableProps['data'][0];
    direction: 'asc' | 'desc';
  } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

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
                  {formatTimestampWithTimezone(row.timestamp, settings.timezone || 'UTC', 'dd/MM/yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.bg} mg/dL
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.isfDynamic.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.isfProfile.toFixed(2)}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  row.deviation > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {row.deviation.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex justify-between w-full">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> até{' '}
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> de{' '}
            <span className="font-medium">{sortedData.length}</span> resultados
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 