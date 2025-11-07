import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import NFTCollection from '../../../models/NFTCollection';
import NFT from '../../../models/NFT';
import Order from '../../../models/Order';
import { handleApiError } from '../../../lib/errorHandler';
import { logger } from '../../../lib/logger';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    logger.apiRequest('GET', '/api/admin/stats');
    
    // Return mock data for development when database is not available
    const mockStats = {
      totalOrders: 0,
      ordersByStatus: [
        { status: 'pending', count: 0 },
        { status: 'completed', count: 0 },
        { status: 'cancelled', count: 0 }
      ],
      totalRevenue: 0,
      recentOrders: []
    };

    try {
      await connectDB();
    } catch (dbError) {
      logger.warn('Database connection failed, returning mock stats', { error: dbError });
      const duration = Date.now() - startTime;
      logger.apiResponse('GET', '/api/admin/stats', 200, duration);
      return NextResponse.json(mockStats);
    }
    
    // Get all stats in parallel for better performance
    const [
      totalCollections,
      activeCollections,
      totalNFTs,
      availableNFTs,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      recentOrders
    ] = await Promise.all([
      // Collection stats
      NFTCollection.countDocuments(),
      NFTCollection.countDocuments({ isActive: true }),
      
      // NFT stats
      NFT.countDocuments(),
      NFT.countDocuments({ isAvailable: true }),
      
      // Order stats
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'completed' }),
      
      // Revenue calculation
      Order.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      
      // Recent orders
      Order.find()
        .populate('nftId', 'title')
        .populate('collectionId', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('customerName nftTitle collectionName amount status createdAt')
    ]);

    // Calculate revenue
    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    // Get network distribution
    const networkStats = await NFTCollection.aggregate([
      { $group: { _id: '$network', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get currency distribution
    const currencyStats = await NFT.aggregate([
      { $group: { _id: '$currency', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get order status distribution
    const orderStatusStats = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const stats = {
      // AdminDashboard expected format
      totalOrders: totalOrders,
      ordersByStatus: orderStatusStats.map(stat => ({
        status: stat._id,
        count: stat.count
      })),
      totalRevenue: revenue,
      recentOrders: recentOrders.map(order => ({
        id: order._id,
        customerName: order.customerName,
        nftTitle: order.nftTitle,
        collectionName: order.collectionName,
        amount: order.amount,
        status: order.status,
        createdAt: order.createdAt
      })),
      // Additional detailed stats
      collections: {
        total: totalCollections,
        active: activeCollections,
        inactive: totalCollections - activeCollections
      },
      nfts: {
        total: totalNFTs,
        available: availableNFTs,
        sold: totalNFTs - availableNFTs
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders,
        other: totalOrders - pendingOrders - completedOrders
      },
      revenue: {
        total: revenue,
        averageOrderValue: completedOrders > 0 ? revenue / completedOrders : 0
      },
      distributions: {
        networks: networkStats,
        currencies: currencyStats,
        orderStatuses: orderStatusStats
      }
    };

    const duration = Date.now() - startTime;
    logger.apiResponse('GET', '/api/admin/stats', 200, duration);
    
    return NextResponse.json(stats);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError('GET', '/api/admin/stats', error as Error);
    return handleApiError(error);
  }
}