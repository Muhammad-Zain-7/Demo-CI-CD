import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NFTCollection',
    required: true
  },
  nftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NFT',
    required: true
  },
  nftTitle: {
    type: String,
    required: true,
    trim: true
  },
  walletAddress: {
    type: String,
    required: false,
    trim: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true
  },
  // Crypto pricing details
  priceCrypto: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    enum: ['ETH', 'MATIC', 'USDC', 'USDT'],
    default: 'ETH'
  },
  network: {
    type: String,
    required: true,
    enum: ['ethereum', 'arbitrum', 'polygon', 'base', 'optimism'],
    default: 'ethereum'
  },
  // USD pricing at time of purchase
  priceUSD: {
    type: Number,
    required: true,
    min: 0
  },
  exchangeRate: {
    type: Number,
    required: true,
    min: 0
  },
  // Final amount paid in USD
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paypalOrderId: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'processing', 'nft_sent', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  transactionHash: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  // Additional fields for better tracking
  paymentMethod: {
    type: String,
    default: 'paypal'
  },
  estimatedDelivery: {
    type: Date
  },
  actualDelivery: {
    type: Date
  },
  adminNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create indexes for better performance
orderSchema.index({ userId: 1 });
orderSchema.index({ collectionId: 1 });
orderSchema.index({ nftId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ customerEmail: 1 });
orderSchema.index({ paypalOrderId: 1 });
orderSchema.index({ network: 1 });
orderSchema.index({ currency: 1 });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
