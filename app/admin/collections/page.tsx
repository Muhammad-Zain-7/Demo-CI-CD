"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { NFTCollection } from "../../types";

export default function AdminCollectionsPage() {
  // simple gate: if cookie not set, prompt for password
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
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCollection, setEditingCollection] =
    useState<NFTCollection | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    network: "ethereum",
    totalSupply: 0,
    isActive: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await fetch("/api/collections");
      if (response.ok) {
        const data = await response.json();
        setCollections(data);
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
      const url = editingCollection
        ? `/api/collections/${
            // Prefer MongoDB _id when available, fallback to id
            (editingCollection as any)._id || (editingCollection as any).id
          }`
        : "/api/collections";
      const method = editingCollection ? "PUT" : "POST";


      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setErrors({});
        await fetchCollections();
        setShowCreateForm(false);
        setEditingCollection(null);
        resetForm();
      } else {
        let errorText = "Failed to save collection";
        let fieldErrors: Record<string, string> = {};
        try {
          const err = await response.json();
          if (err?.details && Array.isArray(err.details) && err.details.length) {
            errorText = err.details.join("\n");
            err.details.forEach((msg: string) => {
              const m = msg.toLowerCase();
              if (m.includes('name')) fieldErrors.name = msg;
              if (m.includes('description')) fieldErrors.description = msg;
              if (m.includes('image')) fieldErrors.imageUrl = msg;
              if (m.includes('network')) fieldErrors.network = msg;
              if (m.includes('total supply') || m.includes('total_supply') || m.includes('supply')) fieldErrors.totalSupply = msg;
              if (m.includes('active')) fieldErrors.isActive = msg;
            });
          } else if (err?.error) {
            errorText = err.error;
          }
        } catch {}
        setErrors(fieldErrors);
        if (!Object.keys(fieldErrors).length) alert(`Could not save collection.\n${errorText}`);
      }
    } catch (error) {
      alert("Unexpected error while saving collection. Please try again.");
    }
  };

  const handleEdit = (collection: any) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name || "",
      description: collection.description || "",
      imageUrl: collection.imageUrl || "",
      network: collection.network || "ethereum",
      totalSupply: collection.totalSupply || 0,
      isActive: collection.isActive !== undefined ? collection.isActive : true,
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this collection?")) return;

    try {
      const response = await fetch(`/api/collections/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchCollections();
      } else {
        alert("Failed to delete collection");
      }
    } catch (error) {
      alert("Failed to delete collection");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      imageUrl: "",
      network: "ethereum",
      totalSupply: 0,
      isActive: true,
    });
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingCollection(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading collections...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">NFT Collections</h1>
          <Button onClick={() => setShowCreateForm(true)}>
            Create Collection
          </Button>
        </div>

        {showCreateForm && (
          <Card className="mb-8 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingCollection ? "Edit Collection" : "Create New Collection"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Collection Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className={`w-full px-4 py-3 bg-gray-800 border ${errors.name ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                    placeholder="Enter collection name"
                  />
                  {errors.name && <div className="text-xs text-red-400 mt-1">{errors.name}</div>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Network *
                  </label>
                  <select
                    value={formData.network}
                    onChange={(e) =>
                      setFormData({ ...formData, network: e.target.value })
                    }
                    required
                    className={`w-full px-4 py-3 bg-gray-800 border ${errors.network ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                  >
                  {errors.network && <div className="text-xs text-red-400 mt-1">{errors.network}</div>}
                    <option value="ethereum">Ethereum</option>
                    <option value="arbitrum">Arbitrum</option>
                    <option value="polygon">Polygon</option>
                    <option value="base">Base</option>
                    <option value="optimism">Optimism</option>
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
                  placeholder="Enter collection description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Image
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className={`flex-1 px-4 py-3 bg-gray-800 border ${errors.imageUrl ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                      placeholder="/uploads/image.jpg or https://..."
                    />
                    {errors.imageUrl && <div className="text-xs text-red-400 mt-1">{errors.imageUrl}</div>}
                    <label className="inline-flex items-center px-3 py-2 bg-gray-700 text-white rounded cursor-pointer hover:bg-gray-600">
                      <span>Upload</span>
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
                            fd.append('file', file);
                            const res = await fetch('/api/upload', { method: 'POST', body: fd });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data?.error || 'Upload failed');
                            
                            setFormData((prev) => ({ ...prev, imageUrl: data.path }));
                          } catch (err) {
                            alert((err as any).message || 'Upload failed');
                          } finally {
                            setUploadingImage(false);
                          }
                        }}
                      />
                    </label>
                  </div>
                  {uploadingImage && <div className="text-xs text-gray-400 mt-1">Uploading...</div>}
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <img src={formData.imageUrl} alt="Preview" className="h-24 w-24 object-cover rounded" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Total Supply
                  </label>
                  <input
                    type="number"
                    value={formData.totalSupply}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalSupply: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    className={`w-full px-4 py-3 bg-gray-800 border ${errors.totalSupply ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                  />
                  {errors.totalSupply && <div className="text-xs text-red-400 mt-1">{errors.totalSupply}</div>}
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-300">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button type="submit">
                  {editingCollection
                    ? "Update Collection"
                    : "Create Collection"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection: any) => (
            <Card key={collection._id || collection.id} className="p-6">
              <div className="text-center mb-4">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl flex items-center justify-center">
                  <div className="text-4xl">🎨</div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {collection.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {collection.description}
                </p>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Network:</span>
                  <span className="text-blue-400 capitalize">
                    {collection.network}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Supply:</span>
                  <span className="text-green-400">
                    {collection.totalSupply}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={
                      collection.isActive ? "text-green-400" : "text-red-400"
                    }
                  >
                    {collection.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(collection)}
                  className="flex-1"
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    (window.location.href = `/admin/collections/${(collection as any)._id || (collection as any).id}/nfts`)
                  }
                  className="flex-1"
                >
                  Manage NFTs
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete((collection as any)._id || (collection as any).id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {collections.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-xl mb-4">
              No collections found
            </div>
            <p className="text-gray-500">
              Create your first collection to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
