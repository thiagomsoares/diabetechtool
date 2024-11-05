import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { zonedTimeToUtc, formatInTimeZone } from 'date-fns-tz';
import Cookies from 'js-cookie';

export const useTimezone = () => {
  const [timezone, setTimezone] = useState<string>('UTC');

  const fetchTimezoneFromNightscout = async () => {
    try {
      const config = localStorage.getItem('nightscout_config') || Cookies.get('nightscout_config');
      if (!config) return 'UTC';

      const { baseUrl, apiSecret } = JSON.parse(config);
      const response = await fetch('/api/nightscout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: `${baseUrl}/api/v1/profile`,
          apiSecret
        }),
      });

      if (response.ok) {
        const profiles = await response.json();
        if (profiles && profiles.length > 0) {
          const activeProfile = profiles[0];
          return activeProfile.store[activeProfile.defaultProfile]?.timezone || 'UTC';
        }
      }
      return 'UTC';
    } catch (error) {
      console.error('Erro ao buscar timezone:', error);
      return 'UTC';
    }
  };

  useEffect(() => {
    fetchTimezoneFromNightscout().then(setTimezone);
  }, []);

  const convertToUserTime = (utcDate: string | Date) => {
    try {
      const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
      return formatInTimeZone(date, timezone, 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      console.error('Erro ao converter para timezone do usuário:', error);
      return format(new Date(utcDate), 'yyyy-MM-dd HH:mm:ss');
    }
  };

  const convertToUTC = (localDate: Date) => {
    try {
      return zonedTimeToUtc(localDate, timezone);
    } catch (error) {
      console.error('Erro ao converter para UTC:', error);
      return localDate;
    }
  };

  const formatInUserTimezone = (date: Date | string, formatString: string) => {
    try {
      const parsedDate = typeof date === 'string' ? parseISO(date) : date;
      return formatInTimeZone(parsedDate, timezone, formatString);
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return format(new Date(date), formatString);
    }
  };

  return {
    timezone,
    convertToUserTime,
    convertToUTC,
    formatInUserTimezone
  };
}; 