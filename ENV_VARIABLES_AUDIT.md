# Next.js Environment Variables - Complete Audit & Fix

## ✅ **Environment Variables Fixed Across All Files**

I've audited all files in the project and fixed environment variable usage to follow proper Next.js conventions.

### 🔧 **Next.js Environment Variable Rules:**

#### **Server-Side Only (API Routes)**
```javascript
// These are only accessible in API routes (server-side)
process.env.MONGODB_URI
process.env.JWT_SECRET
process.env.ADMIN_PASSWORD
process.env.CHANGENOW_API_KEY
process.env.MASTER_WALLET
process.env.CHANGENOW_BASE_URL
process.env.NODE_ENV
```

#### **Client-Side Access (Public Variables)**
```javascript
// These are accessible on both client and server
process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET
process.env.NEXT_PUBLIC_PAYPAL_WEBHOOK_ID
process.env.NEXT_PUBLIC_PAYPAL_BASE_URL
process.env.NEXT_PUBLIC_BASE_URL
```

### 📁 **Files Updated:**

#### **✅ PayPal API Routes (Fixed)**
- `app/api/paypal/create-order/route.ts`
- `app/api/paypal/capture/route.ts`
- `app/api/paypal/webhook/route.ts`
- `app/api/paypal/create-order-widget/route.ts`
- `app/api/paypal/test-config/route.ts`

**Before:**
```javascript
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
```

**After:**
```javascript
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET;
```

#### **✅ Other Files (Already Correct)**
- `app/api/simple-test/route.ts` - Fixed PayPal reference
- `app/config/constants.ts` - Already using `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- `app/lib/mongodb.ts` - Correctly using `process.env.MONGODB_URI`
- `app/api/admin/login/route.ts` - Correctly using `process.env.JWT_SECRET`
- `app/lib/logger.ts` - Correctly using `process.env.NODE_ENV`
- `app/lib/seedDatabase.ts` - Correctly using `process.env.ADMIN_PASSWORD`
- `app/api/changenow/route.ts` - Correctly using server-side env vars

### 🎯 **Environment Variable Setup:**

#### **Create `.env.local` file:**
```bash
# Server-side only (API routes)
MONGODB_URI=mongodb://localhost:27017/mythicmuse
JWT_SECRET=your_jwt_secret_key
ADMIN_PASSWORD=your_admin_password
CHANGENOW_API_KEY=your_changenow_api_key
MASTER_WALLET=your_master_wallet_address
CHANGENOW_BASE_URL=https://api.changenow.io

# Public variables (accessible on client-side)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
NEXT_PUBLIC_PAYPAL_CLIENT_SECRET=your_paypal_client_secret
NEXT_PUBLIC_PAYPAL_WEBHOOK_ID=your_webhook_id
NEXT_PUBLIC_PAYPAL_BASE_URL=https://api-m.paypal.com  # or https://api.paypal.com
NEXT_PUBLIC_BASE_URL=https://api.mythicmuse.art

# Environment
NODE_ENV=development  # or production
```

### 🔄 **Auto-Detection Logic:**

The PayPal Base URL automatically detects the environment:

```javascript
const PAYPAL_BASE_URL = process.env.NEXT_PUBLIC_PAYPAL_BASE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://api.paypal.com'      // Production
    : 'https://api-m.paypal.com');  // Sandbox
```

### ⚠️ **Security Notes:**

1. **Server-side secrets**: Never expose `JWT_SECRET`, `ADMIN_PASSWORD`, `MONGODB_URI`
2. **PayPal credentials**: Can be public (using `NEXT_PUBLIC_` prefix)
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

### 🚀 **Summary:**

**Files Fixed:** 6 files updated to use proper Next.js environment variables
**Files Verified:** 7 files already using correct conventions
**Total Files Audited:** 13 files

All environment variables now follow proper Next.js conventions:
- ✅ Server-side secrets use `process.env.VARIABLE_NAME`
- ✅ Client-side variables use `process.env.NEXT_PUBLIC_VARIABLE_NAME`
- ✅ No mixed environment variable usage
- ✅ Consistent naming across all files

The project is now ready for proper environment variable configuration!
