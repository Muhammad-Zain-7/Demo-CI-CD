import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../lib/mongodb";
import NFTCollection from "../../models/NFTCollection";
import NFT from "../../models/NFT";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get collection count
    const collectionCount = await NFTCollection.countDocuments();
    const nftCount = await NFT.countDocuments();

    // Get sample collections
    const collections = await NFTCollection.find({ isActive: true })
      .select("name description network totalSupply")
      .limit(5)
      .lean();

    // Get sample NFTs
    const nfts = await NFT.find({ isAvailable: true })
      .populate("collectionId", "name network")
      .select("title priceCrypto currency network collectionId")
      .limit(5)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        collectionCount,
        nftCount,
        collections,
        nfts,
      },
    });
  } catch (error) {
    console.error("MongoDB test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
