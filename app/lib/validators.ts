export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateWalletAddress(address: string): boolean {
  // Basic Ethereum address validation (0x followed by 40 hex characters)
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(address);
}

// Contract address validation no longer used (field removed)
export function validateContractAddress(address: string): boolean {
  return true;
}

export function validatePrice(price: number): boolean {
  return typeof price === 'number' && price >= 0 && !isNaN(price);
}

export function validateNetwork(network: string): boolean {
  // Allow any non-empty string for network to support future blockchains
  return typeof network === 'string' && network.trim().length > 0;
}

export function validateCurrency(currency: string): boolean {
  const validCurrencies = ['ETH', 'MATIC', 'USDC', 'USDT'];
  return validCurrencies.includes(currency);
}

export function validateOrderStatus(status: string): boolean {
  const validStatuses = ['pending', 'paid', 'processing', 'nft_sent', 'completed', 'cancelled', 'refunded'];
  return validStatuses.includes(status);
}

export function validateString(value: any, minLength: number = 1, maxLength: number = 1000): boolean {
  return typeof value === 'string' && 
         value.trim().length >= minLength && 
         value.trim().length <= maxLength;
}

export function validateNumber(value: any, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): boolean {
  return typeof value === 'number' && 
         !isNaN(value) && 
         value >= min && 
         value <= max;
}

export function validateBoolean(value: any): boolean {
  return typeof value === 'boolean';
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateObjectId(id: string): boolean {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
}

export function validateCustomId(id: string): boolean {
  return typeof id === 'string' && id.trim().length > 0;
}

export function validateId(id: string): boolean {
  return validateObjectId(id) || validateCustomId(id);
}

// Comprehensive validation functions
export function validateCollectionData(data: any): ValidationResult {
  const errors: string[] = [];

  if (!validateString(data.name, 1, 100)) {
    errors.push('Name must be a string between 1 and 100 characters');
  }

  if (data.description && !validateString(data.description, 0, 1000)) {
    errors.push('Description must be a string with maximum 1000 characters');
  }

  // Allow relative or absolute paths for images; no strict URL validation

  // Contract address optional/unused

  if (data.network && !validateNetwork(data.network)) {
    errors.push('Network must be a non-empty string');
  }

  if (!validateNumber(data.totalSupply, 0, 1000000)) {
    errors.push('Total supply must be a number between 0 and 1,000,000');
  }

  if (data.isActive !== undefined && !validateBoolean(data.isActive)) {
    errors.push('isActive must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateNFTData(data: any): ValidationResult {
  const errors: string[] = [];

  if (!validateString(data.title, 1, 100)) {
    errors.push('Title must be a string between 1 and 100 characters');
  }

  if (data.description && !validateString(data.description, 0, 1000)) {
    errors.push('Description must be a string with maximum 1000 characters');
  }

  // Allow relative or absolute paths for images; no strict URL validation

  if (!validateId(data.collectionId)) {
    errors.push('Collection ID must be a valid ID');
  }

  if (!validatePrice(data.priceCrypto)) {
    errors.push('Price in crypto must be a non-negative number');
  }

  if (data.currency && !validateCurrency(data.currency)) {
    errors.push('Currency must be one of: ETH, MATIC, USDC, USDT');
  }

  if (data.network && !validateNetwork(data.network)) {
    errors.push('Network must be a non-empty string');
  }

  if (data.isAvailable !== undefined && !validateBoolean(data.isAvailable)) {
    errors.push('isAvailable must be a boolean');
  }

  if (data.tokenId && !validateString(data.tokenId, 1, 50)) {
    errors.push('Token ID must be a string between 1 and 50 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateOrderData(data: any): ValidationResult {
  const errors: string[] = [];

  if (!validateEmail(data.customerEmail)) {
    errors.push('Customer email must be a valid email address');
  }

  if (!validateString(data.customerName, 1, 100)) {
    errors.push('Customer name must be a string between 1 and 100 characters');
  }

  // Wallet address is optional for PayPal orders
  if (data.walletAddress && !validateWalletAddress(data.walletAddress)) {
    errors.push('Wallet address must be a valid Ethereum address');
  }

  if (!validateId(data.nftId)) {
    errors.push('NFT ID must be a valid ID');
  }

  if (!validatePrice(data.amount)) {
    errors.push('Amount must be a positive number');
  }

  if (data.status && !validateOrderStatus(data.status)) {
    errors.push('Status must be one of: pending, paid, processing, nft_sent, completed, cancelled, refunded');
  }

  if (data.currency && !validateCurrency(data.currency)) {
    errors.push('Currency must be one of: ETH, MATIC, USDC, USDT');
  }

  if (data.network && !validateNetwork(data.network)) {
    errors.push('Network must be a non-empty string');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
