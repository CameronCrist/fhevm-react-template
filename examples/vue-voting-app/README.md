# 🗳️ Vue Voting App - FHEVM SDK Example

A confidential voting application built with Vue 3 and the Universal FHEVM SDK.

## 🎯 Features

- 🔐 **Confidential Voting** - Votes are encrypted client-side before submission
- 🗳️ **Multiple Proposals** - Create and vote on different proposals
- 📊 **Anonymous Results** - Encrypted vote tallying
- ⚡ **Vue 3 Composition API** - Modern Vue development with composables
- 🎨 **Beautiful UI** - Responsive design with Tailwind CSS
- 🔄 **Real-time Updates** - Live vote count updates

## 🏗️ Architecture

```
Vue Voting App
├── Composables (FHEVM SDK Integration)
│   ├── useFhevmClient() - Client initialization
│   ├── useEncrypt() - Vote encryption
│   └── useDecrypt() - Result decryption
│
├── Components
│   ├── VotingCard - Vote submission
│   ├── ProposalList - Active proposals
│   ├── Results - Encrypted results
│   └── WalletConnect - Wallet integration
│
└── Smart Contract (Solidity)
    ├── Create proposals
    ├── Submit encrypted votes
    └── Tally results
```

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 18.0.0
Vue 3
MetaMask or compatible wallet
Sepolia testnet ETH
```

### Installation

```bash
# Navigate to example directory
cd examples/vue-voting-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Visit `http://localhost:5173`

## 📦 Project Structure

```
vue-voting-app/
├── src/
│   ├── components/
│   │   ├── VotingCard.vue
│   │   ├── ProposalList.vue
│   │   ├── Results.vue
│   │   └── WalletConnect.vue
│   ├── composables/
│   │   ├── useFhevmClient.ts
│   │   ├── useEncrypt.ts
│   │   └── useDecrypt.ts
│   ├── contracts/
│   │   ├── abi.ts
│   │   └── addresses.ts
│   ├── App.vue
│   └── main.ts
├── .env.example
├── package.json
├── vite.config.ts
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create `.env.local`:

```env
# Contract Address (deployed on Sepolia)
VITE_CONTRACT_ADDRESS=0x...

# Network Configuration
VITE_CHAIN_ID=11155111

# FHEVM Gateway
VITE_GATEWAY_URL=https://gateway.sepolia.zama.ai

# WalletConnect
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

## 💻 Usage

### 1. Connect Wallet

```vue
<template>
  <WalletConnect />
</template>
```

### 2. Create a Proposal

```vue
<script setup lang="ts">
const { createProposal } = useVotingContract();

async function handleCreate(title: string) {
  await createProposal(title);
}
</script>
```

### 3. Vote on a Proposal

```vue
<script setup lang="ts">
import { useEncrypt } from '@/composables/useEncrypt';

const { encrypt, isEncrypting } = useEncrypt(client);

async function vote(proposalId: number, choice: boolean) {
  // Encrypt vote (1 = Yes, 0 = No)
  const encrypted = await encrypt(choice ? 1 : 0, 'euint8', {
    contractAddress: CONTRACT_ADDRESS,
    userAddress: address,
  });

  // Submit encrypted vote
  await submitVote(proposalId, encrypted.handles[0], encrypted.inputProof);
}
</script>
```

### 4. View Results

```vue
<script setup lang="ts">
import { useDecrypt } from '@/composables/useDecrypt';

const { decrypt, decryptedValue } = useDecrypt(client);

async function viewResults(handle: string) {
  await decrypt(handle, {
    contractAddress: CONTRACT_ADDRESS,
    userAddress: address,
    signer: signer,
  });
}
</script>
```

## 📊 SDK Integration

### Client Setup

```typescript
// composables/useFhevmClient.ts
import { ref, computed, onMounted } from 'vue';
import { createFhevmClient } from '@fhevm/sdk';

export function useFhevmClient(config) {
  const client = ref(null);
  const isReady = ref(false);

  onMounted(async () => {
    const fhevmClient = createFhevmClient(config);
    await fhevmClient.init();
    client.value = fhevmClient;
    isReady.value = true;
  });

  return { client, isReady };
}
```

### Encryption Hook

```typescript
// composables/useEncrypt.ts
import { ref, computed } from 'vue';

export function useEncrypt(client) {
  const isEncrypting = ref(false);
  const error = ref(null);
  const encryptedData = ref(null);

  const encrypt = async (value, type, options) => {
    isEncrypting.value = true;
    try {
      const encrypted = await client.value.encrypt(value, type, options);
      encryptedData.value = encrypted;
      return encrypted;
    } catch (err) {
      error.value = err;
      return null;
    } finally {
      isEncrypting.value = false;
    }
  };

  return {
    encrypt,
    isEncrypting: computed(() => isEncrypting.value),
    error: computed(() => error.value),
    encryptedData: computed(() => encryptedData.value),
  };
}
```

## 🎨 Component Examples

### Voting Card Component

```vue
<template>
  <div class="voting-card">
    <h3>{{ proposal.title }}</h3>
    <p>{{ proposal.description }}</p>

    <div class="voting-buttons">
      <button @click="vote(true)" :disabled="isEncrypting">
        {{ isEncrypting ? 'Encrypting...' : 'Vote Yes' }}
      </button>
      <button @click="vote(false)" :disabled="isEncrypting">
        {{ isEncrypting ? 'Encrypting...' : 'Vote No' }}
      </button>
    </div>

    <div v-if="encryptedData" class="success">
      ✅ Vote encrypted and submitted!
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFhevmClient } from '@/composables/useFhevmClient';
import { useEncrypt } from '@/composables/useEncrypt';

const props = defineProps<{
  proposal: {
    id: number;
    title: string;
    description: string;
  };
}>();

const { client } = useFhevmClient({
  provider: window.ethereum,
  chainId: 11155111,
});

const { encrypt, isEncrypting, encryptedData } = useEncrypt(client);

async function vote(choice: boolean) {
  const encrypted = await encrypt(
    choice ? 1 : 0,
    'euint8',
    {
      contractAddress: CONTRACT_ADDRESS,
      userAddress: address.value,
    }
  );

  if (encrypted) {
    // Submit to contract
    await submitVote(props.proposal.id, encrypted.handles[0], encrypted.inputProof);
  }
}
</script>
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Type checking
npm run type-check
```

## 🚀 Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel --prod
```

## 🔗 Links

- **Documentation**: [Vue Integration Guide](../../docs/framework-guides/vue.md)
- **SDK API**: [API Reference](../../docs/api-reference.md)
- **Smart Contract**: [0x...](https://sepolia.etherscan.io/address/0x...)

## 📝 License

MIT License - see [LICENSE](../../LICENSE) file for details.

---

**Built with Vue 3 and Universal FHEVM SDK** 🎨🔐
