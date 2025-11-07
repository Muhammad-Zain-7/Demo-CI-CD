# Ngrok Configuration Guide

Your backend is now configured to use the ngrok URL: `https://f7b615915d4a.ngrok-free.app`

## Frontend Configuration

Create a `.env.local` file in your frontend directory with the following content:

```bash
# Backend Configuration
NEXT_PUBLIC_BACKEND_URL=https://f7b615915d4a.ngrok-free.app

# PayPal Configuration (use your actual PayPal Client ID)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id_here
```

## Backend Configuration

Update your backend `.env` file with:

```bash
# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_MODE=sandbox

# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/mythicmuses

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
# Note: This should be your frontend URL, not the ngrok URL
```

## Testing the Integration

1. **Start your backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start your frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the integration:**
   - Visit `http://localhost:3000/backend-integration-example`
   - Create an order and test payment flow
   - All API calls will go to your ngrok backend URL

## Important Notes

- The frontend uses the ngrok URL for API calls
- The backend redirects to your local frontend URL after payment
- Make sure your ngrok tunnel is running and accessible
- If you get a new ngrok URL, update the `NEXT_PUBLIC_BACKEND_URL` in your frontend `.env.local`

## API Endpoints

All frontend components now use these endpoints:
- Order creation: `https://f7b615915d4a.ngrok-free.app/api/orders`
- PayPal order creation: `https://f7b615915d4a.ngrok-free.app/api/paypal/create-order-widget`
- PayPal payment capture: `https://f7b615915d4a.ngrok-free.app/api/paypal/capture`

## Troubleshooting

If you encounter issues:

1. **CORS errors:** Make sure your ngrok URL is accessible
2. **API not found:** Verify the backend is running and accessible via ngrok
3. **PayPal errors:** Check your PayPal credentials in the backend
4. **Database errors:** Ensure MongoDB is running and accessible

## Updating the Ngrok URL

If you get a new ngrok URL:

1. Update `NEXT_PUBLIC_BACKEND_URL` in your frontend `.env.local`
2. Update the CORS configuration in `backend/server.js` if needed
3. Restart both frontend and backend servers
