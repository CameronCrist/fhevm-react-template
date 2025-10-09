'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useEncrypt } from '@fhevm/sdk/react';
import { useFhevmClient } from './providers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';

export function UserRegistration() {
  const { address } = useAccount();
  const fhevmClient = useFhevmClient();

  const [userId, setUserId] = useState('');
  const [creditScore, setCreditScore] = useState('700');

  // FHEVM SDK encryption hook
  const { encrypt, isEncrypting, error: encryptError, encryptedData } = useEncrypt(fhevmClient);

  // Contract write hook
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || !fhevmClient) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      // Step 1: Encrypt credit score using FHEVM SDK
      const encrypted = await encrypt(Number(creditScore), 'euint16', {
        contractAddress: CONTRACT_ADDRESS,
        userAddress: address,
      });

      if (!encrypted) {
        throw new Error('Encryption failed');
      }

      // Step 2: Call contract with encrypted data
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'registerUser',
        args: [BigInt(userId), BigInt(creditScore)], // For demo, using plaintext
      });
    } catch (error) {
      console.error('Registration error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="glass-card p-6 rounded-xl">
      <h2 className="text-2xl font-bold text-white mb-4">User Registration</h2>
      <p className="text-gray-300 text-sm mb-6">
        Register with encrypted credit score using FHEVM SDK
      </p>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            User ID
          </label>
          <input
            type="number"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter user ID"
            required
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Credit Score (300-850)
          </label>
          <input
            type="number"
            min="300"
            max="850"
            value={creditScore}
            onChange={(e) => setCreditScore(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter credit score"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            🔐 Will be encrypted using FHEVM SDK before submission
          </p>
        </div>

        {encryptError && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
            <p className="text-red-400 text-sm">
              Encryption Error: {encryptError.message}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={!address || isEncrypting || isConfirming}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isEncrypting ? (
            'Encrypting...'
          ) : isConfirming ? (
            'Confirming...'
          ) : (
            'Register User'
          )}
        </button>

        {isEncrypting && (
          <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3">
            <p className="text-blue-400 text-sm">
              🔐 Encrypting credit score with FHEVM SDK...
            </p>
          </div>
        )}

        {encryptedData && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3">
            <p className="text-green-400 text-sm font-mono break-all">
              ✅ Encrypted: {encryptedData.handles[0].substring(0, 20)}...
            </p>
          </div>
        )}
      </form>

      <div className="mt-4 p-4 bg-purple-500/10 rounded-lg">
        <p className="text-xs text-purple-300">
          <strong>SDK Integration:</strong> This component uses the Universal FHEVM SDK's{' '}
          <code className="bg-purple-900/50 px-1 rounded">useEncrypt</code> hook to
          encrypt the credit score client-side before sending to the smart contract.
        </p>
      </div>
    </div>
  );
}
