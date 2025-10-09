/**
 * @fhevm/sdk - Universal FHEVM SDK
 * Framework-agnostic encryption SDK for confidential smart contracts
 *
 * @module @fhevm/sdk
 */

export { FhevmClient, createFhevmClient } from './client';
export { encrypt, decrypt } from './encryption';
export { useEncryption, useDecryption } from './hooks';
export * from './types';
export * from './utils';

// Version
export const VERSION = '1.0.0';
