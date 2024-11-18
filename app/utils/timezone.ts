import { format, parseISO } from 'date-fns';
import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';

export function getUserTimezone(): string {
  // Primeiro tenta pegar do perfil do Nightscout (será implementado)
  const profileTimezone = localStorage.getItem('nightscout_timezone');
  if (profileTimezone) {
    return profileTimezone;
  }
  
  // Se não encontrar, usa o fuso horário do navegador
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function convertUTCToUserTime(utcTimestamp: string | Date): Date {
  const userTimezone = getUserTimezone();
  const date = typeof utcTimestamp === 'string' ? parseISO(utcTimestamp) : utcTimestamp;
  return new Date(formatInTimeZone(date, userTimezone, "yyyy-MM-dd'T'HH:mm:ssXXX"));
}

export function formatToUserTime(timestamp: string | Date, formatString: string): string {
  const userTimezone = getUserTimezone();
  const date = typeof timestamp === 'string' ? parseISO(timestamp) : timestamp;
  return formatInTimeZone(date, userTimezone, formatString);
}

export function convertUserTimeToUTC(localTime: Date): Date {
  const userTimezone = getUserTimezone();
  return zonedTimeToUtc(localTime, userTimezone);
}

// Adicionando as funções que faltavam
export function formatTimestampWithTimezone(timestamp: string, timezone: string, formatString: string): string {
  const date = parseISO(timestamp);
  return formatInTimeZone(date, timezone, formatString);
}

export function adjustTimestampToTimezone(timestamp: string, timezone: string): Date {
  const date = parseISO(timestamp);
  return new Date(formatInTimeZone(date, timezone, "yyyy-MM-dd'T'HH:mm:ssXXX"));
}

export function getTimezoneOffset(timezone: string): number {
  const now = new Date();
  const tzDate = new Date(formatInTimeZone(now, timezone, "yyyy-MM-dd'T'HH:mm:ssXXX"));
  return tzDate.getTimezoneOffset();
}