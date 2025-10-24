'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { createFhevmClient } from '@fhevm/sdk';
import { useMemo, createContext, useContext } from 'react';
import type { FhevmClient } from '@fhevm/sdk';
import { useWalletClient } from 'wagmi';

const queryClient = new QueryClient();

const config = getDefaultConfig({
  appName: 'Parking Reservation - FHEVM SDK Example',
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
      gatewayUrl: 'https://gateway.sepolia.zama.ai',
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
