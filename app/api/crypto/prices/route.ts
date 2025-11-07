import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '../../../lib/errorHandler';
import { logger } from '../../../lib/logger';
import { setPriceCache, getAllPrices, isPriceCacheFresh } from '../../../lib/cryptoPrices';

// Prices are cached in app/lib/cryptoPrices with a TTL; we just respect freshness here

// Supported cryptocurrencies
const SUPPORTED_CURRENCIES = ['ethereum', 'matic-network', 'usd-coin', 'tether'];

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    logger.apiRequest('GET', '/api/crypto/prices');
    
    // Optional force refresh via query param
    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true';

    // Check cache first if fresh and not forcing
    const existing = getAllPrices();
    if (!force && existing && isPriceCacheFresh()) {
      logger.info('Crypto prices served from fresh cache');
      return NextResponse.json(existing);
    }

    // Fetch fresh prices from CoinGecko
    const prices = await fetchCryptoPrices();
    
    // Update cache
    setPriceCache(prices);

    const duration = Date.now() - startTime;
    logger.apiResponse('GET', '/api/crypto/prices', 200, duration);
    
    return NextResponse.json(prices);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError('GET', '/api/crypto/prices', error as Error);
    // No fallbacks: explicitly fail so UI shows Price N/A
    return NextResponse.json({ error: 'Price service unavailable' }, { status: 503 });
  }
}

async function fetchCryptoPrices(): Promise<Record<string, number>> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${SUPPORTED_CURRENCIES.join(',')}&vs_currencies=usd`,
      {
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000) // 10 second timeout
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform the response to our expected format
    const prices: Record<string, number> = {};
    
    if (data['ethereum']) prices['ETH'] = data['ethereum'].usd;
    if (data['matic-network']) prices['MATIC'] = data['matic-network'].usd;
    if (data['usd-coin']) prices['USDC'] = data['usd-coin'].usd;
    if (data['tether']) prices['USDT'] = data['tether'].usd;
    
    logger.info('Successfully fetched crypto prices from CoinGecko', { 
      currencies: Object.keys(prices) 
    });
    
    return prices;
  } catch (error) {
    logger.error('Failed to fetch crypto prices from CoinGecko', error as Error);
    throw error;
  }
}

// Internal helpers removed; use app/lib/cryptoPrices instead