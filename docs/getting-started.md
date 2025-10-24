# 🚀 Getting Started with Universal FHEVM SDK

Welcome to the Universal FHEVM SDK! This guide will help you get up and running in minutes.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (or yarn/pnpm)
- **MetaMask** or compatible Web3 wallet
- **Sepolia testnet ETH** (for testing)

## Installation

### Quick Install

```bash
npm install @fhevm/sdk
```

That's it! The SDK includes all dependencies you need.

## Basic Usage

### 1. Create FHEVM Client

```typescript
import { createFhevmClient } from '@fhevm/sdk';
import { BrowserProvider } from 'ethers';

// Get provider from wallet
const provider = new BrowserProvider(window.ethereum);

// Create client
const client = createFhevmClient({
  provider,
  chainId: 11155111, // Sepolia
});

// Initialize
await client.init();
```

### 2. Encrypt a Value

```typescript
import { encrypt } from '@fhevm/sdk';

const encrypted = await encrypt(client, 42, 'euint32', {
  contractAddress: '0x...',
  userAddress: '0x...',
});

console.log(encrypted);
// {
//   handles: ['0x...'],
//   inputProof: '0x...'
// }
```

### 3. Use in Contract Call

```typescript
await contract.submitValue(
  encrypted.handles[0],
  encrypted.inputProof
);
```

## React Integration

### Setup Provider

```typescript
import { createFhevmClient } from '@fhevm/sdk';
import { useMemo, createContext } from 'react';
import { useWalletClient } from 'wagmi';

const FhevmClientContext = createContext(null);

export function FhevmProvider({ children }) {
  const { data: walletClient } = useWalletClient();

  const client = useMemo(() => {
    if (!walletClient) return null;

    const fhevmClient = createFhevmClient({
      provider: walletClient,
      chainId: 11155111,
    });

    fhevmClient.init();
    return fhevmClient;
  }, [walletClient]);

  return (
    <FhevmClientContext.Provider value={client}>
      {children}
    </FhevmClientContext.Provider>
  );
}
```

### Use Hooks

```typescript
import { useEncrypt } from '@fhevm/sdk/react';

function MyComponent() {
  const client = useContext(FhevmClientContext);
  const { encrypt, isEncrypting, encryptedData } = useEncrypt(client);

  const handleSubmit = async (value) => {
    await encrypt(value, 'euint32', {
      contractAddress: CONTRACT_ADDRESS,
      userAddress: address,
    });
  };

  return (
    <button onClick={() => handleSubmit(42)} disabled={isEncrypting}>
      {isEncrypting ? 'Encrypting...' : 'Submit'}
    </button>
  );
}
```

## Vue Integration

```typescript
import { useEncrypt } from '@fhevm/sdk/vue';
import { ref } from 'vue';

export default {
  setup() {
    const client = ref(createFhevmClient({ ... }));
    const { encrypt, isEncrypting } = useEncrypt(client);

    const handleSubmit = async (value) => {
      await encrypt(value, 'euint32', {
        contractAddress: CONTRACT_ADDRESS,
        userAddress: address.value,
      });
    };

    return { handleSubmit, isEncrypting };
  },
};
```

## Node.js Usage

```typescript
import { createFhevmClient, encrypt } from '@fhevm/sdk';
import { JsonRpcProvider } from 'ethers';

const provider = new JsonRpcProvider(process.env.RPC_URL);
const client = createFhevmClient({
  provider,
  chainId: 11155111,
});

await client.init();

const encrypted = await encrypt(client, secretValue, 'euint64', {
  contractAddress: CONTRACT_ADDRESS,
  userAddress: SERVICE_ADDRESS,
});
```

## Environment Setup

### Create .env File

```env
# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=11155111

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# FHEVM Gateway
NEXT_PUBLIC_GATEWAY_URL=https://gateway.sepolia.zama.ai
```

### Get Sepolia ETH

1. Visit [Sepolia Faucet](https://sepoliafaucet.com/)
2. Enter your wallet address
3. Receive testnet ETH

## Next Steps

- **[API Reference](./api-reference.md)** - Complete API documentation
- **[React Guide](./framework-guides/react.md)** - React integration details
- **[Examples](./examples.md)** - Real-world code examples
- **[Troubleshooting](./troubleshooting.md)** - Common issues

## Quick Links

- [Main README](../README.md)
- [SDK Package](../packages/fhevm-sdk/README.md)
- [Parking Reservation Example](../examples/parking-reservation/README.md)

---

**Ready to build confidential smart contracts!** 🎉
