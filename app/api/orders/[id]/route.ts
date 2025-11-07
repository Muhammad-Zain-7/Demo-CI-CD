import { NextRequest, NextResponse } from "next/server";
import {
  handleApiError,
  parseRequestBody,
  sanitizeInput,
} from "../../../lib/errorHandler";
import { logger } from "../../../lib/logger";
import connectDB from "../../../lib/mongodb";
import Order from "../../../models/Order";

// Helper function to validate order data for updates
function validateOrderUpdateData(data: any) {
  const errors: string[] = [];

  if (
    data.status &&
    ![
      "pending",
      "paid",
      "processing",
      "nft_sent",
      "completed",
      "cancelled",
      "refunded",
    ].includes(data.status)
  ) {
    errors.push(
      "Status must be one of: pending, paid, processing, nft_sent, completed, cancelled, refunded"
    );
  }

  if (
    data.currency &&
    !["ETH", "MATIC", "USDC", "USDT"].includes(data.currency)
  ) {
    errors.push("Currency must be one of: ETH, MATIC, USDC, USDT");
  }

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

  if (
    data.amount !== undefined &&
    (typeof data.amount !== "number" || data.amount <= 0)
  ) {
    errors.push("Amount must be a positive number");
  }

  if (
    data.paymentMethod &&
    !["paypal", "crypto"].includes(data.paymentMethod)
  ) {
    errors.push("Payment method must be either paypal or crypto");
  }

  return errors;
}

export async function GET(req: NextRequest, { params }: any) {
  const startTime = Date.now();

  try {
    const { id } = await params;
    logger.apiRequest("GET", `/api/orders/${id}`);

    await connectDB();

    const order = await Order.findById(id)
      .populate("nftId", "title priceCrypto currency network")
      .populate("collectionId", "name network");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const duration = Date.now() - startTime;
    logger.apiResponse("GET", `/api/orders/${id}`, 200, duration);

    return NextResponse.json(order);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError("GET", `/api/orders/${id || 'unknown'}`, error as Error);
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: any) {
  const startTime = Date.now();

  try {
    const { id } = await params;
    logger.apiRequest("PATCH", `/api/orders/${id}`);

    const requestData = await parseRequestBody(req);
    if (!requestData) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Sanitize update data
    const sanitizedUpdates = sanitizeInput(requestData);

    // Validate update data
    const validationErrors = validateOrderUpdateData(sanitizedUpdates);
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
    logger.dbQuery("update", "orders", { id: id });

    const order = await Order.findByIdAndUpdate(
      id,
      {
        ...sanitizedUpdates,
        updatedAt: new Date(),
        ...(sanitizedUpdates.customerEmail && {
          customerEmail: sanitizedUpdates.customerEmail.toLowerCase().trim(),
        }),
      },
      { new: true }
    )
      .populate("nftId", "title priceCrypto currency network")
      .populate("collectionId", "name network");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const duration = Date.now() - startTime;
    logger.apiResponse("PATCH", `/api/orders/${id}`, 200, duration);
    logger.businessEvent("Order updated", {
      orderId: order._id,
      status: order.status,
    });

    return NextResponse.json(order);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError("PATCH", `/api/orders/${id || 'unknown'}`, error as Error);
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: any) {
  const startTime = Date.now();

  try {
    const { id } = await params;
    logger.apiRequest("DELETE", `/api/orders/${id}`);

    await connectDB();
    logger.dbQuery("delete", "orders", { id: id });

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const duration = Date.now() - startTime;
    logger.apiResponse("DELETE", `/api/orders/${id}`, 200, duration);
    logger.businessEvent("Order deleted", { orderId: order._id });

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError("DELETE", `/api/orders/${id || 'unknown'}`, error as Error);
    return handleApiError(error);
  }
}
