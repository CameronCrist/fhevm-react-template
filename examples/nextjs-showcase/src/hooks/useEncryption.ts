/**
 * Encryption Hook
 * Handles client-side encryption operations
 */

'use client';

import { useState, useCallback } from 'react';
import type { FhevmClient } from '@fhevm/sdk';
import type { EncryptedType } from '../lib/fhe/types';

export interface EncryptOptions {
  contractAddress: string;
  userAddress: string;
}

export interface EncryptedData {
  handles: Uint8Array[];
  inputProof: string;
}

export interface UseEncryptionReturn {
  encrypt: (value: number | bigint | boolean, type: EncryptedType, options: EncryptOptions) => Promise<EncryptedData | null>;
  isEncrypting: boolean;
  error: Error | null;
  encryptedData: EncryptedData | null;
  reset: () => void;
}

/**
 * Hook for encryption operations
 */
export function useEncryption(client: FhevmClient | null): UseEncryptionReturn {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [encryptedData, setEncryptedData] = useState<EncryptedData | null>(null);

  const encrypt = useCallback(
    async (value: number | bigint | boolean, type: EncryptedType, options: EncryptOptions) => {
      if (!client) {
        setError(new Error('FHE client not initialized'));
        return null;
      }

      setIsEncrypting(true);
      setError(null);

      try {
        const { encrypt } = await import('@fhevm/sdk');
        const result = await encrypt(client, value, type, options);
        setEncryptedData(result);
        return result;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('Encryption failed');
        setError(errorObj);
        return null;
      } finally {
        setIsEncrypting(false);
      }
    },
    [client]
  );

  const reset = useCallback(() => {
    setError(null);
    setEncryptedData(null);
  }, []);

  return {
    encrypt,
    isEncrypting,
    error,
    encryptedData,
    reset
  };
}
