"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { OrderService } from "../lib/orderService";
import toast from "react-hot-toast";

interface BackendOrderIntegrationProps {
  nftId: string;
  customerName: string;
  customerEmail: string;
  walletAddress: string;
  onOrderCreated?: (orderId: string) => void;
  onPaymentSuccess?: (orderId: string) => void;
  onPaymentError?: (error: any) => void;
}

export default function BackendOrderIntegration({
  nftId,
  customerName,
  customerEmail,
  walletAddress,
  onOrderCreated,
  onPaymentSuccess,
  onPaymentError,
}: BackendOrderIntegrationProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateOrder = async () => {
    setIsLoading(true);

    try {
      const orderData = {
        nftId: nftId,
        customerName: customerName,
        customerEmail: customerEmail,
        walletAddress: walletAddress,
        amount: 150, // Example amount
        paymentMethod: "paypal",
      };

      const order = await OrderService.createOrder(orderData);

      toast.success("Order created successfully!");
      onOrderCreated?.(order._id);

      // Here you could integrate with PayPal or other payment methods
      // For now, we'll just simulate a successful payment
      setTimeout(() => {
        toast.success("Payment processed successfully!");
        onPaymentSuccess?.(order._id);
      }, 2000);
    } catch (error) {
      console.error("Error creating order:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create order";
      toast.error(errorMessage);
      onPaymentError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-300">
        <p>
          <strong>NFT ID:</strong> {nftId}
        </p>
        <p>
          <strong>Customer:</strong> {customerName}
        </p>
        <p>
          <strong>Email:</strong> {customerEmail}
        </p>
        <p>
          <strong>Wallet:</strong> {walletAddress.substring(0, 10)}...
          {walletAddress.substring(walletAddress.length - 6)}
        </p>
      </div>

      <Button
        onClick={handleCreateOrder}
        loading={isLoading}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Creating Order..." : "Create Order & Process Payment"}
      </Button>

      <div className="text-sm text-gray-400">
        <p>This component demonstrates:</p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>Order creation through OrderService</li>
          <li>Payment processing simulation</li>
          <li>Error handling and user feedback</li>
          <li>Event callbacks for parent components</li>
        </ul>
      </div>
    </div>
  );
}
