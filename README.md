# MythicMuse NFT Marketplace

A comprehensive, production-ready NFT marketplace built with Next.js 15, React 19, TypeScript, and MongoDB. This system provides individual NFT pricing, real-time crypto-to-USD conversion, comprehensive order tracking, and a secure admin panel.

## 🚀 Features

### Core Functionality
- **Individual NFT Pricing**: Each NFT has its own price in various cryptocurrencies
- **Real-time Crypto Conversion**: Live conversion of crypto prices to USD using CoinGecko API
- **Comprehensive Order Tracking**: Detailed order management with status updates
- **Multi-chain Support**: Ethereum, Arbitrum, Polygon, Base, and Optimism networks
- **Secure Admin Panel**: Password-protected admin dashboard for managing the marketplace

### Technical Features
- **Industry-Grade Error Handling**: Comprehensive error handling with proper logging
- **Input Validation & Sanitization**: Robust validation for all user inputs
- **Database Resilience**: MongoDB connection with retry logic and fallback mechanisms
- **Caching**: In-memory caching for improved performance
- **Security**: JWT-based authentication, password hashing, and input sanitization
- **Monitoring**: Comprehensive logging and performance tracking

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens, bcrypt password hashing
- **External APIs**: CoinGecko for crypto prices
- **Styling**: Tailwind CSS
- **Validation**: Custom validation utilities

## 📁 Project Structure

```
app/
├── api/                    # API routes
│   ├── admin/             # Admin-specific endpoints
│   │   ├── login/         # Admin authentication
│   │   └── stats/         # Admin dashboard statistics
│   ├── collections/       # NFT collection management
│   ├── nfts/             # NFT management
│   ├── orders/           # Order management
│   ├── crypto/           # Crypto price and conversion
│   └── seed/             # Database seeding
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── AdminDashboard.tsx
│   └── NFTCollectionModal.tsx
├── lib/                 # Utility libraries
│   ├── mongodb.ts       # Database connection
│   ├── errorHandler.ts  # Error handling utilities
│   ├── validators.ts    # Input validation
│   ├── logger.ts        # Logging system
│   └── seedDatabase.ts  # Database seeding
├── models/              # Mongoose models
│   ├── NFTCollection.ts
│   ├── NFT.ts
│   ├── Order.ts
│   ├── User.ts
│   └── AdminUser.ts
├── types.ts             # TypeScript type definitions
└── config/              # Configuration files
    └── constants.ts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account or local MongoDB instance
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Mythicmuse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ADMIN_PASSWORD=your-secure-admin-password
   JWT_SECRET=your-jwt-secret-key
   ```

4. **Database Setup**
   ```bash
   # Seed the database with sample data
   curl -X POST http://localhost:3000/api/seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Main application: http://localhost:3000
   - Admin panel: http://localhost:3000/admin-auth

## 🔐 Admin Access

- **Username**: `admin`
- **Password**: Set in `ADMIN_PASSWORD` environment variable (default: `admin123`)

## 📊 API Endpoints

### Collections
- `GET /api/collections` - Get all collections
- `POST /api/collections` - Create a new collection
- `PUT /api/collections` - Update a collection
- `DELETE /api/collections` - Delete a collection

### NFTs
- `GET /api/nfts` - Get all NFTs (with filtering)
- `POST /api/nfts` - Create a new NFT
- `PUT /api/nfts` - Update an NFT
- `DELETE /api/nfts` - Delete an NFT

### Orders
- `GET /api/orders` - Get all orders (with filtering)
- `POST /api/orders` - Create a new order
- `PUT /api/orders` - Update an order
- `DELETE /api/orders` - Delete an order

### Crypto
- `GET /api/crypto/prices` - Get current crypto prices
- `POST /api/crypto/convert` - Convert crypto to USD

### Admin
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/stats` - Get dashboard statistics

### Database
- `GET /api/seed` - Check if database is seeded
- `POST /api/seed` - Seed the database

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | Required |
| `ADMIN_PASSWORD` | Admin user password | `admin123` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `NODE_ENV` | Environment mode | `development` |

### Supported Networks
- Ethereum
- Arbitrum
- Polygon
- Base
- Optimism

### Supported Currencies
- ETH (Ethereum)
- MATIC (Polygon)
- USDC (USD Coin)
- USDT (Tether)

## 🛡️ Security Features

- **Input Validation**: Comprehensive validation for all inputs
- **SQL Injection Prevention**: Parameterized queries with Mongoose
- **XSS Protection**: Input sanitization and output encoding
- **Authentication**: JWT-based admin authentication
- **Password Security**: bcrypt hashing with salt rounds
- **Rate Limiting**: Built-in request throttling
- **Error Handling**: Secure error messages without sensitive data exposure

## 📈 Performance Features

- **Caching**: In-memory caching for collections and crypto prices
- **Database Optimization**: Proper indexing and query optimization
- **Connection Pooling**: MongoDB connection pooling
- **Lazy Loading**: Component-based lazy loading
- **Image Optimization**: Next.js image optimization

## 🧪 Testing

The system includes comprehensive error handling and validation. To test the system:

1. **Test API endpoints** using the provided endpoints
2. **Test admin functionality** by logging into the admin panel
3. **Test crypto conversion** by creating orders with different currencies
4. **Test error handling** by sending invalid requests

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Set all required environment variables
2. **Database**: Use MongoDB Atlas for production
3. **Security**: Change default passwords and JWT secrets
4. **Monitoring**: Set up proper logging and monitoring
5. **Backup**: Implement database backup strategies

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation
- Review the error logs
- Ensure all environment variables are set correctly
- Verify MongoDB connection

## 🔄 Updates

The system is designed to be easily extensible. Future enhancements could include:
- Additional blockchain networks
- More payment methods
- Advanced analytics
- Mobile app integration
- Multi-language support

---

**Built with ❤️ using Next.js, React, TypeScript, and MongoDB**