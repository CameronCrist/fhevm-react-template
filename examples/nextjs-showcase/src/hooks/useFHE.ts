/**
 * Main FHE Hook
 * Combines encryption, decryption, and client management
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { FhevmClient } from '@fhevm/sdk';
import { BrowserProvider } from 'ethers';

export interface UseFHEReturn {
  client: FhevmClient | null;
  isReady: boolean;
  error: Error | null;
  initialize: () => Promise<void>;
}

/**
 * Main hook for FHE operations
 */
export function useFHE(provider?: BrowserProvider, chainId?: number): UseFHEReturn {
  const [client, setClient] = useState<FhevmClient | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initialize = useCallback(async () => {
    if (!provider || !chainId) {
      setError(new Error('Provider and chainId are required'));
      return;
    }

    try {
      setError(null);
      const { createFhevmClient } = await import('@fhevm/sdk');
      const fhevmClient = createFhevmClient({ provider, chainId });
      await fhevmClient.init();
      setClient(fhevmClient);
      setIsReady(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize FHE client'));
      setIsReady(false);
    }
  }, [provider, chainId]);

  useEffect(() => {
    if (provider && chainId && !client) {
      initialize();
    }
  }, [provider, chainId, client, initialize]);

  return {
    client,
    isReady,
    error,
    initialize
  };
}
