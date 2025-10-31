/**
 * Key Management for FHE Operations
 * Handles public keys and gateway configuration
 */

export interface KeyConfig {
  publicKeyEndpoint?: string;
  gatewayUrl?: string;
  aclAddress?: string;
}

/**
 * Default configuration for Sepolia testnet
 */
export const DEFAULT_KEY_CONFIG: KeyConfig = {
  gatewayUrl: 'https://gateway.sepolia.zama.ai',
};

/**
 * Get public key configuration for a specific chain
 */
export function getKeyConfig(chainId: number): KeyConfig {
  switch (chainId) {
    case 11155111: // Sepolia
      return {
        gatewayUrl: 'https://gateway.sepolia.zama.ai',
      };
    default:
      return DEFAULT_KEY_CONFIG;
  }
}

/**
 * Validate key configuration
 */
export function validateKeyConfig(config: KeyConfig): boolean {
  return Boolean(config.gatewayUrl);
}

/**
 * Format public key for display
 */
export function formatPublicKey(key: string): string {
  if (!key || key.length < 10) return key;
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}
