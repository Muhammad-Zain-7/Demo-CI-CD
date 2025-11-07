"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '../../components/ui/Button';

function Content() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      // In production, fetch order details from your API
      // For demo, we'll simulate the order data
      setTimeout(() => {
        setOrderDetails({
          id: orderId,
          status: 'paid',
          amount: 100,
          currency: 'USD',
          collectionName: 'Mythic Muses Collection',
          nftTitle: 'Your Selected NFT',
          walletAddress: '0x...',
          estimatedDelivery: '24-48 hours'
        });
        setLoading(false);
      }, 1000);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 mx-auto mb-6 bg-green-900 rounded-full flex items-center justify-center">
            <div className="text-4xl">✅</div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-white mb-4">Payment Successful!</h1>
          <p className="text-gray-300 text-lg mb-8">
            Thank you for your purchase. Your NFT order has been confirmed and is being processed.
          </p>

          {/* Order Details */}
          {orderDetails && (
            <div className="bg-gray-700 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-xl font-semibold text-white mb-4">Order Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Order ID:</span>
                  <span className="text-white font-mono">{orderDetails.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Collection:</span>
                  <span className="text-white">{orderDetails.collectionName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">NFT Title:</span>
                  <span className="text-white">{orderDetails.nftTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white">${orderDetails.amount} {orderDetails.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400 font-medium">{orderDetails.status.toUpperCase()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-900 bg-opacity-20 border border-blue-500 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-300 mb-3">What Happens Next?</h3>
            <div className="text-left space-y-2 text-sm text-blue-200">
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">1.</span>
                <span>Your payment has been received and confirmed</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">2.</span>
                <span>Our team will manually transfer the NFT to your wallet</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">3.</span>
                <span>You'll receive the NFT within 24-48 hours</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">4.</span>
                <span>Check your wallet on Arbitrum network</span>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-900 bg-opacity-20 border border-yellow-500 rounded-lg p-4 mb-8">
            <div className="flex items-start space-x-3">
              <div className="text-yellow-400 text-lg">⚠️</div>
              <div className="text-sm text-yellow-200 text-left">
                <p className="font-medium mb-1">Important:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Ensure you're connected to Arbitrum Mainnet</li>
                  <li>Keep your wallet private keys secure</li>
                  <li>Contact support if you don't receive your NFT within 48 hours</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="flex-1"
            >
              Return to Marketplace
            </Button>
            <Button
              onClick={() => window.open('https://discord.gg/Dtqwr2SPar', '_blank')}
              className="flex-1"
            >
              Join Discord Community
            </Button>
          </div>

          {/* Support Info */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              Need help? Contact us at{' '}
              <a href="mailto:support@mythicmuses.com" className="text-blue-400 hover:underline">
                support@mythicmuses.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center p-4"><div className="text-white">Loading...</div></div>}>
      <Content />
    </Suspense>
  );
}
