import { NextRequest, NextResponse } from "next/server";
import { seedNFTs } from "../../lib/seedNFTs";
import { handleApiError } from "../../lib/errorHandler";
import { logger } from "../../lib/logger";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    logger.apiRequest("POST", "/api/seed-nfts");

    
    const result = await seedNFTs();

    const duration = Date.now() - startTime;
    logger.apiResponse("POST", "/api/seed-nfts", 200, duration);
    logger.businessEvent("NFT seeding completed", {
      collections: result.collections,
      nfts: result.nfts,
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        collections: result.collections,
        nfts: result.nfts,
        duration: duration,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError("POST", "/api/seed-nfts", error as Error);
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: "Use POST method to seed NFTs",
    endpoint: "/api/seed-nfts",
    method: "POST",
  });
}
