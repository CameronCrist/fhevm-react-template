'use client';

import { useState } from 'react';
import { FHEProvider } from '@/components/fhe/FHEProvider';
import { EncryptionDemo } from '@/components/fhe/EncryptionDemo';
import { ComputationDemo } from '@/components/fhe/ComputationDemo';
import { KeyManager } from '@/components/fhe/KeyManager';
import { BankingExample } from '@/components/examples/BankingExample';
import { MedicalExample } from '@/components/examples/MedicalExample';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'encryption' | 'computation' | 'banking' | 'medical' | 'keys'>('encryption');

  return (
    <FHEProvider>
      <main className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
            FHEVM SDK Showcase
          </h1>
          <p className="text-xl text-gray-300">
            Fully Homomorphic Encryption for Smart Contracts
          </p>
        </header>

        <div className="mb-8 flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => setActiveTab('encryption')}
            className={activeTab === 'encryption' ? 'btn-primary' : 'btn-secondary'}
          >
            Encryption Demo
          </button>
          <button
            onClick={() => setActiveTab('computation')}
            className={activeTab === 'computation' ? 'btn-primary' : 'btn-secondary'}
          >
            Computation Demo
          </button>
          <button
            onClick={() => setActiveTab('banking')}
            className={activeTab === 'banking' ? 'btn-primary' : 'btn-secondary'}
          >
            Banking Example
          </button>
          <button
            onClick={() => setActiveTab('medical')}
            className={activeTab === 'medical' ? 'btn-primary' : 'btn-secondary'}
          >
            Medical Example
          </button>
          <button
            onClick={() => setActiveTab('keys')}
            className={activeTab === 'keys' ? 'btn-primary' : 'btn-secondary'}
          >
            Key Manager
          </button>
        </div>

        <div className="max-w-6xl mx-auto">
          {activeTab === 'encryption' && <EncryptionDemo />}
          {activeTab === 'computation' && <ComputationDemo />}
          {activeTab === 'banking' && <BankingExample />}
          {activeTab === 'medical' && <MedicalExample />}
          {activeTab === 'keys' && <KeyManager />}
        </div>
      </main>
    </FHEProvider>
  );
}
