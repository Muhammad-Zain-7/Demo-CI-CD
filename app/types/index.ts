export interface NFTCollection {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  contractAddress: string;
  network: string;
  totalSupply: number;
  isActive: boolean;
  _id?: string;
}

export interface NFT {
  id: string;
  collectionId:
    | string
    | { _id: string; name: string; network: string; totalSupply: number };
  title: string;
  description: string;
  imageUrl: string;
  priceCrypto: number;
  priceUSD?: number;
  currency: string;
  network: string;
  isAvailable: boolean;
  tokenId?: string;
  metadata?: any;
  _id?: string;
}

export interface NFTOrder {
  id: string;
  collectionId: string;
  nftId: string;
  collectionName: string;
  nftTitle: string;
  walletAddress: string;
  customerEmail: string;
  customerName: string;
  amount: number;
  currency: string;
  paypalOrderId?: string;
  status: "pending" | "paid" | "nft_sent" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
  transactionHash?: string;
  notes?: string;
  paymentMethod: "paypal" | "crypto";
  priceCrypto?: number;
  priceUSD?: number;
  exchangeRate?: number;
}


export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  recentOrders: NFTOrder[];
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  darkAccent: string;
  lightAccent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  success: string;
  error: string;
  warning: string;
  info: string;
}

export interface WalletConnection {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  provider: any;
  signer: any;
}

export interface PriceConversion {
  originalAmount: number;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  timestamp: number;
}
