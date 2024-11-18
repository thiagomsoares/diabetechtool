'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import Cookies from 'js-cookie';
import { useApp } from '../contexts/AppContext';
import { useLog } from '../contexts/LogContext';
import { adjustTimestampToTimezone, getTimezoneOffset, convertUTCToUserTime, convertUserTimeToUTC, getUserTimezone } from '@/app/utils/timezone';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';
import { format, addDays } from 'date-fns';
import { 
  NightscoutData, 
  NightscoutConfig, 
  LoadingStats,
  DeviceStatus,
  NightscoutProfile,
  ProfileStore
} from '@/app/types/nightscout';
import { useTimezone } from './useTimezone';
import { useLoading } from '../contexts/LoadingContext';
import { cache } from '../lib/cache';

interface HourlyData {
  hour: number;
  avgDeviation: number;
  avgIsfDynamic: number;
  avgIsfProfile: number;
  count: number;
}

interface ProcessedData {
  timestamps: string[];
  bgs: number[];
  isfDynamic: number[];
  isfProfile: number[];
  deviations: number[];
  tableData: {
    timestamp: string;
    bg: number;
    isfDynamic: number;
    isfProfile: number;
    deviation: number;
  }[];
  hourlyStats: HourlyData[];
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

const CACHE_KEYS = {
  ENTRIES: (start: string, end: string) => `entries_${start}_${end}`,
  DEVICESTATUS: (start: string, end: string) => `devicestatus_${start}_${end}`,
  PROFILES: (start: string, end: string) => `profiles_${start}_${end}`
};

const fetchWithCache = async <T>(
  url: string, 
  apiSecret: string, 
  cacheKey: string,
  ttl: number = 5 * 60 * 1000 // 5 minutos
): Promise<T> => {
  // Tentar obter do cache primeiro
  const cachedData = cache.get<T>(cacheKey);
  if (cachedData) {
    console.debug('🎯 Cache hit:', { cacheKey });
    return cachedData;
  }

  // Se não estiver em cache, buscar da API
  console.debug('🌐 Cache miss, fetching:', { url });
  const response = await fetch('/api/nightscout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, apiSecret }),
  });

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Salvar no cache
  cache.set(cacheKey, data, ttl);
  
  return data;
};

export const useNightscoutData = () => {
  const { settings, calculateDataPoints } = useApp();
  const [data, setData] = useState<ProcessedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [loadingStats, setLoadingStats] = useState<LoadingStats | null>(null);
  const { timezone, convertToUserTime, convertToUTC } = useTimezone();
  const { startLoading, stopLoading, updateMessage } = useLoading();
  const { addLog } = useLog();
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const config = localStorage.getItem('nightscout_config') || Cookies.get('nightscout_config');
    setIsConfigured(!!config);
  }, []);

  const getConfig = (): NightscoutConfig => {
    const config = localStorage.getItem('nightscout_config') || Cookies.get('nightscout_config');
    if (!config) {
      throw new Error('Configuração do Nightscout não encontrada. Por favor, configure a URL e a chave API.');
    }

    try {
      const parsedConfig = JSON.parse(config);
      
      if (!parsedConfig.baseUrl) {
        throw new Error('URL base do Nightscout não configurada.');
      }

      // Validar e limpar a URL base
      let cleanBaseUrl = parsedConfig.baseUrl.trim();
      if (!cleanBaseUrl.startsWith('http://') && !cleanBaseUrl.startsWith('https://')) {
        cleanBaseUrl = 'https://' + cleanBaseUrl;
      }
      cleanBaseUrl = cleanBaseUrl.replace(/\/+$/, ''); // Remove barras no final

      return {
        baseUrl: cleanBaseUrl,
        apiSecret: parsedConfig.apiSecret || ''
      };
    } catch (error) {
      throw new Error(`Erro ao processar configuração do Nightscout: ${error instanceof Error ? error.message : 'Formato inválido'}`);
    }
  };

  const processHourlyData = (data: ProcessedData): HourlyData[] => {
    const hourlyData: { [hour: number]: { 
      deviations: number[],
      isfDynamic: number[],
      isfProfile: number[],
      count: number
    }} = {};

    // Inicializar dados para cada hora
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = {
        deviations: [],
        isfDynamic: [],
        isfProfile: [],
        count: 0
      };
    }

    // Agrupar dados por hora
    data.tableData.forEach(entry => {
      const hour = new Date(entry.timestamp).getHours();
      hourlyData[hour].deviations.push(entry.deviation);
      hourlyData[hour].isfDynamic.push(entry.isfDynamic);
      hourlyData[hour].isfProfile.push(entry.isfProfile);
      hourlyData[hour].count++;
    });

    // Calcular médias
    return Object.entries(hourlyData).map(([hour, stats]) => ({
      hour: parseInt(hour),
      avgDeviation: stats.deviations.reduce((a, b) => a + b, 0) / stats.count || 0,
      avgIsfDynamic: stats.isfDynamic.reduce((a, b) => a + b, 0) / stats.count || 0,
      avgIsfProfile: stats.isfProfile.reduce((a, b) => a + b, 0) / stats.count || 0,
      count: stats.count
    })).sort((a, b) => a.hour - b.hour);
  };

  const findActiveProfile = (profiles: NightscoutProfile[], timestamp: string) => {
    // Ordenar perfis por data de criação (mais recente primeiro)
    const sortedProfiles = [...profiles].sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    // Encontrar o perfil ativo para o timestamp
    const targetDate = new Date(timestamp);
    const activeProfile = sortedProfiles.find(profile => 
      new Date(profile.startDate) <= targetDate
    );

    return activeProfile || sortedProfiles[0];
  };

  const findProfileSensitivity = (profileStore: ProfileStore, timestamp: string) => {
    const hour = new Date(timestamp).getHours();
    const minutes = new Date(timestamp).getMinutes();
    const timeInMinutes = hour * 60 + minutes;

    // Converter horários do perfil para minutos para comparação
    const sensSchedule = profileStore.sens
      .map(s => ({
        ...s,
        minutesFromMidnight: parseInt(s.time.split(':')[0]) * 60 + parseInt(s.time.split(':')[1] || '0')
      }))
      .sort((a, b) => a.minutesFromMidnight - b.minutesFromMidnight);

    // Encontrar o valor de sensibilidade apropriado
    const activeSens = sensSchedule.reduce((prev, curr) => {
      if (curr.minutesFromMidnight <= timeInMinutes) {
        return curr;
      }
      return prev;
    }, sensSchedule[sensSchedule.length - 1]);

    return activeSens.value;
  };

  const getProfileISF = (profiles: ProfileStore[], timestamp: string) => {
    const activeProfile = findActiveProfile(profiles, timestamp);
    if (activeProfile?.store) {
      const profileStore = activeProfile.store[activeProfile.defaultProfile];
      if (profileStore?.sens) {
        return findProfileSensitivity(profileStore, timestamp);
      }
    }
    return null;
  };

  const calculateHourlyStats = (data: ProcessedData) => {
    const hourlyData: { [hour: number]: { 
      deviations: number[],
      isfDynamic: number[],
      isfProfile: number[],
      count: number
    }} = {};

    // Inicializar dados para cada hora
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = {
        deviations: [],
        isfDynamic: [],
        isfProfile: [],
        count: 0
      };
    }

    // Agrupar dados por hora
    data.tableData.forEach(entry => {
      const hour = new Date(entry.timestamp).getHours();
      hourlyData[hour].deviations.push(entry.deviation);
      hourlyData[hour].isfDynamic.push(entry.isfDynamic);
      hourlyData[hour].isfProfile.push(entry.isfProfile);
      hourlyData[hour].count++;
    });

    // Calcular médias
    return Object.entries(hourlyData).map(([hour, stats]) => ({
      hour: parseInt(hour),
      avgDeviation: stats.deviations.reduce((a, b) => a + b, 0) / stats.count || 0,
      avgIsfDynamic: stats.isfDynamic.reduce((a, b) => a + b, 0) / stats.count || 0,
      avgIsfProfile: stats.isfProfile.reduce((a, b) => a + b, 0) / stats.count || 0,
      count: stats.count
    })).sort((a, b) => a.hour - b.hour);
  };

  const processEntries = async (entries: any[]) => {
    console.debug('🔄 Iniciando processamento de entries:', { total: entries.length });
    updateMessage("Processando registros de glicose...");
    
    // Pré-alocação de memória para melhor performance
    const timestamps: string[] = [];
    const bgs: number[] = [];
    const tableData: any[] = [];
    
    // Processamento em chunks menores
    const chunkSize = 100;
    let processed = 0;
    
    for (let i = 0; i < entries.length; i += chunkSize) {
      const chunk = entries.slice(i, i + chunkSize);
      
      // Processamento síncrono do chunk atual
      chunk.forEach(entry => {
        if (entry && entry.date && (entry.sgv || entry.glucose)) {
          const timestamp = new Date(entry.date).toISOString();
          const bg = entry.sgv || entry.glucose;
          
          if (!isNaN(bg)) {
            timestamps.push(timestamp);
            bgs.push(bg);
            tableData.push({
              timestamp,
              bg,
              isfDynamic: 0,
              isfProfile: 0,
              deviation: 0
            });
          }
        }
      });
      
      processed += chunk.length;
      updateMessage(`Processando glicose... ${Math.round((processed / entries.length) * 100)}%`);
      
      // Yield para UI a cada chunk
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    return {
      timestamps,
      bgs,
      isfDynamic: [],
      isfProfile: [],
      deviations: [],
      tableData,
      hourlyStats: []
    };
  };

  const processDeviceStatus = async (devicestatus: DeviceStatus[], profiles: ProfileStore[]) => {
    console.debug('🔄 Iniciando processamento de devicestatus');
    updateMessage("Processando dados do dispositivo...");
    
    // Pré-alocação de memória
    const timestamps: string[] = [];
    const bgs: number[] = [];
    const isfDynamic: number[] = [];
    const isfProfile: number[] = [];
    const deviations: number[] = [];
    const tableData: any[] = [];
    
    // Cache de ISF profiles para melhor performance
    const isfCache = new Map<string, number>();
    
    // Processamento em chunks menores
    const chunkSize = 100;
    let processed = 0;
    
    for (let i = 0; i < devicestatus.length; i += chunkSize) {
      const chunk = devicestatus.slice(i, i + chunkSize);
      
      // Processamento síncrono do chunk atual
      chunk.forEach(status => {
        if (status?.openaps?.suggested) {
          const timestamp = new Date(status.created_at).toISOString();
          const bg = status.openaps.suggested.bg;
          const dynamic = status.openaps.suggested.sens;
          
          // Usar cache para ISF profile
          let profile = isfCache.get(timestamp);
          if (profile === undefined) {
            profile = getProfileISF(profiles, timestamp);
            isfCache.set(timestamp, profile || 0);
          }
          
          if (bg && dynamic && profile && !isNaN(bg) && !isNaN(dynamic) && !isNaN(profile)) {
            const deviation = ((dynamic - profile) / profile) * 100;
            
            timestamps.push(timestamp);
            bgs.push(bg);
            isfDynamic.push(dynamic);
            isfProfile.push(profile);
            deviations.push(deviation);
            tableData.push({
              timestamp,
              bg,
              isfDynamic: dynamic,
              isfProfile: profile,
              deviation
            });
          }
        }
      });
      
      processed += chunk.length;
      updateMessage(`Processando sensibilidade... ${Math.round((processed / devicestatus.length) * 100)}%`);
      
      // Yield para UI a cada chunk
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    return {
      timestamps,
      bgs,
      isfDynamic,
      isfProfile,
      deviations,
      tableData,
      hourlyStats: []
    };
  };

  const mergeData = async (entriesData: ProcessedData, deviceData: ProcessedData): Promise<ProcessedData> => {
    updateMessage("Combinando dados...");
    
    // Usar Map para lookup mais eficiente
    const deviceMap = new Map(
      deviceData.timestamps.map((timestamp, index) => [
        timestamp,
        {
          isfDynamic: deviceData.isfDynamic[index],
          isfProfile: deviceData.isfProfile[index],
          deviation: deviceData.deviations[index]
        }
      ])
    );
    
    // Processar em chunks para não travar a UI
    const chunkSize = 100;
    const result: ProcessedData = {
      timestamps: [],
      bgs: [],
      isfDynamic: [],
      isfProfile: [],
      deviations: [],
      tableData: [],
      hourlyStats: []
    };
    
    for (let i = 0; i < entriesData.timestamps.length; i += chunkSize) {
      const chunk = entriesData.timestamps.slice(i, i + chunkSize);
      
      chunk.forEach((timestamp, idx) => {
        const actualIdx = i + idx;
        const deviceInfo = deviceMap.get(timestamp);
        
        result.timestamps.push(timestamp);
        result.bgs.push(entriesData.bgs[actualIdx]);
        result.isfDynamic.push(deviceInfo?.isfDynamic || 0);
        result.isfProfile.push(deviceInfo?.isfProfile || 0);
        result.deviations.push(deviceInfo?.deviation || 0);
        result.tableData.push({
          timestamp,
          bg: entriesData.bgs[actualIdx],
          isfDynamic: deviceInfo?.isfDynamic || 0,
          isfProfile: deviceInfo?.isfProfile || 0,
          deviation: deviceInfo?.deviation || 0
        });
      });
      
      updateMessage(`Combinando dados... ${Math.round((i / entriesData.timestamps.length) * 100)}%`);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    // Calcular estatísticas por hora
    updateMessage("Calculando estatísticas...");
    result.hourlyStats = calculateHourlyStats(result);
    
    return result;
  };

  const fetchProfiles = async (baseUrl: string, apiSecret: string, formattedStartDate: string, formattedEndDate: string) => {
    updateMessage("Carregando perfis...");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

    try {
      const profilesUrl = `${baseUrl}/api/v1/profiles?find[startDate][$gte]=${formattedStartDate}&find[startDate][$lte]=${formattedEndDate}`;
      
      const profilesResponse = await fetch('/api/nightscout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: profilesUrl, apiSecret }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!profilesResponse.ok) {
        throw new Error(`Erro ao buscar profiles: ${profilesResponse.statusText}`);
      }

      const profiles = await profilesResponse.json();
      
      if (!Array.isArray(profiles) || profiles.length === 0) {
        addLog('warning', 'Perfis', 'Nenhum perfil encontrado para o período selecionado. Usando perfil padrão.');
        // Retorna um perfil padrão para não bloquear a aplicação
        return [{
          startDate: formattedStartDate,
          defaultProfile: 'Default',
          store: {
            Default: {
              sens: [{ time: '00:00', value: 50, timeAsSeconds: 0 }]
            }
          }
        }];
      }

      addLog('success', 'Perfis Carregados', 
        `Total de perfis: ${profiles.length}\n` +
        `Primeiro perfil: ${format(new Date(profiles[0].startDate), 'dd/MM/yyyy HH:mm')}\n` +
        `Último perfil: ${format(new Date(profiles[profiles.length - 1].startDate), 'dd/MM/yyyy HH:mm')}`
      );

      return profiles;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        addLog('warning', 'Timeout', 'Tempo limite excedido ao carregar perfis. Usando perfil padrão.');
      } else {
        addLog('error', 'Erro ao Carregar Perfis', 
          `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`
        );
      }
      // Retorna um perfil padrão em caso de erro
      return [{
        startDate: formattedStartDate,
        defaultProfile: 'Default',
        store: {
          Default: {
            sens: [{ time: '00:00', value: 50, timeAsSeconds: 0 }]
          }
        }
      }];
    }
  };

  const fetchData = useCallback(async (dateRange: DateRange) => {
    if (isFetchingRef.current) {
      console.log('⚠️ Busca já em andamento');
      return;
    }

    if (!dateRange.startDate || !dateRange.endDate) {
      const msg = 'Por favor, selecione um período válido para a busca.';
      setError(msg);
      addLog('error', 'Erro de Validação', msg);
      return;
    }

    isFetchingRef.current = true;
    startLoading('Conectando ao Nightscout...');
    setError(null);
    setLoadingStats(null);

    try {
      const savedConfig = getConfig();
      if (!savedConfig.baseUrl) {
        throw new Error('URL do Nightscout não configurada corretamente.');
      }

      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Datas selecionadas são inválidas.');
      }

      if (startDate > endDate) {
        throw new Error('A data inicial não pode ser posterior à data final.');
      }

      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(addDays(endDate, 1), 'yyyy-MM-dd');
      
      addLog('info', 'Período da Busca', 
        `Início: ${format(startDate, 'dd/MM/yyyy HH:mm')}\n` +
        `Fim: ${format(endDate, 'dd/MM/yyyy HH:mm')}\n` +
        `Timezone: ${timezone}`
      );

      const diffMinutes = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60));
      const expectedDataPoints = Math.ceil(diffMinutes / settings.sensorInterval);

      setLoadingStats({ current: 0, total: expectedDataPoints });

      // Buscar dados em paralelo
      updateMessage("Buscando dados...");
      const [entries, devicestatus, profiles] = await Promise.all([
        // Entries
        fetchWithCache(
          `${savedConfig.baseUrl}/api/v1/entries?find[dateString][$gte]=${formattedStartDate}&find[dateString][$lte]=${formattedEndDate}&count=${expectedDataPoints}`,
          savedConfig.apiSecret,
          CACHE_KEYS.ENTRIES(formattedStartDate, formattedEndDate)
        ),
        // DeviceStatus
        fetchWithCache(
          `${savedConfig.baseUrl}/api/v1/devicestatus?find[created_at][$gte]=${formattedStartDate}&find[created_at][$lte]=${formattedEndDate}&count=${expectedDataPoints}`,
          savedConfig.apiSecret,
          CACHE_KEYS.DEVICESTATUS(formattedStartDate, formattedEndDate)
        ),
        // Profiles
        fetchWithCache(
          `${savedConfig.baseUrl}/api/v1/profiles?find[startDate][$gte]=${formattedStartDate}&find[startDate][$lte]=${formattedEndDate}`,
          savedConfig.apiSecret,
          CACHE_KEYS.PROFILES(formattedStartDate, formattedEndDate)
        )
      ]);

      if (!Array.isArray(entries) || entries.length === 0) {
        throw new Error('Nenhum dado encontrado para o período selecionado');
      }

      // Processar dados em paralelo
      updateMessage("Processando dados...");
      const [processedEntries, processedDevice] = await Promise.all([
        processEntries(entries),
        Array.isArray(devicestatus) && devicestatus.length > 0
          ? processDeviceStatus(devicestatus, profiles)
          : null
      ]);

      // Merge final dos dados
      updateMessage("Finalizando...");
      const finalData = processedDevice
        ? await mergeData(processedEntries, processedDevice)
        : processedEntries;

      setData(finalData);
      addLog('success', 'Processamento Concluído', 
        `Total de registros: ${finalData.timestamps.length}\n` +
        `Primeiro: ${format(new Date(finalData.timestamps[0]), 'dd/MM/yyyy HH:mm')}\n` +
        `Último: ${format(new Date(finalData.timestamps[finalData.timestamps.length - 1]), 'dd/MM/yyyy HH:mm')}`
      );

    } catch (error) {
      console.error('❌ Erro:', error);
      const msg = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(msg);
      addLog('error', 'Erro', msg);
      setData(null);
    } finally {
      isFetchingRef.current = false;
      stopLoading();
    }
  }, [settings?.sensorInterval, addLog, startLoading, stopLoading, timezone, updateMessage]);

  return { data, error, fetchData, isConfigured, loadingStats };
};