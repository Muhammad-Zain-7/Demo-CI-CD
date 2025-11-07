import React, { useState, useEffect } from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { NFTCollection, NFT } from "../types";
import PayPalCheckout from "./PayPalCheckout";
import toast from "react-hot-toast";
import { getCryptoPrice } from "../lib/cryptoPrices";

interface NFTCollectionModalProps {
  collection: NFTCollection;
  isOpen: boolean;
  onClose: () => void;
  initialStep?: "details" | "purchase";
  preselectedNFT?: NFT | null;
}

export const NFTCollectionModal: React.FC<NFTCollectionModalProps> = ({
  collection,
  isOpen,
  onClose,
  initialStep = "details",
  preselectedNFT = null,
}) => {
  const [step, setStep] = useState<"details" | "purchase">(initialStep);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(preselectedNFT);
  const [paymentMethod, setPaymentMethod] = useState<"paypal">("paypal");
  const [formData, setFormData] = useState({
    nftTitle: "",
    customerName: "",
    customerEmail: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [cryptoPrices, setCryptoPrices] = useState<Record<
    string,
    number
  > | null>(null);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null);

  // Reset state when modal opens with new props
  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
      setSelectedNFT(preselectedNFT);
    }
  }, [isOpen, initialStep, preselectedNFT]);

  // Fetch NFTs when modal opens
  useEffect(() => {
    if (isOpen && (collection.id || collection._id)) {
      fetchNFTs();
    }
  }, [isOpen, collection.id, collection._id]);

  // Auto-populate NFT title when NFT is selected
  useEffect(() => {
    if (selectedNFT) {
      setFormData((prev) => ({
        ...prev,
        nftTitle: selectedNFT.title || "",
      }));
    }
  }, [selectedNFT]);

  // Fetch crypto prices when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCryptoPrices();
    }
  }, [isOpen]);

  const fetchCryptoPrices = async () => {
    setLoadingPrices(true);
    try {
      const response = await fetch("/api/crypto/prices");
      if (response.ok) {
        const prices = await response.json();
        setCryptoPrices(prices);
        setLastPriceUpdate(new Date());
      } else {
        console.error("Failed to fetch crypto prices");
        setCryptoPrices(null);
      }
    } catch (error) {
      console.error("Error fetching crypto prices:", error);
      setCryptoPrices(null);
    } finally {
      setLoadingPrices(false);
    }
  };

  // Calculate USDC price (which equals PayPal USD price)
  const calculateUSDCPrice = (nft: NFT): number | null => {
    if (!cryptoPrices || !nft.priceCrypto || !nft.currency) {
      return null;
    }

    const cryptoPrice = cryptoPrices[nft.currency.toUpperCase()];
    if (!cryptoPrice) {
      return null;
    }

    // Convert NFT crypto price to USD
    const usdPrice = nft.priceCrypto * cryptoPrice;

    // USDC price equals USD price (1:1 ratio)
    return usdPrice;
  };

  const fetchNFTs = async () => {
    try {
      const collectionId = collection._id || collection.id;
      const response = await fetch(
        `/api/nfts?collectionId=${collectionId}&isAvailable=true`
      );
      if (response.ok) {
        const data = await response.json();
        setNfts(data);
      }
    } catch (error) {
      // Silent error handling for production
    }
  };

  // No fallback rates: show N/A in UI if conversion unavailable

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePurchase = (nft: NFT) => {
    setSelectedNFT(nft);
    setFormData({
      ...formData,
      nftTitle: nft.title,
    });
    setStep("purchase");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNFT) return;

    setIsLoading(true);

    try {
      const orderData = {
        collectionId: collection._id || collection.id,
        nftId: selectedNFT._id || selectedNFT.id,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        priceCrypto: selectedNFT.priceCrypto,
        currency: selectedNFT.currency,
        network: selectedNFT.network,
        exchangeRate: selectedNFT.priceCrypto,
        priceUSD:
          calculateUSDCPrice(selectedNFT) || (selectedNFT as any).priceUSD || 0,
        amount:
          calculateUSDCPrice(selectedNFT) || (selectedNFT as any).priceUSD || 0,
        paymentMethod: paymentMethod,
      };

      // Create order
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        throw new Error(
          `Failed to create order: ${orderResponse.status} - ${errorText}`
        );
      }

      const order = await orderResponse.json();

      // For PayPal, we'll handle the payment in the PayPal component
      // The order is created and ready for PayPal processing
      toast.success(
        "Order created successfully! Please complete payment with PayPal."
      );
    } catch (error: any) {
      toast.error(`Failed to create order: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayPalSuccess = (orderId: string) => {
    toast.success(
      "Payment successful! Your NFT will be delivered within 24-48 hours."
    );
    onClose();
  };

  const handlePayPalError = (error: any) => {
    console.error("PayPal payment error:", error);
    toast.error("Payment failed. Please try again or contact support.");
  };

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl flex items-center justify-center">
          <div className="text-6xl">
            <img
              src={collection.img}
              alt={collection.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">
          {collection.name}
        </h3>
        <p className="text-gray-300">{collection.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">{nfts.length}</div>
          <div className="text-sm text-gray-400">Available NFTs</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-400 capitalize">
            {collection.network}
          </div>
          <div className="text-sm text-gray-400">Network</div>
        </div>
      </div>

      <div className="bg-blue-900 bg-opacity-20 border border-blue-500 rounded-lg p-4">
        <h4 className="font-semibold text-blue-300 mb-2">🎨 Available NFTs</h4>
        <p className="text-sm text-gray-300 mb-3">
          Select an NFT from the collection below to view pricing and purchase.
        </p>

        {nfts.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-400">
              No NFTs available in this collection
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
            {nfts.map((nft) => (
              <div
                key={nft._id || nft.id || `nft-${nft.title}-${nft.priceCrypto}`}
                className="bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-600 transition-colors"
                onClick={() => handlePurchase(nft)}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={nft.img || "/placeholder-nft.png"}
                    alt={nft.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h5 className="font-medium text-white">{nft.title}</h5>
                    <p className="text-sm text-gray-300">
                      {nft.priceCrypto} {nft.currency}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-yellow-400 font-medium">
                      Click to view price
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPurchaseStep = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-3">
            NFT: {selectedNFT?.title}
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Crypto Price:</span>
              <span className="text-yellow-400 font-medium">
                {selectedNFT?.priceCrypto} {selectedNFT?.currency}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Network:</span>
              <span className="text-blue-400 font-medium capitalize">
                {selectedNFT?.network}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">USDC Price (PayPal USD):</span>
              <div className="flex items-center space-x-2">
                <span className="text-green-400 font-medium">
                  {loadingPrices
                    ? "Loading..."
                    : calculateUSDCPrice(selectedNFT!)
                    ? `$${calculateUSDCPrice(selectedNFT!)!.toFixed(2)}`
                    : (selectedNFT as any)?.priceUSD
                    ? `$${(selectedNFT as any).priceUSD.toFixed(2)}`
                    : "N/A"}
                </span>
                <button
                  type="button"
                  onClick={fetchCryptoPrices}
                  disabled={loadingPrices}
                  className="text-blue-400 hover:text-blue-300 disabled:text-gray-500 text-xs"
                  title="Refresh prices"
                >
                  🔄
                </button>
              </div>
            </div>
            {lastPriceUpdate && (
              <div className="flex justify-end text-xs text-gray-500 mt-1">
                Updated: {lastPriceUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-3">Payment Method</h4>
          <div className="space-y-3">
            {/* PayPal Option */}
            <div
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                paymentMethod === "paypal"
                  ? "bg-blue-900 bg-opacity-30 border border-blue-500"
                  : "hover:bg-gray-700"
              }`}
              onClick={() => setPaymentMethod("paypal")}
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">P</span>
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">PayPal (USD)</div>
                <div className="text-sm text-gray-400">
                  Pay with USD via PayPal - $
                  {loadingPrices
                    ? "Loading..."
                    : calculateUSDCPrice(selectedNFT!)
                    ? calculateUSDCPrice(selectedNFT!)!.toFixed(2)
                    : (selectedNFT as any)?.priceUSD
                    ? (selectedNFT as any).priceUSD.toFixed(2)
                    : "N/A"}
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  paymentMethod === "paypal"
                    ? "bg-blue-500 border-blue-500"
                    : "border-gray-400"
                }`}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              NFT Title *
            </label>
            <input
              type="text"
              name="nftTitle"
              value={formData.nftTitle}
              onChange={handleInputChange}
              required
              placeholder="NFT title"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              readOnly
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                required
                placeholder="Full Name"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleInputChange}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-yellow-900 bg-opacity-20 border border-yellow-500 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-yellow-400 text-xl">⚠️</div>
            <div className="text-sm text-yellow-200">
              <p className="font-medium mb-1">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1 text-yellow-100">
                <li>NFTs will be manually transferred within 24-48 hours</li>
                <li>
                  Payment is processed via PayPal in USD (USDC equivalent at
                  current market rate)
                </li>
                <li>This transaction is non-refundable and non-transferable</li>
              </ul>
            </div>
          </div>
        </div>

        {/* PayPal Checkout Component */}
        {paymentMethod === "paypal" && selectedNFT && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3">Complete Payment</h4>
            <PayPalCheckout
              product={{
                name: selectedNFT.title || "NFT",
                description: `NFT from ${collection.name}`,
                price:
                  calculateUSDCPrice(selectedNFT) ||
                  (selectedNFT as any)?.priceUSD ||
                  100,
              }}
              quantity={1}
              onSuccess={handlePayPalSuccess}
              onError={handlePayPalError}
            />
          </div>
        )}

        <div className="flex space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep("details")}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            type="submit"
            loading={isLoading || loadingPrices}
            className="flex-1"
            size="lg"
            disabled={false}
          >
            {loadingPrices ? "Loading Prices..." : "Create Order"}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === "details" ? collection.name : "Complete Purchase"}
      size="lg"
    >
      {step === "details" ? renderDetailsStep() : renderPurchaseStep()}
    </Modal>
  );
};
