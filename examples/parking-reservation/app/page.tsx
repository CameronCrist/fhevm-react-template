'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { UserRegistration } from '@/components/user-registration';
import { ParkingSpots } from '@/components/parking-spots';
import { Reservations } from '@/components/reservations';
import { DecryptionDemo } from '@/components/decryption-demo';
import { useAccount } from 'wagmi';

export default function HomePage() {
  const { isConnected } = useAccount();

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🅿️ Parking Reservation System
            </h1>
            <p className="text-gray-300">
              Powered by Universal FHEVM SDK - Confidential Smart Contracts
            </p>
          </div>
          <ConnectButton />
        </header>

        {/* SDK Info Banner */}
        <div className="mb-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-2">
            🔐 FHEVM SDK Integration Example
          </h3>
          <p className="text-gray-300 mb-4">
            This application demonstrates the Universal FHEVM SDK in a real-world parking
            reservation system. Credit scores are encrypted client-side using the SDK
            before being submitted to the smart contract.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-purple-400 font-semibold text-sm">SDK Features</p>
              <p className="text-white text-xs mt-1">
                useEncrypt, useDecrypt, useFhevmClient hooks
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-pink-400 font-semibold text-sm">Framework</p>
              <p className="text-white text-xs mt-1">
                Next.js 14 with React hooks
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-blue-400 font-semibold text-sm">Network</p>
              <p className="text-white text-xs mt-1">
                Sepolia Testnet (Chain ID: 11155111)
              </p>
            </div>
          </div>
        </div>

        {!isConnected ? (
          <div className="glass-card p-12 rounded-xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Welcome to Parking Reservation
            </h2>
            <p className="text-gray-300 mb-8">
              Connect your wallet to start using the application
            </p>
            <ConnectButton />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Registration */}
            <div>
              <UserRegistration />
            </div>

            {/* Parking Spots */}
            <div>
              <ParkingSpots />
            </div>

            {/* Reservations - Full Width */}
            <div className="lg:col-span-2">
              <Reservations />
            </div>

            {/* Decryption Demo - Full Width */}
            <div className="lg:col-span-2">
              <DecryptionDemo />
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-400 text-sm">
          <p>
            Built with{' '}
            <a
              href="https://github.com/yourusername/fhevm-universal-sdk"
              className="text-purple-400 hover:text-purple-300 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              @fhevm/sdk
            </a>
            {' '}- Universal FHEVM SDK for confidential smart contracts
          </p>
          <p className="mt-2">
            Contract:{' '}
            <a
              href="https://sepolia.etherscan.io/address/0x78257622318fC85f2a9c909DD7aF9d0142cd90ce"
              className="text-blue-400 hover:text-blue-300 font-mono text-xs"
              target="_blank"
              rel="noopener noreferrer"
            >
              0x78257622318fC85f2a9c909DD7aF9d0142cd90ce
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
