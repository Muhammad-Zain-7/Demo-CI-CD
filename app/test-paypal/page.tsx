"use client";
import PayPalCheckout from "../components/PayPalCheckout";

export default function TestPayPalPage() {
  const testProduct = {
    name: "Test NFT",
    description: "A test NFT for PayPal integration",
    price: 29.99,
  };

  const handleSuccess = (orderId: string) => {
    alert(`Payment successful! Order ID: ${orderId}`);
  };

  const handleError = (error: any) => {
    console.error("Payment error:", error);
    alert("Payment failed. Please try again.");
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-4">PayPal Test</h1>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white mb-2">
            {testProduct.name}
          </h2>
          <p className="text-gray-300 mb-2">{testProduct.description}</p>
          <p className="text-green-400 font-bold">${testProduct.price}</p>
        </div>

        <PayPalCheckout
          product={testProduct}
          quantity={1}
          onSuccess={handleSuccess}
          onError={handleError}
        />

        <div className="mt-6 text-xs text-gray-500">
          <p>• This is a test page for PayPal integration</p>
          <p>• Uses sandbox environment</p>
          <p>• Test with PayPal sandbox credentials</p>
        </div>
      </div>
    </div>
  );
}
