import { NextResponse } from 'next/server';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class AppError extends Error implements ApiError {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Handle known operational errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        statusCode: error.statusCode,
        timestamp: new Date().toISOString()
      },
      { status: error.statusCode }
    );
  }

  // Handle Mongoose validation errors
  if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
    const validationError = error as any;
    const errors = Object.values(validationError.errors).map((err: any) => err.message);
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: errors,
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    );
  }

  // Handle Mongoose cast errors
  if (error && typeof error === 'object' && 'name' in error && error.name === 'CastError') {
    const castError = error as any;
    return NextResponse.json(
      {
        error: `Invalid ${castError.path}: ${castError.value}`,
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    );
  }

  // Handle MongoDB duplicate key errors
  if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
    const duplicateError = error as any;
    const field = Object.keys(duplicateError.keyValue)[0];
    return NextResponse.json(
      {
        error: `${field} already exists`,
        timestamp: new Date().toISOString()
      },
      { status: 409 }
    );
  }

  // Handle generic errors
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
  const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500;

  return NextResponse.json(
    {
      error: errorMessage,
      timestamp: new Date().toISOString()
    },
    { status: statusCode }
  );
}

export function asyncHandler(fn: Function) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function validateRequiredFields(data: any, requiredFields: string[]): string[] {
  const errors: string[] = [];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim().length === 0)) {
      errors.push(`${field} is required`);
    }
  }
  
  return errors;
}

export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (input && typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

// Helper function to parse request body safely
export async function parseRequestBody(req: Request): Promise<any> {
  try {
    const text = await req.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error('Error parsing request body:', error);
    return null;
  }
}
