import { NextRequest, NextResponse } from "next/server";
import {
  seedDatabase,
  isDatabaseSeeded,
  resetDatabase,
} from "../../lib/seedDatabase";
import { seedNFTs } from "../../lib/seedNFTs";
import { handleApiError } from "../../lib/errorHandler";
import { logger } from "../../lib/logger";

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    logger.apiRequest("GET", "/api/seed");

    const isSeeded = await isDatabaseSeeded();

    const duration = Date.now() - startTime;
    logger.apiResponse("GET", "/api/seed", 200, duration);

    return NextResponse.json({
      isSeeded,
      message: isSeeded
        ? "Database is already seeded"
        : "Database is not seeded",
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError("GET", "/api/seed", error as Error);
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    logger.apiRequest("POST", "/api/seed");

    const body = await req.text();
    const { action } = body ? JSON.parse(body) : { action: "seed" };

    let result;

    switch (action) {
      case "seed":
        result = await seedDatabase();
        break;
      case "seed-nfts":
        result = await seedNFTs();
        break;
      case "reset":
        result = await resetDatabase();
        break;
      default:
        return NextResponse.json(
          {
            error: "Invalid action. Supported actions: seed, seed-nfts, reset",
          },
          { status: 400 }
        );
    }

    const duration = Date.now() - startTime;
    logger.apiResponse("POST", "/api/seed", 200, duration);
    logger.businessEvent("Database operation", {
      action,
      success: result.success,
    });

    return NextResponse.json(result);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError("POST", "/api/seed", error as Error);
    return handleApiError(error);
  }
}
