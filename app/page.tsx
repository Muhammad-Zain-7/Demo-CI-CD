"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { NFTCollectionModal } from "./components/NFTCollectionModal";
import { CollectionCard, Card } from "./components/ui/Card";
import { NFT_COLLECTIONS, APP_CONFIG } from "./config/constants";
import { NFTCollection, NFT } from "./types";
import "./styles/mint.css";

// Collections Grid component
const CollectionsGrid = ({
  collections,
  nfts,
  onCollectionClick,
  loading,
}: {
  collections: NFTCollection[];
  nfts: NFT[];
  onCollectionClick: (collection: NFTCollection) => void;
  loading: boolean;
}) => {
  // Calculate NFT count for each collection
  const getNFTCountForCollection = (collectionId: string) => {
    return nfts.filter((nft) => {
      const nftCollectionId =
        typeof nft.collectionId === "object" && nft.collectionId !== null
          ? nft.collectionId._id
          : nft.collectionId;
      return nftCollectionId === collectionId && nft.isAvailable;
    }).length;
  };

  if (loading) {
    return (
      <div className="collections-grid-container">
        <div className="loading-container">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading collections...</p>
        </div>
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="collections-grid-container">
        <div className="empty-state">
          <div className="text-gray-400 text-xl mb-4">No collections found</div>
          <p className="text-gray-500">
            Collections will appear here once they are created
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="collections-grid-container">
      <div className="collections-grid">
        {collections.map((collection) => {
          const collectionId = collection._id || collection.id || "";
          const availableNFTCount = getNFTCountForCollection(collectionId);

          return (
            <CollectionCard
              key={collection.id || collection._id}
              collection={{
                id: collection.id || collection._id || "",
                name: collection.name,
                description: collection.description,
                img: collection.img,
                imageUrl: collection.imageUrl,
                network: collection.network,
                totalSupply: collection.totalSupply,
              }}
              nftCount={availableNFTCount}
              onClick={() => onCollectionClick(collection)}
            />
          );
        })}
      </div>

      {/* View All Collections button */}
      {collections.length > 0 && (
        <div className="view-more">
          <a href="/collections" className="view-all-collections-btn">
            View All Collections
          </a>
        </div>
      )}
    </div>
  );
};

// NFT Grid component with pagination
const NFTGrid = ({
  nfts,
  onNFTClick,
  collections,
}: {
  nfts: NFT[];
  onNFTClick: (nft: NFT, collection: NFTCollection) => void;
  collections: NFTCollection[];
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6; // Max 6 NFTs total
  const itemsPerRow = 6; // Max 6 per row

  // Limit to max 6 NFTs for display
  const displayNFTs = nfts.slice(0, 6);
  const totalPages = Math.ceil(displayNFTs.length / itemsPerRow);

  const getCurrentPageNFTs = () => {
    const startIndex = currentPage * itemsPerRow;
    return displayNFTs.slice(startIndex, startIndex + itemsPerRow);
  };

  const handleNFTClick = (nft: NFT) => {
    // Find the collection for this NFT
    let collectionId = nft.collectionId;
    if (typeof nft.collectionId === "object" && nft.collectionId !== null) {
      collectionId = nft.collectionId._id;
    }

    const collection = collections.find(
      (c) => c._id === collectionId || c.id === collectionId
    );

    if (collection) {
      onNFTClick(nft, collection);
    }
  };

  if (displayNFTs.length === 0) {
    return (
      <div className="nfts-grid">
        <div className="empty-state">
          <div className="text-gray-400 text-xl mb-4">No NFTs found</div>
          <p className="text-gray-500">
            NFTs will appear here once they are created
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="nfts-section-content">
      <div className="nfts-grid">
        {getCurrentPageNFTs().map((nft) => (
          <Card key={nft.id || nft._id} className="nft-card w-full max-w-sm">
            <div className="relative overflow-hidden">
              <div className="aspect-square w-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                {nft.img ? (
                  <img
                    src={nft.img}
                    alt={nft.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-6xl">🎨</div>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">{nft.title}</h3>
              <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                {nft.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-400">
                  Price:{" "}
                  <span className="text-green-400 font-medium">
                    {nft.priceCrypto} {nft.currency}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  Network:{" "}
                  <span className="text-blue-400 font-medium capitalize">
                    {nft.network}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    nft.isAvailable
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {nft.isAvailable ? "Available" : "Sold"}
                </span>
              </div>

              <button
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                onClick={() => handleNFTClick(nft)}
                disabled={!nft.isAvailable}
              >
                {nft.isAvailable ? "View Details & Purchase" : "Sold Out"}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="nft-pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
          >
            Previous
          </button>

          <div className="pagination-dots">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                className={`pagination-dot ${
                  index === currentPage ? "active" : ""
                }`}
                onClick={() => setCurrentPage(index)}
              />
            ))}
          </div>

          <button
            className="pagination-btn"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
            }
            disabled={currentPage === totalPages - 1}
          >
            Next
          </button>
        </div>
      )}

      {/* View All NFTs button */}
      {nfts.length > 6 && (
        <div className="view-more">
          <button
            className="view-more-btn"
            onClick={() => {
              // Navigate to NFTs page or show all NFTs
              window.location.href = "/nfts";
            }}
          >
            View All NFTs
          </button>
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const [selectedCollection, setSelectedCollection] =
    useState<NFTCollection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch both collections and NFTs in parallel
        await Promise.all([fetchCollections(), fetchAllNFTs()]);
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

  const fetchAllNFTs = async () => {
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

  const handleNFTClick = (nft: NFT, collection: NFTCollection) => {
    setSelectedCollection(collection);
    setSelectedNFT(nft);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCollection(null);
    setSelectedNFT(null);
  };

  return (
    <>
      {/* Background Image */}
      <div className="bg-container">
        <div className="bg-image" />
      </div>

      {/* Header */}
      <header className="header-container">
        <div className="header-content">
          <div className="logo-container">
            <div className="logo" />
            <div className="logo-text">
              <h1>Mythic Muses</h1>
              <p>NFT Marketplace</p>
            </div>
          </div>
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
      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="hero-title">Discover Mythical NFTs</h1>
          <p className="hero-description">
            Explore unique digital artworks inspired by ancient mythology. Each
            piece is a one-of-a-kind creation, blending traditional art with
            digital innovation.
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">{collections.length}</div>
              <div className="stat-label">Collections</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{nfts.length}</div>
              <div className="stat-label">Available NFTs</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">3</div>
              <div className="stat-label">Networks</div>
            </div>
          </div>
          <div className="hero-actions">
            <button
              className="refresh-btn"
              onClick={async () => {
                setLoading(true);
                try {
                  await Promise.all([fetchCollections(), fetchAllNFTs()]);
                } catch (error) {
                  // Silent error handling for production
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </section>

        {/* Featured Collections */}
        <section className="collections-section">
          <div className="section-header">
            <h2 className="section-title">Featured Collections</h2>
            <div className="section-info">
              <span className="collection-count">
                {collections.length} Collections
              </span>
            </div>
          </div>
          <CollectionsGrid
            collections={collections}
            nfts={nfts}
            onCollectionClick={handleCollectionClick}
            loading={loading}
          />
        </section>

        {/* Featured NFTs */}
        {nfts.length > 0 && (
          <section className="nfts-section">
            <div className="section-header">
              <h2 className="section-title">Featured NFTs</h2>
              <div className="section-info">
                <span className="nft-count">{nfts.length} Available NFTs</span>
              </div>
            </div>
            <NFTGrid
              nfts={nfts}
              onNFTClick={handleNFTClick}
              collections={collections}
            />
          </section>
        )}

        {/* Features Grid */}
        <section className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3 className="feature-title">Unique Artwork</h3>
            <p className="feature-description">
              Each NFT is a unique piece of digital art created by talented
              artists.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3 className="feature-title">Secure Ownership</h3>
            <p className="feature-description">
              All NFTs are securely stored on the blockchain.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3 className="feature-title">Easy Payment</h3>
            <p className="feature-description">
              Pay with PayPal in USD or crypto. Simple and secure payment
              processing.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌟</div>
            <h3 className="feature-title">Exclusive Community</h3>
            <p className="feature-description">
              Owners gain access to exclusive events and digital exhibitions.
            </p>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="pricing-section">
          <h2 className="section-title">How It Works</h2>
          <div className="pricing-cards">
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Individual Pricing</h3>
                <div className="price">Variable</div>
                <div className="price-usd">Real-time USD conversion</div>
              </div>
              <ul className="pricing-features">
                <li>✓ Each NFT has individual pricing</li>
                <li>✓ PayPal and crypto payments accepted</li>
                <li>✓ Real-time crypto to USD conversion</li>
                <li>✓ 24-48 hour delivery</li>
              </ul>
            </div>

            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Purchase Process</h3>
                <div className="process-steps">
                  <div className="step">1. Browse Collections</div>
                  <div className="step">2. Select NFT</div>
                  <div className="step">3. Choose Payment Method</div>
                  <div className="step">4. Complete Purchase</div>
                  <div className="step">5. Receive NFT</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className="warning-box">
          <p>
            Please ensure you are connected to the correct network and correct
            address. Acquisitions are final and cannot be reversed once
            completed. NFTs will be manually transferred within 24-48 hours.
          </p>
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
