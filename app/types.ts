export interface NFTCollection {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  imageUrl: string;
  img: string;
  contractAddress?: string;
  network: string;
  totalSupply: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NFT {
  id?: string;
  _id?: string;
  collectionId: string | { _id: string; name: string; network: string };
  title: string;
  description?: string;
  imageUrl?: string;
  img?: string;
  priceCrypto: number; // Price in crypto (ETH, MATIC, etc.)
  currency: "ETH" | "MATIC" | "USDC" | "USDT";
  network: string;
  isAvailable: boolean;
  tokenId?: string;
  metadata?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  orderId: string;
  collectionId: string;
  nftId: string;
  nftTitle: string;
  customerName: string;
  customerEmail: string;
  walletAddress: string;
  // Crypto pricing details
  priceCrypto: number;
  currency: "ETH" | "MATIC" | "USDC" | "USDT";
  network: string;
  // USD pricing at time of purchase
  priceUSD: number;
  exchangeRate: number; // Rate used for conversion
  // Payment details
  amount: number; // Final amount paid in USD
  status:
    | "pending"
    | "paid"
    | "processing"
    | "nft_sent"
    | "completed"
    | "cancelled"
    | "refunded";
  paypalOrderId?: string;
  transactionHash?: string;
  notes?: string;
  adminNotes?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  walletAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CryptoPrice {
  currency: string;
  price: number;
  timestamp: number;
}

export interface PriceConversion {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  timestamp: number;
}
