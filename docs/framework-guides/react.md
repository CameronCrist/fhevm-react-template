# ⚛️ React Integration Guide

Complete guide for integrating the Universal FHEVM SDK with React applications.

## Installation

```bash
npm install @fhevm/sdk react
```

## Setup

### 1. Create FHEVM Client Provider

```typescript
// providers/FhevmProvider.tsx
import { createFhevmClient } from '@fhevm/sdk';
import type { FhevmClient } from '@fhevm/sdk';
import { createContext, useContext, useMemo, useEffect } from 'react';
import { useWalletClient } from 'wagmi';

const FhevmClientContext = createContext<FhevmClient | null>(null);

export function FhevmProvider({ children }: { children: React.ReactNode }) {
  const { data: walletClient } = useWalletClient();

  const client = useMemo(() => {
    if (!walletClient) return null;

    return createFhevmClient({
      provider: walletClient as any,
      chainId: 11155111, // Sepolia
      gatewayUrl: 'https://gateway.sepolia.zama.ai',
    });
  }, [walletClient]);

  useEffect(() => {
    if (client) {
      client.init().catch(console.error);
    }
  }, [client]);

  return (
    <FhevmClientContext.Provider value={client}>
      {children}
    </FhevmClientContext.Provider>
  );
}

export function useFhevmClient() {
  const context = useContext(FhevmClientContext);
  if (!context) {
    throw new Error('useFhevmClient must be used within FhevmProvider');
  }
  return context;
}
```

### 2. Wrap Your App

```typescript
// App.tsx
import { FhevmProvider } from './providers/FhevmProvider';

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <FhevmProvider>
            <YourApp />
          </FhevmProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

## Encryption Hook

### Basic Usage

```typescript
import { useEncrypt } from '@fhevm/sdk/react';
import { useFhevmClient } from './providers/FhevmProvider';

function EncryptionComponent() {
  const client = useFhevmClient();
  const { encrypt, isEncrypting, error, encryptedData } = useEncrypt(client);

  const handleEncrypt = async () => {
    await encrypt(42, 'euint32', {
      contractAddress: CONTRACT_ADDRESS,
      userAddress: address!,
    });
  };

  return (
    <div>
      <button onClick={handleEncrypt} disabled={isEncrypting}>
        {isEncrypting ? 'Encrypting...' : 'Encrypt Value'}
      </button>

      {error && (
        <div className="error">
          Error: {error.message}
        </div>
      )}

      {encryptedData && (
        <div className="success">
          Encrypted! Handle: {encryptedData.handles[0]}
        </div>
      )}
    </div>
  );
}
```

### With Form

```typescript
function EncryptedForm() {
  const client = useFhevmClient();
  const { encrypt, isEncrypting, encryptedData } = useEncrypt(client);
  const [value, setValue] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const encrypted = await encrypt(Number(value), 'euint32', {
      contractAddress: CONTRACT_ADDRESS,
      userAddress: address!,
    });

    if (encrypted) {
      // Call contract with encrypted data
      await contract.submitValue(
        encrypted.handles[0],
        encrypted.inputProof
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter value"
      />
      <button type="submit" disabled={isEncrypting}>
        Submit
      </button>
    </form>
  );
}
```

## Decryption Hook

### Basic Usage

```typescript
import { useDecrypt } from '@fhevm/sdk/react';

function DecryptionComponent({ handle }: { handle: string }) {
  const client = useFhevmClient();
  const { decrypt, isDecrypting, decryptedValue } = useDecrypt(client);
  const { data: signer } = useSigner();

  const handleDecrypt = async () => {
    if (!signer) return;

    await decrypt(handle, {
      contractAddress: CONTRACT_ADDRESS,
      userAddress: address!,
      signer,
    });
  };

  return (
    <div>
      <button onClick={handleDecrypt} disabled={isDecrypting}>
        {isDecrypting ? 'Decrypting...' : 'Decrypt Value'}
      </button>

      {decryptedValue !== null && (
        <div>Decrypted Value: {decryptedValue}</div>
      )}
    </div>
  );
}
```

### Auto-Decrypt on Mount

```typescript
function AutoDecrypt({ handle }: { handle: string }) {
  const client = useFhevmClient();
  const { decrypt, isDecrypting, decryptedValue } = useDecrypt(client);
  const { data: signer } = useSigner();

  useEffect(() => {
    if (handle && signer && client) {
      decrypt(handle, {
        contractAddress: CONTRACT_ADDRESS,
        userAddress: address!,
        signer,
      });
    }
  }, [handle, signer, client]);

  if (isDecrypting) return <div>Decrypting...</div>;
  if (decryptedValue === null) return <div>No data</div>;

  return <div>Value: {decryptedValue}</div>;
}
```

## Contract Integration

### With wagmi

```typescript
import { useContractWrite, useWaitForTransactionReceipt } from 'wagmi';
import { useEncrypt } from '@fhevm/sdk/react';

function ContractInteraction() {
  const client = useFhevmClient();
  const { encrypt, isEncrypting, encryptedData } = useEncrypt(client);

  const { writeContract, data: hash } = useContractWrite();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const handleSubmit = async (value: number) => {
    // Step 1: Encrypt
    const encrypted = await encrypt(value, 'euint32', {
      contractAddress: CONTRACT_ADDRESS,
      userAddress: address!,
    });

    if (!encrypted) return;

    // Step 2: Call contract
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'submitValue',
      args: [encrypted.handles[0], encrypted.inputProof],
    });
  };

  return (
    <button
      onClick={() => handleSubmit(42)}
      disabled={isEncrypting || isConfirming}
    >
      {isEncrypting ? 'Encrypting...' :
       isConfirming ? 'Confirming...' :
       'Submit'}
    </button>
  );
}
```

## Error Handling

### With Error Boundary

```typescript
function EncryptionWithErrorBoundary() {
  const client = useFhevmClient();
  const { encrypt, isEncrypting, error, reset } = useEncrypt(client);

  useEffect(() => {
    if (error) {
      // Log error
      console.error('Encryption failed:', error);

      // Optionally reset after showing error
      setTimeout(reset, 3000);
    }
  }, [error]);

  return (
    <div>
      <button onClick={() => encrypt(42, 'euint32', options)}>
        Encrypt
      </button>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error.message}
          <button onClick={reset}>Dismiss</button>
        </div>
      )}
    </div>
  );
}
```

## Advanced Patterns

### Batch Encryption

```typescript
function BatchEncryption() {
  const client = useFhevmClient();
  const [values, setValues] = useState<number[]>([]);
  const [encryptedValues, setEncryptedValues] = useState<EncryptedInput[]>([]);
  const [isEncrypting, setIsEncrypting] = useState(false);

  const encryptAll = async () => {
    setIsEncrypting(true);

    try {
      const results = await Promise.all(
        values.map(value =>
          client.encrypt(value, 'euint32', {
            contractAddress: CONTRACT_ADDRESS,
            userAddress: address!,
          })
        )
      );

      setEncryptedValues(results);
    } catch (error) {
      console.error(error);
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div>
      <button onClick={encryptAll} disabled={isEncrypting}>
        Encrypt All
      </button>
    </div>
  );
}
```

### Custom Hook

```typescript
function useEncryptedValue(initialValue: number) {
  const client = useFhevmClient();
  const { address } = useAccount();
  const [encrypted, setEncrypted] = useState<EncryptedInput | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);

  const encrypt = useCallback(async (value: number) => {
    if (!client || !address) return;

    setIsEncrypting(true);

    try {
      const result = await client.encrypt(value, 'euint32', {
        contractAddress: CONTRACT_ADDRESS,
        userAddress: address,
      });

      setEncrypted(result);
      return result;
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      setIsEncrypting(false);
    }
  }, [client, address]);

  useEffect(() => {
    encrypt(initialValue);
  }, [initialValue]);

  return { encrypted, encrypt, isEncrypting };
}
```

## Best Practices

### 1. Memoize Client Creation

```typescript
const client = useMemo(() => createFhevmClient({ ... }), [provider]);
```

### 2. Initialize Once

```typescript
useEffect(() => {
  if (client && !client.isReady()) {
    client.init();
  }
}, [client]);
```

### 3. Handle Loading States

```typescript
{isEncrypting && <Spinner />}
{!isEncrypting && <Button />}
```

### 4. Cleanup on Unmount

```typescript
useEffect(() => {
  return () => {
    reset();
  };
}, []);
```

### 5. Type Safety

```typescript
const { encrypt } = useEncrypt(client);

// TypeScript will enforce correct types
encrypt(42, 'euint32', options); // ✅
encrypt('42', 'euint32', options); // ❌ Type error
```

## Performance Tips

1. **Memoize providers** - Use `useMemo` for client creation
2. **Lazy initialize** - Only init when needed
3. **Debounce inputs** - Don't encrypt on every keystroke
4. **Cache encrypted values** - Store in state to avoid re-encryption
5. **Use React.lazy** - Code-split encryption components

---

For more examples:
- [Getting Started](../getting-started.md)
- [API Reference](../api-reference.md)
- [Parking Reservation Example](../../examples/parking-reservation/README.md)
