import { z } from 'zod'

export const TimeValueSchema = z.object({
  time: z.string(),
  timeAsSeconds: z.number(),
  value: z.number()
})

export const ProfileStoreSchema = z.object({
  dia: z.number(),
  carbratio: z.array(TimeValueSchema),
  sens: z.array(TimeValueSchema),
  basal: z.array(TimeValueSchema),
  target_low: z.array(TimeValueSchema),
  target_high: z.array(TimeValueSchema),
  units: z.string(),
  timezone: z.string()
})

export const NightscoutConfigSchema = z.object({
  baseUrl: z.string().url('URL inválida'),
  apiSecret: z.string().min(12, 'API Secret deve ter pelo menos 12 caracteres')
}) 