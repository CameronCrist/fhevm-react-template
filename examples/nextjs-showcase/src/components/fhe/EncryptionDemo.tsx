'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useFHE } from './FHEProvider';

export function EncryptionDemo() {
  const { account, connectWallet, isInitialized } = useFHE();
  const [value, setValue] = useState('');
  const [encryptedValue, setEncryptedValue] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('euint32');

  const handleEncrypt = async () => {
    if (!value) return;

    setIsEncrypting(true);
    try {
      const response = await fetch('/api/fhe/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: parseInt(value),
          type: selectedType,
          contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          userAddress: account
        })
      });

      const data = await response.json();
      if (data.success) {
        setEncryptedValue(data.encrypted.handles[0]);
      }
    } catch (error) {
      console.error('Encryption error:', error);
    } finally {
      setIsEncrypting(false);
    }
  };

  if (!isInitialized) {
    return (
      <Card title="Encryption Demo">
        <p className="text-gray-300 mb-4">Connect your wallet to start encrypting data.</p>
        <Button onClick={connectWallet}>Connect Wallet</Button>
      </Card>
    );
  }

  return (
    <Card title="Encryption Demo">
      <div className="space-y-6">
        <div>
          <p className="text-gray-300 mb-4">
            Encrypt a value using Fully Homomorphic Encryption (FHE). The encrypted data can be processed on-chain without revealing the original value.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Value to Encrypt"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter a number"
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Encryption Type
            </label>
            <select
              className="input-field w-full"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="euint8">euint8 (0-255)</option>
              <option value="euint16">euint16 (0-65535)</option>
              <option value="euint32">euint32 (0-4B)</option>
              <option value="euint64">euint64 (Large numbers)</option>
              <option value="ebool">ebool (Boolean)</option>
            </select>
          </div>
        </div>

        <Button onClick={handleEncrypt} isLoading={isEncrypting} className="w-full">
          Encrypt Value
        </Button>

        {encryptedValue && (
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <h4 className="text-sm font-semibold text-green-400 mb-2">Encrypted Result:</h4>
            <code className="text-xs text-gray-300 break-all">
              {encryptedValue}
            </code>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-400 mb-2">How it works:</h4>
          <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
            <li>Enter a value and select an encryption type</li>
            <li>The value is encrypted using FHE on the client side</li>
            <li>The encrypted handle can be sent to smart contracts</li>
            <li>Smart contracts can perform operations on encrypted data</li>
            <li>Results remain encrypted until authorized decryption</li>
          </ol>
        </div>
      </div>
    </Card>
  );
}
