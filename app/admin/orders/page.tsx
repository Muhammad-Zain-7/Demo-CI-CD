"use client";

import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import React from "react";

export default function AdminOrdersPage() {
  React.useEffect(() => {
    const hasCookie = document.cookie.split('; ').find((c) => c.startsWith('admin_auth='));
    if (!hasCookie) {
      const input = prompt('Enter admin password');
      if (input !== 'Hippos7939@#') {
        alert('Invalid password');
        window.location.href = '/';
      } else {
        document.cookie = 'admin_auth=ok; path=/; max-age=86400';
      }
    }
  }, []);
  const [orders, setOrders] = useState<[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const url =
        filter === "all" ? "/api/orders" : `/api/orders?status=${filter}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      // Silent error handling for production
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await fetchOrders();
      } else {
        alert("Failed to update order status");
      }
    } catch (error) {
      alert("Failed to update order status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-400";
      case "paid":
        return "text-green-400";
      case "processing":
        return "text-blue-400";
      case "nft_sent":
        return "text-purple-400";
      case "completed":
        return "text-green-500";
      case "cancelled":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-900 text-yellow-300",
      paid: "bg-green-900 text-green-300",
      processing: "bg-blue-900 text-blue-300",
      nft_sent: "bg-purple-900 text-purple-300",
      completed: "bg-green-800 text-green-200",
      cancelled: "bg-red-900 text-red-300",
    };

    return colors[status as keyof typeof colors] || "bg-gray-900 text-gray-300";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Orders</h1>
            <p className="text-gray-400 mt-2">
              Manage customer orders and payments
            </p>
          </div>
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/admin")}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2 mb-6">
          {[
            "all",
            "pending",
            "paid",
            "processing",
            "nft_sent",
            "completed",
            "cancelled",
          ].map((status) => (
            <Button
              key={status}
              onClick={() => setFilter(status)}
              variant={filter === status ? "primary" : "outline"}
              size="sm"
              className="capitalize"
            >
              {status === "all" ? "All Orders" : status.replace("_", " ")}
            </Button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order: any, index) => (
            <Card key={index} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {order.nftTitle}
                  </h3>
                  <p className="text-gray-400">
                    Collection: {order.collectionName}
                  </p>
                  <p className="text-sm text-gray-500">Order ID: {order.id}</p>
                </div>
                <div className="text-right">
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status.replace("_", " ").toUpperCase()}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-400">Customer</p>
                  <p className="text-white font-medium">{order.customerName}</p>
                  <p className="text-sm text-gray-500">{order.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Wallet Address</p>
                  <p className="text-white font-mono text-sm">
                    {order.walletAddress?.slice(0, 6)}...
                    {order.walletAddress?.slice(-4)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Payment Method</p>
                  <p className="text-white font-medium capitalize">
                    {order.paymentMethod}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.paymentMethod === "crypto"
                      ? `${order.priceCrypto} ${order.currency}`
                      : `$${order.amount?.toFixed(2)}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Network</p>
                  <p className="text-white font-medium capitalize">
                    {order.network}
                  </p>
                </div>
              </div>

              {order.transactionHash && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400">Transaction Hash</p>
                  <p className="text-white font-mono text-sm break-all">
                    {order.transactionHash}
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                {order.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, "paid")}
                    >
                      Mark as Paid
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateOrderStatus(order.id, "cancelled")}
                    >
                      Cancel
                    </Button>
                  </>
                )}
                {order.status === "paid" && (
                  <Button
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, "processing")}
                  >
                    Start Processing
                  </Button>
                )}
                {order.status === "processing" && (
                  <Button
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, "nft_sent")}
                  >
                    Mark NFT Sent
                  </Button>
                )}
                {order.status === "nft_sent" && (
                  <Button
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, "completed")}
                  >
                    Complete Order
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-xl mb-4">No orders found</div>
            <p className="text-gray-500">
              {filter === "all"
                ? "No orders have been placed yet"
                : `No ${filter} orders found`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
