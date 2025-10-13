<template>
  <div class="wallet-connect">
    <button
      v-if="!isConnected"
      @click="connect"
      class="connect-button"
      :disabled="isConnecting"
    >
      {{ isConnecting ? 'Connecting...' : '🔌 Connect Wallet' }}
    </button>

    <div v-else class="wallet-info">
      <div class="address">
        {{ formatAddress(address) }}
      </div>
      <button @click="disconnect" class="disconnect-button">
        Disconnect
      </button>
    </div>

    <div v-if="error" class="error-message">
      ❌ {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isConnected = ref(false);
const isConnecting = ref(false);
const address = ref('');
const error = ref('');

const emit = defineEmits<{
  connected: [address: string, provider: any];
  disconnected: [];
}>();

const connect = async () => {
  if (!window.ethereum) {
    error.value = 'MetaMask not detected. Please install MetaMask.';
    return;
  }

  isConnecting.value = true;
  error.value = '';

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (accounts.length > 0) {
      address.value = accounts[0];
      isConnected.value = true;
      emit('connected', address.value, window.ethereum);
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to connect wallet';
    console.error('Wallet connection error:', err);
  } finally {
    isConnecting.value = false;
  }
};

const disconnect = () => {
  isConnected.value = false;
  address.value = '';
  emit('disconnected');
};

const formatAddress = (addr: string) => {
  if (!addr) return '';
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
};

// Check if already connected
onMounted(async () => {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      if (accounts.length > 0) {
        address.value = accounts[0];
        isConnected.value = true;
        emit('connected', address.value, window.ethereum);
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err);
    }

    // Listen for account changes
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length > 0) {
        address.value = accounts[0];
        isConnected.value = true;
        emit('connected', address.value, window.ethereum);
      } else {
        disconnect();
      }
    });
  }
});

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
</script>

<style scoped>
.wallet-connect {
  display: flex;
  align-items: center;
  gap: 12px;
}

.connect-button {
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.connect-button:hover:not(:disabled) {
  background: #2563eb;
}

.connect-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.wallet-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.address {
  padding: 8px 16px;
  background: #f3f4f6;
  border-radius: 8px;
  font-family: monospace;
  font-size: 14px;
  color: #111827;
}

.disconnect-button {
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.disconnect-button:hover {
  background: #dc2626;
}

.error-message {
  padding: 12px;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 8px;
  font-size: 14px;
}
</style>
