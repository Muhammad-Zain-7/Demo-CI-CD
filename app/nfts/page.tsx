"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { NFTCollectionModal } from "../components/NFTCollectionModal";
import { Card } from "../components/ui/Card";
import { NFT, NFTCollection } from "../types";
import "../styles/mint.css";

export default function NFTsPage() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] =
    useState<NFTCollection | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const itemsPerPage = 9; // 9 NFTs per page (3 per row)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchNFTs(), fetchCollections()]);
      } catch (error) {
        // Silent error handling for production
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  const fetchCollections = async () => {
    try {
      const response = await fetch("/api/collections");
      if (response.ok) {
        const data = await response.json();
        setCollections(data);
      }
    } catch (error) {
      // Silent error handling for production
    }
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
      setSelectedCollection(collection);
      setSelectedNFT(nft);
      setIsModalOpen(true);
      // Set the modal to open directly in purchase mode
      // We'll need to pass this as a prop to the modal
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCollection(null);
    setSelectedNFT(null);
  };

  // Pagination
  const totalPages = Math.ceil(nfts.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const currentNFTs = nfts.slice(startIndex, startIndex + itemsPerPage);

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
      <main className="nfts-page-main">
        <div className="nfts-page-container">
          {/* Page Header */}
          <div className="nfts-page-header">
            <div className="page-title-section">
              <h1 className="page-title">All NFTs</h1>
              <p className="page-description">
                Discover and collect unique digital artworks from our curated
                collections
              </p>
            </div>
            <div className="page-stats">
              <div className="stat-item">
                <div className="stat-number">{nfts.length}</div>
                <div className="stat-label">Available NFTs</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{collections.length}</div>
                <div className="stat-label">Collections</div>
              </div>
            </div>
          </div>

          {/* NFTs Grid */}
          <div className="nfts-grid-section">
            {loading ? (
              <div className="loading-container">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
                <p className="text-gray-400 mt-4">Loading NFTs...</p>
              </div>
            ) : currentNFTs.length === 0 ? (
              <div className="empty-state">
                <div className="text-gray-400 text-xl mb-4">
                  {nfts.length === 0 ? "No NFTs found" : "No NFTs on this page"}
                </div>
                <p className="text-gray-500">
                  {nfts.length === 0
                    ? "Check back later for new NFTs"
                    : "Try going to a different page"}
                </p>
              </div>
            ) : (
              <div className="nfts-grid">
                {currentNFTs.map((nft) => (
                  <Card
                    key={nft.id || nft._id}
                    className="nft-card w-full max-w-sm"
                  >
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
                      <h3 className="text-xl font-bold text-white mb-2">
                        {nft.title}
                      </h3>
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
                        {nft.isAvailable
                          ? "View Details & Purchase"
                          : "Sold Out"}
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="nft-pagination">
                <button
                  className="pagination-btn"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentPage === 0}
                >
                  Previous
                </button>

                <div className="pagination-info">
                  Page {currentPage + 1} of {totalPages}
                </div>

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
          initialStep="purchase"
          preselectedNFT={selectedNFT}
        />
      )}
    </>
  );
}
