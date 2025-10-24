# 📚 API Reference - Universal FHEVM SDK

Complete API documentation for @fhevm/sdk.

## Core Client

### `createFhevmClient(config: FhevmConfig): FhevmClient`

Creates a new FHEVM client instance.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `FhevmConfig` | Yes | Client configuration |

**FhevmConfig:**

```typescript
interface FhevmConfig {
  provider: BrowserProvider | JsonRpcProvider;
  chainId: number;
  publicKeyEndpoint?: string;
  gatewayUrl?: string;
  aclAddress?: string;
}
```

**Example:**

```typescript
import { createFhevmClient } from '@fhevm/sdk';

const client = createFhevmClient({
  provider: browserProvider,
  chainId: 11155111,
  gatewayUrl: 'https://gateway.sepolia.zama.ai',
});
```

**Returns:** `FhevmClient` instance

---

### `client.init(): Promise<void>`

Initializes the FHEVM client. Must be called before encryption/decryption.

**Example:**

```typescript
await client.init();
```

---

### `client.encrypt(value, type, options): Promise<EncryptedInput>`

Encrypts a value for smart contract input.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `value` | `number \| boolean` | Value to encrypt |
| `type` | `EncryptedType` | Encryption type |
| `options` | `EncryptionOptions` | Encryption options |

**EncryptedType:**

- `'euint8'` - 8-bit unsigned integer (0-255)
- `'euint16'` - 16-bit unsigned integer (0-65535)
- `'euint32'` - 32-bit unsigned integer
- `'euint64'` - 64-bit unsigned integer
- `'euint128'` - 128-bit unsigned integer
- `'ebool'` - Boolean
- `'eaddress'` - Ethereum address

**EncryptionOptions:**

```typescript
interface EncryptionOptions {
  contractAddress: string;
  userAddress: string;
}
```

**Example:**

```typescript
const encrypted = await client.encrypt(42, 'euint32', {
  contractAddress: '0x...',
  userAddress: '0x...',
});
```

**Returns:**

```typescript
interface EncryptedInput {
  handles: string[];
  inputProof: string;
}
```

---

### `client.decrypt(handle, options): Promise<number | boolean>`

Decrypts a value from smart contract storage.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `handle` | `string` | Encrypted handle |
| `options` | `DecryptionOptions` | Decryption options |

**DecryptionOptions:**

```typescript
interface DecryptionOptions {
  contractAddress: string;
  userAddress: string;
  signer: Signer;
}
```

**Example:**

```typescript
const value = await client.decrypt(handle, {
  contractAddress: '0x...',
  userAddress: '0x...',
  signer: signer,
});
```

**Returns:** Decrypted value (number or boolean)

---

### `client.isReady(): boolean`

Checks if client is initialized and ready.

**Example:**

```typescript
if (client.isReady()) {
  // Client is ready
}
```

**Returns:** `boolean`

---

### `client.getPublicKey(): string | null`

Gets the public encryption key.

**Example:**

```typescript
const publicKey = client.getPublicKey();
```

**Returns:** Public key string or null if not initialized

---

## Standalone Functions

### `encrypt(client, value, type, options): Promise<EncryptedInput>`

Standalone encryption function.

**Example:**

```typescript
import { encrypt } from '@fhevm/sdk';

const encrypted = await encrypt(client, 42, 'euint32', {
  contractAddress: '0x...',
  userAddress: '0x...',
});
```

---

### `decrypt(client, handle, options): Promise<number | boolean>`

Standalone decryption function.

**Example:**

```typescript
import { decrypt } from '@fhevm/sdk';

const value = await decrypt(client, handle, {
  contractAddress: '0x...',
  userAddress: '0x...',
  signer: signer,
});
```

---

### `batchEncrypt(client, values, options): Promise<EncryptedInput[]>`

Encrypts multiple values at once.

**Parameters:**

```typescript
interface BatchValue {
  value: number | boolean;
  type: EncryptedType;
}
```

**Example:**

```typescript
import { batchEncrypt } from '@fhevm/sdk';

const encrypted = await batchEncrypt(
  client,
  [
    { value: 42, type: 'euint32' },
    { value: true, type: 'ebool' },
  ],
  {
    contractAddress: '0x...',
    userAddress: '0x...',
  }
);
```

**Returns:** Array of `EncryptedInput`

---

## React Hooks

### `useEncrypt(client): EncryptHook`

React hook for encryption with automatic state management.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `client` | `FhevmClient \| null` | FHEVM client instance |

**Returns:**

```typescript
interface EncryptHook {
  encrypt: (value: number | boolean, type: EncryptedType, options: EncryptionOptions) => Promise<EncryptedInput | null>;
  isEncrypting: boolean;
  error: Error | null;
  encryptedData: EncryptedInput | null;
  reset: () => void;
}
```

**Example:**

```typescript
import { useEncrypt } from '@fhevm/sdk/react';

function MyComponent() {
  const { encrypt, isEncrypting, error, encryptedData } = useEncrypt(client);

  const handleClick = async () => {
    await encrypt(42, 'euint32', { contractAddress, userAddress });
  };

  return (
    <div>
      <button onClick={handleClick} disabled={isEncrypting}>
        {isEncrypting ? 'Encrypting...' : 'Encrypt'}
      </button>
      {error && <p>Error: {error.message}</p>}
      {encryptedData && <p>Encrypted!</p>}
    </div>
  );
}
```

---

### `useDecrypt(client): DecryptHook`

React hook for decryption with automatic state management.

**Returns:**

```typescript
interface DecryptHook {
  decrypt: (handle: string, options: DecryptionOptions) => Promise<number | boolean | null>;
  isDecrypting: boolean;
  error: Error | null;
  decryptedValue: number | boolean | null;
  reset: () => void;
}
```

**Example:**

```typescript
import { useDecrypt } from '@fhevm/sdk/react';

function MyComponent() {
  const { decrypt, isDecrypting, decryptedValue } = useDecrypt(client);

  const handleDecrypt = async () => {
    await decrypt(handle, { contractAddress, userAddress, signer });
  };

  return (
    <div>
      <button onClick={handleDecrypt} disabled={isDecrypting}>
        Decrypt
      </button>
      {decryptedValue !== null && <p>Value: {decryptedValue}</p>}
    </div>
  );
}
```

---

### `useFhevmClient(client): ClientHook`

React hook for client initialization.

**Returns:**

```typescript
interface ClientHook {
  client: FhevmClient | null;
  isReady: boolean;
  error: Error | null;
}
```

**Example:**

```typescript
import { useFhevmClient } from '@fhevm/sdk/react';

function MyApp() {
  const { client, isReady, error } = useFhevmClient(fhevmClient);

  if (!isReady) return <div>Initializing...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Ready!</div>;
}
```

---

## Vue Composables

### `useEncrypt(client): EncryptComposable`

Vue composable for encryption (same API as React hook).

**Example:**

```typescript
import { useEncrypt } from '@fhevm/sdk/vue';
import { ref } from 'vue';

export default {
  setup() {
    const client = ref(fhevmClient);
    const { encrypt, isEncrypting, encryptedData } = useEncrypt(client);

    return { encrypt, isEncrypting, encryptedData };
  },
};
```

---

### `useDecrypt(client): DecryptComposable`

Vue composable for decryption (same API as React hook).

---

### `useFhevmClient(client): ClientComposable`

Vue composable for client initialization (same API as React hook).

---

## Utility Functions

### `isValidEncryptedType(type: string): boolean`

Validates if a type is a valid encrypted type.

**Example:**

```typescript
import { isValidEncryptedType } from '@fhevm/sdk';

if (isValidEncryptedType('euint32')) {
  // Valid type
}
```

---

### `getMaxValueForType(type: EncryptedType): bigint`

Gets the maximum value for an encrypted type.

**Example:**

```typescript
import { getMaxValueForType } from '@fhevm/sdk';

const max = getMaxValueForType('euint8'); // 255n
```

---

### `validateValueForType(value, type): boolean`

Validates if a value is valid for a given type.

**Example:**

```typescript
import { validateValueForType } from '@fhevm/sdk';

const valid = validateValueForType(100, 'euint8'); // true
const invalid = validateValueForType(1000, 'euint8'); // false
```

---

### `formatHandle(handle: string): string`

Formats a handle for display (truncates middle).

**Example:**

```typescript
import { formatHandle } from '@fhevm/sdk';

const formatted = formatHandle('0x123456789abcdef');
// "0x1234...cdef"
```

---

### `retry(fn, options): Promise<T>`

Retries a function with exponential backoff.

**Options:**

```typescript
interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffFactor?: number;
}
```

**Example:**

```typescript
import { retry } from '@fhevm/sdk';

const result = await retry(
  () => client.init(),
  {
    maxAttempts: 3,
    delayMs: 1000,
    backoffFactor: 2,
  }
);
```

---

## Type Definitions

Complete TypeScript type definitions are available in the package.

```typescript
import type {
  FhevmConfig,
  FhevmClient,
  EncryptedType,
  EncryptedInput,
  EncryptionOptions,
  DecryptionOptions,
  EIP712Signature,
} from '@fhevm/sdk';
```

---

For more examples and guides, see:
- [Getting Started](./getting-started.md)
- [React Guide](./framework-guides/react.md)
- [Examples](./examples.md)
