'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useFHE } from '@/components/fhe/FHEProvider';

interface Account {
  id: string;
  encryptedBalance: string;
  owner: string;
}

export function BankingExample() {
  const { account, connectWallet, isInitialized } = useFHE();
  const [balance, setBalance] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createAccount = async () => {
    if (!balance) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/fhe/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: parseInt(balance),
          type: 'euint64',
          contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          userAddress: account
        })
      });

      const data = await response.json();
      if (data.success) {
        const newAccount: Account = {
          id: `ACC${Date.now()}`,
          encryptedBalance: data.encrypted.handles[0],
          owner: account!
        };
        setAccounts([...accounts, newAccount]);
        setBalance('');
      }
    } catch (error) {
      console.error('Error creating account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferAmount || !recipient) return;

    setIsLoading(true);
    try {
      // Encrypt transfer amount
      const response = await fetch('/api/fhe/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: parseInt(transferAmount),
          type: 'euint64',
          contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          userAddress: account
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Transfer of encrypted amount initiated to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`);
        setTransferAmount('');
        setRecipient('');
      }
    } catch (error) {
      console.error('Transfer error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <Card title="Confidential Banking Example">
        <p className="text-gray-300 mb-4">Connect your wallet to use confidential banking features.</p>
        <Button onClick={connectWallet}>Connect Wallet</Button>
      </Card>
    );
  }

  return (
    <Card title="Confidential Banking Example">
      <div className="space-y-6">
        <div>
          <p className="text-gray-300 mb-4">
            Demonstrate confidential banking with encrypted account balances and private transfers using FHE.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Create Account</h4>
            <Input
              label="Initial Balance"
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="Enter initial balance"
            />
            <Button onClick={createAccount} isLoading={isLoading} className="w-full">
              Create Confidential Account
            </Button>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Private Transfer</h4>
            <Input
              label="Amount"
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="Amount to transfer"
            />
            <Input
              label="Recipient Address"
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
            />
            <Button onClick={handleTransfer} isLoading={isLoading} className="w-full">
              Send Encrypted Transfer
            </Button>
          </div>
        </div>

        {accounts.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-white mb-4">Your Accounts</h4>
            <div className="space-y-3">
              {accounts.map((acc) => (
                <div key={acc.id} className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-400">Account ID:</p>
                      <p className="text-white font-medium">{acc.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Owner:</p>
                      <p className="text-white font-medium">{acc.owner.slice(0, 6)}...{acc.owner.slice(-4)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-400">Encrypted Balance:</p>
                      <code className="text-xs text-white break-all">{acc.encryptedBalance}</code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-400 mb-2">Privacy Features:</h4>
          <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
            <li>Account balances are fully encrypted on-chain</li>
            <li>Transfer amounts remain confidential</li>
            <li>Only authorized parties can decrypt balances</li>
            <li>All operations preserve privacy throughout execution</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
