/**
 * FHE Type Definitions
 * Centralized type definitions for FHE operations
 */

export type EncryptedType = 'euint8' | 'euint16' | 'euint32' | 'euint64' | 'euint128' | 'ebool' | 'eaddress';

export interface FHEClientConfig {
  chainId: number;
  gatewayUrl?: string;
  publicKeyEndpoint?: string;
  aclAddress?: string;
}

export interface EncryptionParams {
  value: number | bigint | boolean;
  type: EncryptedType;
  contractAddress: string;
  userAddress: string;
}

export interface DecryptionParams {
  handle: string;
  contractAddress: string;
  userAddress: string;
}

export interface EncryptedInput {
  handles: Uint8Array[];
  inputProof: string;
}

export interface FHEOperation {
  id: string;
  type: 'encrypt' | 'decrypt' | 'compute';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: number;
  error?: string;
}

export interface FHEContextValue {
  isInitialized: boolean;
  isConnected: boolean;
  chainId?: number;
  address?: string;
  error?: string;
}
