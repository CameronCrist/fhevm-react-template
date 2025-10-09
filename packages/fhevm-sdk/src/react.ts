/**
 * React hooks for FHEVM SDK
 */

import { useState, useCallback, useEffect } from 'react';
import type { FhevmClient } from './client';
import type {
  EncryptedInput,
  EncryptedType,
  EncryptionOptions,
  DecryptionOptions,
} from './types';

/**
 * React hook for encryption
 *
 * @example
 * ```typescript
 * const { encrypt, isEncrypting, error, encryptedData } = useEncrypt(client);
 *
 * const handleEncrypt = async () => {
 *   await encrypt(42, 'euint32', {
 *     contractAddress: '0x...',
 *     userAddress: '0x...'
 *   });
 * };
 * ```
 */
export function useEncrypt(client: FhevmClient | null) {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [encryptedData, setEncryptedData] = useState<EncryptedInput | null>(null);

  const encrypt = useCallback(
    async (
      value: number | boolean,
      type: EncryptedType,
      options: EncryptionOptions
    ): Promise<EncryptedInput | null> => {
      if (!client) {
        setError(new Error('FHEVM client not initialized'));
        return null;
      }

      setIsEncrypting(true);
      setError(null);

      try {
        const result = await client.encrypt(value, type, options);
        setEncryptedData(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Encryption failed');
        setError(error);
        return null;
      } finally {
        setIsEncrypting(false);
      }
    },
    [client]
  );

  const reset = useCallback(() => {
    setIsEncrypting(false);
    setError(null);
    setEncryptedData(null);
  }, []);

  return {
    encrypt,
    isEncrypting,
    error,
    encryptedData,
    reset,
  };
}

/**
 * React hook for decryption
 *
 * @example
 * ```typescript
 * const { decrypt, isDecrypting, error, decryptedValue } = useDecrypt(client);
 *
 * const handleDecrypt = async () => {
 *   await decrypt(handle, {
 *     contractAddress: '0x...',
 *     userAddress: '0x...',
 *     signer: signer
 *   });
 * };
 * ```
 */
export function useDecrypt(client: FhevmClient | null) {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [decryptedValue, setDecryptedValue] = useState<number | boolean | null>(null);

  const decrypt = useCallback(
    async (
      handle: string,
      options: DecryptionOptions
    ): Promise<number | boolean | null> => {
      if (!client) {
        setError(new Error('FHEVM client not initialized'));
        return null;
      }

      setIsDecrypting(true);
      setError(null);

      try {
        const result = await client.decrypt(handle, options);
        setDecryptedValue(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Decryption failed');
        setError(error);
        return null;
      } finally {
        setIsDecrypting(false);
      }
    },
    [client]
  );

  const reset = useCallback(() => {
    setIsDecrypting(false);
    setError(null);
    setDecryptedValue(null);
  }, []);

  return {
    decrypt,
    isDecrypting,
    error,
    decryptedValue,
    reset,
  };
}

/**
 * React hook for FHEVM client initialization
 *
 * @example
 * ```typescript
 * const { client, isReady, error } = useFhevmClient({
 *   provider,
 *   chainId: 11155111
 * });
 * ```
 */
export function useFhevmClient(client: FhevmClient | null) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!client) return;

    const init = async () => {
      try {
        await client.init();
        setIsReady(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Client initialization failed'));
      }
    };

    init();
  }, [client]);

  return {
    client,
    isReady,
    error,
  };
}
