# Backend Migration Guide

This guide explains how to migrate from the Next.js API routes to the Express backend for order creation and PayPal integration.

## Overview

The order creation and PayPal processing has been moved from Next.js API routes to a dedicated Express backend. This provides better separation of concerns, improved scalability, and centralized order management.

## Changes Made

### Backend (Express)
- **New Express server** running on port 3001
- **MongoDB integration** with Mongoose ODM
- **Order management** with full CRUD operations
- **PayPal integration** with multiple payment methods
- **NFT support** with automatic USD price calculation

### Frontend (Next.js)
- **Updated PayPal components** to use backend APIs
- **New order service** for backend communication
- **New integration component** for seamless order creation
- **Environment variables** for backend URL configuration

## Migration Steps

### 1. Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp env.example .env
   # Edit .env with your credentials
   ```

3. **Start the backend:**
   ```bash
   npm run dev
   ```

### 2. Frontend Configuration

1. **Add environment variable:**
   ```bash
   # In your .env.local or .env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
   ```

2. **Update existing components:**
   - PayPal components now use backend URLs
   - Order creation flows updated to use backend APIs

### 3. API Endpoint Changes

| Old (Next.js) | New (Express) | Description |
|---------------|---------------|-------------|
| `/api/orders` | `http://localhost:3001/api/orders` | Order management |
| `/api/paypal/create-order` | `http://localhost:3001/api/paypal/create-order-for-order` | PayPal order creation |
| `/api/paypal/capture` | `http://localhost:3001/api/paypal/capture` | PayPal payment capture |

## New Features

### 1. Backend Order Integration Component

```tsx
import BackendOrderIntegration from './components/BackendOrderIntegration';

<BackendOrderIntegration
  nftId="507f1f77bcf86cd799439011"
  customerName="John Doe"
  customerEmail="john@example.com"
  walletAddress="0x1234567890123456789012345678901234567890"
  onOrderCreated={(orderId) => console.log('Order created:', orderId)}
  onPaymentSuccess={(orderId) => console.log('Payment successful:', orderId)}
  onPaymentError={(error) => console.error('Payment error:', error)}
/>
```

### 2. Order Service

```tsx
import { OrderService } from './lib/orderService';

// Create order
const order = await OrderService.createOrder({
  nftId: '507f1f77bcf86cd799439011',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  walletAddress: '0x1234567890123456789012345678901234567890'
});

// Get orders
const orders = await OrderService.getOrders({ status: 'paid' });

// Create PayPal order
const paypalOrder = await OrderService.createPayPalOrder(order._id);
```

### 3. Updated PayPal Components

The existing PayPal components (`PayPalWidget`, `PayPalCardWidget`) have been updated to use the backend APIs automatically. No changes needed in existing usage.

## Database Schema

### Order Model
```javascript
{
  _id: ObjectId,
  nftId: ObjectId (ref: 'NFT'),
  collectionId: ObjectId (ref: 'NFTCollection'),
  customerName: String,
  customerEmail: String,
  walletAddress: String,
  priceCrypto: Number,
  currency: String,
  network: String,
  priceUSD: Number,
  amount: Number,
  status: String,
  paypalOrderId: String,
  paymentMethod: String,
  createdAt: Date,
  updatedAt: Date
}
```

### NFT Model
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  image: String,
  priceCrypto: Number,
  priceUSD: Number,
  currency: String,
  network: String,
  collectionId: ObjectId,
  isAvailable: Boolean,
  isMinted: Boolean
}
```

## Testing

1. **Start both servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Test the integration:**
   - Visit `/backend-integration-example` in your frontend
   - Create an order and test payment flow
   - Verify order appears in the orders list

## Environment Variables

### Backend (.env)
```bash
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox
PORT=3001
MONGODB_URI=mongodb://localhost:27017/mythicmuses
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
```

## Troubleshooting

### Common Issues

1. **CORS errors:**
   - Ensure backend is running on port 3001
   - Check CORS configuration in backend

2. **Database connection:**
   - Verify MongoDB is running
   - Check MONGODB_URI in backend .env

3. **PayPal integration:**
   - Verify PayPal credentials in both frontend and backend
   - Check PAYPAL_MODE is set correctly

4. **Order creation fails:**
   - Ensure NFT exists in database
   - Check required fields are provided
   - Verify customer email format

### Debug Steps

1. Check backend logs for errors
2. Verify API endpoints are accessible
3. Test with Postman or curl
4. Check browser network tab for failed requests

## Benefits of Migration

1. **Separation of Concerns:** Backend handles business logic, frontend handles UI
2. **Scalability:** Backend can be scaled independently
3. **Database Management:** Centralized order and NFT management
4. **API Consistency:** RESTful APIs with proper error handling
5. **Development:** Easier to test and maintain

## Next Steps

1. **Remove old API routes** from Next.js (optional)
2. **Add authentication** to backend APIs
3. **Implement webhooks** for PayPal events
4. **Add order status tracking** and notifications
5. **Implement admin dashboard** for order management
