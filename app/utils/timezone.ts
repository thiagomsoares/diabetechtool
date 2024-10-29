import { format, parseISO } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

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
  return toZonedTime(date, userTimezone);
}

export function formatToUserTime(timestamp: string | Date, formatString: string): string {
  const userTimezone = getUserTimezone();
  return formatInTimeZone(
    typeof timestamp === 'string' ? parseISO(timestamp) : timestamp,
    userTimezone,
    formatString
  );
}

export function convertUserTimeToUTC(localTime: Date): Date {
  const userTimezone = getUserTimezone();
  const utcDate = new Date(localTime.toLocaleString('en-US', { timeZone: 'UTC' }));
  const userDate = new Date(localTime.toLocaleString('en-US', { timeZone: userTimezone }));
  const diff = userDate.getTime() - utcDate.getTime();
  return new Date(localTime.getTime() - diff);
}

// Adicionando as funções que faltavam
export function formatTimestampWithTimezone(timestamp: string, timezone: string, formatString: string): string {
  return formatInTimeZone(parseISO(timestamp), timezone, formatString);
}

export function adjustTimestampToTimezone(timestamp: string, timezone: string): Date {
  return toZonedTime(parseISO(timestamp), timezone);
}

export function getTimezoneOffset(timezone: string): number {
  const now = new Date();
  const tzDate = toZonedTime(now, timezone);
  const utcDate = new Date(now.toUTCString());
  return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60); // Retorna o offset em minutos
} 