/**
 * Encryption utilities - Standalone functions for framework-agnostic usage
 */

import type { FhevmClient } from './client';
import type { EncryptedInput, EncryptedType, EncryptionOptions } from './types';

/**
 * Encrypt a value using FHEVM client
 *
 * @example
 * ```typescript
 * const encrypted = await encrypt(client, 42, 'euint32', {
 *   contractAddress: '0x...',
 *   userAddress: '0x...'
 * });
 * ```
 */
export async function encrypt(
  client: FhevmClient,
  value: number | boolean,
  type: EncryptedType,
  options: EncryptionOptions
): Promise<EncryptedInput> {
  return client.encrypt(value, type, options);
}

/**
 * Decrypt a value using FHEVM client
 *
 * @example
 * ```typescript
 * const decrypted = await decrypt(client, handle, {
 *   contractAddress: '0x...',
 *   userAddress: '0x...',
 *   signer: signer
 * });
 * ```
 */
export async function decrypt(
  client: FhevmClient,
  handle: string,
  options: { contractAddress: string; userAddress: string; signer: any }
): Promise<number | boolean> {
  return client.decrypt(handle, options);
}

/**
 * Batch encrypt multiple values
 *
 * @example
 * ```typescript
 * const encrypted = await batchEncrypt(client, [
 *   { value: 42, type: 'euint32' },
 *   { value: true, type: 'ebool' }
 * ], options);
 * ```
 */
export async function batchEncrypt(
  client: FhevmClient,
  values: Array<{ value: number | boolean; type: EncryptedType }>,
  options: EncryptionOptions
): Promise<EncryptedInput[]> {
  return Promise.all(
    values.map(({ value, type }) => client.encrypt(value, type, options))
  );
}
