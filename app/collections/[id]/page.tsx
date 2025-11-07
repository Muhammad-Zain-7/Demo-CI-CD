"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { NFTCollectionModal } from "../../components/NFTCollectionModal";
import { Card } from "../../components/ui/Card";
import { NFT, NFTCollection } from "../../types";
import "../../styles/mint.css";

export default function CollectionDetailsPage() {
  const params = useParams();
  const collectionId = params.id as string;

  const [collection, setCollection] = useState<NFTCollection | null>(null);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load collection details
        const collectionResponse = await fetch(
          `/api/collections/${collectionId}`
        );
        if (collectionResponse.ok) {
          const collectionData = await collectionResponse.json();
          setCollection(collectionData);
        }

        // Load NFTs for this collection
        const nftsResponse = await fetch(
          `/api/nfts?collectionId=${collectionId}&isAvailable=true`
        );
        if (nftsResponse.ok) {
          const nftsData = await nftsResponse.json();
          setNfts(nftsData);
        }
      } catch (error) {
        // Silent error handling for production
      } finally {
        setLoading(false);
      }
    };

    if (collectionId) {
      loadData();
    }
  }, [collectionId]);

  const handleNFTClick = (nft: NFT) => {
    if (collection) {
      setSelectedNFT(nft);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedNFT(null);
  };

  if (loading) {
    return (
      <div className="collection-details-main">
        <div className="loading-container">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="collection-details-main">
        <div className="empty-state">
          <div className="text-gray-400 text-xl mb-4">Collection not found</div>
          <p className="text-gray-500">
            The collection you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Background Image */}
      <div className="bg-container">
        <div className="bg-image"></div>
        <div className="bg-overlay"></div>
      </div>

      <main className="collection-details-main">
        <div className="collection-details-container">
          {/* Header */}
          <div className="collection-details-header">
            <div className="collection-info">
              <div className="collection-image">
                {collection.imageUrl ? (
                  <img
                    src={collection.img}
                    alt={collection.name}
                    className="collection-main-image"
                  />
                ) : (
                  <div className="collection-placeholder">
                    <svg
                      className="w-16 h-16 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="collection-details">
                <h1 className="collection-title">{collection.name}</h1>
                <p className="collection-description">
                  {collection.description}
                </p>
                <div className="collection-stats">
                  <div className="stat-item">
                    <div className="stat-number">{nfts.length}</div>
                    <div className="stat-label">Available NFTs</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{collection.totalSupply}</div>
                    <div className="stat-label">Total Supply</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{collection.network}</div>
                    <div className="stat-label">Network</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* NFTs Grid */}
          <div className="collection-nfts-section">
            <div className="section-header">
              <h2 className="section-title">Available NFTs</h2>
              <div className="section-info">
                <span className="nft-count">{nfts.length} NFTs Available</span>
              </div>
            </div>

            {nfts.length === 0 ? (
              <div className="empty-state">
                <div className="text-gray-400 text-xl mb-4">
                  No NFTs available
                </div>
                <p className="text-gray-500">
                  This collection doesn't have any available NFTs yet.
                </p>
              </div>
            ) : (
              <div className="collection-nfts-grid">
                {nfts.map((nft) => (
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

                      <button
                        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                        onClick={() => handleNFTClick(nft)}
                      >
                        View Details & Purchase
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* NFT Collection Modal */}
      {collection && selectedNFT && (
        <NFTCollectionModal
          collection={collection}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          initialStep="purchase"
          preselectedNFT={selectedNFT}
        />
      )}
    </>
  );
}
