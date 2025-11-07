import mongoose from "mongoose";

const nftCollectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    img: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    contractAddress: {
      type: String,
      required: false,
      trim: true,
    },
    network: {
      type: String,
      required: true,
      default: "ethereum",
    },
    totalSupply: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for better performance
nftCollectionSchema.index({ isActive: 1 });

export default mongoose.models.NFTCollection ||
  mongoose.model("NFTCollection", nftCollectionSchema);
