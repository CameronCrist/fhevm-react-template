'use client';

import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { useEncrypt } from '@fhevm/sdk/react';
import { useFhevmClient } from './providers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { parseEther } from 'viem';

export function Reservations() {
  const { address } = useAccount();
  const fhevmClient = useFhevmClient();

  const [spotId, setSpotId] = useState('1');
  const [duration, setDuration] = useState('1');
  const [reservationId, setReservationId] = useState('');
  const [useEncryption, setUseEncryption] = useState(false);

  // FHEVM SDK encryption hook
  const { encrypt, isEncrypting, error: encryptError, encryptedData } = useEncrypt(fhevmClient);

  const { writeContract: makeReservation, isPending: isReserving } = useWriteContract();
  const { writeContract: completeReservation, isPending: isCompleting } = useWriteContract();

  const handleMakeReservation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || !fhevmClient) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const totalCost = parseEther((0.001 * Number(duration)).toString());

      // Optional: Encrypt duration for confidential reservations
      if (useEncryption) {
        const encryptedDuration = await encrypt(Number(duration), 'euint32', {
          contractAddress: CONTRACT_ADDRESS,
          userAddress: address,
        });

        if (!encryptedDuration) {
          throw new Error('Encryption failed');
        }

        // In a real implementation, you would call a contract function that accepts encrypted duration
        console.log('Encrypted duration:', encryptedDuration);
      }

      makeReservation({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'makeReservation',
        args: [BigInt(spotId), BigInt(duration)],
        value: totalCost,
      });
    } catch (error) {
      console.error('Reservation error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCompleteReservation = (e: React.FormEvent) => {
    e.preventDefault();

    completeReservation({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'completeReservation',
      args: [BigInt(reservationId)],
    });
  };

  return (
    <div className="glass-card p-6 rounded-xl">
      <h2 className="text-2xl font-bold text-white mb-6">Reservations</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Make Reservation */}
        <div>
          <h3 className="text-lg font-semibold text-purple-300 mb-4">
            Make Reservation
          </h3>
          <form onSubmit={handleMakeReservation} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Spot ID
              </label>
              <input
                type="number"
                min="1"
                value={spotId}
                onChange={(e) => setSpotId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Duration (hours)
              </label>
              <input
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Estimated cost: {(0.001 * Number(duration)).toFixed(4)} ETH
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useEncryption"
                checked={useEncryption}
                onChange={(e) => setUseEncryption(e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
              />
              <label htmlFor="useEncryption" className="text-sm text-gray-300">
                🔐 Use encrypted duration (SDK demo)
              </label>
            </div>

            {encryptError && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">
                  Encryption Error: {encryptError.message}
                </p>
              </div>
            )}

            {isEncrypting && (
              <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3">
                <p className="text-blue-400 text-sm">
                  🔐 Encrypting reservation duration with FHEVM SDK...
                </p>
              </div>
            )}

            {encryptedData && useEncryption && (
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3">
                <p className="text-green-400 text-sm font-mono break-all">
                  ✅ Encrypted: {encryptedData.handles[0].substring(0, 20)}...
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={!address || isReserving || isEncrypting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isEncrypting ? 'Encrypting...' : isReserving ? 'Reserving...' : 'Make Reservation'}
            </button>
          </form>
        </div>

        {/* Complete Reservation */}
        <div>
          <h3 className="text-lg font-semibold text-pink-300 mb-4">
            Complete Reservation
          </h3>
          <form onSubmit={handleCompleteReservation} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Reservation ID
              </label>
              <input
                type="number"
                min="1"
                value={reservationId}
                onChange={(e) => setReservationId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!address || isCompleting}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isCompleting ? 'Completing...' : 'Complete Reservation'}
            </button>

            <p className="text-xs text-gray-400">
              Release the parking spot and transfer payment
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
