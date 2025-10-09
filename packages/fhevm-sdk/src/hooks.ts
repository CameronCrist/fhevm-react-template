/**
 * Framework-agnostic hooks for encryption/decryption
 * These are basic implementations that can be wrapped by React/Vue
 */

import type { FhevmClient } from './client';
import type {
  EncryptedInput,
  EncryptedType,
  EncryptionOptions,
  DecryptionOptions,
  EncryptionState,
  DecryptionState,
} from './types';

/**
 * Basic encryption hook (framework-agnostic)
 */
export function useEncryption(client: FhevmClient) {
  let state: EncryptionState = {
    isEncrypting: false,
    error: null,
    encryptedData: null,
  };

  const encrypt = async (
    value: number | boolean,
    type: EncryptedType,
    options: EncryptionOptions
  ): Promise<EncryptedInput | null> => {
    state.isEncrypting = true;
    state.error = null;

    try {
      const result = await client.encrypt(value, type, options);
      state.encryptedData = result;
      state.isEncrypting = false;
      return result;
    } catch (error) {
      state.error = error instanceof Error ? error : new Error('Encryption failed');
      state.isEncrypting = false;
      return null;
    }
  };

  return {
    encrypt,
    getState: () => ({ ...state }),
  };
}

/**
 * Basic decryption hook (framework-agnostic)
 */
export function useDecryption(client: FhevmClient) {
  let state: DecryptionState = {
    isDecrypting: false,
    error: null,
    decryptedValue: null,
  };

  const decrypt = async (
    handle: string,
    options: DecryptionOptions
  ): Promise<number | boolean | null> => {
    state.isDecrypting = true;
    state.error = null;

    try {
      const result = await client.decrypt(handle, options);
      state.decryptedValue = result;
      state.isDecrypting = false;
      return result;
    } catch (error) {
      state.error = error instanceof Error ? error : new Error('Decryption failed');
      state.isDecrypting = false;
      return null;
    }
  };

  return {
    decrypt,
    getState: () => ({ ...state }),
  };
}
