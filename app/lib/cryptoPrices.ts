export interface PriceCache {
  data: Record<string, number>;
  timestamp: number;
}

const CACHE_DURATION_MS = 60_000; // 1 minute

let priceCache: PriceCache | null = null;

export function setPriceCache(prices: Record<string, number>): void {
  priceCache = {
    data: prices,
    timestamp: Date.now(),
  };
}

export function getAllPrices(): Record<string, number> | null {
  return priceCache ? priceCache.data : null;
}

export function getCryptoPrice(symbol: string): number | null {
  if (!priceCache) return null;
  const normalized = symbol.toUpperCase();
  return priceCache.data[normalized] ?? null;
}

export function isPriceCacheFresh(): boolean {
  if (!priceCache) return false;
  return Date.now() - priceCache.timestamp < CACHE_DURATION_MS;
}

