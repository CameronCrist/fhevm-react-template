import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import type { FhevmClient } from '@fhevm/sdk';

export interface DecryptOptions {
  contractAddress: string;
  userAddress: string;
  signer: any;
}

export function useDecrypt(client: Ref<FhevmClient | null>) {
  const isDecrypting = ref(false);
  const error = ref<Error | null>(null);
  const decryptedValue = ref<number | boolean | null>(null);

  const decrypt = async (
    handle: string,
    options: DecryptOptions
  ): Promise<number | boolean | null> => {
    if (!client.value) {
      error.value = new Error('FHEVM client not initialized');
      return null;
    }

    if (!options.signer) {
      error.value = new Error('Signer is required for decryption');
      return null;
    }

    isDecrypting.value = true;
    error.value = null;

    try {
      const decrypted = await client.value.decrypt(handle, {
        contractAddress: options.contractAddress,
        userAddress: options.userAddress,
        signer: options.signer,
      });

      decryptedValue.value = decrypted;
      console.log(`✅ Decrypted handle: ${handle} => ${decrypted}`);
      return decrypted;
    } catch (err) {
      console.error('❌ Decryption error:', err);
      error.value = err as Error;
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
    reset,
    isDecrypting: computed(() => isDecrypting.value),
    error: computed(() => error.value),
    decryptedValue: computed(() => decryptedValue.value),
  };
}
