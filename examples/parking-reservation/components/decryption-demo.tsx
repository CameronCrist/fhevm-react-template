'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useDecrypt } from '@fhevm/sdk/react';
import { useFhevmClient } from './providers';
import { useEthersSigner } from '@/lib/contract';

export function DecryptionDemo() {
  const { address } = useAccount();
  const fhevmClient = useFhevmClient();
  const signer = useEthersSigner();

  const [encryptedHandle, setEncryptedHandle] = useState('');
  const [contractAddress, setContractAddress] = useState('0x78257622318fC85f2a9c909DD7aF9d0142cd90ce');

  // FHEVM SDK decryption hook
  const { decrypt, isDecrypting, error: decryptError, decryptedValue } = useDecrypt(fhevmClient);

  const handleDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || !fhevmClient || !signer) {
      alert('Please connect your wallet first');
      return;
    }

    if (!encryptedHandle.startsWith('0x') || encryptedHandle.length !== 66) {
      alert('Please enter a valid encrypted handle (0x + 64 hex characters)');
      return;
    }

    try {
      // Decrypt the encrypted handle using FHEVM SDK
      await decrypt(encryptedHandle, {
        contractAddress,
        userAddress: address,
        signer,
      });
    } catch (error) {
      console.error('Decryption error:', error);
    }
  };

  return (
    <div className="glass-card p-6 rounded-xl">
      <h2 className="text-2xl font-bold text-white mb-4">Decryption Demo</h2>
      <p className="text-gray-300 text-sm mb-6">
        Decrypt encrypted values using FHEVM SDK (requires permission via EIP-712 signature)
      </p>

      <form onSubmit={handleDecrypt} className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Encrypted Handle
          </label>
          <input
            type="text"
            value={encryptedHandle}
            onChange={(e) => setEncryptedHandle(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs"
            placeholder="0x..."
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            Enter the encrypted handle returned from encryption
          </p>
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Contract Address
          </label>
          <input
            type="text"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs"
            placeholder="0x..."
            required
          />
        </div>

        {decryptError && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
            <p className="text-red-400 text-sm">
              <strong>Decryption Error:</strong> {decryptError.message}
            </p>
            <p className="text-red-300 text-xs mt-1">
              Make sure you have permission to decrypt this value
            </p>
          </div>
        )}

        {isDecrypting && (
          <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3">
            <p className="text-blue-400 text-sm">
              🔓 Decrypting with FHEVM SDK...
            </p>
            <p className="text-blue-300 text-xs mt-1">
              You may need to sign an EIP-712 signature for permission
            </p>
          </div>
        )}

        {decryptedValue !== null && decryptedValue !== undefined && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
            <p className="text-green-400 text-sm font-semibold mb-2">
              ✅ Decryption Successful!
            </p>
            <div className="bg-green-900/30 rounded p-3">
              <p className="text-green-300 text-xs mb-1">Decrypted Value:</p>
              <p className="text-white text-xl font-bold font-mono">
                {typeof decryptedValue === 'boolean'
                  ? decryptedValue.toString()
                  : decryptedValue.toString()}
              </p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!address || !signer || isDecrypting || !encryptedHandle}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isDecrypting ? 'Decrypting...' : 'Decrypt Value'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-purple-500/10 rounded-lg">
        <h3 className="text-sm font-semibold text-purple-300 mb-2">
          📖 How it Works:
        </h3>
        <ul className="text-xs text-purple-200 space-y-1">
          <li>• Copy an encrypted handle from the encryption outputs above</li>
          <li>• Paste it into the "Encrypted Handle" field</li>
          <li>• Click "Decrypt Value" and sign the EIP-712 permission request</li>
          <li>• The SDK will request decryption from the FHEVM gateway</li>
          <li>• The decrypted value will be displayed</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-orange-500/10 rounded-lg">
        <p className="text-xs text-orange-300">
          <strong>⚠️ Note:</strong> Decryption requires proper permissions set in the smart contract.
          You can only decrypt values you have permission to access.
        </p>
      </div>
    </div>
  );
}
