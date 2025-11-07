"use client";

import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

interface WalletContextType {
  wallet: any;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<any>({
    isConnected: false,
    address: null,
    chainId: null,
    provider: null,
    signer: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });
          setWallet({
            isConnected: true,
            address: accounts[0],
            chainId: parseInt(chainId, 16),
            provider: window.ethereum,
            signer: null, // Will be set when needed
          });
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("Please install MetaMask or another Web3 wallet");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      // Get chain ID
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      const chainIdNumber = parseInt(chainId, 16);

      // Check if it's a supported network (Arbitrum, Ethereum, Polygon)
      const supportedChains = [1, 42161, 137]; // Ethereum, Arbitrum, Polygon
      if (!supportedChains.includes(chainIdNumber)) {
        // Try to switch to Arbitrum (42161)
        await switchNetwork(42161);
      }

      setWallet({
        isConnected: true,
        address: accounts[0],
        chainId: chainIdNumber,
        provider: window.ethereum,
        signer: null, // Will be set when needed
      });

      // Listen for account changes
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      setError(error.message || "Failed to connect wallet");
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: null,
      chainId: null,
      provider: null,
      signer: null,
    });
    setError(null);
  };

  const switchNetwork = async (chainId: number) => {
    if (!window.ethereum) {
      throw new Error("No wallet provider found");
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      // If the chain doesn't exist, add it
      if (error.code === 4902) {
        await addNetwork(chainId);
      } else {
        throw error;
      }
    }
  };

  const addNetwork = async (chainId: number) => {
    const networkConfigs = {
      1: {
        chainId: "0x1",
        chainName: "Ethereum Mainnet",
        rpcUrls: ["https://mainnet.infura.io/v3/"],
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        blockExplorerUrls: ["https://etherscan.io"],
      },
      42161: {
        chainId: "0xa4b1",
        chainName: "Arbitrum One",
        rpcUrls: ["https://arb1.arbitrum.io/rpc"],
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        blockExplorerUrls: ["https://arbiscan.io"],
      },
      137: {
        chainId: "0x89",
        chainName: "Polygon Mainnet",
        rpcUrls: ["https://polygon-rpc.com"],
        nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
        blockExplorerUrls: ["https://polygonscan.com"],
      },
    };

    const config = networkConfigs[chainId as keyof typeof networkConfigs];
    if (!config) {
      throw new Error("Unsupported network");
    }

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [config],
    });
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setWallet((prev: any) => ({
        ...prev,
        address: accounts[0],
      }));
    }
  };

  const handleChainChanged = (chainId: string) => {
    setWallet((prev: any) => ({
      ...prev,
      chainId: parseInt(chainId, 16),
    }));
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        isLoading,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
