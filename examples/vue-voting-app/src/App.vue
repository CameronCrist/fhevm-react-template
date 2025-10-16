<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <h1>🗳️ Confidential Voting</h1>
          <p>Powered by FHEVM SDK</p>
        </div>
        <WalletConnect
          @connected="handleWalletConnected"
          @disconnected="handleWalletDisconnected"
        />
      </div>
    </header>

    <main class="app-main">
      <div v-if="!isWalletConnected" class="connect-prompt">
        <h2>Connect Your Wallet</h2>
        <p>Please connect your wallet to participate in voting</p>
      </div>

      <div v-else-if="!fhevmClient" class="loading-state">
        <p>Initializing FHEVM Client...</p>
      </div>

      <ProposalList
        v-else
        :fhevm-client="fhevmClientRef"
        :contract-address="CONTRACT_ADDRESS"
        :user-address="userAddress"
        :is-wallet-connected="isWalletConnected"
        :contract="contract"
      />
    </main>

    <footer class="app-footer">
      <p>Built with Vue 3 and Universal FHEVM SDK</p>
      <p>Contract: {{ CONTRACT_ADDRESS.substring(0, 10) }}...</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Contract, BrowserProvider } from 'ethers';
import WalletConnect from './components/WalletConnect.vue';
import ProposalList from './components/ProposalList.vue';
import { useFhevmClient } from './composables/useFhevmClient';
import { CONTRACT_ADDRESS, CHAIN_ID } from './contracts/addresses';
import { VOTING_CONTRACT_ABI } from './contracts/abi';

const isWalletConnected = ref(false);
const userAddress = ref('');
const provider = ref<any>(null);
const contract = ref<any>(null);

// Initialize FHEVM client (will initialize when provider is set)
const fhevmClientConfig = ref({
  provider: null as any,
  chainId: CHAIN_ID,
});

const { client: fhevmClient, isReady: isFhevmReady } = useFhevmClient(fhevmClientConfig.value);

// Create a ref wrapper for the client to pass to child components
const fhevmClientRef = ref(fhevmClient);

watch(fhevmClient, (newClient) => {
  fhevmClientRef.value = newClient;
});

const handleWalletConnected = async (address: string, walletProvider: any) => {
  userAddress.value = address;
  isWalletConnected.value = true;

  // Create ethers provider
  const ethersProvider = new BrowserProvider(walletProvider);
  provider.value = ethersProvider;

  // Create contract instance
  const signer = await ethersProvider.getSigner();
  contract.value = new Contract(CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);

  // Update FHEVM client config
  fhevmClientConfig.value.provider = walletProvider;

  console.log('✅ Wallet connected:', address);
};

const handleWalletDisconnected = () => {
  isWalletConnected.value = false;
  userAddress.value = '';
  provider.value = null;
  contract.value = null;
  console.log('👋 Wallet disconnected');
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #f9fafb;
  color: #111827;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 20px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo h1 {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.logo p {
  font-size: 14px;
  color: #6b7280;
}

.app-main {
  flex: 1;
  padding: 40px 20px;
}

.connect-prompt,
.loading-state {
  text-align: center;
  padding: 80px 20px;
}

.connect-prompt h2 {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 12px;
}

.connect-prompt p {
  font-size: 18px;
  color: #6b7280;
}

.loading-state p {
  font-size: 18px;
  color: #6b7280;
}

.app-footer {
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 24px 0;
  text-align: center;
}

.app-footer p {
  font-size: 14px;
  color: #6b7280;
  margin: 4px 0;
}
</style>
