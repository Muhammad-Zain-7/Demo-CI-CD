import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Get the client's IP address
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = forwarded ? forwarded.split(',')[0] : realIp || 'Unknown';

    return NextResponse.json({
      message: 'IP Address for MongoDB Whitelist',
      ip: clientIp,
      instructions: [
        '1. Go to MongoDB Atlas Dashboard',
        '2. Navigate to Network Access',
        '3. Click "Add IP Address"',
        '4. Add the IP address shown above',
        '5. Or use "Allow Access from Anywhere" (0.0.0.0/0) for development'
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to get IP address',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
