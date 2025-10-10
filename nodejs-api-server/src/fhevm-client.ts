import { createFhevmClient } from '@fhevm/sdk';
import { JsonRpcProvider, Wallet } from 'ethers';
import type { FhevmClient } from '@fhevm/sdk';
import dotenv from 'dotenv';

dotenv.config();

let fhevmClient: FhevmClient | null = null;
let provider: JsonRpcProvider | null = null;
let signer: Wallet | null = null;

export async function initializeFhevmClient() {
  if (fhevmClient) {
    return fhevmClient;
  }

  try {
    // Initialize provider
    provider = new JsonRpcProvider(process.env.RPC_URL);

    // Initialize signer (wallet)
    if (!process.env.PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY not found in environment variables');
    }
    signer = new Wallet(process.env.PRIVATE_KEY, provider);

    // Create FHEVM client
    fhevmClient = createFhevmClient({
      provider,
      chainId: Number(process.env.CHAIN_ID || 11155111),
      gatewayUrl: process.env.GATEWAY_URL || 'https://gateway.sepolia.zama.ai',
    });

    // Initialize client
    await fhevmClient.init();

    console.log('✅ FHEVM Client initialized successfully');
    console.log(`   Chain ID: ${process.env.CHAIN_ID}`);
    console.log(`   Signer Address: ${signer.address}`);

    return fhevmClient;
  } catch (error) {
    console.error('❌ Failed to initialize FHEVM client:', error);
    throw error;
  }
}

export function getClient(): FhevmClient {
  if (!fhevmClient) {
    throw new Error('FHEVM client not initialized. Call initializeFhevmClient() first.');
  }
  return fhevmClient;
}

export function getProvider(): JsonRpcProvider {
  if (!provider) {
    throw new Error('Provider not initialized. Call initializeFhevmClient() first.');
  }
  return provider;
}

export function getSigner(): Wallet {
  if (!signer) {
    throw new Error('Signer not initialized. Call initializeFhevmClient() first.');
  }
  return signer;
}
