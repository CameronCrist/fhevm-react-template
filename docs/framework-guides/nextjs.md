# ⚡ Next.js Integration Guide

Complete guide for integrating the Universal FHEVM SDK with Next.js 13+ applications (App Router).

## Installation

```bash
npm install @fhevm/sdk next react react-dom
```

## Project Structure

```
nextjs-app/
├── app/
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Home page
│   └── api/
│       └── decrypt/
│           └── route.ts     # Server-side decryption
├── components/
│   ├── providers.tsx        # Client providers
│   ├── encryption.tsx       # Encryption component
│   └── decryption.tsx       # Decryption component
├── lib/
│   ├── fhevm-client.ts      # FHEVM client setup
│   └── contract.ts          # Contract configuration
└── public/
```

## Setup

### 1. Create Client Provider (`components/providers.tsx`)

```typescript
'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { createFhevmClient } from '@fhevm/sdk';
import { useMemo, createContext, useContext, useEffect } from 'react';
import type { FhevmClient } from '@fhevm/sdk';
import { useWalletClient } from 'wagmi';

const queryClient = new QueryClient();

const config = getDefaultConfig({
  appName: 'FHEVM Next.js App',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [sepolia],
  ssr: true,
});

// FHEVM Client Context
const FhevmClientContext = createContext<FhevmClient | null>(null);

export function useFhevmClient() {
  const context = useContext(FhevmClientContext);
  if (!context) {
    throw new Error('useFhevmClient must be used within FhevmClientProvider');
  }
  return context;
}

function FhevmClientProvider({ children }: { children: React.ReactNode }) {
  const { data: walletClient } = useWalletClient();

  const client = useMemo(() => {
    if (!walletClient) return null;

    const fhevmClient = createFhevmClient({
      provider: walletClient as any,
      chainId: sepolia.id,
      gatewayUrl: process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://gateway.sepolia.zama.ai',
    });

    // Initialize client
    fhevmClient.init().catch(console.error);

    return fhevmClient;
  }, [walletClient]);

  return (
    <FhevmClientContext.Provider value={client}>
      {children}
    </FhevmClientContext.Provider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <FhevmClientProvider>
            {children}
          </FhevmClientProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### 2. Root Layout (`app/layout.tsx`)

```typescript
import { Providers } from '@/components/providers';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FHEVM Next.js App',
  description: 'Confidential smart contracts with FHEVM SDK',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### 3. Environment Configuration

Create `.env.local`:

```env
# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=0x78257622318fC85f2a9c909DD7aF9d0142cd90ce
NEXT_PUBLIC_CHAIN_ID=11155111

# FHEVM Gateway
NEXT_PUBLIC_GATEWAY_URL=https://gateway.sepolia.zama.ai

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Server-side (optional)
PRIVATE_KEY=your_private_key_for_server_operations
RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
```

## Client-Side Usage

### 1. Encryption Component (`components/encryption.tsx`)

```typescript
'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useEncrypt } from '@fhevm/sdk/react';
import { useFhevmClient } from './providers';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

export function EncryptionComponent() {
  const { address } = useAccount();
  const fhevmClient = useFhevmClient();

  const [value, setValue] = useState('42');
  const [encryptionType, setEncryptionType] = useState<'euint8' | 'euint16' | 'euint32' | 'euint64'>('euint32');

  const { encrypt, isEncrypting, error, encryptedData } = useEncrypt(fhevmClient);

  const handleEncrypt = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || !fhevmClient) {
      alert('Please connect your wallet first');
      return;
    }

    await encrypt(Number(value), encryptionType, {
      contractAddress: CONTRACT_ADDRESS,
      userAddress: address,
    });
  };

  return (
    <div className="card">
      <h2>Encrypt a Value</h2>

      <form onSubmit={handleEncrypt}>
        <div className="form-group">
          <label>Value:</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter a number"
            required
          />
        </div>

        <div className="form-group">
          <label>Type:</label>
          <select
            value={encryptionType}
            onChange={(e) => setEncryptionType(e.target.value as any)}
          >
            <option value="euint8">euint8 (0-255)</option>
            <option value="euint16">euint16 (0-65535)</option>
            <option value="euint32">euint32</option>
            <option value="euint64">euint64</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={!address || isEncrypting}
        >
          {isEncrypting ? 'Encrypting...' : 'Encrypt'}
        </button>
      </form>

      {error && (
        <div className="error">
          Error: {error.message}
        </div>
      )}

      {encryptedData && (
        <div className="success">
          <h3>Encrypted!</h3>
          <p><strong>Handle:</strong> {encryptedData.handles[0]}</p>
          <p><strong>Proof:</strong> {encryptedData.inputProof.substring(0, 20)}...</p>
        </div>
      )}
    </div>
  );
}
```

### 2. Home Page (`app/page.tsx`)

```typescript
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { EncryptionComponent } from '@/components/encryption';
import { DecryptionComponent } from '@/components/decryption';

export default function HomePage() {
  return (
    <main className="container">
      <header>
        <h1>🔐 FHEVM SDK with Next.js</h1>
        <ConnectButton />
      </header>

      <div className="grid">
        <EncryptionComponent />
        <DecryptionComponent />
      </div>
    </main>
  );
}
```

## Server-Side Usage

### 1. Server Action for Decryption

```typescript
// app/actions/decrypt.ts
'use server';

import { createFhevmClient } from '@fhevm/sdk';
import { JsonRpcProvider, Wallet } from 'ethers';

export async function decryptServerSide(handle: string, contractAddress: string) {
  // Initialize provider and signer
  const provider = new JsonRpcProvider(process.env.RPC_URL);
  const wallet = new Wallet(process.env.PRIVATE_KEY!, provider);

  // Create FHEVM client
  const client = createFhevmClient({
    provider,
    chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID),
    gatewayUrl: process.env.NEXT_PUBLIC_GATEWAY_URL,
  });

  await client.init();

  // Decrypt value
  try {
    const decrypted = await client.decrypt(handle, {
      contractAddress,
      userAddress: wallet.address,
      signer: wallet,
    });

    return { success: true, value: decrypted };
  } catch (error) {
    console.error('Server-side decryption error:', error);
    return { success: false, error: (error as Error).message };
  }
}
```

### 2. API Route for Decryption (`app/api/decrypt/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createFhevmClient } from '@fhevm/sdk';
import { JsonRpcProvider, Wallet } from 'ethers';

export async function POST(request: NextRequest) {
  try {
    const { handle, contractAddress } = await request.json();

    if (!handle || !contractAddress) {
      return NextResponse.json(
        { error: 'Missing handle or contractAddress' },
        { status: 400 }
      );
    }

    // Initialize provider and signer
    const provider = new JsonRpcProvider(process.env.RPC_URL);
    const wallet = new Wallet(process.env.PRIVATE_KEY!, provider);

    // Create FHEVM client
    const client = createFhevmClient({
      provider,
      chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID),
      gatewayUrl: process.env.NEXT_PUBLIC_GATEWAY_URL,
    });

    await client.init();

    // Decrypt value
    const decrypted = await client.decrypt(handle, {
      contractAddress,
      userAddress: wallet.address,
      signer: wallet,
    });

    return NextResponse.json({
      success: true,
      value: decrypted,
    });
  } catch (error) {
    console.error('Decryption API error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
```

### 3. Using Server API in Client Component

```typescript
'use client';

import { useState } from 'react';

export function ServerDecryption() {
  const [handle, setHandle] = useState('');
  const [result, setResult] = useState<number | boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDecrypt = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle,
          contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.value);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Server-Side Decryption</h2>

      <div className="form-group">
        <label>Encrypted Handle:</label>
        <input
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="0x..."
        />
      </div>

      <button
        onClick={handleDecrypt}
        disabled={isLoading || !handle}
      >
        {isLoading ? 'Decrypting...' : 'Decrypt on Server'}
      </button>

      {error && <div className="error">Error: {error}</div>}
      {result !== null && (
        <div className="success">
          <h3>Decrypted Value:</h3>
          <p className="large-value">{result.toString()}</p>
        </div>
      )}
    </div>
  );
}
```

## Hybrid Usage (Client + Server)

### 1. Page with Both Client and Server Components

```typescript
// app/hybrid/page.tsx
import { ClientEncryption } from '@/components/client-encryption';
import { ServerDecryption } from '@/components/server-decryption';
import { Suspense } from 'react';

export default function HybridPage() {
  return (
    <div className="container">
      <h1>Hybrid Encryption/Decryption</h1>

      <div className="grid">
        {/* Client-side encryption */}
        <Suspense fallback={<div>Loading...</div>}>
          <ClientEncryption />
        </Suspense>

        {/* Server-side decryption */}
        <ServerDecryption />
      </div>
    </div>
  );
}
```

### 2. Server Component with Pre-encrypted Data

```typescript
// app/dashboard/page.tsx
import { createFhevmClient } from '@fhevm/sdk';
import { JsonRpcProvider } from 'ethers';

async function getEncryptedData() {
  const provider = new JsonRpcProvider(process.env.RPC_URL);
  const client = createFhevmClient({
    provider,
    chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID),
  });

  await client.init();

  // Fetch encrypted data from contract
  const contract = new Contract(CONTRACT_ADDRESS, ABI, provider);
  const encryptedValue = await contract.getEncryptedValue();

  return encryptedValue;
}

export default async function DashboardPage() {
  const encryptedData = await getEncryptedData();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Encrypted Value: {encryptedData}</p>
    </div>
  );
}
```

## Best Practices

### 1. Use Environment Variables

```typescript
// lib/config.ts
export const config = {
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID),
  gatewayUrl: process.env.NEXT_PUBLIC_GATEWAY_URL!,
  rpcUrl: process.env.RPC_URL,
};
```

### 2. Error Boundaries

```typescript
// components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong with FHEVM operations.</h2>;
    }

    return this.props.children;
  }
}
```

### 3. Loading States

```typescript
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <EncryptionComponent />
    </Suspense>
  );
}
```

### 4. Middleware for Authentication

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if user is authenticated for decryption operations
  if (request.nextUrl.pathname.startsWith('/api/decrypt')) {
    // Add your authentication logic here
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}
```

## Deployment

### 1. Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 2. Environment Variables on Vercel

Add these in your Vercel project settings:
- `NEXT_PUBLIC_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_CHAIN_ID`
- `NEXT_PUBLIC_GATEWAY_URL`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `PRIVATE_KEY` (for server-side operations)
- `RPC_URL`

### 3. Build Configuration

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## Performance Optimization

### 1. Dynamic Imports

```typescript
import dynamic from 'next/dynamic';

const EncryptionComponent = dynamic(
  () => import('@/components/encryption').then(mod => mod.EncryptionComponent),
  { ssr: false, loading: () => <p>Loading...</p> }
);
```

### 2. Memoization

```typescript
import { useMemo } from 'react';

const config = useMemo(() => ({
  provider: walletClient,
  chainId: 11155111,
}), [walletClient]);
```

### 3. Code Splitting

```typescript
// Lazy load FHEVM client only when needed
const loadFhevmClient = async () => {
  const { createFhevmClient } = await import('@fhevm/sdk');
  return createFhevmClient(config);
};
```

---

For more information:
- [Getting Started](../getting-started.md)
- [API Reference](../api-reference.md)
- [React Guide](./react.md)
