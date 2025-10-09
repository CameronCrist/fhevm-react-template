/**
 * Core type definitions for FHEVM SDK
 */

import type { BrowserProvider, JsonRpcProvider, Signer } from 'ethers';

/**
 * FHEVM client configuration
 */
export interface FhevmConfig {
  /** Network provider (ethers.js provider) */
  provider: BrowserProvider | JsonRpcProvider;
  /** Network chain ID */
  chainId: number;
  /** Optional: Public key endpoint for encryption */
  publicKeyEndpoint?: string;
  /** Optional: Gateway URL for decryption */
  gatewayUrl?: string;
  /** Optional: ACL contract address */
  aclAddress?: string;
}

/**
 * Encryption options
 */
export interface EncryptionOptions {
  /** Contract address for encryption context */
  contractAddress: string;
  /** User address (signer) */
  userAddress: string;
}

/**
 * Decryption options
 */
export interface DecryptionOptions {
  /** Contract address to decrypt from */
  contractAddress: string;
  /** User address (signer) */
  userAddress: string;
  /** Signer for signature generation */
  signer: Signer;
}

/**
 * Encrypted value types
 */
export type EncryptedType = 'euint8' | 'euint16' | 'euint32' | 'euint64' | 'euint128' | 'ebool' | 'eaddress';

/**
 * Encrypted input for contract calls
 */
export interface EncryptedInput {
  handles: string[];
  inputProof: string;
}

/**
 * EIP-712 signature for decryption
 */
export interface EIP712Signature {
  signature: string;
  publicKey: string;
}

/**
 * FHEVM client instance
 */
export interface IFhevmClient {
  /** Initialize the client */
  init(): Promise<void>;
  /** Check if client is ready */
  isReady(): boolean;
  /** Encrypt a value */
  encrypt(value: number | boolean, type: EncryptedType, options: EncryptionOptions): Promise<EncryptedInput>;
  /** Decrypt a value */
  decrypt(handle: string, options: DecryptionOptions): Promise<number | boolean>;
  /** Create EIP-712 signature for decryption */
  createDecryptionSignature(contractAddress: string, signer: Signer): Promise<EIP712Signature>;
  /** Get public encryption key */
  getPublicKey(): string | null;
}

/**
 * Hook state for React/Vue
 */
export interface EncryptionState {
  isEncrypting: boolean;
  error: Error | null;
  encryptedData: EncryptedInput | null;
}

export interface DecryptionState {
  isDecrypting: boolean;
  error: Error | null;
  decryptedValue: number | boolean | null;
}
