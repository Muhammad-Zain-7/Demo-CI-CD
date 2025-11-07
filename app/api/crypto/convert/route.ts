import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '../../../lib/errorHandler';
import { logger } from '../../../lib/logger';
import { getCryptoPrice as _getCryptoPrice, isPriceCacheFresh as _isPriceCacheFresh } from '../../../lib/cryptoPrices';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    logger.apiRequest('POST', '/api/crypto/convert');
    
    const body = await req.text();
    if (!body) {
      return NextResponse.json({ error: 'Request body is required' }, { status: 400 });
    }

    const raw = JSON.parse(body);
    const toCurrency = (raw.toCurrency ?? 'USD').toString().toUpperCase();
    const fromCurrency = raw.fromCurrency ? raw.fromCurrency.toString() : '';
    const amount = Number(raw.amount);
    
    // Validate input
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ 
        error: 'Amount must be a positive number' 
      }, { status: 400 });
    }

    if (!fromCurrency || typeof fromCurrency !== 'string') {
      return NextResponse.json({ 
        error: 'From currency is required' 
      }, { status: 400 });
    }

    if (toCurrency !== 'USD') {
      return NextResponse.json({ 
        error: 'Only USD conversion is currently supported' 
      }, { status: 400 });
    }

    const normalizedFromCurrency = fromCurrency.toUpperCase();
    const supportedCurrencies = ['ETH', 'MATIC', 'USDC', 'USDT'];
    
    if (!supportedCurrencies.includes(normalizedFromCurrency)) {
      return NextResponse.json({ 
        error: `Unsupported currency: ${fromCurrency}. Supported currencies: ${supportedCurrencies.join(', ')}` 
      }, { status: 400 });
    }

    // Check if we have fresh price data
    if (!_isPriceCacheFresh()) {
      logger.warn('Price cache is stale, fetching fresh prices');
      try {
        const response = await fetch(`${req.nextUrl.origin}/api/crypto/prices?force=true`);
        if (!response.ok) throw new Error('Failed to fetch fresh prices');
      } catch (error) {
        logger.error('Failed to fetch fresh prices for conversion', error as Error);
        // No fallback
        return NextResponse.json({ error: 'Price service unavailable' }, { status: 503 });
      }
    }

    // Get the current price
    const currentPrice = _getCryptoPrice(normalizedFromCurrency);
    
    if (currentPrice === null) {
      return NextResponse.json({ error: 'Price service unavailable' }, { status: 503 });
    }

    // Calculate conversion
    const convertedAmount = amount * currentPrice;
    const exchangeRate = currentPrice;

    const result = {
      originalAmount: amount,
      fromCurrency: normalizedFromCurrency,
      toCurrency: toCurrency,
      convertedAmount: Math.round(convertedAmount * 100) / 100, // Round to 2 decimal places
      exchangeRate: Math.round(exchangeRate * 100) / 100,
      timestamp: new Date().toISOString()
    };

    const duration = Date.now() - startTime;
    logger.apiResponse('POST', '/api/crypto/convert', 200, duration);
    logger.businessEvent('Crypto conversion', { 
      fromCurrency: normalizedFromCurrency, 
      amount, 
      convertedAmount: result.convertedAmount 
    });

    return NextResponse.json(result);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError('POST', '/api/crypto/convert', error as Error);
    return handleApiError(error);
  }
}