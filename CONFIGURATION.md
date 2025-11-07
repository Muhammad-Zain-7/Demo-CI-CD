# Configuration Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Variables

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Admin Configuration
ADMIN_PASSWORD=your-secure-admin-password

# JWT Configuration
JWT_SECRET=your-jwt-secret-key

# Environment
NODE_ENV=development
```

### Optional Variables

```env
# PayPal Configuration (if using PayPal integration)
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox

# Additional API Keys
COINGECKO_API_KEY=your-coingecko-api-key
```

## MongoDB Setup

### Using MongoDB Atlas (Recommended)

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user with read/write permissions
4. Whitelist your IP address
5. Get the connection string and update `MONGODB_URI`

### Connection String Format

```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

## Security Configuration

### Admin Password
- Use a strong password for the admin account
- Default password is `admin123` (change in production)
- Password is hashed using bcrypt with 12 salt rounds

### JWT Secret
- Use a strong, random secret key
- Minimum 32 characters recommended
- Keep this secret secure

## Network Configuration

### Supported Networks
- Ethereum (mainnet)
- Arbitrum (mainnet)
- Polygon (mainnet)
- Base (mainnet)
- Optimism (mainnet)

### Supported Currencies
- ETH (Ethereum)
- MATIC (Polygon)
- USDC (USD Coin)
- USDT (Tether)

## API Configuration

### Rate Limiting
- Collections API: 30-second cache
- Crypto prices: 1-minute cache
- Admin endpoints: JWT authentication required

### CORS Configuration
- Configured for localhost:3000 in development
- Update for production domain

## Production Checklist

- [ ] Change default admin password
- [ ] Set strong JWT secret
- [ ] Use MongoDB Atlas for production
- [ ] Configure proper CORS settings
- [ ] Set up monitoring and logging
- [ ] Configure SSL/TLS
- [ ] Set up database backups
- [ ] Configure environment-specific settings
