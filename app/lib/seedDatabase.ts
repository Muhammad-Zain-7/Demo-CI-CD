import connectDB from './mongodb';
import bcrypt from 'bcryptjs';
import NFTCollection from '../models/NFTCollection';
import NFT from '../models/NFT';
import AdminUser from '../models/AdminUser';
import { logger } from './logger';

// Sample collections data
const sampleCollections = [
  {
    name: 'Mystical Creatures',
    description: 'A collection of enchanting mythical creatures from ancient legends',
    imageUrl: '/images/collection-1.jpg',
    contractAddress: '0x1234567890123456789012345678901234567890',
    network: 'ethereum',
    totalSupply: 100,
    isActive: true
  },
  {
    name: 'Digital Dreams',
    description: 'Surreal digital art pieces that explore the boundaries of reality',
    imageUrl: '/images/collection-2.jpg',
    contractAddress: '0x2345678901234567890123456789012345678901',
    network: 'polygon',
    totalSupply: 50,
    isActive: true
  },
  {
    name: 'Cosmic Explorers',
    description: 'Space-themed NFTs featuring astronauts and alien worlds',
    imageUrl: '/images/collection-3.jpg',
    contractAddress: '0x3456789012345678901234567890123456789012',
    network: 'arbitrum',
    totalSupply: 75,
    isActive: true
  }
];

// Sample NFTs data
const sampleNFTs = [
  {
    title: 'Dragon of Fire',
    description: 'A majestic fire dragon with glowing scales',
    imageUrl: '/images/nft-1.jpg',
    priceCrypto: 0.5,
    currency: 'ETH',
    network: 'ethereum',
    isAvailable: true,
    tokenId: '1'
  },
  {
    title: 'Phoenix Rising',
    description: 'A beautiful phoenix emerging from flames',
    imageUrl: '/images/nft-2.jpg',
    priceCrypto: 0.3,
    currency: 'ETH',
    network: 'ethereum',
    isAvailable: true,
    tokenId: '2'
  },
  {
    title: 'Digital Sunset',
    description: 'A mesmerizing digital sunset over a cyberpunk city',
    imageUrl: '/images/nft-3.jpg',
    priceCrypto: 100,
    currency: 'MATIC',
    network: 'polygon',
    isAvailable: true,
    tokenId: '1'
  },
  {
    title: 'Space Walker',
    description: 'An astronaut floating in the vastness of space',
    imageUrl: '/images/nft-4.jpg',
    priceCrypto: 0.8,
    currency: 'ETH',
    network: 'arbitrum',
    isAvailable: true,
    tokenId: '1'
  }
];

export async function seedDatabase() {
  try {
    logger.info('Starting database seeding...');
    
    await connectDB();
    
    // Clear existing data
    await Promise.all([
      NFTCollection.deleteMany({}),
      NFT.deleteMany({}),
      AdminUser.deleteMany({})
    ]);
    
    logger.info('Cleared existing data');
    
    // Create admin user
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    const adminUser = new AdminUser({
      username: 'admin',
      passwordHash: hashedPassword,
      isActive: true,
      role: 'admin'
    });
    
    await adminUser.save();
    logger.info('Created admin user');
    
    // Create collections
    const collections = [];
    for (const collectionData of sampleCollections) {
      const collection = new NFTCollection({
        ...collectionData,
        id: `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
      await collection.save();
      collections.push(collection);
      logger.info(`Created collection: ${collection.name}`);
    }
    
    // Create NFTs
    for (let i = 0; i < sampleNFTs.length; i++) {
      const nftData = sampleNFTs[i];
      const collection = collections[i % collections.length]; // Distribute NFTs across collections
      
      const nft = new NFT({
        ...nftData,
        collectionId: collection._id
      });
      
      await nft.save();
      logger.info(`Created NFT: ${nft.title} in collection: ${collection.name}`);
    }
    
    logger.info('Database seeding completed successfully');
    
    return {
      success: true,
      message: 'Database seeded successfully',
      data: {
        collections: collections.length,
        nfts: sampleNFTs.length,
        adminUser: 'admin'
      }
    };
    
  } catch (error) {
    logger.error('Database seeding failed', error as Error);
    throw error;
  }
}

// Function to check if database is already seeded
export async function isDatabaseSeeded(): Promise<boolean> {
  try {
    await connectDB();
    
    const [collectionCount, nftCount, adminCount] = await Promise.all([
      NFTCollection.countDocuments(),
      NFT.countDocuments(),
      AdminUser.countDocuments()
    ]);
    
    return collectionCount > 0 && nftCount > 0 && adminCount > 0;
  } catch (error) {
    logger.error('Error checking if database is seeded', error as Error);
    return false;
  }
}

// Function to reset database
export async function resetDatabase() {
  try {
    logger.info('Resetting database...');
    
    await connectDB();
    
    await Promise.all([
      NFTCollection.deleteMany({}),
      NFT.deleteMany({}),
      AdminUser.deleteMany({})
    ]);
    
    logger.info('Database reset completed');
    
    return {
      success: true,
      message: 'Database reset successfully'
    };
  } catch (error) {
    logger.error('Database reset failed', error as Error);
    throw error;
  }
}