import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../lib/mongodb";
import NFTCollection from "../../models/NFTCollection";
import {
  handleApiError,
  parseRequestBody,
  sanitizeInput,
} from "../../lib/errorHandler";
import { validateCollectionData } from "../../lib/validators";
import { logger } from "../../lib/logger";
import { apiRateLimiter, getClientIP } from "../../lib/rateLimiter";

// In-memory fallback for testing when MongoDB is not available
let inMemoryCollections: any[] = [];
let collectionCounter = 1;

// Simple in-memory cache for collections
let collectionsCache: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 seconds

// Helper function to validate collection data for updates
function validateCollectionUpdateData(data: any) {
  const errors: string[] = [];

  if (
    data.network &&
    !["ethereum", "arbitrum", "polygon", "base", "optimism"].includes(
      data.network
    )
  ) {
    errors.push(
      "Network must be one of: ethereum, arbitrum, polygon, base, optimism"
    );
  }

  if (data.isActive !== undefined && typeof data.isActive !== "boolean") {
    errors.push("isActive must be a boolean");
  }

  if (
    data.totalSupply !== undefined &&
    (typeof data.totalSupply !== "number" || data.totalSupply < 0)
  ) {
    errors.push("Total supply must be a non-negative number");
  }

  return errors;
}

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

    logger.apiRequest("GET", "/api/collections");

    // Check cache first
    const now = Date.now();
    if (collectionsCache && now - cacheTimestamp < CACHE_DURATION) {
      logger.info("Collections served from cache");
      return NextResponse.json(collectionsCache);
    }

    await connectDB();
    logger.dbQuery("find", "collections");

    const collections = await NFTCollection.find({ isActive: true })
      .select(
        "name description imageUrl img network totalSupply isActive createdAt updatedAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    // Update cache
    collectionsCache = collections;
    cacheTimestamp = now;

    const duration = Date.now() - startTime;
    logger.apiResponse("GET", "/api/collections", 200, duration);

    return NextResponse.json(collections);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError("GET", "/api/collections", error as Error);
    logger.warn("Using in-memory fallback for collections");

    // Return in-memory collections as fallback
    return NextResponse.json(inMemoryCollections);
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    logger.apiRequest("POST", "/api/collections");

    const collectionData = await parseRequestBody(req);
    if (!collectionData) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Sanitize input data
    const sanitizedData = sanitizeInput(collectionData);

    // Validate collection data
    const validation = validateCollectionData(sanitizedData);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    await connectDB();
    logger.dbQuery("create", "collections");

    // Generate a unique ID for the collection
    const { contractAddress, ...rest } = sanitizedData;
    const collection = new NFTCollection({
      ...rest,
      id: `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });

    await collection.save();

    // Invalidate cache
    collectionsCache = null;

    const duration = Date.now() - startTime;
    logger.apiResponse("POST", "/api/collections", 201, duration);
    logger.businessEvent("Collection created", {
      collectionId: collection.id,
      name: collection.name,
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError("POST", "/api/collections", error as Error);
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  const startTime = Date.now();

  try {
    logger.apiRequest("PUT", "/api/collections");

    const requestData = await parseRequestBody(req);
    if (!requestData) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { id, ...updates } = requestData;

    if (!id) {
      return NextResponse.json(
        { error: "Collection ID is required" },
        { status: 400 }
      );
    }

    // Sanitize update data
    const sanitizedUpdates = sanitizeInput(updates);

    // Validate update data
    const validationErrors = validateCollectionUpdateData(sanitizedUpdates);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    await connectDB();
    logger.dbQuery("update", "collections", { id });

    // Handle both ObjectId and custom id
    let collection;
    if (id && typeof id === "string" && id.match(/^[0-9a-fA-F]{24}$/)) {
      // It's a MongoDB ObjectId
      collection = await NFTCollection.findByIdAndUpdate(
        id,
        {
          ...sanitizedUpdates,
          updatedAt: new Date().toISOString(),
        },
        { new: true }
      );
    } else {
      // It's a custom id, find by the custom id field
      collection = await NFTCollection.findOneAndUpdate(
        { id },
        {
          ...sanitizedUpdates,
          updatedAt: new Date().toISOString(),
        },
        { new: true }
      );
    }

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    // Invalidate cache
    collectionsCache = null;

    const duration = Date.now() - startTime;
    logger.apiResponse("PUT", "/api/collections", 200, duration);
    logger.businessEvent("Collection updated", {
      collectionId: collection.id,
      name: collection.name,
    });

    return NextResponse.json(collection);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError("PUT", "/api/collections", error as Error);
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  const startTime = Date.now();

  try {
    logger.apiRequest("DELETE", "/api/collections");

    const requestData = await parseRequestBody(req);
    if (!requestData) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { id } = requestData;

    if (!id) {
      return NextResponse.json(
        { error: "Collection ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    logger.dbQuery("delete", "collections", { id });

    // Handle both ObjectId and custom id
    let collection;
    if (id && typeof id === "string" && id.match(/^[0-9a-fA-F]{24}$/)) {
      // It's a MongoDB ObjectId
      collection = await NFTCollection.findByIdAndDelete(id);
    } else {
      // It's a custom id, find by the custom id field
      collection = await NFTCollection.findOneAndDelete({ id });
    }

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    // Invalidate cache
    collectionsCache = null;

    const duration = Date.now() - startTime;
    logger.apiResponse("DELETE", "/api/collections", 200, duration);
    logger.businessEvent("Collection deleted", {
      collectionId: collection.id,
      name: collection.name,
    });

    return NextResponse.json({ message: "Collection deleted successfully" });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError("DELETE", "/api/collections", error as Error);
    return handleApiError(error);
  }
}
