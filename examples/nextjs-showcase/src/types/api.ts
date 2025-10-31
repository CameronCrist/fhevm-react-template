/**
 * API Type Definitions
 * Type definitions for API routes and responses
 */

import type { EncryptedType } from './fhe';

// Request types
export interface EncryptRequest {
  value: number | boolean;
  type: EncryptedType;
  contractAddress: string;
  userAddress: string;
}

export interface DecryptRequest {
  handle: string;
  contractAddress: string;
  userAddress: string;
}

export interface ComputeRequest {
  operation: string;
  operands: string[];
  contractAddress: string;
}

// Response types
export interface EncryptResponse {
  success: boolean;
  data?: {
    handles: string[];
    inputProof: string;
  };
  error?: string;
}

export interface DecryptResponse {
  success: boolean;
  data?: {
    value: number | boolean;
    type: EncryptedType;
  };
  error?: string;
}

export interface ComputeResponse {
  success: boolean;
  data?: {
    result: string;
    transactionHash?: string;
  };
  error?: string;
}

export interface KeysResponse {
  success: boolean;
  data?: {
    publicKey: string;
    chainId: number;
  };
  error?: string;
}

// Error types
export interface APIError {
  code: string;
  message: string;
  details?: any;
}

// Generic API response wrapper
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  timestamp: number;
}
