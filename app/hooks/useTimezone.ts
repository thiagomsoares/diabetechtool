import { useState, useEffect } from 'react';
import { format, zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
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
    return utcToZonedTime(new Date(utcDate), timezone);
  };

  const convertToUTC = (localDate: Date) => {
    return zonedTimeToUtc(localDate, timezone);
  };

  const formatInUserTimezone = (date: Date | string, formatString: string) => {
    const zonedDate = convertToUserTime(date);
    return format(zonedDate, formatString, { timeZone: timezone });
  };

  return {
    timezone,
    convertToUserTime,
    convertToUTC,
    formatInUserTimezone
  };
}; 