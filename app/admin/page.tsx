"use client";

import React from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export default function AdminDashboard() {
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

  const ensureAuth = () => {
    const hasCookie = document.cookie.split('; ').find((c) => c.startsWith('admin_auth='));
    if (!hasCookie) {
      const input = prompt('Enter admin password');
      if (input !== 'Hippos7939@#') {
        alert('Invalid password');
        throw new Error('Unauthorized');
      }
      document.cookie = 'admin_auth=ok; path=/; max-age=86400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">
            Manage your NFT marketplace collections and orders
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl flex items-center justify-center">
                <div className="text-3xl">🎨</div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Collections
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Manage NFT collections
              </p>
              <Button
                onClick={() => { try { ensureAuth(); window.location.href = "/admin/collections"; } catch {} }}
                className="w-full"
                style={{background: "#009cde"}}
              >
                Manage Collections
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-900 to-blue-900 rounded-2xl flex items-center justify-center">
                <div className="text-3xl">📦</div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Orders</h3>
              <p className="text-gray-400 text-sm mb-4">
                View and manage orders
              </p>
              <Button
                onClick={() => { try { ensureAuth(); window.location.href = "/admin/orders"; } catch {} }}
                className="w-full"
                variant="outline"
                style={{background: "#009cde"}}
              >
                View Orders
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-900 to-orange-900 rounded-2xl flex items-center justify-center">
                <div className="text-3xl">📊</div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Analytics
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                View marketplace statistics
              </p>
              <Button
                onClick={() => { try { ensureAuth(); window.location.href = "/admin/stats"; } catch {} }}
                className="w-full"
                variant="outline"
                style={{background: "#009cde"}}
              >
                View Analytics
              </Button>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button
                onClick={() => { try { ensureAuth(); window.location.href = "/admin/collections"; } catch {} }}
                variant="outline"
                className="w-full justify-start"
                style={{background: "#009cde"}}
              >
                ➕ Create New Collection
              </Button>
              <Button
                onClick={() => { try { ensureAuth(); window.location.href = "/admin/collections"; } catch {} }}
                variant="outline"
                className="w-full justify-start"
                style={{background: "#009cde"}}
              >
                🎨 Add NFTs to Collection
              </Button>
              <Button
                onClick={() => { try { ensureAuth(); window.location.href = "/admin/orders"; } catch {} }}
                variant="outline"
                className="w-full justify-start"
                style={{background: "#009cde"}}
              >
                📋 Process Pending Orders
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Database</span>
                <span className="text-green-400">✓ Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">PayPal API</span>
                <span className="text-green-400">✓ Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Crypto Prices</span>
                <span className="text-green-400">✓ Updated</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Wallet Connect</span>
                <span className="text-green-400">✓ Ready</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
          >
            ← Back to Marketplace
          </Button>
        </div>
      </div>
    </div>
  );
}
