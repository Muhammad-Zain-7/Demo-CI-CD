"use client";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export default function PayPalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialOptions = {
    clientId:
      "AXQePKQmhgSnQG0dTbqyCJm2eSJMr5tA0xDKScNNKG5Qasekpjhb3XjkTjfnwO-nzcnvES4IExzCg46L",
    currency: "USD",
    intent: "capture",
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      {children}
    </PayPalScriptProvider>
  );
}
