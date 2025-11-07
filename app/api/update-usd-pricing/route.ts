import { NextRequest, NextResponse } from 'next/server';
import { updateNFTsWithUSDPricing } from '../../lib/seedNFTs';

export async function POST(req: NextRequest) {
  try {
    
    const result = await updateNFTsWithUSDPricing();
    
    
    
    return NextResponse.json({
      success: true,
      message: result.message,
      updated: result.updated
    });
    
  } catch (error) {
    console.error('Failed to update NFTs with USD pricing', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update NFTs with USD pricing',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    
    const result = await updateNFTsWithUSDPricing();
    
    return NextResponse.json({
      success: true,
      message: result.message,
      updated: result.updated,
      hasUSD: result.updated === 0
    });
    
  } catch (error) {
    console.error('Failed to check NFT USD pricing status', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check NFT USD pricing status',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
