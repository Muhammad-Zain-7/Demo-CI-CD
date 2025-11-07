"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '../../components/ui/Button';

function Content() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl text-center">
          {/* Cancelled Icon */}
          <div className="w-24 h-24 mx-auto mb-6 bg-red-900 rounded-full flex items-center justify-center">
            <div className="text-4xl">❌</div>
          </div>

          {/* Cancelled Message */}
          <h1 className="text-3xl font-bold text-white mb-4">Payment Cancelled</h1>
          <p className="text-gray-300 text-lg mb-8">
            Your payment was cancelled. No charges have been made to your account.
          </p>

          {/* Order Info */}
          {orderId && (
            <div className="bg-gray-700 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-white mb-3">Order Information</h2>
              <p className="text-gray-400 mb-2">
                Order ID: <span className="text-white font-mono">{orderId}</span>
              </p>
              <p className="text-gray-400 text-sm">
                This order has been cancelled and can be recreated if you wish to try again.
              </p>
            </div>
          )}

          {/* What Happened */}
          <div className="bg-blue-900 bg-opacity-20 border border-blue-500 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-300 mb-3">What Happened?</h3>
            <div className="text-left space-y-2 text-sm text-blue-200">
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">•</span>
                <span>You cancelled the payment process</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">•</span>
                <span>No money was transferred</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">•</span>
                <span>Your order was not completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">•</span>
                <span>You can try again anytime</span>
              </div>
            </div>
          </div>

          {/* Try Again Info */}
          <div className="bg-yellow-900 bg-opacity-20 border border-yellow-500 rounded-lg p-4 mb-8">
            <div className="flex items-start space-x-3">
              <div className="text-yellow-400 text-lg">💡</div>
              <div className="text-sm text-yellow-200 text-left">
                <p className="font-medium mb-1">Want to try again?</p>
                <p>Return to the marketplace and select your preferred NFT collection. The payment process is secure and only takes a few minutes.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => window.location.href = '/'}
              className="flex-1"
            >
              Return to Marketplace
            </Button>
            <Button
              onClick={() => window.open('https://discord.gg/Dtqwr2SPar', '_blank')}
              variant="outline"
              className="flex-1"
            >
              Get Help on Discord
            </Button>
          </div>

          {/* Support Info */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              Having trouble? Contact us at{' '}
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

export default function PaymentCancelled() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center p-4"><div className="text-white">Loading...</div></div>}>
      <Content />
    </Suspense>
  );
}
