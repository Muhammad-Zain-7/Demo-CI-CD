import mongoose from "mongoose";

const nftSchema = new mongoose.Schema(
  {
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NFTCollection",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    img: {
      type: String,
      trim: true,
    },
    priceCrypto: {
      type: Number,
      required: true,
      min: 0,
    },
    priceUSD: {
      type: Number,
      required: false,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      enum: ["ETH", "MATIC", "USDC", "USDT"],
      default: "ETH",
    },
    network: {
      type: String,
      required: true,
      default: "ethereum",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    tokenId: {
      type: String,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
nftSchema.index({ collectionId: 1 });
nftSchema.index({ isAvailable: 1 });
nftSchema.index({ network: 1 });
nftSchema.index({ currency: 1 });

export default mongoose.models.NFT || mongoose.model("NFT", nftSchema);
