'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useFHE } from './FHEProvider';

export function KeyManager() {
  const { account, connectWallet, isInitialized } = useFHE();
  const [publicKey, setPublicKey] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPublicKey = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/keys');
      const data = await response.json();
      if (data.success) {
        setPublicKey(data.publicKey);
      }
    } catch (error) {
      console.error('Error fetching public key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const rotateKeys = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rotate' })
      });
      const data = await response.json();
      if (data.success) {
        await fetchPublicKey();
        alert('Keys rotated successfully!');
      }
    } catch (error) {
      console.error('Error rotating keys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      fetchPublicKey();
    }
  }, [isInitialized]);

  if (!isInitialized) {
    return (
      <Card title="Key Management">
        <p className="text-gray-300 mb-4">Connect your wallet to manage encryption keys.</p>
        <Button onClick={connectWallet}>Connect Wallet</Button>
      </Card>
    );
  }

  return (
    <Card title="Key Management">
      <div className="space-y-6">
        <div>
          <p className="text-gray-300 mb-4">
            Manage FHE public keys used for encryption. The public key is used to encrypt data before sending it to smart contracts.
          </p>
        </div>

        <div className="flex gap-4">
          <Button onClick={fetchPublicKey} isLoading={isLoading} variant="secondary">
            Refresh Public Key
          </Button>
          <Button onClick={rotateKeys} isLoading={isLoading} variant="primary">
            Rotate Keys
          </Button>
        </div>

        {publicKey && (
          <div className="space-y-4">
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
              <h4 className="text-sm font-semibold text-indigo-400 mb-2">Public Key:</h4>
              <code className="text-xs text-gray-300 break-all">
                {publicKey.key}
              </code>
            </div>

            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <h4 className="text-sm font-semibold text-purple-400 mb-3">Key Parameters:</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400">Algorithm:</p>
                  <p className="text-white font-medium">{publicKey.algorithm}</p>
                </div>
                <div>
                  <p className="text-gray-400">LWE Dimension:</p>
                  <p className="text-white font-medium">{publicKey.parameters.lwe_dimension}</p>
                </div>
                <div>
                  <p className="text-gray-400">GLWE Dimension:</p>
                  <p className="text-white font-medium">{publicKey.parameters.glwe_dimension}</p>
                </div>
                <div>
                  <p className="text-gray-400">Polynomial Size:</p>
                  <p className="text-white font-medium">{publicKey.parameters.polynomial_size}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-400 mb-2">About FHE Keys:</h4>
          <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
            <li>Public keys are used to encrypt data before sending to contracts</li>
            <li>Private keys remain secure and are never transmitted</li>
            <li>Keys can be rotated for enhanced security</li>
            <li>TFHE-rs algorithm ensures strong encryption</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
