/**
 * Server-side FHE Operations
 * Handles decryption and server-side FHE operations using the FHEVM SDK
 */

import { createFhevmClient, decrypt, type FhevmClient } from '@fhevm/sdk';
import { JsonRpcProvider, Wallet } from 'ethers';

export interface DecryptOptions {
  contractAddress: string;
  userAddress: string;
  signer: Wallet;
}

/**
 * Initialize FHEVM client with JSON-RPC provider (server-side)
 */
export async function initializeServerFhevmClient(
  rpcUrl: string,
  chainId: number
): Promise<FhevmClient> {
  const provider = new JsonRpcProvider(rpcUrl);
  const client = createFhevmClient({ provider, chainId });
  await client.init();
  return client;
}

/**
 * Decrypt a value from contract storage
 */
export async function decryptValue(
  client: FhevmClient,
  handle: string,
  options: DecryptOptions
): Promise<number | boolean> {
  return await decrypt(client, handle, options);
}

/**
 * Batch decrypt multiple handles
 */
export async function batchDecryptValues(
  client: FhevmClient,
  handles: string[],
  options: DecryptOptions
): Promise<(number | boolean)[]> {
  const results = await Promise.all(
    handles.map((handle) => decrypt(client, handle, options))
  );
  return results;
}
