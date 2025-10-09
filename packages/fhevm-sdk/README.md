# @fhevm/sdk

**Universal FHEVM SDK** - Framework-agnostic encryption SDK for confidential smart contracts powered by Zama's FHEVM.

[![NPM Version](https://img.shields.io/npm/v/@fhevm/sdk.svg)](https://www.npmjs.com/package/@fhevm/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- 🎯 **Framework-Agnostic** - Works with Node.js, Next.js, React, Vue, or any JavaScript environment
- 📦 **All-in-One** - Single package wrapping all required dependencies
- 🪝 **wagmi-like API** - Intuitive hooks for React and Vue developers
- 🔐 **Type-Safe** - Full TypeScript support with comprehensive type definitions
- ⚡ **Fast Setup** - Get started in less than 10 lines of code
- 🛡️ **Battle-Tested** - Following Zama's official SDK patterns

## 🚀 Quick Start

### Installation

```bash
npm install @fhevm/sdk
# or
yarn add @fhevm/sdk
# or
pnpm add @fhevm/sdk
```

### Basic Usage (Framework-Agnostic)

```typescript
import { createFhevmClient, encrypt, decrypt } from '@fhevm/sdk';
import { BrowserProvider } from 'ethers';

// 1. Create client
const provider = new BrowserProvider(window.ethereum);
const client = createFhevmClient({
  provider,
  chainId: 11155111, // Sepolia
});

// 2. Initialize
await client.init();

// 3. Encrypt
const encrypted = await encrypt(client, 42, 'euint32', {
  contractAddress: '0x...',
  userAddress: '0x...',
});

// 4. Use in contract call
await contract.submitValue(encrypted.handles[0], encrypted.inputProof);

// 5. Decrypt
const signer = await provider.getSigner();
const decrypted = await decrypt(client, handle, {
  contractAddress: '0x...',
  userAddress: '0x...',
  signer,
});
```

### React Usage

```typescript
import { createFhevmClient } from '@fhevm/sdk';
import { useEncrypt, useDecrypt, useFhevmClient } from '@fhevm/sdk/react';
import { useMemo } from 'react';

function MyComponent() {
  // 1. Create client
  const client = useMemo(() => createFhevmClient({
    provider,
    chainId: 11155111,
  }), [provider]);

  // 2. Initialize client
  const { isReady } = useFhevmClient(client);

  // 3. Use encryption hook
  const { encrypt, isEncrypting, encryptedData } = useEncrypt(client);

  // 4. Encrypt value
  const handleEncrypt = async () => {
    await encrypt(42, 'euint32', {
      contractAddress: '0x...',
      userAddress: address!,
    });
  };

  return (
    <div>
      <button onClick={handleEncrypt} disabled={!isReady || isEncrypting}>
        {isEncrypting ? 'Encrypting...' : 'Encrypt Value'}
      </button>
      {encryptedData && <p>Encrypted: {encryptedData.handles[0]}</p>}
    </div>
  );
}
```

### Vue Usage

```typescript
import { createFhevmClient } from '@fhevm/sdk';
import { useEncrypt, useDecrypt, useFhevmClient } from '@fhevm/sdk/vue';
import { ref } from 'vue';

export default {
  setup() {
    // 1. Create client
    const client = ref(createFhevmClient({
      provider,
      chainId: 11155111,
    }));

    // 2. Initialize client
    const { isReady } = useFhevmClient(client);

    // 3. Use encryption composable
    const { encrypt, isEncrypting, encryptedData } = useEncrypt(client);

    // 4. Encrypt value
    const handleEncrypt = async () => {
      await encrypt(42, 'euint32', {
        contractAddress: '0x...',
        userAddress: address.value!,
      });
    };

    return {
      isReady,
      isEncrypting,
      encryptedData,
      handleEncrypt,
    };
  },
};
```

## 📚 API Reference

### Client

#### `createFhevmClient(config: FhevmConfig): FhevmClient`

Create a new FHEVM client instance.

```typescript
const client = createFhevmClient({
  provider: browserProvider,
  chainId: 11155111,
  publicKeyEndpoint: '/fhe-public-key', // optional
  gatewayUrl: 'https://gateway.sepolia.zama.ai', // optional
  aclAddress: '0x...', // optional
});
```

#### `client.init(): Promise<void>`

Initialize the FHEVM client. Must be called before encryption/decryption.

```typescript
await client.init();
```

#### `client.encrypt(value, type, options): Promise<EncryptedInput>`

Encrypt a value for smart contract input.

```typescript
const encrypted = await client.encrypt(42, 'euint32', {
  contractAddress: '0x...',
  userAddress: '0x...',
});
```

**Supported types:** `euint8`, `euint16`, `euint32`, `euint64`, `euint128`, `ebool`, `eaddress`

#### `client.decrypt(handle, options): Promise<number | boolean>`

Decrypt a value from smart contract.

```typescript
const decrypted = await client.decrypt(handle, {
  contractAddress: '0x...',
  userAddress: '0x...',
  signer: signer,
});
```

### Standalone Functions

#### `encrypt(client, value, type, options): Promise<EncryptedInput>`

Standalone encryption function.

#### `decrypt(client, handle, options): Promise<number | boolean>`

Standalone decryption function.

#### `batchEncrypt(client, values, options): Promise<EncryptedInput[]>`

Encrypt multiple values at once.

```typescript
const encrypted = await batchEncrypt(client, [
  { value: 42, type: 'euint32' },
  { value: true, type: 'ebool' },
], options);
```

### React Hooks

#### `useEncrypt(client): EncryptHook`

React hook for encryption.

**Returns:**
- `encrypt(value, type, options)` - Encryption function
- `isEncrypting` - Loading state
- `error` - Error state
- `encryptedData` - Encrypted result
- `reset()` - Reset state

#### `useDecrypt(client): DecryptHook`

React hook for decryption.

**Returns:**
- `decrypt(handle, options)` - Decryption function
- `isDecrypting` - Loading state
- `error` - Error state
- `decryptedValue` - Decrypted result
- `reset()` - Reset state

#### `useFhevmClient(client): ClientHook`

React hook for client initialization.

**Returns:**
- `client` - FHEVM client instance
- `isReady` - Initialization status
- `error` - Error state

### Vue Composables

#### `useEncrypt(client): EncryptComposable`

Vue composable for encryption (same API as React hook).

#### `useDecrypt(client): DecryptComposable`

Vue composable for decryption (same API as React hook).

#### `useFhevmClient(client): ClientComposable`

Vue composable for client initialization (same API as React hook).

### Utility Functions

```typescript
import {
  isValidEncryptedType,
  getMaxValueForType,
  validateValueForType,
  formatHandle,
  retry,
} from '@fhevm/sdk';
```

## 🎯 Examples

### Complete React Example

```typescript
import { createFhevmClient } from '@fhevm/sdk';
import { useEncrypt } from '@fhevm/sdk/react';
import { BrowserProvider } from 'ethers';
import { useMemo, useEffect } from 'react';

function VotingApp() {
  const provider = useMemo(() =>
    new BrowserProvider(window.ethereum), []
  );

  const client = useMemo(() => createFhevmClient({
    provider,
    chainId: 11155111,
  }), [provider]);

  useEffect(() => {
    client.init();
  }, [client]);

  const { encrypt, isEncrypting, encryptedData, error } = useEncrypt(client);

  const submitVote = async (vote: number) => {
    const encrypted = await encrypt(vote, 'euint8', {
      contractAddress: VOTING_CONTRACT_ADDRESS,
      userAddress: await (await provider.getSigner()).getAddress(),
    });

    if (encrypted) {
      // Call contract with encrypted vote
      await votingContract.submitVote(
        encrypted.handles[0],
        encrypted.inputProof
      );
    }
  };

  return (
    <div>
      <h1>Confidential Voting</h1>
      <button onClick={() => submitVote(1)} disabled={isEncrypting}>
        Vote Yes
      </button>
      <button onClick={() => submitVote(0)} disabled={isEncrypting}>
        Vote No
      </button>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

### Node.js Example

```typescript
import { createFhevmClient, encrypt } from '@fhevm/sdk';
import { JsonRpcProvider } from 'ethers';

const provider = new JsonRpcProvider('https://sepolia.infura.io/v3/...');

const client = createFhevmClient({
  provider,
  chainId: 11155111,
});

await client.init();

const encrypted = await encrypt(client, 42, 'euint32', {
  contractAddress: '0x...',
  userAddress: '0x...',
});

console.log('Encrypted:', encrypted);
```

## 🔧 Configuration

### Network Configuration

```typescript
// Sepolia Testnet
const client = createFhevmClient({
  provider,
  chainId: 11155111,
  gatewayUrl: 'https://gateway.sepolia.zama.ai',
});

// Custom Network
const client = createFhevmClient({
  provider,
  chainId: YOUR_CHAIN_ID,
  publicKeyEndpoint: 'https://your-node.com/fhe-public-key',
  gatewayUrl: 'https://your-gateway.com',
  aclAddress: '0x...', // ACL contract address
});
```

### TypeScript Configuration

Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

## 🛡️ Security Best Practices

1. **Never expose private keys** - Use secure wallet providers
2. **Validate inputs** - Always validate values before encryption
3. **Handle errors** - Implement proper error handling for encryption/decryption
4. **Use HTTPS** - Always use HTTPS for gateway communication
5. **Rate limiting** - Implement rate limiting for production apps

## 📖 Documentation

- [Full Documentation](https://docs.example.com)
- [API Reference](https://docs.example.com/api)
- [Examples Repository](https://github.com/yourusername/fhevm-sdk-examples)
- [Zama FHEVM Docs](https://docs.zama.ai/fhevm)

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](../../LICENSE) file for details.

## 🔗 Links

- **GitHub**: [fhevm-universal-sdk](https://github.com/yourusername/fhevm-universal-sdk)
- **NPM**: [@fhevm/sdk](https://www.npmjs.com/package/@fhevm/sdk)
- **Zama**: [zama.ai](https://www.zama.ai/)
- **FHEVM Docs**: [docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)

---

**Built for the Zama FHE Challenge** - Making confidential smart contracts accessible to all developers.
