import { NFTCollection } from '../types';

export const APP_CONFIG = {
  // NFT Configuration
  nft: {
    price: 0.03, // ETH
    priceUSD: 100, // Approximate USD equivalent
    totalSupply: 40,
    collectionName: 'Mythic Muses'
  },
  
  // Payment Configuration
  payment: {
    paypal: {
      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'your_paypal_client_id',
      currency: 'USD',
      intent: 'capture'
    }
  },
  
  // Admin Configuration
  admin: {
    password: process.env.ADMIN_PASSWORD || 'admin123',
    sessionTimeout: 24 * 60 * 60 * 1000 // 24 hours
  },
  
  // API Endpoints
  api: {
    orders: '/api/orders',
    paypal: '/api/paypal',
    admin: '/api/admin'
  }
};

export const NFT_COLLECTIONS: NFTCollection[] = [
  {
    id: '1',
    name: 'Ancient Warriors',
    description: 'Legendary warriors from ancient mythology',
    imageUrl: '/images/collection-1.jpg',
    contractAddress: '0x1234567890123456789012345678901234567890',
    network: 'ethereum',
    totalSupply: 15,
    isActive: true
  },
  {
    id: '2',
    name: 'Mystical Creatures',
    description: 'Enchanted beings from folklore and legends',
    imageUrl: '/images/collection-2.jpg',
    contractAddress: '0x2345678901234567890123456789012345678901',
    network: 'arbitrum',
    totalSupply: 15,
    isActive: true
  },
  {
    id: '3',
    name: 'Divine Entities',
    description: 'Sacred deities and spiritual manifestations',
    imageUrl: '/images/collection-3.jpg',
    contractAddress: '0x3456789012345678901234567890123456789012',
    network: 'polygon',
    totalSupply: 10,
    isActive: true
  }
];
