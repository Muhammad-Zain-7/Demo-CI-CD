import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../lib/mongodb';
import Order from '../../models/Order';
import NFT from '../../models/NFT';
import NFTCollection from '../../models/NFTCollection';
import { handleApiError, parseRequestBody, sanitizeInput } from '../../lib/errorHandler';
import { validateOrderData } from '../../lib/validators';
import { logger } from '../../lib/logger';

// Helper function to validate order data for updates
function validateOrderUpdateData(data: any) {
  const errors: string[] = [];
  
  if (data.status && !['pending', 'paid', 'processing', 'nft_sent', 'completed', 'cancelled', 'refunded'].includes(data.status)) {
    errors.push('Status must be one of: pending, paid, processing, nft_sent, completed, cancelled, refunded');
  }
  
  if (data.currency && !['ETH', 'MATIC', 'USDC', 'USDT'].includes(data.currency)) {
    errors.push('Currency must be one of: ETH, MATIC, USDC, USDT');
  }
  
  if (data.network && !['ethereum', 'arbitrum', 'polygon', 'base', 'optimism'].includes(data.network)) {
    errors.push('Network must be one of: ethereum, arbitrum, polygon, base, optimism');
  }
  
  if (data.amount !== undefined && (typeof data.amount !== 'number' || data.amount <= 0)) {
    errors.push('Amount must be a positive number');
  }
  
  return errors;
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    logger.apiRequest('GET', '/api/orders');
    
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const customerEmail = searchParams.get('customerEmail');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    logger.dbQuery('find', 'orders', { status, customerEmail, limit, offset });

    let query = Order.find()
      .populate('nftId', 'title priceCrypto currency network')
      .populate('collectionId', 'name network');

    // Filter by status
    if (status) {
      query = query.where('status', status);
    }

    // Filter by customer email
    if (customerEmail) {
      query = query.where('customerEmail', customerEmail);
    }

    const orders = await query
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 100)) // Cap at 100 for performance
      .skip(offset)
      .exec();
    
    const duration = Date.now() - startTime;
    logger.apiResponse('GET', '/api/orders', 200, duration);
    
    return NextResponse.json(orders);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError('GET', '/api/orders', error as Error);
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    logger.apiRequest('POST', '/api/orders');
    
    const orderData = await parseRequestBody(req);
    if (!orderData) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Sanitize input data
    const sanitizedData = sanitizeInput(orderData);

    // Validate order data
    const validation = validateOrderData(sanitizedData);
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.errors 
      }, { status: 400 });
    }

    await connectDB();
    
    // Validate NFT exists
    const nft = await NFT.findById(sanitizedData.nftId).populate('collectionId');
    if (!nft) {
      return NextResponse.json({ error: 'NFT not found' }, { status: 404 });
    }

    // Check if NFT is available
    if (!nft.isAvailable) {
      return NextResponse.json({ error: 'NFT is not available for purchase' }, { status: 400 });
    }

    // Get collection data
    const collection = nft.collectionId;
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found for this NFT' }, { status: 404 });
    }

    // Clean and prepare order data
    const cleanOrderData = {
      ...sanitizedData,
      customerEmail: sanitizedData.customerEmail.toLowerCase().trim(),
      nftId: nft._id,
      collectionId: collection._id,
      collectionName: collection.name,
      nftTitle: nft.title,
      priceCrypto: nft.priceCrypto,
      currency: nft.currency,
      network: nft.network,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    logger.dbQuery('create', 'orders', { nftId: nft._id, customerEmail: cleanOrderData.customerEmail });

    const order = new Order(cleanOrderData);
    await order.save();
    
    // Populate the order with related data
    await order.populate('nftId', 'title priceCrypto currency network');
    await order.populate('collectionId', 'name network');
    
    const duration = Date.now() - startTime;
    logger.apiResponse('POST', '/api/orders', 201, duration);
    logger.businessEvent('Order created', { orderId: order._id, nftId: nft._id, customerEmail: cleanOrderData.customerEmail });
    
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError('POST', '/api/orders', error as Error);
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    logger.apiRequest('PUT', '/api/orders');
    
    const requestData = await parseRequestBody(req);
    if (!requestData) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { id, ...updates } = requestData;
    
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Sanitize update data
    const sanitizedUpdates = sanitizeInput(updates);

    // Validate update data
    const validationErrors = validateOrderUpdateData(sanitizedUpdates);
    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, { status: 400 });
    }

    await connectDB();
    logger.dbQuery('update', 'orders', { id });
    
    const order = await Order.findByIdAndUpdate(
      id,
      {
        ...sanitizedUpdates,
        updatedAt: new Date(),
        ...(sanitizedUpdates.customerEmail && { customerEmail: sanitizedUpdates.customerEmail.toLowerCase().trim() })
      },
      { new: true }
    )
    .populate('nftId', 'title priceCrypto currency network')
    .populate('collectionId', 'name network');
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    const duration = Date.now() - startTime;
    logger.apiResponse('PUT', '/api/orders', 200, duration);
    logger.businessEvent('Order updated', { orderId: order._id, status: order.status });
    
    return NextResponse.json(order);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError('PUT', '/api/orders', error as Error);
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    logger.apiRequest('DELETE', '/api/orders');
    
    const requestData = await parseRequestBody(req);
    if (!requestData) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { id } = requestData;
    
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    await connectDB();
    logger.dbQuery('delete', 'orders', { id });
    
    const order = await Order.findByIdAndDelete(id);
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    const duration = Date.now() - startTime;
    logger.apiResponse('DELETE', '/api/orders', 200, duration);
    logger.businessEvent('Order deleted', { orderId: order._id });
    
    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError('DELETE', '/api/orders', error as Error);
    return handleApiError(error);
  }
}