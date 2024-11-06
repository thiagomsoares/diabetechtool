'use client'

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useApp } from '../contexts/AppContext';
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

export const useNightscoutData = () => {
  const { settings, calculateDataPoints } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProcessedData | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [loadingStats, setLoadingStats] = useState<LoadingStats | null>(null);
  const { timezone, convertToUserTime, convertToUTC } = useTimezone();

  useEffect(() => {
    const config = localStorage.getItem('nightscout_config') || Cookies.get('nightscout_config');
    setIsConfigured(!!config);
  }, []);

  const getConfig = () => {
    const localConfig = localStorage.getItem('nightscout_config');
    const cookieConfig = Cookies.get('nightscout_config');
    const config = localConfig || cookieConfig;
    
    if (!config) {
      throw new Error('Configurações do Nightscout não encontradas. Por favor, configure novamente.');
    }
    
    return JSON.parse(config);
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

  const processData = (devicestatus: DeviceStatus[], profiles: NightscoutProfile[]) => {
    console.log('Iniciando processamento de dados:', {
      devicestatusCount: devicestatus.length,
      profilesCount: profiles.length
    });

    const processedData: ProcessedData = {
      timestamps: [],
      bgs: [],
      isfDynamic: [],
      isfProfile: [],
      deviations: [],
      tableData: [],
      hourlyStats: []
    };

    // Ordenar devicestatus por data
    devicestatus.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    let processedCount = 0;
    let skippedCount = 0;

    devicestatus.forEach(status => {
      if (status.openaps?.suggested) {
        const suggested = status.openaps.suggested;
        const timestamp = new Date(status.created_at).toISOString();
        const bg = suggested.bg;

        // Buscar o ISF dinâmico
        let isfDynamic = null;
        if (suggested.sens) {
          isfDynamic = suggested.sens;
        } else if (suggested.sensitivities) {
          isfDynamic = suggested.sensitivities;
        } else if (suggested.variable_sens) {
          isfDynamic = suggested.variable_sens;
        } else if (suggested.sensitivityRatio) {
          isfDynamic = 70 / suggested.sensitivityRatio;
        }

        // Encontrar o perfil ativo e seu ISF
        const activeProfile = findActiveProfile(profiles, timestamp);
        let isfProfile = null;

        if (activeProfile?.store) {
          const profileStore = activeProfile.store[activeProfile.defaultProfile];
          if (profileStore?.sens) {
            isfProfile = findProfileSensitivity(profileStore, timestamp);
          }
        }

        if (bg && isfDynamic && isfProfile) {
          const deviation = ((isfDynamic - isfProfile) / isfProfile) * 100;

          processedData.timestamps.push(timestamp);
          processedData.bgs.push(bg);
          processedData.isfDynamic.push(isfDynamic);
          processedData.isfProfile.push(isfProfile);
          processedData.deviations.push(deviation);

          processedData.tableData.push({
            timestamp,
            bg,
            isfDynamic,
            isfProfile,
            deviation
          });

          processedCount++;
        } else {
          skippedCount++;
        }
      }
    });

    console.log('Processamento concluído:', {
      processedCount,
      skippedCount,
      resultSize: {
        timestamps: processedData.timestamps.length,
        bgs: processedData.bgs.length,
        isfDynamic: processedData.isfDynamic.length,
        isfProfile: processedData.isfProfile.length,
        deviations: processedData.deviations.length,
        tableData: processedData.tableData.length
      }
    });

    // Processar estatísticas por hora
    processedData.hourlyStats = processHourlyData(processedData);

    return processedData;
  };

  const fetchData = async (dateRange: DateRange) => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setError('Datas inválidas');
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingStats(null);

    try {
      const savedConfig = getConfig();
      const { baseUrl, apiSecret } = savedConfig;
      const cleanBaseUrl = baseUrl.replace(/\/$/, '');

      // Formatar datas para a API
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Datas inválidas');
      }

      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(addDays(endDate, 1), 'yyyy-MM-dd');

      // Calcular o número de pontos baseado no intervalo do sensor
      const diffMinutes = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60));
      const expectedDataPoints = Math.ceil(diffMinutes / settings.sensorInterval);

      setLoadingStats({ current: 0, total: expectedDataPoints });

      // Buscar entries
      const entriesUrl = `${cleanBaseUrl}/api/v1/entries?find[dateString][$gte]=${formattedStartDate}&find[dateString][$lte]=${formattedEndDate}&count=${expectedDataPoints}`;
      
      const entriesResponse = await fetch('/api/nightscout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: entriesUrl, apiSecret }),
      });

      if (!entriesResponse.ok) {
        throw new Error(`Erro ao buscar entries: ${entriesResponse.statusText}`);
      }

      const entries = await entriesResponse.json();

      // Processar dados de glicose
      const processedData: ProcessedData = {
        timestamps: entries.map((entry: any) => new Date(entry.date).toISOString()),
        bgs: entries.map((entry: any) => entry.sgv || entry.glucose),
        isfDynamic: [],
        isfProfile: [],
        deviations: [],
        tableData: entries.map((entry: any) => ({
          timestamp: new Date(entry.date).toISOString(),
          bg: entry.sgv || entry.glucose,
          isfDynamic: 0,
          isfProfile: 0,
          deviation: 0
        })),
        hourlyStats: []
      };

      // Buscar devicestatus
      try {
        const devicestatusUrl = `${cleanBaseUrl}/api/v1/devicestatus?find[created_at][$gte]=${formattedStartDate}&find[created_at][$lte]=${formattedEndDate}&count=${expectedDataPoints}`;
        const devicestatusResponse = await fetch('/api/nightscout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: devicestatusUrl, apiSecret }),
        });

        if (devicestatusResponse.ok) {
          const devicestatus = await devicestatusResponse.json();
          
          // Adicionar log para debug da chamada do perfil
          console.log('Buscando perfis...');
          const profileResponse = await fetch('/api/nightscout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: `${cleanBaseUrl}/api/v1/profile`,
              apiSecret
            }),
          });

          console.log('Resposta do perfil:', {
            ok: profileResponse.ok,
            status: profileResponse.status
          });

          if (profileResponse.ok) {
            const profiles = await profileResponse.json();
            console.log('Perfis carregados:', profiles.length);
            const processedWithSensitivity = processData(devicestatus, profiles);
            setData({
              ...processedData,
              ...processedWithSensitivity
            });
          } else {
            console.error('Erro ao carregar perfis:', await profileResponse.text());
            setData(processedData);
          }
        }
      } catch (err) {
        console.error('Erro detalhado:', err);
      }

    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados');
    } finally {
      setLoading(false);
      setLoadingStats(null);
    }
  };

  return { data, loading, error, fetchData, isConfigured, loadingStats };
}; 