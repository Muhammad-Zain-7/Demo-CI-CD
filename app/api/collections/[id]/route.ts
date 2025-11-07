import { NextRequest, NextResponse } from "next/server";
import {
  handleApiError,
  parseRequestBody,
  sanitizeInput,
} from "../../../lib/errorHandler";
import { logger } from "../../../lib/logger";
import connectDB from "../../../lib/mongodb";
import NFTCollection from "../../../models/NFTCollection";

export async function GET(req: NextRequest, { params }: any) {
  const startTime = Date.now();

  try {
    const { id } = await params;
    logger.apiRequest("GET", `/api/collections/${id}`);

    await connectDB();

    const collection = await NFTCollection.findById(id);

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    const duration = Date.now() - startTime;
    logger.apiResponse("GET", `/api/collections/${id}`, 200, duration);

    return NextResponse.json(collection);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError("GET", `/api/collections/${id || 'unknown'}`, error as Error);
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: any) {
  const startTime = Date.now();

  try {
    const { id } = await params;
    logger.apiRequest("PUT", `/api/collections/${id}`);

    const requestData = await parseRequestBody(req);
    if (!requestData) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Sanitize update data
    const sanitizedUpdates = sanitizeInput(requestData);

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
    logger.dbQuery("update", "collections", { id: id });

    const collection = await NFTCollection.findByIdAndUpdate(
      id,
      {
        ...sanitizedUpdates,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    const duration = Date.now() - startTime;
    logger.apiResponse("PUT", `/api/collections/${id}`, 200, duration);
    logger.businessEvent("Collection updated", {
      collectionId: collection._id,
      name: collection.name,
    });

    return NextResponse.json(collection);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError("PUT", `/api/collections/${id || 'unknown'}`, error as Error);
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: any) {
  const startTime = Date.now();

  try {
    const { id } = await params;
    logger.apiRequest("DELETE", `/api/collections/${id}`);

    await connectDB();
    logger.dbQuery("delete", "collections", { id: id });

    const collection = await NFTCollection.findByIdAndDelete(id);

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    const duration = Date.now() - startTime;
    logger.apiResponse(
      "DELETE",
      `/api/collections/${id}`,
      200,
      duration
    );
    logger.businessEvent("Collection deleted", {
      collectionId: collection._id,
      name: collection.name,
    });

    return NextResponse.json({ message: "Collection deleted successfully" });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError("DELETE", `/api/collections/${id || 'unknown'}`, error as Error);
    return handleApiError(error);
  }
}
