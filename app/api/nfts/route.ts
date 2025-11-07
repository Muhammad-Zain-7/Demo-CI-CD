import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../lib/mongodb";
import NFT from "../../models/NFT";
import NFTCollection from "../../models/NFTCollection";
import {
  handleApiError,
  parseRequestBody,
  sanitizeInput,
} from "../../lib/errorHandler";
import { logger } from "../../lib/logger";
import { apiRateLimiter, getClientIP } from "../../lib/rateLimiter";

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Apply rate limiting
    const clientIP = getClientIP(req);
    const rateLimitResult = apiRateLimiter.isAllowed(clientIP);

    if (!rateLimitResult.allowed) {
      logger.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Too many requests, please try again later",
          retryAfter: Math.ceil(
            apiRateLimiter.getRemainingTime(clientIP) / 1000
          ),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              apiRateLimiter.getRemainingTime(clientIP) / 1000
            ).toString(),
            "X-RateLimit-Limit": "100",
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": new Date(
              rateLimitResult.resetTime
            ).toISOString(),
          },
        }
      );
    }

    logger.apiRequest("GET", "/api/nfts");

    await connectDB();

    const { searchParams } = new URL(req.url);
    const collectionId = searchParams.get("collectionId");
    const isAvailable = searchParams.get("isAvailable");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    logger.dbQuery("find", "nfts", {
      collectionId,
      isAvailable,
      limit,
      offset,
    });

    let query = NFT.find().populate("collectionId", "name network totalSupply");

    // Filter by collection
    if (collectionId) {
      query = query.where("collectionId", collectionId);
    }

    // Filter by availability
    if (isAvailable !== null) {
      query = query.where("isAvailable", isAvailable === "true");
    }

    const nfts = await query
      .select(
        "title description imageUrl img priceCrypto priceUSD currency network isAvailable tokenId metadata collectionId createdAt updatedAt"
      )
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 100)) // Cap at 100 for performance
      .skip(offset)
      .exec();

    const duration = Date.now() - startTime;
    logger.apiResponse("GET", "/api/nfts", 200, duration);

    return NextResponse.json(nfts);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError("GET", "/api/nfts", error as Error);
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    logger.apiRequest("POST", "/api/nfts");

    const nftData = await parseRequestBody(req);
    if (!nftData) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Sanitize input data
    const sanitizedData = sanitizeInput(nftData);

    // Validate required fields
    const requiredFields = [
      "collectionId",
      "title",
      "priceCrypto",
      "currency",
      "network",
    ];
    const missingFields = requiredFields.filter(
      (field) => !sanitizedData[field]
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: missingFields,
        },
        { status: 400 }
      );
    }

    // Validate currency
    const validCurrencies = ["ETH", "MATIC", "USDC", "USDT"];
    if (!validCurrencies.includes(sanitizedData.currency)) {
      return NextResponse.json(
        {
          error: "Invalid currency",
          details: `Currency must be one of: ${validCurrencies.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate network
    const validNetworks = [
      "ethereum",
      "arbitrum",
      "polygon",
      "base",
      "optimism",
    ];
    if (!validNetworks.includes(sanitizedData.network)) {
      return NextResponse.json(
        {
          error: "Invalid network",
          details: `Network must be one of: ${validNetworks.join(", ")}`,
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Validate collection exists
    const collection = await NFTCollection.findById(sanitizedData.collectionId);
    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    // Clean and prepare NFT data
    const cleanNftData = {
      ...sanitizedData,
      collectionId: collection._id,
      isAvailable: sanitizedData.isAvailable !== false, // Default to true
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    logger.dbQuery("create", "nfts", {
      collectionId: collection._id,
      title: cleanNftData.title,
    });

    const nft = new NFT(cleanNftData);
    await nft.save();

    // Populate the NFT with collection data
    await nft.populate("collectionId", "name network totalSupply");

    // Select all fields including img for the response
    const populatedNft = await NFT.findById(nft._id)
      .select(
        "title description imageUrl img priceCrypto priceUSD currency network isAvailable tokenId metadata collectionId createdAt updatedAt"
      )
      .populate("collectionId", "name network totalSupply");

    const duration = Date.now() - startTime;
    logger.apiResponse("POST", "/api/nfts", 201, duration);
    logger.businessEvent("NFT created", {
      nftId: nft._id,
      collectionId: collection._id,
      title: cleanNftData.title,
    });

    return NextResponse.json(populatedNft, { status: 201 });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError("POST", "/api/nfts", error as Error);
    return handleApiError(error);
  }
}
