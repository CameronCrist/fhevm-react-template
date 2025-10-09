'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { useEncrypt } from '@fhevm/sdk/react';
import { useFhevmClient } from './providers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { parseEther } from 'viem';

export function ParkingSpots() {
  const { address } = useAccount();
  const fhevmClient = useFhevmClient();

  const [location, setLocation] = useState('');
  const [pricePerHour, setPricePerHour] = useState('0.001');
  const [useEncryptedPrice, setUseEncryptedPrice] = useState(false);

  // FHEVM SDK encryption hook
  const { encrypt, isEncrypting, error: encryptError, encryptedData } = useEncrypt(fhevmClient);

  const { writeContract, isPending } = useWriteContract();

  const { data: stats } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getStatistics',
  });

  const handleAddSpot = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || !fhevmClient) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      // Optional: Encrypt price for confidential pricing
      if (useEncryptedPrice) {
        // Convert ETH to wei and encrypt
        const priceInWei = Number(parseEther(pricePerHour));
        const encryptedPrice = await encrypt(priceInWei, 'euint64', {
          contractAddress: CONTRACT_ADDRESS,
          userAddress: address,
        });

        if (!encryptedPrice) {
          throw new Error('Encryption failed');
        }

        // In a real implementation, you would call a contract function that accepts encrypted price
        console.log('Encrypted price:', encryptedPrice);
      }

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'addParkingSpot',
        args: [location, parseEther(pricePerHour)],
      });

      setLocation('');
      setPricePerHour('0.001');
    } catch (error) {
      console.error('Add spot error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="glass-card p-6 rounded-xl">
      <h2 className="text-2xl font-bold text-white mb-4">Parking Spots</h2>

      {/* Statistics */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="bg-purple-500/10 rounded-lg p-3">
            <p className="text-purple-300 text-sm">Total Spots</p>
            <p className="text-2xl font-bold text-white">{stats[0].toString()}</p>
          </div>
          <div className="bg-pink-500/10 rounded-lg p-3">
            <p className="text-pink-300 text-sm">Total Reservations</p>
            <p className="text-2xl font-bold text-white">{stats[1].toString()}</p>
          </div>
        </div>
      )}

      {/* Add Spot Form */}
      <form onSubmit={handleAddSpot} className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., Building A, Floor 2, Spot 15"
            required
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Price per Hour (ETH)
          </label>
          <input
            type="number"
            step="0.0001"
            value={pricePerHour}
            onChange={(e) => setPricePerHour(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="0.001"
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="useEncryptedPrice"
            checked={useEncryptedPrice}
            onChange={(e) => setUseEncryptedPrice(e.target.checked)}
            className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
          />
          <label htmlFor="useEncryptedPrice" className="text-sm text-gray-300">
            🔐 Encrypt price (SDK demo)
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
              🔐 Encrypting price with FHEVM SDK...
            </p>
          </div>
        )}

        {encryptedData && useEncryptedPrice && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3">
            <p className="text-green-400 text-sm font-mono break-all">
              ✅ Encrypted: {encryptedData.handles[0].substring(0, 20)}...
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={!address || isPending || isEncrypting}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isEncrypting ? 'Encrypting...' : isPending ? 'Adding Spot...' : 'Add Parking Spot'}
        </button>
      </form>

      <p className="mt-4 text-xs text-gray-400">
        Owner only: Add new parking spots to the system
      </p>
    </div>
  );
}
