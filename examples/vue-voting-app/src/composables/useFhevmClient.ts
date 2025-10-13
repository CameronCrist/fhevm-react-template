import { ref, computed, onMounted } from 'vue';
import type { Ref } from 'vue';
import { createFhevmClient } from '@fhevm/sdk';
import type { FhevmClient } from '@fhevm/sdk';

export interface FhevmClientConfig {
  provider: any;
  chainId: number;
  gatewayUrl?: string;
}

export function useFhevmClient(config: FhevmClientConfig) {
  const client = ref<FhevmClient | null>(null);
  const isReady = ref(false);
  const error = ref<Error | null>(null);

  onMounted(async () => {
    try {
      const fhevmClient = createFhevmClient({
        provider: config.provider,
        chainId: config.chainId,
        gatewayUrl: config.gatewayUrl || 'https://gateway.sepolia.zama.ai',
      });

      await fhevmClient.init();

      client.value = fhevmClient;
      isReady.value = true;

      console.log('✅ FHEVM Client initialized');
    } catch (err) {
      console.error('❌ Failed to initialize FHEVM client:', err);
      error.value = err as Error;
    }
  });

  return {
    client: computed(() => client.value),
    isReady: computed(() => isReady.value),
    error: computed(() => error.value),
  };
}
