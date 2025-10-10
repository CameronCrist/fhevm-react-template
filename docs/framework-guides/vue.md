# 🎨 Vue Integration Guide

Complete guide for integrating the Universal FHEVM SDK with Vue 3 applications.

## Installation

```bash
npm install @fhevm/sdk vue
```

## Setup

### 1. Create FHEVM Client Composable

```typescript
// composables/useFhevmClient.ts
import { ref, computed, onMounted } from 'vue';
import { createFhevmClient } from '@fhevm/sdk';
import type { FhevmClient } from '@fhevm/sdk';

export function useFhevmClient(config: {
  provider: any;
  chainId: number;
  gatewayUrl?: string;
}) {
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
    } catch (err) {
      error.value = err as Error;
      console.error('FHEVM Client initialization error:', err);
    }
  });

  return {
    client: computed(() => client.value),
    isReady: computed(() => isReady.value),
    error: computed(() => error.value),
  };
}
```

### 2. Create Encryption Composable

```typescript
// composables/useEncrypt.ts
import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import type { FhevmClient, EncryptedInput, EncryptedType } from '@fhevm/sdk';

export function useEncrypt(client: Ref<FhevmClient | null>) {
  const isEncrypting = ref(false);
  const error = ref<Error | null>(null);
  const encryptedData = ref<EncryptedInput | null>(null);

  const encrypt = async (
    value: number | boolean,
    type: EncryptedType,
    options: {
      contractAddress: string;
      userAddress: string;
    }
  ): Promise<EncryptedInput | null> => {
    if (!client.value) {
      error.value = new Error('FHEVM client not initialized');
      return null;
    }

    isEncrypting.value = true;
    error.value = null;
    encryptedData.value = null;

    try {
      const encrypted = await client.value.encrypt(value, type, options);
      encryptedData.value = encrypted;
      return encrypted;
    } catch (err) {
      error.value = err as Error;
      console.error('Encryption error:', err);
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
    isEncrypting: computed(() => isEncrypting.value),
    error: computed(() => error.value),
    encryptedData: computed(() => encryptedData.value),
    reset,
  };
}
```

### 3. Create Decryption Composable

```typescript
// composables/useDecrypt.ts
import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import type { FhevmClient } from '@fhevm/sdk';
import type { Signer } from 'ethers';

export function useDecrypt(client: Ref<FhevmClient | null>) {
  const isDecrypting = ref(false);
  const error = ref<Error | null>(null);
  const decryptedValue = ref<number | boolean | null>(null);

  const decrypt = async (
    handle: string,
    options: {
      contractAddress: string;
      userAddress: string;
      signer: Signer;
    }
  ): Promise<number | boolean | null> => {
    if (!client.value) {
      error.value = new Error('FHEVM client not initialized');
      return null;
    }

    isDecrypting.value = true;
    error.value = null;
    decryptedValue.value = null;

    try {
      const decrypted = await client.value.decrypt(handle, options);
      decryptedValue.value = decrypted;
      return decrypted;
    } catch (err) {
      error.value = err as Error;
      console.error('Decryption error:', err);
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
    isDecrypting: computed(() => isDecrypting.value),
    error: computed(() => error.value),
    decryptedValue: computed(() => decryptedValue.value),
    reset,
  };
}
```

## Usage Examples

### 1. Basic Encryption Component

```vue
<template>
  <div class="encryption-demo">
    <h2>Encrypt a Value</h2>

    <form @submit.prevent="handleEncrypt">
      <div class="form-group">
        <label>Value to Encrypt:</label>
        <input
          v-model.number="value"
          type="number"
          placeholder="Enter a number"
          required
        />
      </div>

      <div class="form-group">
        <label>Encryption Type:</label>
        <select v-model="encryptionType">
          <option value="euint8">euint8 (0-255)</option>
          <option value="euint16">euint16 (0-65535)</option>
          <option value="euint32">euint32</option>
          <option value="euint64">euint64</option>
        </select>
      </div>

      <button
        type="submit"
        :disabled="!isReady || isEncrypting"
      >
        {{ isEncrypting ? 'Encrypting...' : 'Encrypt' }}
      </button>
    </form>

    <div v-if="error" class="error">
      Error: {{ error.message }}
    </div>

    <div v-if="encryptedData" class="success">
      <h3>Encrypted Successfully!</h3>
      <p>Handle: {{ encryptedData.handles[0] }}</p>
      <p>Proof: {{ encryptedData.inputProof.substring(0, 20) }}...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFhevmClient } from '@/composables/useFhevmClient';
import { useEncrypt } from '@/composables/useEncrypt';
import { useAccount } from '@wagmi/vue';

const CONTRACT_ADDRESS = '0x78257622318fC85f2a9c909DD7aF9d0142cd90ce';

// Get wallet connection
const { address } = useAccount();

// Initialize FHEVM client
const { client, isReady, error: clientError } = useFhevmClient({
  provider: window.ethereum,
  chainId: 11155111,
});

// Use encryption composable
const { encrypt, isEncrypting, error, encryptedData } = useEncrypt(client);

// Form state
const value = ref(42);
const encryptionType = ref('euint32');

const handleEncrypt = async () => {
  if (!address.value) {
    alert('Please connect your wallet first');
    return;
  }

  await encrypt(value.value, encryptionType.value as any, {
    contractAddress: CONTRACT_ADDRESS,
    userAddress: address.value,
  });
};
</script>

<style scoped>
.encryption-demo {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input, select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  background: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.success {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}
</style>
```

### 2. Confidential Voting Component

```vue
<template>
  <div class="voting-component">
    <h2>Confidential Voting</h2>
    <p>Your vote will be encrypted before submission</p>

    <div class="voting-options">
      <button
        @click="vote(1)"
        :disabled="isEncrypting || !address"
        class="vote-button vote-yes"
      >
        {{ isEncrypting && selectedVote === 1 ? 'Encrypting...' : 'Vote Yes' }}
      </button>

      <button
        @click="vote(0)"
        :disabled="isEncrypting || !address"
        class="vote-button vote-no"
      >
        {{ isEncrypting && selectedVote === 0 ? 'Encrypting...' : 'Vote No' }}
      </button>
    </div>

    <div v-if="error" class="error">
      {{ error.message }}
    </div>

    <div v-if="encryptedData" class="success">
      ✅ Vote encrypted and submitted!
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFhevmClient } from '@/composables/useFhevmClient';
import { useEncrypt } from '@/composables/useEncrypt';
import { useAccount, useWriteContract } from '@wagmi/vue';

const VOTING_CONTRACT = '0x...';

const { address } = useAccount();
const { client } = useFhevmClient({
  provider: window.ethereum,
  chainId: 11155111,
});

const { encrypt, isEncrypting, error, encryptedData } = useEncrypt(client);
const { writeContract } = useWriteContract();

const selectedVote = ref<number | null>(null);

const vote = async (choice: number) => {
  if (!address.value) {
    alert('Please connect your wallet');
    return;
  }

  selectedVote.value = choice;

  // Encrypt vote
  const encrypted = await encrypt(choice, 'euint8', {
    contractAddress: VOTING_CONTRACT,
    userAddress: address.value,
  });

  if (encrypted) {
    // Submit to contract
    writeContract({
      address: VOTING_CONTRACT,
      abi: VOTING_ABI,
      functionName: 'submitVote',
      args: [encrypted.handles[0], encrypted.inputProof],
    });
  }

  selectedVote.value = null;
};
</script>

<style scoped>
.voting-component {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.voting-options {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin: 20px 0;
}

.vote-button {
  padding: 15px 30px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.vote-yes {
  background: #4CAF50;
  color: white;
}

.vote-no {
  background: #f44336;
  color: white;
}

.vote-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  background: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.success {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}
</style>
```

### 3. Decryption Component

```vue
<template>
  <div class="decryption-demo">
    <h2>Decrypt a Value</h2>

    <form @submit.prevent="handleDecrypt">
      <div class="form-group">
        <label>Encrypted Handle:</label>
        <input
          v-model="handle"
          type="text"
          placeholder="0x..."
          required
        />
      </div>

      <button
        type="submit"
        :disabled="!isReady || isDecrypting || !signer"
      >
        {{ isDecrypting ? 'Decrypting...' : 'Decrypt' }}
      </button>
    </form>

    <div v-if="error" class="error">
      Error: {{ error.message }}
    </div>

    <div v-if="decryptedValue !== null" class="success">
      <h3>Decrypted Value:</h3>
      <p class="decrypted-value">{{ decryptedValue }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useFhevmClient } from '@/composables/useFhevmClient';
import { useDecrypt } from '@/composables/useDecrypt';
import { useAccount, useWalletClient } from '@wagmi/vue';
import { BrowserProvider } from 'ethers';

const CONTRACT_ADDRESS = '0x78257622318fC85f2a9c909DD7aF9d0142cd90ce';

const { address } = useAccount();
const { data: walletClient } = useWalletClient();

const { client, isReady } = useFhevmClient({
  provider: window.ethereum,
  chainId: 11155111,
});

const { decrypt, isDecrypting, error, decryptedValue } = useDecrypt(client);

const handle = ref('');

// Get signer from wallet client
const signer = computed(() => {
  if (!walletClient.value) return null;
  const provider = new BrowserProvider(walletClient.value);
  return provider.getSigner();
});

const handleDecrypt = async () => {
  if (!address.value || !signer.value) {
    alert('Please connect your wallet first');
    return;
  }

  await decrypt(handle.value, {
    contractAddress: CONTRACT_ADDRESS,
    userAddress: address.value,
    signer: await signer.value,
  });
};
</script>

<style scoped>
.decryption-demo {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
}

button {
  background: #2196F3;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  background: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.success {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.decrypted-value {
  font-size: 24px;
  font-weight: bold;
  font-family: monospace;
}
</style>
```

## Best Practices

### 1. Reactive Client Management

```typescript
// Store client in reactive ref
const { client, isReady } = useFhevmClient(config);

// Use computed for derived state
const canEncrypt = computed(() => isReady.value && client.value !== null);
```

### 2. Error Handling

```vue
<template>
  <div>
    <div v-if="error" class="error-banner">
      <p>{{ error.message }}</p>
      <button @click="reset">Dismiss</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { encrypt, error, reset } = useEncrypt(client);
</script>
```

### 3. Loading States

```vue
<template>
  <button :disabled="isEncrypting || !isReady">
    <span v-if="isEncrypting">
      <LoadingSpinner /> Encrypting...
    </span>
    <span v-else>Encrypt Value</span>
  </button>
</template>
```

### 4. Cleanup

```typescript
import { onUnmounted } from 'vue';

const { reset } = useEncrypt(client);

onUnmounted(() => {
  reset();
});
```

### 5. Type Safety

```typescript
import type { EncryptedType } from '@fhevm/sdk';

const encryptionType = ref<EncryptedType>('euint32');

// TypeScript will enforce correct types
await encrypt(42, encryptionType.value, options); // ✅
```

## Performance Tips

1. **Memoize client creation** - Use `computed` for expensive operations
2. **Lazy initialization** - Only init when component is mounted
3. **Debounce inputs** - Don't encrypt on every input change
4. **Cache encrypted values** - Store in reactive refs
5. **Use v-once** - For static content

## Complete Example App

```typescript
// main.ts
import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);
app.mount('#app');
```

```vue
<!-- App.vue -->
<template>
  <div id="app">
    <header>
      <h1>FHEVM SDK Demo</h1>
      <WalletConnect />
    </header>

    <main>
      <EncryptionDemo v-if="isConnected" />
      <DecryptionDemo v-if="isConnected" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAccount } from '@wagmi/vue';
import EncryptionDemo from './components/EncryptionDemo.vue';
import DecryptionDemo from './components/DecryptionDemo.vue';
import WalletConnect from './components/WalletConnect.vue';

const { isConnected } = useAccount();
</script>
```

---

For more information:
- [Getting Started](../getting-started.md)
- [API Reference](../api-reference.md)
- [Examples](../examples.md)
