# ⚡ Quick Start Guide - Universal FHEVM SDK

Get started with confidential smart contracts in under 5 minutes!

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Basic Setup](#basic-setup)
- [First Encryption](#first-encryption)
- [First Decryption](#first-decryption)
- [Framework Examples](#framework-examples)
- [Next Steps](#next-steps)

---

## ✅ Prerequisites

Before you begin, ensure you have:

```bash
✅ Node.js >= 18.0.0
✅ npm or yarn
✅ MetaMask or compatible wallet
✅ Sepolia testnet ETH (for transactions)
```

**Check your Node.js version:**
```bash
node --version
# Should show v18.0.0 or higher
```

**Get Sepolia ETH:**
- [Sepolia Faucet 1](https://sepoliafaucet.com/)
- [Sepolia Faucet 2](https://www.infura.io/faucet/sepolia)

---

## 📦 Installation

### Option 1: Use Example Projects (Recommended)

Clone the repository with all examples:

```bash
# Clone repository
git clone https://github.com/CameronCrist/fhevm-react-template.git
cd fhevm-react-template

# Install dependencies
npm install

# Choose an example to run
cd examples/parking-reservation  # Next.js + React
# or
cd examples/vue-voting-app       # Vue 3
# or
cd examples/nodejs-api-server    # Node.js API
```

### Option 2: Install SDK Only

For new projects, install just the SDK:

```bash
npm install @fhevm/sdk ethers viem
```

---

## 🚀 Basic Setup

### 1. Create FHEVM Client

The first step is creating an FHEVM client. This is framework-agnostic:

```typescript
import { createFhevmClient } from '@fhevm/sdk';
import { BrowserProvider } from 'ethers';

// Get provider from wallet
const provider = new BrowserProvider(window.ethereum);

// Create FHEVM client
const client = createFhevmClient({
  provider,
  chainId: 11155111, // Sepolia testnet
  gatewayUrl: 'https://gateway.sepolia.zama.ai',
});

// Initialize client (required before use)
await client.init();

console.log('✅ FHEVM Client ready!');
```

### 2. Environment Variables

Create `.env.local` (Next.js/React) or `.env` (Node.js):

```env
# Network
NEXT_PUBLIC_CHAIN_ID=11155111

# FHEVM Gateway
NEXT_PUBLIC_GATEWAY_URL=https://gateway.sepolia.zama.ai

# Your deployed contract
NEXT_PUBLIC_CONTRACT_ADDRESS=0x78257622318fC85f2a9c909DD7aF9d0142cd90ce

# WalletConnect (optional)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

---

## 🔐 First Encryption

### Simple Encryption Example

Encrypt a number before sending to a smart contract:

```typescript
import { createFhevmClient } from '@fhevm/sdk';

// Assume client is already initialized
const client = createFhevmClient({ ... });
await client.init();

// Encrypt a value
const encrypted = await client.encrypt(
  42,           // Value to encrypt
  'euint32',    // Encryption type
  {
    contractAddress: '0x78257622318fC85f2a9c909DD7aF9d0142cd90ce',
    userAddress: '0xYourWalletAddress',
  }
);

console.log('Encrypted handle:', encrypted.handles[0]);
console.log('Input proof:', encrypted.inputProof);

// Use in contract call
await contract.submitValue(
  encrypted.handles[0],
  encrypted.inputProof
);
```

### Supported Types

| Type | Range | Use Case |
|------|-------|----------|
| `euint8` | 0-255 | Small integers, vote choices |
| `euint16` | 0-65,535 | Medium integers, scores |
| `euint32` | 0-4,294,967,295 | Large integers, IDs |
| `euint64` | 0-2^64-1 | Very large numbers, wei amounts |
| `ebool` | true/false | Boolean values |
| `eaddress` | Ethereum address | Addresses |

### Encryption Workflow

```
User Input (42)
      ↓
  encrypt()
      ↓
Encrypted Handle (0x...)
      ↓
Submit to Contract
      ↓
On-chain Storage
```

---

## 🔓 First Decryption

### Simple Decryption Example

Decrypt a value from a smart contract:

```typescript
import { createFhevmClient } from '@fhevm/sdk';

// Get encrypted handle from contract
const encryptedHandle = await contract.getEncryptedValue();

// Decrypt (requires EIP-712 signature)
const decrypted = await client.decrypt(
  encryptedHandle,
  {
    contractAddress: '0x78257622318fC85f2a9c909DD7aF9d0142cd90ce',
    userAddress: '0xYourWalletAddress',
    signer: signer, // ethers Signer for EIP-712 signature
  }
);

console.log('Decrypted value:', decrypted); // 42
```

### Decryption Workflow

```
Encrypted Handle (0x...)
      ↓
Request Decryption
      ↓
Sign EIP-712 Permission
      ↓
Gateway Decrypts
      ↓
Plaintext Value (42)
```

---

## 🎯 Framework Examples

### React Hook

```typescript
'use client';

import { useMemo, useState } from 'react';
import { createFhevmClient } from '@fhevm/sdk';
import { useEncrypt } from '@fhevm/sdk/react';
import { useAccount, useWalletClient } from 'wagmi';

export function EncryptionDemo() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [value, setValue] = useState(42);

  // Create client
  const client = useMemo(() => {
    if (!walletClient) return null;
    return createFhevmClient({
      provider: walletClient,
      chainId: 11155111,
    });
  }, [walletClient]);

  // Use encryption hook
  const { encrypt, isEncrypting, encryptedData } = useEncrypt(client);

  const handleEncrypt = async () => {
    if (!address) return;

    await encrypt(value, 'euint32', {
      contractAddress: CONTRACT_ADDRESS,
      userAddress: address,
    });
  };

  return (
    <div>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
      />
      <button onClick={handleEncrypt} disabled={isEncrypting}>
        {isEncrypting ? 'Encrypting...' : 'Encrypt'}
      </button>
      {encryptedData && (
        <p>✅ Encrypted: {encryptedData.handles[0]}</p>
      )}
    </div>
  );
}
```

### Vue Composable

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { createFhevmClient } from '@fhevm/sdk';
import { useEncrypt } from '@fhevm/sdk/vue';

const value = ref(42);
const address = ref('0xYourAddress');

// Create client
const fhevmClient = ref(createFhevmClient({
  provider: window.ethereum,
  chainId: 11155111,
}));

// Use encryption composable
const { encrypt, isEncrypting, encryptedData } = useEncrypt(fhevmClient);

async function handleEncrypt() {
  await encrypt(value.value, 'euint32', {
    contractAddress: CONTRACT_ADDRESS,
    userAddress: address.value,
  });
}
</script>

<template>
  <div>
    <input v-model.number="value" type="number" />
    <button @click="handleEncrypt" :disabled="isEncrypting">
      {{ isEncrypting ? 'Encrypting...' : 'Encrypt' }}
    </button>
    <p v-if="encryptedData">
      ✅ Encrypted: {{ encryptedData.handles[0] }}
    </p>
  </div>
</template>
```

### Node.js Server

```typescript
import { createFhevmClient } from '@fhevm/sdk';
import { JsonRpcProvider, Wallet } from 'ethers';
import express from 'express';

const app = express();
app.use(express.json());

// Initialize FHEVM client
const provider = new JsonRpcProvider(process.env.RPC_URL);
const wallet = new Wallet(process.env.PRIVATE_KEY!, provider);

const client = createFhevmClient({
  provider,
  chainId: 11155111,
});

await client.init();

// Encryption endpoint
app.post('/api/encrypt', async (req, res) => {
  const { value, type, contractAddress } = req.body;

  try {
    const encrypted = await client.encrypt(value, type, {
      contractAddress,
      userAddress: wallet.address,
    });

    res.json({
      success: true,
      data: encrypted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

---

## 🏃 Running Examples

### Next.js Parking Reservation

```bash
cd examples/parking-reservation
npm install
npm run dev
```

Visit `http://localhost:3000`

**Features:**
- User registration with encrypted credit scores
- Parking spot management with encrypted prices
- Reservation system with encrypted durations
- Complete decryption demo

### Vue Voting App

```bash
cd examples/vue-voting-app
npm install
npm run dev
```

Visit `http://localhost:5173`

**Features:**
- Create proposals
- Vote anonymously with encrypted votes
- View encrypted vote counts
- Real-time updates

### Node.js API Server

```bash
cd examples/nodejs-api-server
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

API available at `http://localhost:3000`

**Endpoints:**
```bash
# Health check
curl http://localhost:3000/api/health

# Encrypt a value
curl -X POST http://localhost:3000/api/encrypt \
  -H "Content-Type: application/json" \
  -d '{
    "value": 42,
    "type": "euint32",
    "contractAddress": "0x..."
  }'

# Decrypt a handle
curl -X POST http://localhost:3000/api/decrypt \
  -H "Content-Type: application/json" \
  -d '{
    "handle": "0x...",
    "contractAddress": "0x..."
  }'
```

**CLI Tool:**
```bash
# Encrypt
npm run cli encrypt -- -v 42 -t euint32 -c 0x...

# Decrypt
npm run cli decrypt -- -h 0x... -c 0x...
```

---

## 🎓 Next Steps

### Learn More

1. **Read Documentation**
   - [Framework Summary](./FRAMEWORK_SUMMARY.md)
   - [API Reference](./docs/api-reference.md)
   - [Framework Guides](./docs/framework-guides/)

2. **Explore Examples**
   - [Parking Reservation](./examples/parking-reservation/)
   - [Vue Voting App](./examples/vue-voting-app/)
   - [Node.js API Server](./examples/nodejs-api-server/)

3. **Deploy Your App**
   - [Deployment Guide](./DEPLOYMENT.md)
   - [Production Checklist](./DEPLOYMENT.md#production-checklist)

### Build Your First App

#### Option 1: Extend an Example

```bash
# Copy parking reservation example
cp -r examples/parking-reservation my-app
cd my-app

# Customize for your use case
# 1. Update contract address
# 2. Modify components
# 3. Add your business logic
```

#### Option 2: Start Fresh

```bash
# Create new Next.js app
npx create-next-app@latest my-fhevm-app --typescript --tailwind --app

cd my-fhevm-app

# Install FHEVM SDK
npm install @fhevm/sdk ethers viem

# Follow the setup guide above
```

### Common Use Cases

1. **Confidential Voting**
   - Encrypt vote choices
   - Tally without revealing individual votes
   - Example: [Vue Voting App](./examples/vue-voting-app/)

2. **Private Auctions**
   - Encrypt bid amounts
   - Find winner without revealing losing bids
   - Example: Build on parking reservation

3. **Encrypted Identity**
   - Encrypt personal data
   - Verify without revealing details
   - Example: Credit score in parking app

4. **Secure Transactions**
   - Encrypt transaction amounts
   - Process privately on-chain
   - Example: Node.js API for backend

---

## 🆘 Troubleshooting

### Common Issues

**Client won't initialize**
```typescript
// Make sure to await init()
await client.init();

// Check provider is connected
console.log(await provider.getNetwork());
```

**Encryption fails**
```typescript
// Ensure contract address is valid
const isValid = ethers.isAddress(contractAddress);

// Check value is within type range
// euint8: 0-255, euint16: 0-65535, etc.
```

**Decryption fails**
```typescript
// Ensure signer is provided
const { decrypt } = useDecrypt(client);

// Get signer from ethers
const signer = await provider.getSigner();

// Pass to decrypt
await decrypt(handle, { ..., signer });
```

### Getting Help

- **Documentation**: [Full Docs](./README.md)
- **Issues**: [GitHub Issues](https://github.com/CameronCrist/fhevm-react-template/issues)
- **Discussions**: [GitHub Discussions](https://github.com/CameronCrist/fhevm-react-template/discussions)

---

## 📚 Additional Resources

### External Links

- [Zama FHEVM Docs](https://docs.zama.ai/fhevm)
- [fhevmjs GitHub](https://github.com/zama-ai/fhevmjs)
- [FHEVM Solidity](https://github.com/zama-ai/fhevm)
- [Zama Discord](https://discord.fhevm.io)

### Video Tutorials

- [Demo Video](./demo.mp4) - Complete walkthrough
- [Live Demo](https://arking-reservation.vercel.app/) - Try it yourself

---

## ✅ You're Ready!

You now know how to:
- ✅ Install and set up the FHEVM SDK
- ✅ Encrypt values for smart contracts
- ✅ Decrypt values with permissions
- ✅ Use the SDK in React, Vue, and Node.js
- ✅ Run the example applications

**Start building confidential dApps today!** 🚀

---

**Built with ❤️ for the Zama FHE Challenge**
