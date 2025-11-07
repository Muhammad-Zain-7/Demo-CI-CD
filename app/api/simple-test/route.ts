import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({ 
      message: 'API is working!',
      env: {
        mongodb_uri_set: !!process.env.MONGODB_URI,
        paypal_client_id_set: !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
        admin_password_set: !!process.env.ADMIN_PASSWORD
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Simple test error:', error);
    return NextResponse.json({ 
      error: 'Simple test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
