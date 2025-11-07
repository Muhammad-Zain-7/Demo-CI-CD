"use client";

import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import React from "react";

export default function AdminStatsPage() {
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
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      // Silent error handling for production
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading statistics...</p>
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
            <h1 className="text-3xl font-bold text-white">Analytics</h1>
            <p className="text-gray-400 mt-2">
              Marketplace performance and statistics
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

        {stats && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {stats.totalOrders}
                  </div>
                  <div className="text-gray-400">Total Orders</div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    ${stats.totalRevenue.toFixed(2)}
                  </div>
                  <div className="text-gray-400">Total Revenue</div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {stats.pendingOrders}
                  </div>
                  <div className="text-gray-400">Pending Orders</div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {stats.completedOrders}
                  </div>
                  <div className="text-gray-400">Completed Orders</div>
                </div>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Recent Orders
              </h3>
              <div className="space-y-3">
                {stats.recentOrders.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">
                    No recent orders
                  </p>
                ) : (
                  stats.recentOrders.map((order: any) => (
                    <div
                      key={order.id}
                      className="flex justify-between items-center p-3 bg-gray-800 rounded-lg"
                    >
                      <div>
                        <p className="text-white font-medium">
                          {order.nftTitle}
                        </p>
                        <p className="text-sm text-gray-400">
                          {order.customerName} • {order.customerEmail}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">
                          {order.paymentMethod === "crypto"
                            ? `${order.priceCrypto} ${order.currency}`
                            : `$${order.amount?.toFixed(2)}`}
                        </p>
                        <p
                          className={`text-sm ${
                            order.status === "completed"
                              ? "text-green-400"
                              : "text-yellow-400"
                          }`}
                        >
                          {order.status.replace("_", " ").toUpperCase()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </>
        )}

        {!stats && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-xl mb-4">No data available</div>
            <p className="text-gray-500">
              Statistics will appear here once orders are placed
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
