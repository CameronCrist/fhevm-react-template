import { getClient, getSigner } from '../fhevm-client.js';
import type { EncryptedType } from '@fhevm/sdk';

export class EncryptionService {
  /**
   * Encrypt a value using FHEVM SDK
   */
  async encrypt(
    value: number | boolean,
    type: EncryptedType,
    contractAddress: string
  ) {
    const client = getClient();
    const signer = getSigner();

    try {
      const encrypted = await client.encrypt(value, type, {
        contractAddress,
        userAddress: signer.address,
      });

      console.log(`✅ Encrypted ${value} as ${type}`);

      return {
        success: true,
        data: {
          handles: encrypted.handles,
          inputProof: encrypted.inputProof,
        },
      };
    } catch (error) {
      console.error('❌ Encryption error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Encrypt multiple values in batch
   */
  async encryptBatch(
    values: Array<{ value: number | boolean; type: EncryptedType }>,
    contractAddress: string
  ) {
    const results = [];

    for (const item of values) {
      const result = await this.encrypt(item.value, item.type, contractAddress);
      results.push(result);
    }

    return {
      success: results.every((r) => r.success),
      data: results,
    };
  }

  /**
   * Decrypt an encrypted handle
   */
  async decrypt(handle: string, contractAddress: string) {
    const client = getClient();
    const signer = getSigner();

    try {
      const decrypted = await client.decrypt(handle, {
        contractAddress,
        userAddress: signer.address,
        signer,
      });

      console.log(`✅ Decrypted handle: ${handle} => ${decrypted}`);

      return {
        success: true,
        value: decrypted,
      };
    } catch (error) {
      console.error('❌ Decryption error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
}
