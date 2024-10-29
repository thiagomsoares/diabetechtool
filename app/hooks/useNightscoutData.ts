'use client'

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useApp } from '../contexts/AppContext';
import { adjustTimestampToTimezone, getTimezoneOffset, convertUTCToUserTime, convertUserTimeToUTC, getUserTimezone } from '@/app/utils/timezone';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';
import { format, addDays } from 'date-fns';

interface NightscoutConfig {
  startDate: string;
  endDate: string;
}

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

interface LoadingStats {
  current: number;
  total: number;
}

export const useNightscoutData = () => {
  const { settings, calculateDataPoints } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProcessedData | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [loadingStats, setLoadingStats] = useState<LoadingStats | null>(null);
  const [timezone, setTimezone] = useState<string>('UTC');

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

  const findActiveProfile = (profiles: any[], timestamp: string) => {
    // Ordenar perfis por data de criação (mais recente primeiro)
    const sortedProfiles = [...profiles].sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    // Encontrar o primeiro perfil que é anterior ou igual à data do timestamp
    const activeProfile = sortedProfiles.find(profile => 
      new Date(profile.startDate) <= new Date(timestamp)
    );

    return activeProfile || sortedProfiles[0]; // Retorna o perfil mais recente se nenhum for encontrado
  };

  const processData = (devicestatus: any[], profiles: any[]) => {
    console.log('Processando dados:', { devicestatus, profiles });
    const total = devicestatus.length;
    let current = 0;

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

    devicestatus.forEach(status => {
      current++;
      if (current % 100 === 0) { // Atualizar a cada 100 registros
        setLoadingStats({ current, total });
      }

      if (status.openaps?.suggested) {
        const suggested = status.openaps.suggested;
        const timestamp = toZonedTime(new Date(status.created_at), timezone);
        const bg = suggested.bg;

        // Buscar o ISF dinâmico
        let isfDynamic = null;
        
        if (status.openaps?.suggested?.sens) {
          isfDynamic = status.openaps.suggested.sens;
        } else if (status.openaps?.suggested?.sensitivities) {
          isfDynamic = status.openaps.suggested.sensitivities;
        } else if (status.openaps?.suggested?.variable_sens) {
          isfDynamic = status.openaps.suggested.variable_sens;
        } else if (status.openaps?.suggested?.sensitivityRatio) {
          isfDynamic = 70 / status.openaps.suggested.sensitivityRatio;
        }

        // Encontrar o perfil ativo para este timestamp específico
        const activeProfile = findActiveProfile(profiles, timestamp.toISOString());
        let isfProfile = null;

        if (activeProfile?.store) {
          const profileData = activeProfile.store[activeProfile.defaultProfile];
          if (profileData?.sens) {
            const hour = new Date(timestamp).getHours();
            const sensSchedule = profileData.sens.find((s: any) => {
              const scheduleHour = parseInt(s.time.split(':')[0]);
              return hour >= scheduleHour;
            });
            if (sensSchedule) {
              isfProfile = sensSchedule.value;
            }
          }
        }

        console.log('Dados processados:', {
          timestamp,
          bg,
          isfDynamic,
          isfProfile,
          profileName: activeProfile?.defaultProfile
        });

        if (bg && isfDynamic && isfProfile) {
          const deviation = ((isfDynamic - isfProfile) / isfProfile) * 100;

          processedData.timestamps.push(timestamp.toISOString());
          processedData.bgs.push(bg);
          processedData.isfDynamic.push(isfDynamic);
          processedData.isfProfile.push(isfProfile);
          processedData.deviations.push(deviation);

          processedData.tableData.push({
            timestamp: timestamp.toISOString(),
            bg,
            isfDynamic,
            isfProfile,
            deviation
          });
        }
      }
    });

    setLoadingStats(null);
    return processedData;
  };

  const fetchTimezone = async () => {
    try {
      const savedConfig = getConfig();
      const { baseUrl, apiSecret } = savedConfig;
      const cleanBaseUrl = baseUrl.replace(/\/$/, '');
      
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

      if (profileResponse.ok) {
        const profiles = await profileResponse.json();
        if (profiles && profiles.length > 0) {
          const activeProfile = profiles[0];
          const profileTimezone = activeProfile.store[activeProfile.defaultProfile]?.timezone;
          if (profileTimezone) {
            setTimezone(profileTimezone);
            return profileTimezone;
          }
        }
      }
      return 'UTC'; // Fallback para UTC se não encontrar o fuso horário
    } catch (error) {
      console.error('Erro ao buscar fuso horário:', error);
      return 'UTC';
    }
  };

  const fetchData = async (config: NightscoutConfig) => {
    setLoading(true);
    setError(null);
    setLoadingStats(null);

    try {
      const startDate = new Date(config.startDate);
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      
      // Adicionar um dia à data final
      const endDate = new Date(config.endDate);
      const nextDay = addDays(endDate, 1);
      const formattedEndDate = format(nextDay, 'yyyy-MM-dd');
      
      console.log('Buscando dados:', {
        startDate: formattedStartDate,
        endDate: formattedEndDate
      });

      // Calcular o número de pontos baseado no intervalo do sensor
      const diffMinutes = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60));
      const expectedDataPoints = Math.ceil(diffMinutes / settings.sensorInterval);
      
      console.log('Calculando pontos de dados:', {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        diffMinutes,
        sensorInterval: settings.sensorInterval,
        expectedDataPoints
      });

      setLoadingStats({ current: 0, total: expectedDataPoints });
      
      const savedConfig = getConfig();
      const { baseUrl, apiSecret } = savedConfig;
      const cleanBaseUrl = baseUrl.replace(/\/$/, '');

      // Ajustar a URL para usar o formato de data correto
      const entriesUrl = `${cleanBaseUrl}/api/v1/entries?find[dateString][$gte]=${formattedStartDate}&find[dateString][$lte]=${formattedEndDate}&count=${expectedDataPoints}`;
      
      console.log('URL da requisição:', entriesUrl);

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
      console.log('Dados recebidos:', {
        esperado: expectedDataPoints,
        recebido: entries.length
      });

      // Processar os dados de glicose
      const processedData = {
        timestamps: entries.map((entry: any) => 
          convertUTCToUserTime(new Date(entry.date)).toISOString()
        ),
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

      // Tentar buscar dados de sensibilidade se disponíveis
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
          // Processar dados de sensibilidade se disponíveis
          // ... (manter o código de processamento existente)
        }
      } catch (err) {
        console.log('Erro ao buscar dados de sensibilidade:', err);
        // Não lançar erro, apenas continuar sem os dados de sensibilidade
      }

      setData(processedData);

    } catch (err) {
      console.error('Erro detalhado:', err);
      let errorMessage = 'Erro ao conectar com o Nightscout. ';
      
      if (err instanceof Error) {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setLoadingStats(null);
    }
  };

  return { data, loading, error, fetchData, isConfigured, loadingStats };
}; 