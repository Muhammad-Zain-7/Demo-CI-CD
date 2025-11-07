import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '../../../lib/mongodb';
import AdminUser from '../../../models/AdminUser';
import { handleApiError, sanitizeInput } from '../../../lib/errorHandler';
import { logger } from '../../../lib/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    logger.apiRequest('POST', '/api/admin/login');
    
    const body = await req.text();
    if (!body) {
      return NextResponse.json({ error: 'Request body is required' }, { status: 400 });
    }

    const { username, password } = JSON.parse(body);
    
    if (!username || !password) {
      return NextResponse.json({ 
        error: 'Username and password are required' 
      }, { status: 400 });
    }

    // Sanitize input
    const sanitizedUsername = sanitizeInput(username);
    const sanitizedPassword = sanitizeInput(password);

    if (!sanitizedUsername || !sanitizedPassword) {
      return NextResponse.json({ 
        error: 'Invalid username or password format' 
      }, { status: 400 });
    }

    await connectDB();
    logger.dbQuery('findOne', 'adminusers', { username: sanitizedUsername });

    // Find admin user
    const adminUser = await AdminUser.findOne({ 
      username: sanitizedUsername,
      isActive: true 
    });

    if (!adminUser) {
      logger.warn('Admin login attempt with invalid username', { username: sanitizedUsername });
      return NextResponse.json({ 
        error: 'Invalid credentials' 
      }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(sanitizedPassword, adminUser.passwordHash);
    
    if (!isPasswordValid) {
      logger.warn('Admin login attempt with invalid password', { username: sanitizedUsername });
      return NextResponse.json({ 
        error: 'Invalid credentials' 
      }, { status: 401 });
    }

    // Update last login
    adminUser.lastLogin = new Date();
    await adminUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: adminUser._id,
        username: adminUser.username,
        role: adminUser.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const duration = Date.now() - startTime;
    logger.apiResponse('POST', '/api/admin/login', 200, duration);
    logger.businessEvent('Admin login successful', { 
      username: adminUser.username, 
      role: adminUser.role 
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: adminUser._id,
        username: adminUser.username,
        role: adminUser.role,
        lastLogin: adminUser.lastLogin
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError('POST', '/api/admin/login', error as Error);
    return handleApiError(error);
  }
}

// Middleware to verify JWT token
function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Middleware to check admin authentication
function requireAuth(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    try {
      const authHeader = req.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      if (!decoded) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      }

      // Add user info to request
      (req as any).user = decoded;
      
      return handler(req, ...args);
    } catch (error) {
      logger.error('Authentication middleware error', error as Error);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
  };
}