import { NextRequest, NextResponse } from "next/server";
import {
  handleApiError,
  parseRequestBody,
  sanitizeInput,
} from "../../../lib/errorHandler";
import { logger } from "../../../lib/logger";
import connectDB from "../../../lib/mongodb";
import NFT from "../../../models/NFT";

export async function GET(req: NextRequest, { params }: any) {
  const startTime = Date.now();

  try {
    const { id } = await params;
    logger.apiRequest("GET", `/api/nfts/${id}`);

    await connectDB();

    const nft = await NFT.findById(id)
      .select(
        "title description imageUrl img priceCrypto priceUSD currency network isAvailable tokenId metadata collectionId createdAt updatedAt"
      )
      .populate("collectionId", "name network");

    if (!nft) {
      return NextResponse.json({ error: "NFT not found" }, { status: 404 });
    }

    const duration = Date.now() - startTime;
    logger.apiResponse("GET", `/api/nfts/${id}`, 200, duration);

    return NextResponse.json(nft);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError("GET", `/api/nfts/${id || "unknown"}`, error as Error);
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: any) {
  const startTime = Date.now();

  try {
    const { id } = await params;
    logger.apiRequest("PUT", `/api/nfts/${id}`);

    const requestData = await parseRequestBody(req);
    if (!requestData) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Sanitize update data
    const sanitizedUpdates = sanitizeInput(requestData);

    // Validate currency
    const validCurrencies = ["ETH", "MATIC", "USDC", "USDT"];
    if (
      sanitizedUpdates.currency &&
      !validCurrencies.includes(sanitizedUpdates.currency)
    ) {
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
    if (
      sanitizedUpdates.network &&
      !validNetworks.includes(sanitizedUpdates.network)
    ) {
      return NextResponse.json(
        {
          error: "Invalid network",
          details: `Network must be one of: ${validNetworks.join(", ")}`,
        },
        { status: 400 }
      );
    }

    await connectDB();
    logger.dbQuery("update", "nfts", { id: id });

    const nft = await NFT.findByIdAndUpdate(
      id,
      {
        ...sanitizedUpdates,
        updatedAt: new Date(),
      },
      { new: true }
    )
      .select(
        "title description imageUrl img priceCrypto priceUSD currency network isAvailable tokenId metadata collectionId createdAt updatedAt"
      )
      .populate("collectionId", "name network");

    if (!nft) {
      return NextResponse.json({ error: "NFT not found" }, { status: 404 });
    }

    const duration = Date.now() - startTime;
    logger.apiResponse("PUT", `/api/nfts/${id}`, 200, duration);
    logger.businessEvent("NFT updated", { nftId: nft._id, title: nft.title });

    return NextResponse.json(nft);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError("PUT", `/api/nfts/${id || "unknown"}`, error as Error);
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: any) {
  const startTime = Date.now();

  try {
    const { id } = await params;
    logger.apiRequest("DELETE", `/api/nfts/${id}`);

    await connectDB();
    logger.dbQuery("delete", "nfts", { id: id });

    const nft = await NFT.findByIdAndDelete(id);

    if (!nft) {
      return NextResponse.json({ error: "NFT not found" }, { status: 404 });
    }

    const duration = Date.now() - startTime;
    logger.apiResponse("DELETE", `/api/nfts/${id}`, 200, duration);
    logger.businessEvent("NFT deleted", { nftId: nft._id, title: nft.title });

    return NextResponse.json({ message: "NFT deleted successfully" });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError("DELETE", `/api/nfts/${id || "unknown"}`, error as Error);
    return handleApiError(error);
  }
}
