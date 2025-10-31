/**
 * Type Definitions for FHE Operations
 */

export type EncryptedType = 'euint8' | 'euint16' | 'euint32' | 'euint64' | 'euint128' | 'ebool' | 'eaddress';

export interface FHEConfig {
  chainId: number;
  gatewayUrl?: string;
  publicKeyEndpoint?: string;
  aclAddress?: string;
}

export interface EncryptionResult {
  handles: Uint8Array[];
  inputProof: string;
}

export interface DecryptionResult {
  value: number | boolean;
  type: EncryptedType;
}

export interface FHEClientState {
  isInitialized: boolean;
  isEncrypting: boolean;
  isDecrypting: boolean;
  error: Error | null;
}

/**
 * Get maximum value for encrypted type
 */
export function getMaxValue(type: EncryptedType): bigint {
  switch (type) {
    case 'euint8':
      return 255n;
    case 'euint16':
      return 65535n;
    case 'euint32':
      return 4294967295n;
    case 'euint64':
      return 18446744073709551615n;
    case 'euint128':
      return 340282366920938463463374607431768211455n;
    case 'ebool':
      return 1n;
    case 'eaddress':
      return BigInt('0xffffffffffffffffffffffffffffffffffffffff');
  }
}

/**
 * Validate value for encrypted type
 */
export function validateValue(value: number | bigint | boolean, type: EncryptedType): boolean {
  if (type === 'ebool') {
    return typeof value === 'boolean';
  }

  const numValue = typeof value === 'bigint' ? value : BigInt(value);
  return numValue >= 0n && numValue <= getMaxValue(type);
}
