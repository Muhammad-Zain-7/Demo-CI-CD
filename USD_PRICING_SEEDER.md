# NFT USD Pricing Seeder Update

## Overview
Updated the NFT seeder to include random USD pricing for all NFTs in the database. This ensures that all NFTs have both crypto and USD pricing information.

## Changes Made

### 1. NFT Model Schema (`app/models/NFT.ts`)
- ✅ **Added `priceUSD` field**: Optional field to store USD pricing
- ✅ **Type**: Number with minimum value of 0
- ✅ **Required**: false (for backward compatibility)

```javascript
priceUSD: {
  type: Number,
  required: false,
  min: 0
}
```

### 2. NFT Seeder (`app/lib/seedNFTs.ts`)
- ✅ **Added `generateRandomUSDPrice()` function**: Generates realistic USD prices based on crypto currency
- ✅ **Random exchange rates**: 
  - ETH: $2,500 - $3,500
  - MATIC: $0.60 - $1.20
  - USDC: $0.98 - $1.02 (pegged to USD)
  - USDT: $0.98 - $1.02 (pegged to USD)
- ✅ **Updated NFT creation**: All new NFTs include USD pricing
- ✅ **Enhanced logging**: Shows both crypto and USD prices

### 3. USD Pricing Update Function
- ✅ **Added `updateNFTsWithUSDPricing()` function**: Updates existing NFTs without USD pricing
- ✅ **Smart detection**: Only updates NFTs missing USD pricing
- ✅ **Batch processing**: Updates all NFTs efficiently

### 4. New API Endpoint (`app/api/update-usd-pricing/route.ts`)
- ✅ **POST**: Updates existing NFTs with USD pricing
- ✅ **GET**: Checks USD pricing status
- ✅ **Error handling**: Comprehensive error management
- ✅ **Logging**: Detailed operation logs

## Usage

### Update Existing NFTs with USD Pricing
```bash
# POST request to update existing NFTs
curl -X POST https://api.mythicmuse.art/api/update-usd-pricing

# GET request to check status
curl -X GET https://api.mythicmuse.art/api/update-usd-pricing
```

### Seed New NFTs with USD Pricing
```bash
# POST request to seed new NFTs (includes USD pricing)
curl -X POST https://api.mythicmuse.art/api/seed-nfts
```

## Exchange Rate Logic

The seeder uses realistic exchange rate ranges:

```javascript
const exchangeRates = {
  'ETH': { min: 2500, max: 3500 },    // $2,500 - $3,500
  'MATIC': { min: 0.6, max: 1.2 },   // $0.60 - $1.20
  'USDC': { min: 0.98, max: 1.02 },  // $0.98 - $1.02
  'USDT': { min: 0.98, max: 1.02 },  // $0.98 - $1.02
};
```

## Example Output

When seeding NFTs, you'll see output like:
```
Created NFT: Achilles the Invincible in Ancient Warriors - 0.05 ETH ($150.25)
Created NFT: Phoenix Rising in Mystical Creatures - 0.15 ETH ($450.75)
Created NFT: Athena Goddess of Wisdom in Divine Entities - 0.3 MATIC ($0.36)
```

## Benefits

1. **Consistent Pricing**: All NFTs have both crypto and USD pricing
2. **Realistic Rates**: Uses market-realistic exchange rate ranges
3. **Backward Compatible**: Existing NFTs can be updated without breaking changes
4. **Easy Management**: Simple API endpoints for updating pricing
5. **Better UX**: Frontend can display USD prices immediately

## Testing

To test the USD pricing functionality:

1. **Check existing NFTs**: `GET /api/update-usd-pricing`
2. **Update existing NFTs**: `POST /api/update-usd-pricing`
3. **Seed new NFTs**: `POST /api/seed-nfts`
4. **Verify in database**: Check that NFTs have `priceUSD` field populated

The system now ensures all NFTs have comprehensive pricing information for both crypto and fiat currencies.
