"use client";

import { useState } from "react";
import BackendOrderIntegration from "../components/BackendOrderIntegration";
import { OrderService, Order } from "../lib/orderService";

export default function BackendIntegrationExample() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const ordersData = await OrderService.getOrders({ limit: 10 });
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderCreated = (orderId: string) => {
    console.log("Order created:", orderId);
    // Optionally fetch orders again to show the new one
    fetchOrders();
  };

  const handlePaymentSuccess = (orderId: string) => {
    console.log("Payment successful for order:", orderId);
    // Optionally fetch orders again to show updated status
    fetchOrders();
  };

  const handlePaymentError = (error: any) => {
    console.error("Payment error:", error);
    setError(error instanceof Error ? error.message : "Payment failed");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Backend Integration Example</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Creation Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Create Order & Pay</h2>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">NFT Purchase - Credit Card Only</h3>
              <p className="text-gray-300 mb-4">
                This example shows how to create an order through the backend and process payment using credit cards only. All payments are processed through PayPal's secure payment system.
              </p>
              
              <BackendOrderIntegration
                nftId="507f1f77bcf86cd799439011" // Example NFT ID
                customerName="John Doe"
                customerEmail="john@example.com"
                walletAddress="0x1234567890123456789012345678901234567890"
                onOrderCreated={handleOrderCreated}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </div>
          </div>

          {/* Orders List Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Recent Orders</h2>
              <button
                onClick={fetchOrders}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded"
              >
                {isLoading ? "Loading..." : "Refresh Orders"}
              </button>
            </div>

            {error && (
              <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-gray-800 p-6 rounded-lg text-center">
                  <p className="text-gray-400">No orders found. Create an order to see it here.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order._id} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{order.nftTitle}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.status === 'paid' ? 'bg-green-900 text-green-300' :
                        order.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                        order.status === 'cancelled' ? 'bg-red-900 text-red-300' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>Order ID: {order._id}</p>
                      <p>Customer: {order.customerName} ({order.customerEmail})</p>
                      <p>Amount: ${order.amount} USD</p>
                      <p>Payment Method: {order.paymentMethod || 'N/A'}</p>
                      <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* API Documentation */}
        <div className="mt-12 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Backend API Endpoints</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-blue-400">Orders</h3>
              <ul className="ml-4 space-y-1 text-gray-300">
                <li><code>POST /api/orders</code> - Create new order</li>
                <li><code>GET /api/orders</code> - Get all orders (with filters)</li>
                <li><code>GET /api/orders/:id</code> - Get specific order</li>
                <li><code>PUT /api/orders/:id</code> - Update order</li>
                <li><code>DELETE /api/orders/:id</code> - Delete order</li>
              </ul>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
