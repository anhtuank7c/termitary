export const CRON_PATTERNS = {
  EVERY_MINUTE: '* * * * *',
  EVERY_5_MINUTES: '*/5 * * * *',
  EVERY_15_MINUTES: '*/15 * * * *',
  EVERY_30_MINUTES: '*/30 * * * *',
  EVERY_HOUR: '0 * * * *',
  EVERY_2_HOURS: '0 */2 * * *',
  EVERY_6_HOURS: '0 */6 * * *',
  EVERY_12_HOURS: '0 */12 * * *',
  DAILY_MIDNIGHT: '0 0 * * *',
  DAILY_NOON: '0 12 * * *',
  WEEKLY_SUNDAY: '0 0 * * 0',
  MONTHLY: '0 0 1 * *',
} as const;
