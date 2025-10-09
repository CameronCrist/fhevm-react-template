/**
 * Vue composables for FHEVM SDK
 */

import { ref, readonly, Ref } from 'vue';
import type { FhevmClient } from './client';
import type {
  EncryptedInput,
  EncryptedType,
  EncryptionOptions,
  DecryptionOptions,
} from './types';

/**
 * Vue composable for encryption
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
export function useEncrypt(client: Ref<FhevmClient | null> | FhevmClient | null) {
  const isEncrypting = ref(false);
  const error = ref<Error | null>(null);
  const encryptedData = ref<EncryptedInput | null>(null);

  const getClient = (): FhevmClient | null => {
    if (client === null) return null;
    return 'value' in client ? client.value : client;
  };

  const encrypt = async (
    value: number | boolean,
    type: EncryptedType,
    options: EncryptionOptions
  ): Promise<EncryptedInput | null> => {
    const fhevmClient = getClient();

    if (!fhevmClient) {
      error.value = new Error('FHEVM client not initialized');
      return null;
    }

    isEncrypting.value = true;
    error.value = null;

    try {
      const result = await fhevmClient.encrypt(value, type, options);
      encryptedData.value = result;
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Encryption failed');
      return null;
    } finally {
      isEncrypting.value = false;
    }
  };

  const reset = () => {
    isEncrypting.value = false;
    error.value = null;
    encryptedData.value = null;
  };

  return {
    encrypt,
    isEncrypting: readonly(isEncrypting),
    error: readonly(error),
    encryptedData: readonly(encryptedData),
    reset,
  };
}

/**
 * Vue composable for decryption
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
export function useDecrypt(client: Ref<FhevmClient | null> | FhevmClient | null) {
  const isDecrypting = ref(false);
  const error = ref<Error | null>(null);
  const decryptedValue = ref<number | boolean | null>(null);

  const getClient = (): FhevmClient | null => {
    if (client === null) return null;
    return 'value' in client ? client.value : client;
  };

  const decrypt = async (
    handle: string,
    options: DecryptionOptions
  ): Promise<number | boolean | null> => {
    const fhevmClient = getClient();

    if (!fhevmClient) {
      error.value = new Error('FHEVM client not initialized');
      return null;
    }

    isDecrypting.value = true;
    error.value = null;

    try {
      const result = await fhevmClient.decrypt(handle, options);
      decryptedValue.value = result;
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Decryption failed');
      return null;
    } finally {
      isDecrypting.value = false;
    }
  };

  const reset = () => {
    isDecrypting.value = false;
    error.value = null;
    decryptedValue.value = null;
  };

  return {
    decrypt,
    isDecrypting: readonly(isDecrypting),
    error: readonly(error),
    decryptedValue: readonly(decryptedValue),
    reset,
  };
}

/**
 * Vue composable for FHEVM client initialization
 *
 * @example
 * ```typescript
 * const client = ref<FhevmClient | null>(null);
 * const { isReady, error } = useFhevmClient(client);
 * ```
 */
export function useFhevmClient(client: Ref<FhevmClient | null> | FhevmClient | null) {
  const isReady = ref(false);
  const error = ref<Error | null>(null);

  const getClient = (): FhevmClient | null => {
    if (client === null) return null;
    return 'value' in client ? client.value : client;
  };

  const init = async () => {
    const fhevmClient = getClient();
    if (!fhevmClient) return;

    try {
      await fhevmClient.init();
      isReady.value = true;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Client initialization failed');
    }
  };

  // Auto-initialize if client is provided
  if (getClient()) {
    init();
  }

  return {
    isReady: readonly(isReady),
    error: readonly(error),
    init,
  };
}
