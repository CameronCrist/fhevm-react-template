import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import type { FhevmClient, EncryptedInput, EncryptedType } from '@fhevm/sdk';

export interface EncryptOptions {
  contractAddress: string;
  userAddress: string;
}

export function useEncrypt(client: Ref<FhevmClient | null>) {
  const isEncrypting = ref(false);
  const error = ref<Error | null>(null);
  const encryptedData = ref<EncryptedInput | null>(null);

  const encrypt = async (
    value: number | boolean,
    type: EncryptedType,
    options: EncryptOptions
  ): Promise<EncryptedInput | null> => {
    if (!client.value) {
      error.value = new Error('FHEVM client not initialized');
      return null;
    }

    isEncrypting.value = true;
    error.value = null;

    try {
      const encrypted = await client.value.encrypt(value, type, options);
      encryptedData.value = encrypted;
      console.log(`✅ Encrypted ${value} as ${type}`);
      return encrypted;
    } catch (err) {
      console.error('❌ Encryption error:', err);
      error.value = err as Error;
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
    reset,
    isEncrypting: computed(() => isEncrypting.value),
    error: computed(() => error.value),
    encryptedData: computed(() => encryptedData.value),
  };
}
