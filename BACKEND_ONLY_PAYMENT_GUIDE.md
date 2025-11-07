# Backend-Only Payment Integration Guide

This guide explains the backend-only payment integration approach where the frontend does NOT use PayPal independently and all payments are processed through the backend using credit cards only.

## 🚫 What Frontend CANNOT Do

The frontend is **strictly prohibited** from:
- Creating PayPal orders independently
- Capturing PayPal payments independently  
- Using PayPal SDK for direct payment processing
- Bypassing the backend for any payment operations

## ✅ What Frontend MUST Do

The frontend **must**:
- Create orders through backend API (`/api/orders`)
- Use backend PayPal integration (`/api/paypal/create-order-widget`)
- Capture payments through backend (`/api/paypal/capture`)
- Only support credit card payments (no PayPal wallet)

## 🔧 Implementation Details

### 1. Order Creation Flow

```typescript
// ✅ CORRECT: Create order through backend
const response = await fetch(`${BACKEND_URL}/api/orders`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nftId,
    customerName,
    customerEmail,
    walletAddress
  })
});

// ❌ WRONG: Direct PayPal order creation
// const paypalOrder = await paypal.orders.create({...});
```

### 2. Payment Processing Flow

```typescript
// ✅ CORRECT: Use backend for PayPal order creation
const response = await fetch(`${BACKEND_URL}/api/paypal/create-order-widget`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId,
    amount,
    paymentMethod: "card"
  })
});

// ❌ WRONG: Direct PayPal SDK usage
// const order = await paypal.orders.create({...});
```

### 3. Payment Capture Flow

```typescript
// ✅ CORRECT: Capture through backend
const response = await fetch(`${BACKEND_URL}/api/paypal/capture`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: paypalOrderId,
    ourOrderId: ourOrderId,
    paymentMethod: "card"
  })
});

// ❌ WRONG: Direct PayPal capture
// const capture = await paypal.orders.capture(orderId);
```

## 🎯 Credit Card Only Configuration

### PayPal SDK Configuration

```javascript
// Only enable credit card funding, disable all other methods
script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&components=buttons&enable-funding=card&disable-funding=paylater,venmo,paypal&intent=capture`;
```

### Button Configuration

```javascript
window.paypal.Buttons({
  fundingSource: window.paypal.FUNDING.CARD, // Only credit cards
  style: {
    layout: "vertical",
    color: "black",
    shape: "rect",
    label: "pay",
    height: 50,
  },
  // ... rest of configuration
});
```

## 🔒 Security Benefits

1. **Centralized Control**: All payment logic in backend
2. **Secure Credentials**: PayPal secrets only in backend
3. **Audit Trail**: All transactions logged in backend
4. **Validation**: Backend validates all payment data
5. **Error Handling**: Centralized error management

## 📋 API Endpoints Used

| Endpoint | Purpose | Frontend Usage |
|----------|---------|----------------|
| `POST /api/orders` | Create order | ✅ Required |
| `POST /api/paypal/create-order-widget` | Create PayPal order | ✅ Required |
| `POST /api/paypal/capture` | Capture payment | ✅ Required |
| `GET /api/orders` | Get orders | ✅ Optional |

## 🚀 Component Usage

### BackendOrderIntegration Component

```tsx
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

### PayPalCardWidget Component

```tsx
<PayPalCardWidget
  amount={29.99}
  orderId="order_123"
  onSuccess={(orderId) => console.log('Success:', orderId)}
  onError={(error) => console.error('Error:', error)}
/>
```

## ⚠️ Important Notes

1. **No Direct PayPal**: Frontend never calls PayPal APIs directly
2. **Backend Only**: All payment operations go through backend
3. **Credit Card Only**: No PayPal wallet, only credit cards
4. **Error Handling**: All errors handled through backend responses
5. **Security**: PayPal credentials never exposed to frontend

## 🔍 Validation Checklist

- [ ] No direct PayPal SDK calls in frontend
- [ ] All orders created through `/api/orders`
- [ ] All PayPal orders created through `/api/paypal/create-order-widget`
- [ ] All payments captured through `/api/paypal/capture`
- [ ] Only credit card payment method enabled
- [ ] PayPal wallet funding disabled
- [ ] Backend URL configured correctly
- [ ] Error handling implemented

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Check backend CORS configuration
2. **API Not Found**: Verify backend is running and accessible
3. **Payment Fails**: Check backend logs for PayPal errors
4. **Order Creation Fails**: Verify NFT exists in database

### Debug Steps

1. Check browser network tab for failed requests
2. Verify backend logs for errors
3. Test API endpoints with Postman
4. Check PayPal credentials in backend

## 📚 Related Files

- `frontend/app/components/BackendOrderIntegration.tsx` - Main integration component
- `frontend/app/components/PayPalCardWidget.tsx` - Credit card payment widget
- `frontend/app/lib/orderService.ts` - Backend communication service
- `backend/routes/orders.js` - Order management endpoints
- `backend/routes/paypal.js` - PayPal integration endpoints
