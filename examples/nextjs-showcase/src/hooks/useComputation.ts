/**
 * Computation Hook
 * Handles homomorphic computation operations and contract interactions
 */

'use client';

import { useState, useCallback } from 'react';
import type { FhevmClient } from '@fhevm/sdk';

export interface ComputationResult {
  result: any;
  transactionHash?: string;
}

export interface UseComputationReturn {
  compute: (operation: () => Promise<any>) => Promise<ComputationResult | null>;
  isComputing: boolean;
  error: Error | null;
  result: ComputationResult | null;
  reset: () => void;
}

/**
 * Hook for homomorphic computation operations
 */
export function useComputation(client: FhevmClient | null): UseComputationReturn {
  const [isComputing, setIsComputing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<ComputationResult | null>(null);

  const compute = useCallback(
    async (operation: () => Promise<any>) => {
      if (!client) {
        setError(new Error('FHE client not initialized'));
        return null;
      }

      setIsComputing(true);
      setError(null);

      try {
        const opResult = await operation();
        const computationResult: ComputationResult = {
          result: opResult
        };
        setResult(computationResult);
        return computationResult;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('Computation failed');
        setError(errorObj);
        return null;
      } finally {
        setIsComputing(false);
      }
    },
    [client]
  );

  const reset = useCallback(() => {
    setError(null);
    setResult(null);
  }, []);

  return {
    compute,
    isComputing,
    error,
    result,
    reset
  };
}
