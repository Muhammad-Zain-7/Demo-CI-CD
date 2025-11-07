"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { NFTCollectionModal } from "../components/NFTCollectionModal";
import { CollectionCard } from "../components/ui/Card";
import { NFT_COLLECTIONS } from "../config/constants";
import { NFTCollection, NFT } from "../types";
import "../styles/mint.css";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] =
    useState<NFTCollection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState({
    network: "",
    search: "",
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchCollections(), fetchNFTs()]);
      } catch (error) {
        // Silent error handling for production
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await fetch("/api/collections");
      if (response.ok) {
        const data = await response.json();
        setCollections(data);
      } else {
        setCollections(NFT_COLLECTIONS);
      }
    } catch (error) {
      setCollections(NFT_COLLECTIONS);
    }
  };

  const fetchNFTs = async () => {
    try {
      const response = await fetch("/api/nfts?isAvailable=true");
      if (response.ok) {
        const data = await response.json();
        setNfts(data);
      }
    } catch (error) {
      // Silent error handling for production
    }
  };

  const handleCollectionClick = (collection: NFTCollection) => {
    // Navigate to collection details page
    const collectionId = collection._id || collection.id;
    window.location.href = `/collections/${collectionId}`;
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCollection(null);
  };

  const getNFTsForCollection = (collectionId: string) => {
    return nfts.filter((nft) => {
      if (typeof nft.collectionId === "object" && nft.collectionId !== null) {
        return nft.collectionId._id === collectionId;
      }
      return nft.collectionId === collectionId;
    });
  };

  // Filter collections based on current filters
  const filteredCollections = collections.filter((collection) => {
    // Network filter
    if (filter.network && collection.network !== filter.network) return false;

    // Search filter
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      if (
        !collection.name.toLowerCase().includes(searchTerm) &&
        !collection.description.toLowerCase().includes(searchTerm)
      )
        return false;
    }

    return true;
  });

  return (
    <>
      {/* Background Image */}
      <div className="bg-container">
        <div className="bg-image" />
      </div>

      {/* Header */}
      <header className="header-container">
        <div className="header-content">
          <a href="/" className="logo-container">
            <div className="logo" />
            <div className="logo-text">
              <h1>Mythic Muses</h1>
              <p>NFT Marketplace</p>
            </div>
          </a>
          <div className="social-links">
            <a
              href="https://x.com/mythic_musesart"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <div className="Twitter" />
            </a>
            <a
              href="https://discord.gg/Dtqwr2SPar"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <div className="Discord" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="collections-page-main">
        <div className="collections-page-container">
          {/* Page Header */}
          <div className="collections-page-header">
            <div className="page-title-section">
              <h1 className="page-title">All Collections</h1>
              <p className="page-description">
                Explore our curated collections of unique digital artworks
              </p>
            </div>
            <div className="page-stats">
              <div className="stat-item">
                <div className="stat-number">{filteredCollections.length}</div>
                <div className="stat-label">Collections</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{nfts.length}</div>
                <div className="stat-label">Total NFTs</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="collections-filters">
            <div className="filter-row">
              <div className="filter-group">
                <label htmlFor="search">Search Collections</label>
                <input
                  id="search"
                  type="text"
                  placeholder="Search collections..."
                  value={filter.search}
                  onChange={(e) =>
                    setFilter({ ...filter, search: e.target.value })
                  }
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label htmlFor="network">Network</label>
                <select
                  id="network"
                  value={filter.network}
                  onChange={(e) =>
                    setFilter({ ...filter, network: e.target.value })
                  }
                  className="filter-select"
                >
                  <option value="">All Networks</option>
                  <option value="ethereum">Ethereum</option>
                  <option value="polygon">Polygon</option>
                  <option value="arbitrum">Arbitrum</option>
                </select>
              </div>
            </div>
          </div>

          {/* Collections Grid */}
          <div className="collections-grid-section">
            {loading ? (
              <div className="loading-container">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
                <p className="text-gray-400 mt-4">Loading collections...</p>
              </div>
            ) : filteredCollections.length === 0 ? (
              <div className="empty-state">
                <div className="text-gray-400 text-xl mb-4">
                  No collections found
                </div>
                <p className="text-gray-500">
                  Try adjusting your filters or check back later
                </p>
              </div>
            ) : (
              <div className="collections-grid">
                {filteredCollections.map((collection) => {
                  const collectionId = collection._id || collection.id;
                  const collectionNFTs = collectionId
                    ? getNFTsForCollection(collectionId)
                    : [];
                  return (
                    <CollectionCard
                      key={collection.id || collection._id}
                      collection={{
                        id: collection.id || collection._id || "",
                        name: collection.name,
                        description: collection.description,
                        imageUrl: collection.imageUrl,
                        img: collection.img,
                        network: collection.network,
                        totalSupply: collection.totalSupply,
                      }}
                      nftCount={collectionNFTs.length}
                      onClick={() => handleCollectionClick(collection)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Copyright */}
      <div className="copyright">
        <p>&copy; 2025 Mythic Muses | All Rights Reserved</p>
      </div>

      {/* NFT Collection Modal */}
      {selectedCollection && (
        <NFTCollectionModal
          collection={selectedCollection}
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      )}
    </>
  );
}
