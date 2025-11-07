"use client";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";

interface PayPalCheckoutProps {
  product: {
    name: string;
    description: string;
    price: number;
  };
  quantity?: number;
  onSuccess?: (orderId: string) => void;
  onError?: (error: any) => void;
}

export default function PayPalCheckout({
  product,
  quantity = 1,
  onSuccess,
  onError,
}: PayPalCheckoutProps) {
  const [error, setError] = useState<string | null>(null);

  const createOrder = async () => {
    try {
      const backendUrl = "https://mythicmuses-backend.vercel.app";
      // const backendUrl = "http://localhost:3001"
      const response = await fetch(`${backendUrl}/api/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: {
            name: product.name,
            description: product.description,
          },
          quantity,
          price: product.price,
        }),
      });

      const data = await response.json();
      return data.orderID;
    } catch (err) {
      setError("Failed to create order");
      console.error(err);
      throw err;
    }
  };

  const onApprove = async (data: any) => {
    try {
      const backendUrl = "https://mythicmuses-backend.vercel.app";
            // const backendUrl = "http://localhost:3001"

      const response = await fetch(`${backendUrl}/api/payment/capture-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID: data.orderID }),
      });

      const details = await response.json();

      if (details.success) {
        onSuccess?.(details.orderID);
      } else {
        throw new Error("Payment capture failed");
      }
    } catch (err) {
      setError("Failed to capture payment");
      console.error(err);
      onError?.(err);
    }
  };

  return (
    <div className="paypal-button-container">
      {error && (
        <div className="mb-4 p-3 bg-red-900 bg-opacity-20 border border-red-500 rounded text-red-400 text-sm">
          {error}
        </div>
      )}
      <PayPalButtons
        createOrder={createOrder}
        onApprove={onApprove}
        onError={(err) => {
          setError("Payment failed");
          console.error(err);
          onError?.(err);
        }}
        style={{
          layout: "vertical",
          color: "blue",
          shape: "rect",
          label: "paypal",
        }}
      />
    </div>
  );
}
