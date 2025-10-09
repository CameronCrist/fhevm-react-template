/**
 * FHEVM Client - Core encryption/decryption client
 */

import { createInstance, FhevmInstance } from 'fhevmjs';
import type { Signer } from 'ethers';
import type {
  FhevmConfig,
  IFhevmClient,
  EncryptionOptions,
  DecryptionOptions,
  EncryptedInput,
  EncryptedType,
  EIP712Signature,
} from './types';

/**
 * Default configuration values
 */
const DEFAULTS = {
  publicKeyEndpoint: '/fhe-public-key',
  gatewayUrl: 'https://gateway.sepolia.zama.ai',
  aclAddress: '0x0000000000000000000000000000000000000000',
};

/**
 * FHEVM Client implementation
 */
export class FhevmClient implements IFhevmClient {
  private instance: FhevmInstance | null = null;
  private config: FhevmConfig;
  private ready = false;

  constructor(config: FhevmConfig) {
    this.config = {
      ...config,
      publicKeyEndpoint: config.publicKeyEndpoint ?? DEFAULTS.publicKeyEndpoint,
      gatewayUrl: config.gatewayUrl ?? DEFAULTS.gatewayUrl,
      aclAddress: config.aclAddress ?? DEFAULTS.aclAddress,
    };
  }

  /**
   * Initialize the FHEVM client
   */
  async init(): Promise<void> {
    if (this.ready) return;

    try {
      // Create FHE instance
      this.instance = await createInstance({
        chainId: this.config.chainId,
        publicKeyVerifier: this.config.publicKeyEndpoint,
        gatewayUrl: this.config.gatewayUrl,
        aclAddress: this.config.aclAddress,
      });

      this.ready = true;
    } catch (error) {
      throw new Error(`Failed to initialize FHEVM client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if client is ready
   */
  isReady(): boolean {
    return this.ready && this.instance !== null;
  }

  /**
   * Encrypt a value for contract input
   */
  async encrypt(
    value: number | boolean,
    type: EncryptedType,
    options: EncryptionOptions
  ): Promise<EncryptedInput> {
    if (!this.isReady()) {
      throw new Error('FHEVM client not initialized. Call init() first.');
    }

    try {
      const input = this.instance!.createEncryptedInput(
        options.contractAddress,
        options.userAddress
      );

      // Add value based on type
      switch (type) {
        case 'ebool':
          input.addBool(Boolean(value));
          break;
        case 'euint8':
          input.add8(Number(value));
          break;
        case 'euint16':
          input.add16(Number(value));
          break;
        case 'euint32':
          input.add32(Number(value));
          break;
        case 'euint64':
          input.add64(BigInt(value));
          break;
        case 'euint128':
          input.add128(BigInt(value));
          break;
        default:
          throw new Error(`Unsupported encrypted type: ${type}`);
      }

      const encryptedInput = input.encrypt();

      return {
        handles: encryptedInput.handles,
        inputProof: encryptedInput.inputProof,
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt a value from contract
   */
  async decrypt(
    handle: string,
    options: DecryptionOptions
  ): Promise<number | boolean> {
    if (!this.isReady()) {
      throw new Error('FHEVM client not initialized. Call init() first.');
    }

    try {
      // Create EIP-712 signature for decryption permission
      const { signature, publicKey } = await this.createDecryptionSignature(
        options.contractAddress,
        options.signer
      );

      // Request decryption from gateway
      const response = await fetch(`${this.config.gatewayUrl}/decrypt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          handle,
          contractAddress: options.contractAddress,
          userAddress: options.userAddress,
          signature,
          publicKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`Gateway request failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.value;
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create EIP-712 signature for decryption authorization
   */
  async createDecryptionSignature(
    contractAddress: string,
    signer: Signer
  ): Promise<EIP712Signature> {
    if (!this.isReady()) {
      throw new Error('FHEVM client not initialized. Call init() first.');
    }

    try {
      const publicKey = this.instance!.getPublicKey(contractAddress);

      const domain = {
        name: 'Authorization token',
        version: '1',
        chainId: this.config.chainId,
        verifyingContract: contractAddress,
      };

      const types = {
        Reencrypt: [
          { name: 'publicKey', type: 'bytes' },
        ],
      };

      const value = {
        publicKey: `0x${publicKey}`,
      };

      const signature = await signer.signTypedData(domain, types, value);

      return {
        signature,
        publicKey,
      };
    } catch (error) {
      throw new Error(`Failed to create decryption signature: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the public encryption key
   */
  getPublicKey(): string | null {
    if (!this.isReady()) return null;
    return this.instance!.getPublicKey(this.config.aclAddress!);
  }
}

/**
 * Factory function to create FHEVM client
 */
export function createFhevmClient(config: FhevmConfig): FhevmClient {
  return new FhevmClient(config);
}
