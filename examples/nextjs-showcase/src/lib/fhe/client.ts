/**
 * Client-side FHE Operations
 * Handles encryption and client-side FHE operations using the FHEVM SDK
 */

import { createFhevmClient, encrypt, type FhevmClient } from '@fhevm/sdk';
import { BrowserProvider } from 'ethers';

export interface EncryptOptions {
  contractAddress: string;
  userAddress: string;
}

export interface EncryptedData {
  handles: Uint8Array[];
  inputProof: string;
}

/**
 * Initialize FHEVM client with browser provider
 */
export async function initializeFhevmClient(
  provider: BrowserProvider,
  chainId: number
): Promise<FhevmClient> {
  const client = createFhevmClient({ provider, chainId });
  await client.init();
  return client;
}

/**
 * Encrypt a value for contract input
 */
export async function encryptValue(
  client: FhevmClient,
  value: number | bigint | boolean,
  type: string,
  options: EncryptOptions
): Promise<EncryptedData> {
  return await encrypt(client, value, type, options);
}

/**
 * Batch encrypt multiple values
 */
export async function batchEncryptValues(
  client: FhevmClient,
  values: Array<{ value: number | bigint | boolean; type: string }>,
  options: EncryptOptions
): Promise<EncryptedData[]> {
  const results = await Promise.all(
    values.map((item) => encrypt(client, item.value, item.type, options))
  );
  return results;
}

/**
 * Validate encrypted type
 */
export function isValidEncryptedType(type: string): boolean {
  const validTypes = ['euint8', 'euint16', 'euint32', 'euint64', 'euint128', 'ebool', 'eaddress'];
  return validTypes.includes(type);
}
