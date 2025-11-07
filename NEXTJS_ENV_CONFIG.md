# Next.js PayPal Environment Variables Configuration

## ✅ **Environment Variables Fixed**

All PayPal routes now use proper Next.js environment variable conventions.

### 🔧 **Next.js Environment Variable Rules:**

#### **Server-Side Only (API Routes)**
```javascript
// These are only accessible in API routes (server-side)
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;
const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL;
```

#### **Client-Side Access (if needed)**
```javascript
// These are accessible on both client and server
const NEXT_PUBLIC_PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
```

### 📁 **Files Updated:**

#### **✅ app/api/paypal/create-order/route.ts**
```javascript
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://api.paypal.com' : 'https://api-m.paypal.com');
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;
```

#### **✅ app/api/paypal/capture/route.ts**
```javascript
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://api.paypal.com' : 'https://api-m.paypal.com');
```

#### **✅ app/api/paypal/webhook/route.ts**
```javascript
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;
const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://api.paypal.com' : 'https://api-m.paypal.com');
```

#### **✅ app/api/paypal/create-order-widget/route.ts**
```javascript
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://api.paypal.com' : 'https://api-m.paypal.com');
```

#### **✅ app/api/paypal/test-config/route.ts**
```javascript
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://api.paypal.com' : 'https://api-m.paypal.com');
```

### 🎯 **Environment Variable Setup:**

#### **Create `.env.local` file:**
```bash
# PayPal Configuration (Server-side only)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_WEBHOOK_ID=your_webhook_id

# PayPal Base URL (optional - auto-detects based on NODE_ENV)
PAYPAL_BASE_URL=https://api-m.paypal.com  # for sandbox
# PAYPAL_BASE_URL=https://api.paypal.com  # for production

# Base URL for redirects
NEXT_PUBLIC_BASE_URL=https://api.mythicmuse.art

# Environment
NODE_ENV=development  # or production
```

#### **For Production Deployment:**
```bash
# Production environment variables
NODE_ENV=production
PAYPAL_CLIENT_ID=your_production_client_id
PAYPAL_CLIENT_SECRET=your_production_client_secret
PAYPAL_WEBHOOK_ID=your_production_webhook_id
NEXT_PUBLIC_BASE_URL=https://api.mythicmuse.art
```

### 🔄 **Auto-Detection Logic:**

The PayPal Base URL automatically detects the environment:

```javascript
const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://api.paypal.com'      // Production
    : 'https://api-m.paypal.com');  // Sandbox
```

### ⚠️ **Security Notes:**

1. **Never expose secrets**: `PAYPAL_CLIENT_SECRET` is server-side only
2. **Client ID can be public**: Safe to use `NEXT_PUBLIC_PAYPAL_CLIENT_ID` if needed
3. **Environment separation**: Use different credentials for dev/prod
4. **File security**: Never commit `.env.local` to version control

### 🧪 **Testing:**

Test your configuration:
```bash
curl http://localhost:3000/api/paypal/test-config
```

Should return:
```json
{
  "paypalClientId": "Set",
  "paypalClientSecret": "Set", 
  "paypalBaseUrl": "https://api-m.paypal.com",
  "nodeEnv": "development",
  "paypalConnectionTest": "Success"
}
```

### 🚀 **Next Steps:**

1. **Create `.env.local`** with your PayPal credentials
2. **Set NODE_ENV** to `development` for sandbox or `production` for live
3. **Test the configuration** using the test endpoint
4. **Deploy with production credentials** when ready

All PayPal routes now follow proper Next.js environment variable conventions!
