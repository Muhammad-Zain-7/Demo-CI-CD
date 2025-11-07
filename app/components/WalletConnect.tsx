"use client";

import React from "react";
import { useWallet } from "../contexts/WalletContext";
import { Button } from "./ui/Button";

export const WalletConnect: React.FC = () => {
  const { wallet, connectWallet, disconnectWallet, isLoading, error } =
    useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 1:
        return "Ethereum";
      case 42161:
        return "Arbitrum";
      case 137:
        return "Polygon";
      default:
        return "Unknown";
    }
  };

  if (wallet.isConnected) {
    return (
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <div className="text-sm text-gray-300">
            {formatAddress(wallet.address!)}
          </div>
          <div className="text-xs text-gray-500">
            {getNetworkName(wallet.chainId)}
          </div>
        </div>
        <Button onClick={disconnectWallet} variant="outline" size="sm">
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end space-y-2">
      <Button onClick={connectWallet} loading={isLoading} size="sm">
        {isLoading ? "Connecting..." : "Connect Wallet"}
      </Button>
      {error && (
        <div className="text-xs text-red-400 text-right max-w-xs">{error}</div>
      )}
    </div>
  );
};
