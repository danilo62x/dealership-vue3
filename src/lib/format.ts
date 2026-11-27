const LOCALE_MAP: Record<string, { locale: string; currency: string }> = {
  'pt-BR': { locale: 'pt-BR', currency: 'BRL' },
  en: { locale: 'en-US', currency: 'USD' },
  es: { locale: 'es-ES', currency: 'EUR' },
}

/** Format a currency value respecting the active i18n language (BRL by default). */
export function formatCurrency(value: number, lang = 'pt-BR'): string {
  const cfg = LOCALE_MAP[lang] ?? LOCALE_MAP['pt-BR']
  return new Intl.NumberFormat(cfg.locale, {
    style: 'currency',
    currency: cfg.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/** Compact number format, e.g. 2840 -> 2.8 mil */
export function formatCompact(value: number, lang = 'pt-BR'): string {
  const cfg = LOCALE_MAP[lang] ?? LOCALE_MAP['pt-BR']
  return new Intl.NumberFormat(cfg.locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

/** Locale-aware date + time, e.g. "30/05/2026 14:32". */
export function formatDateTime(iso: string, lang = 'pt-BR'): string {
  const cfg = LOCALE_MAP[lang] ?? LOCALE_MAP['pt-BR']
  return new Intl.DateTimeFormat(cfg.locale, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
}

/** Locale-aware date only. */
export function formatDate(iso: string, lang = 'pt-BR'): string {
  const cfg = LOCALE_MAP[lang] ?? LOCALE_MAP['pt-BR']
  return new Intl.DateTimeFormat(cfg.locale, { dateStyle: 'medium' }).format(new Date(iso))
}

/** HH:mm only. */
export function formatTime(iso: string, lang = 'pt-BR'): string {
  const cfg = LOCALE_MAP[lang] ?? LOCALE_MAP['pt-BR']
  return new Intl.DateTimeFormat(cfg.locale, { timeStyle: 'short' }).format(new Date(iso))
}

/** Short day/month label for charts, e.g. "22/08". */
export function formatDayMonth(iso: string, lang = 'pt-BR'): string {
  const cfg = LOCALE_MAP[lang] ?? LOCALE_MAP['pt-BR']
  return new Intl.DateTimeFormat(cfg.locale, { day: '2-digit', month: '2-digit' }).format(new Date(iso))
}

/** Plain integer formatting (e.g. unit counts). */
export function formatNumber(value: number, lang = 'pt-BR'): string {
  const cfg = LOCALE_MAP[lang] ?? LOCALE_MAP['pt-BR']
  return new Intl.NumberFormat(cfg.locale).format(value)
}

/** Percentage from a 0..1 ratio, e.g. 0.62 -> "62%". */
export function formatPercent(ratio: number, lang = 'pt-BR'): string {
  const cfg = LOCALE_MAP[lang] ?? LOCALE_MAP['pt-BR']
  return new Intl.NumberFormat(cfg.locale, { style: 'percent', maximumFractionDigits: 0 }).format(ratio)
}

/** Compact currency, e.g. 1284000 -> "R$ 1,3 mi". */
export function formatCurrencyCompact(value: number, lang = 'pt-BR'): string {
  const cfg = LOCALE_MAP[lang] ?? LOCALE_MAP['pt-BR']
  return new Intl.NumberFormat(cfg.locale, {
    style: 'currency',
    currency: cfg.currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

/** Value for a `datetime-local` input, e.g. "2026-08-22T15:00". */
export function toInputDateTime(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Reads a `datetime-local` value back into ISO. */
export function fromInputDateTime(value: string): string {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
}

/** Human duration from minutes, e.g. 90 -> "1h30", 45 -> "45min". */
export function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h${String(m).padStart(2, '0')}`
}
