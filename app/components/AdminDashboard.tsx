"use client";

import React, { useState, useEffect } from "react";
import { Order, NFTCollection, NFT } from "../types";

interface AdminStats {
  totalOrders: number;
  ordersByStatus: { status: string; count: number }[];
  totalRevenue: number;
  recentOrders: Order[];
}

interface AdminDashboardProps {
  isAuthenticated: boolean;
  onLogout?: () => void;
}

export function AdminDashboard({
  isAuthenticated,
  onLogout,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "collections" | "nfts">(
    "orders"
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedCollection, setSelectedCollection] =
    useState<NFTCollection | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showNFTModal, setShowNFTModal] = useState(false);

  // Collection form state
  const [collectionForm, setCollectionForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    network: "ethereum" as string,
    totalSupply: 0,
    isActive: true,
  });

  // NFT form state
  const [nftForm, setNftForm] = useState({
    collectionId: "",
    title: "",
    description: "",
    imageUrl: "",
    priceCrypto: 0,
    currency: "ETH" as "ETH" | "MATIC" | "USDC" | "USDT",
    network: "ethereum" as string,
    isAvailable: true,
    tokenId: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchCollections();
      fetchNFTs();
      fetchStats();
    }
  }, [isAuthenticated]);

  // Populate form when editing a collection
  useEffect(() => {
    if (selectedCollection) {
      setCollectionForm({
        name: selectedCollection.name || "",
        description: selectedCollection.description || "",
        imageUrl: selectedCollection.imageUrl || "",
        network: (selectedCollection.network || "ethereum") as string,
        totalSupply: selectedCollection.totalSupply || 0,
        isActive:
          selectedCollection.isActive !== undefined
            ? selectedCollection.isActive
            : true,
      });
    }
  }, [selectedCollection]);

  // Populate form when editing an NFT
  useEffect(() => {
    if (selectedNFT) {
      setNftForm({
        collectionId:
          typeof selectedNFT.collectionId === "string"
            ? selectedNFT.collectionId
            : (selectedNFT.collectionId as any)?._id || "",
        title: selectedNFT.title || "",
        description: selectedNFT.description || "",
        imageUrl: selectednft.img || "",
        priceCrypto: selectedNFT.priceCrypto || 0,
        currency: selectedNFT.currency || "ETH",
        network: (selectedNFT.network || "ethereum") as string,
        isAvailable:
          selectedNFT.isAvailable !== undefined
            ? selectedNFT.isAvailable
            : true,
        tokenId: selectedNFT.tokenId || "",
      });
    }
  }, [selectedNFT]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await fetch("/api/collections");
      if (response.ok) {
        const data = await response.json();
        setCollections(data);
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNFTs = async () => {
    try {
      const response = await fetch("/api/nfts");
      if (response.ok) {
        const data = await response.json();
        setNfts(data);
      }
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });

      if (response.ok) {
        fetchOrders();
        fetchStats();
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const createCollection = async () => {
    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(collectionForm),
      });

      if (response.ok) {
        setShowCollectionModal(false);
        setCollectionForm({
          name: "",
          description: "",
          imageUrl: "",
          network: "ethereum",
          totalSupply: 0,
          isActive: true,
        });
        fetchCollections();
      }
    } catch (error) {
      console.error("Error creating collection:", error);
    }
  };

  const updateCollection = async (
    collectionId: string,
    updates: Partial<NFTCollection>
  ) => {
    try {
      const response = await fetch("/api/collections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: collectionId, ...updates }),
      });

      if (response.ok) {
        fetchCollections();
      }
    } catch (error) {
      console.error("Error updating collection:", error);
    }
  };

  const deleteCollection = async (collectionId: string) => {
    if (confirm("Are you sure you want to delete this collection?")) {
      try {
        const response = await fetch("/api/collections", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: collectionId }),
        });

        if (response.ok) {
          fetchCollections();
        }
      } catch (error) {
        console.error("Error deleting collection:", error);
      }
    }
  };

  const createNFT = async () => {
    try {
      const response = await fetch("/api/nfts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nftForm),
      });

      if (response.ok) {
        setShowNFTModal(false);
        setNftForm({
          collectionId: "",
          title: "",
          description: "",
          imageUrl: "",
          priceCrypto: 0,
          currency: "ETH",
          network: "ethereum",
          isAvailable: true,
          tokenId: "",
        });
        fetchNFTs();
      }
    } catch (error) {
      console.error("Error creating NFT:", error);
    }
  };

  const updateNFT = async (nftId: string, updates: Partial<NFT>) => {
    try {
      const response = await fetch("/api/nfts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: nftId, ...updates }),
      });

      if (response.ok) {
        fetchNFTs();
      }
    } catch (error) {
      console.error("Error updating NFT:", error);
    }
  };

  const deleteNFT = async (nftId: string) => {
    if (confirm("Are you sure you want to delete this NFT?")) {
      try {
        const response = await fetch("/api/nfts", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: nftId }),
        });

        if (response.ok) {
          fetchNFTs();
        }
      } catch (error) {
        console.error("Error deleting NFT:", error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      nft_sent: "bg-indigo-100 text-indigo-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (!isAuthenticated) {
    return <div>Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-800">Manage orders and collections</p>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900">
                Total Orders
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {stats?.totalOrders || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900">
                Total Revenue
              </h3>
              <p className="text-3xl font-bold text-green-600">
                ${stats?.totalRevenue?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900">Collections</h3>
              <p className="text-3xl font-bold text-purple-600">
                {collections.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900">
                Active Collections
              </h3>
              <p className="text-3xl font-bold text-indigo-600">
                {collections.filter((c) => c.isActive).length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("orders")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "orders"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab("collections")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "collections"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
              }`}
            >
              Collections
            </button>
            <button
              onClick={() => setActiveTab("nfts")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "nfts"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
              }`}
            >
              NFTs
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "orders" ? (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      NFT Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">
                            {order.customerName}
                          </div>
                          <div className="text-gray-600">
                            {order.customerEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.nftTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          value={order.status}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            updateOrderStatus(order.orderId, e.target.value)
                          }
                          className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-900"
                        >
                          <option key="pending" value="pending">
                            Pending
                          </option>
                          <option key="paid" value="paid">
                            Paid
                          </option>
                          <option key="processing" value="processing">
                            Processing
                          </option>
                          <option key="nft_sent" value="nft_sent">
                            NFT Sent
                          </option>
                          <option key="completed" value="completed">
                            Completed
                          </option>
                          <option key="cancelled" value="cancelled">
                            Cancelled
                          </option>
                          <option key="refunded" value="refunded">
                            Refunded
                          </option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === "collections" ? (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Collections
              </h2>
              <button
                onClick={() => setShowCollectionModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Collection
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Network
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Supply
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {collections.map((collection) => (
                    <tr
                      key={collection._id || collection.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={collection.imageUrl}
                          alt={collection.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">
                            {collection.name}
                          </div>
                          <div className="text-gray-600 text-sm">
                            {collection.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="capitalize">{collection.network}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {collection.totalSupply}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            collection.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {collection.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedCollection(collection);
                            setShowCollectionModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            deleteCollection(
                              collection._id || collection.id || ""
                            )
                          }
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">NFTs</h2>
              <button
                onClick={() => setShowNFTModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add NFT
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Collection
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Network
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {nfts.map((nft) => (
                    <tr key={nft._id || nft.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={nft.img || "/placeholder-nft.png"}
                          alt={nft.title}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">
                            {nft.title}
                          </div>
                          <div className="text-gray-600 text-sm">
                            {nft.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {typeof nft.collectionId === "object" &&
                        nft.collectionId
                          ? (nft.collectionId as any).name
                          : "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {nft.priceCrypto} {nft.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="capitalize">{nft.network}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            nft.isAvailable
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {nft.isAvailable ? "Available" : "Sold"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedNFT(nft);
                            setShowNFTModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteNFT(nft._id || nft.id || "")}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Collection Modal */}
      {showCollectionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedCollection ? "Edit Collection" : "Add New Collection"}
              </h3>
              <form
                onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  if (selectedCollection) {
                    updateCollection(
                      selectedCollection._id || selectedCollection.id || "",
                      collectionForm
                    );
                    setShowCollectionModal(false);
                    setSelectedCollection(null);
                    setCollectionForm({
                      name: "",
                      description: "",
                      imageUrl: "",
                      network: "ethereum",
                      totalSupply: 0,
                      isActive: true,
                    });
                  } else {
                    createCollection();
                  }
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800">
                      Collection Name
                    </label>
                    <input
                      type="text"
                      value={collectionForm.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCollectionForm({
                          ...collectionForm,
                          name: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800">
                      Description
                    </label>
                    <textarea
                      value={collectionForm.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setCollectionForm({
                          ...collectionForm,
                          description: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={collectionForm.imageUrl}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCollectionForm({
                          ...collectionForm,
                          imageUrl: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800">
                      Network
                    </label>
                    <select
                      value={collectionForm.network}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setCollectionForm({
                          ...collectionForm,
                          network: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      required
                    >
                      <option key="ethereum" value="ethereum">
                        Ethereum
                      </option>
                      <option key="arbitrum" value="arbitrum">
                        Arbitrum
                      </option>
                      <option key="polygon" value="polygon">
                        Polygon
                      </option>
                      <option key="base" value="base">
                        Base
                      </option>
                      <option key="optimism" value="optimism">
                        Optimism
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800">
                      Total Supply
                    </label>
                    <input
                      type="number"
                      value={collectionForm.totalSupply}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value;
                        const numValue = value === "" ? 0 : parseInt(value);
                        if (!isNaN(numValue)) {
                          setCollectionForm({
                            ...collectionForm,
                            totalSupply: numValue,
                          });
                        }
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      required
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={collectionForm.isActive}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCollectionForm({
                          ...collectionForm,
                          isActive: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCollectionModal(false);
                      setSelectedCollection(null);
                      setCollectionForm({
                        name: "",
                        description: "",
                        imageUrl: "",
                        network: "ethereum",
                        totalSupply: 0,
                        isActive: true,
                      });
                    }}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {selectedCollection ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* NFT Modal */}
      {showNFTModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedNFT ? "Edit NFT" : "Add New NFT"}
              </h3>
              <form
                onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  if (selectedNFT) {
                    updateNFT(selectedNFT._id || selectedNFT.id || "", nftForm);
                    setShowNFTModal(false);
                    setSelectedNFT(null);
                    setNftForm({
                      collectionId: "",
                      title: "",
                      description: "",
                      imageUrl: "",
                      priceCrypto: 0,
                      currency: "ETH",
                      network: "ethereum",
                      isAvailable: true,
                      tokenId: "",
                    });
                  } else {
                    createNFT();
                  }
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800">
                      Collection
                    </label>
                    <select
                      value={nftForm.collectionId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setNftForm({ ...nftForm, collectionId: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      required
                    >
                      <option value="">Select Collection</option>
                      {collections.map((collection) => (
                        <option
                          key={collection._id || collection.id}
                          value={collection._id || collection.id}
                        >
                          {collection.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800">
                      NFT Title
                    </label>
                    <input
                      type="text"
                      value={nftForm.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNftForm({ ...nftForm, title: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800">
                      Description
                    </label>
                    <textarea
                      value={nftForm.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setNftForm({ ...nftForm, description: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={nftForm.imageUrl}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNftForm({ ...nftForm, imageUrl: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800">
                      Price (Crypto)
                    </label>
                    <input
                      type="number"
                      value={nftForm.priceCrypto}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value;
                        const numValue = value === "" ? 0 : parseFloat(value);
                        if (!isNaN(numValue)) {
                          setNftForm({ ...nftForm, priceCrypto: numValue });
                        }
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      step="0.0001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800">
                      Currency
                    </label>
                    <select
                      value={nftForm.currency}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setNftForm({
                          ...nftForm,
                          currency: e.target.value as
                            | "ETH"
                            | "MATIC"
                            | "USDC"
                            | "USDT",
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      required
                    >
                      <option key="ETH" value="ETH">
                        ETH
                      </option>
                      <option key="MATIC" value="MATIC">
                        MATIC
                      </option>
                      <option key="USDC" value="USDC">
                        USDC
                      </option>
                      <option key="USDT" value="USDT">
                        USDT
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800">
                      Network
                    </label>
                    <select
                      value={nftForm.network}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setNftForm({ ...nftForm, network: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                      required
                    >
                      <option key="ethereum" value="ethereum">
                        Ethereum
                      </option>
                      <option key="arbitrum" value="arbitrum">
                        Arbitrum
                      </option>
                      <option key="polygon" value="polygon">
                        Polygon
                      </option>
                      <option key="base" value="base">
                        Base
                      </option>
                      <option key="optimism" value="optimism">
                        Optimism
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800">
                      Token ID
                    </label>
                    <input
                      type="text"
                      value={nftForm.tokenId}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNftForm({ ...nftForm, tokenId: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={nftForm.isAvailable}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNftForm({
                          ...nftForm,
                          isAvailable: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Available
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNFTModal(false);
                      setSelectedNFT(null);
                      setNftForm({
                        collectionId: "",
                        title: "",
                        description: "",
                        imageUrl: "",
                        priceCrypto: 0,
                        currency: "ETH",
                        network: "ethereum",
                        isAvailable: true,
                        tokenId: "",
                      });
                    }}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {selectedNFT ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
