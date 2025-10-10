// Centralized tariff pricing (per day, with driver) in RWF
export const TARIFF_OVERRIDES: { [key: string]: number } = {
  'TOYOTA PRADO TXL': 120000,
  'TOYOTA LAND CRUISER': 120000, // treat as Prado TXL for pricing
  'TOYOTA TXL': 120000,
  'TOYOTA COASTER': 100000,
  'RAV4 FULL ELECTRIC': 100000,
  'TOYOTA RAV4': 100000,
  'KIA SORENTO': 80000,
  'TOYOTA SORENTO': 80000, // source data variant
  'HYUNDAI SONATA': 50000,
  'TOYOTA SONATA': 50000, // source data variant
  'TOYOTA NOAH': 80000,
  'HYUNDAI TUCSON': 60000,
  'TOYOTA TUCSON': 60000, // source data variant
  'TOYOTA LEVIN': 60000,
  'TOYOTA PRIUS': 50000,
  'KIA K5 OPTIMA': 50000,
  'KIA K5': 50000,
  'TOYOTA KI 5': 50000, // source data variant
}

export const normalizeModelName = (s: any): string => String(s || '')
  .replace(/\s+#\d+$/i, '')
  .trim()
  .replace(/\s+/g, ' ')
  .toUpperCase();

export const formatRwf = (amount: number): string => `${amount.toLocaleString()} RWF`;

// Alias map for additional normalization (maps weird names to canonical keys)
const NAME_ALIASES: { [key: string]: string } = {
  'TXL': 'TOYOTA PRADO TXL',
}

export const getTariffPrice = (name: any, fallback: string | number | undefined): string => {
  const norm = normalizeModelName(name)
  const key = NAME_ALIASES[norm] || norm
  const override = TARIFF_OVERRIDES[key]
  if (override) return formatRwf(override)
  if (typeof fallback === 'number') return formatRwf(fallback)
  return String(fallback || '')
}


