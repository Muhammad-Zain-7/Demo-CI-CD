"use client";

import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { NFT, NFTCollection } from "@/app/types";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function AdminNFTsPage() {
  React.useEffect(() => {
    const hasCookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("admin_auth="));
    if (!hasCookie) {
      const input = prompt("Enter admin password");
      if (input !== "Hippos7939@#") {
        alert("Invalid password");
        window.location.href = "/";
      } else {
        document.cookie = "admin_auth=ok; path=/; max-age=86400";
      }
    }
  }, []);
  const params = useParams();
  const collectionId = params.id as string;

  const [collection, setCollection] = useState<NFTCollection | null>(null);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNFT, setEditingNFT] = useState<NFT | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    priceCrypto: 0,
    currency: "ETH",
    network: "ethereum",
    isAvailable: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (collectionId) {
      fetchCollection();
      fetchNFTs();
    }
  }, [collectionId]);

  const fetchCollection = async () => {
    try {
      const response = await fetch(`/api/collections/${collectionId}`);
      if (response.ok) {
        const data = await response.json();
        setCollection(data);
        setFormData((prev) => ({ ...prev, network: data.network }));
      }
    } catch (error) {
      // Silent error handling for production
    }
  };

  const fetchNFTs = async () => {
    try {
      const response = await fetch(`/api/nfts?collectionId=${collectionId}`);
      if (response.ok) {
        const data = await response.json();
        setNfts(data);
      }
    } catch (error) {
      // Silent error handling for production
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingNFT
        ? `/api/nfts/${(editingNFT as any)._id || (editingNFT as any).id}`
        : "/api/nfts";
      const method = editingNFT ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          collectionId: collectionId,
        }),
      });

      if (response.ok) {
        setErrors({});
        await fetchNFTs();
        setShowCreateForm(false);
        setEditingNFT(null);
        resetForm();
      } else {
        let errorText = "Failed to save NFT";
        let fieldErrors: Record<string, string> = {};
        try {
          const err = await response.json();
          if (
            err?.details &&
            Array.isArray(err.details) &&
            err.details.length
          ) {
            errorText = err.details.join("\n");
            err.details.forEach((msg: string) => {
              const m = msg.toLowerCase();
              if (m.includes("title")) fieldErrors.title = msg;
              if (m.includes("description")) fieldErrors.description = msg;
              if (m.includes("image")) fieldErrors.imageUrl = msg;
              if (m.includes("price") || m.includes("pricecrypto"))
                fieldErrors.priceCrypto = msg;
              if (m.includes("currency")) fieldErrors.currency = msg;
              if (m.includes("network")) fieldErrors.network = msg;
              if (m.includes("available")) fieldErrors.isAvailable = msg;
            });
          } else if (err?.error) {
            errorText = err.error;
          }
        } catch {}
        setErrors(fieldErrors);
        if (!Object.keys(fieldErrors).length)
          alert(`Could not save NFT.\n${errorText}`);
      }
    } catch (error) {
      alert("Unexpected error while saving NFT. Please try again.");
    }
  };

  const handleEdit = (nft: any) => {
    setEditingNFT(nft);
    setFormData({
      title: nft.title || "",
      description: nft.description || "",
      imageUrl: nft.img || "",
      priceCrypto: nft.priceCrypto || 0,
      currency: nft.currency || "ETH",
      network: nft.network || "ethereum",
      isAvailable: nft.isAvailable !== undefined ? nft.isAvailable : true,
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this NFT?")) return;

    try {
      const response = await fetch(`/api/nfts/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchNFTs();
      } else {
        alert("Failed to delete NFT");
      }
    } catch (error) {
      alert("Failed to delete NFT");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      priceCrypto: 0,
      currency: "ETH",
      network: collection?.network || "ethereum",
      isAvailable: true,
    });
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingNFT(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading NFTs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
              {collection?.name} - NFTs
            </h1>
            <p className="text-gray-400 mt-2 text-sm sm:text-base line-clamp-2">
              {collection?.description}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/admin/collections")}
              className="w-full sm:w-auto"
            >
              <span className="truncate">Back to Collections</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(true)}
              className="w-full sm:w-auto"
            >
              <span className="truncate">Create NFT</span>
            </Button>
          </div>
        </div>

        {showCreateForm && (
          <Card className="mb-8 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingNFT ? "Edit NFT" : "Create New NFT"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    NFT Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className={`w-full px-4 py-3 bg-gray-800 border ${
                      errors.title ? "border-red-500" : "border-gray-600"
                    } rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                    placeholder="Enter NFT title"
                  />
                  {errors.title && (
                    <div className="text-xs text-red-400 mt-1">
                      {errors.title}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Currency *
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    required
                    className={`w-full px-4 py-3 bg-gray-800 border ${
                      errors.currency ? "border-red-500" : "border-gray-600"
                    } rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                  >
                    {errors.currency && (
                      <div className="text-xs text-red-400 mt-1">
                        {errors.currency}
                      </div>
                    )}
                    <option value="ETH">ETH</option>
                    <option value="MATIC">MATIC</option>
                    <option value="USDC">USDC</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter NFT description"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Image
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, imageUrl: e.target.value })
                      }
                      className={`w-full px-4 py-3 bg-gray-800 border ${
                        errors.imageUrl ? "border-red-500" : "border-gray-600"
                      } rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                      placeholder="/uploads/image.jpg or https://..."
                    />
                    {errors.imageUrl && (
                      <div className="text-xs text-red-400 mt-1">
                        {errors.imageUrl}
                      </div>
                    )}
                    <label className="inline-flex items-center justify-center w-full px-4 py-3 bg-gray-700 text-white rounded-lg cursor-pointer hover:bg-gray-600 transition-colors border border-gray-600 hover:border-gray-500">
                      <span className="text-sm font-medium truncate">
                        {uploadingImage ? "Uploading..." : "Upload Image"}
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingImage(true);
                          try {
                            const fd = new FormData();
                            fd.append("file", file);
                            const res = await fetch("/api/upload", {
                              method: "POST",
                              body: fd,
                            });
                            const data = await res.json();
                            if (!res.ok)
                              throw new Error(data?.error || "Upload failed");

                            setFormData((prev) => ({
                              ...prev,
                              imageUrl: data.path,
                            }));
                          } catch (err) {
                            alert((err as any).message || "Upload failed");
                          } finally {
                            setUploadingImage(false);
                          }
                        }}
                      />
                    </label>
                  </div>
                  {uploadingImage && (
                    <div className="text-xs text-gray-400 mt-1">
                      Uploading...
                    </div>
                  )}
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="h-24 w-24 object-cover rounded"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price (Crypto) *
                  </label>
                  <input
                    type="number"
                    value={formData.priceCrypto}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priceCrypto: parseFloat(e.target.value) || 0,
                      })
                    }
                    step="0.001"
                    min="0"
                    required
                    className={`w-full px-4 py-3 bg-gray-800 border ${
                      errors.priceCrypto ? "border-red-500" : "border-gray-600"
                    } rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                    placeholder="0.01"
                  />
                  {errors.priceCrypto && (
                    <div className="text-xs text-red-400 mt-1">
                      {errors.priceCrypto}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isAvailable: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-300">Available for purchase</span>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button type="submit" className="w-full sm:w-auto">
                  <span className="truncate">
                    {editingNFT ? "Update NFT" : "Create NFT"}
                  </span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="w-full sm:w-auto"
                >
                  <span className="truncate">Cancel</span>
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {nfts.map((nft: any) => (
            <Card
              key={
                (nft as any)._id ||
                (nft as any).id ||
                `nft-${nft.title}-${nft.priceCrypto}`
              }
              className="p-6"
            >
              <div className="text-center mb-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl flex items-center justify-center">
                  {nft.img ? (
                    <img
                      src={nft.img}
                      alt={nft.title}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="text-2xl sm:text-4xl">🎨</div>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 truncate">
                  {nft.title}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm mb-4 line-clamp-2">
                  {nft.description}
                </p>
              </div>

              <div className="space-y-2 mb-4 sm:mb-6">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-400 truncate">Price:</span>
                  <span className="text-yellow-400 font-medium truncate ml-2">
                    {nft.priceCrypto} {nft.currency}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-400 truncate">Network:</span>
                  <span className="text-blue-400 capitalize truncate ml-2">
                    {nft.network}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-400 truncate">Status:</span>
                  <span
                    className={`truncate ml-2 ${
                      nft.isAvailable ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {nft.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(nft)}
                  className="flex-1 w-full sm:w-auto"
                >
                  <span className="truncate text-xs sm:text-sm">Edit</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleDelete((nft as any)._id || (nft as any).id)
                  }
                  className="flex-1 w-full sm:w-auto text-red-400 hover:text-red-300 hover:border-red-300"
                >
                  <span className="truncate text-xs sm:text-sm">Delete</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {nfts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-xl mb-4">No NFTs found</div>
            <p className="text-gray-500">
              Create your first NFT for this collection
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
