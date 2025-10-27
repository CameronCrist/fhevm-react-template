'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useFHE } from './FHEProvider';

export function ComputationDemo() {
  const { account, connectWallet, isInitialized } = useFHE();
  const [operand1, setOperand1] = useState('');
  const [operand2, setOperand2] = useState('');
  const [operation, setOperation] = useState<string>('add');
  const [result, setResult] = useState<any>(null);
  const [isComputing, setIsComputing] = useState(false);

  const handleCompute = async () => {
    if (!operand1 || !operand2) return;

    setIsComputing(true);
    try {
      const response = await fetch('/api/fhe/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation,
          operands: [parseInt(operand1), parseInt(operand2)],
          type: 'euint32'
        })
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.computation);
      }
    } catch (error) {
      console.error('Computation error:', error);
    } finally {
      setIsComputing(false);
    }
  };

  if (!isInitialized) {
    return (
      <Card title="Homomorphic Computation Demo">
        <p className="text-gray-300 mb-4">Connect your wallet to perform encrypted computations.</p>
        <Button onClick={connectWallet}>Connect Wallet</Button>
      </Card>
    );
  }

  return (
    <Card title="Homomorphic Computation Demo">
      <div className="space-y-6">
        <div>
          <p className="text-gray-300 mb-4">
            Perform computations on encrypted data without decrypting it. This demonstrates the power of Fully Homomorphic Encryption.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="First Operand"
            type="number"
            value={operand1}
            onChange={(e) => setOperand1(e.target.value)}
            placeholder="Enter first number"
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Operation
            </label>
            <select
              className="input-field w-full"
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
            >
              <option value="add">Addition (+)</option>
              <option value="subtract">Subtraction (-)</option>
              <option value="multiply">Multiplication (×)</option>
              <option value="compare">Compare (&gt;)</option>
            </select>
          </div>

          <Input
            label="Second Operand"
            type="number"
            value={operand2}
            onChange={(e) => setOperand2(e.target.value)}
            placeholder="Enter second number"
          />
        </div>

        <Button onClick={handleCompute} isLoading={isComputing} className="w-full">
          Compute on Encrypted Data
        </Button>

        {result && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <h4 className="text-sm font-semibold text-purple-400 mb-2">Computation Result:</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p><span className="font-medium">Operation:</span> {result.operation}</p>
                <p><span className="font-medium">Operands:</span> {result.operands.join(', ')}</p>
                <p><span className="font-medium">Result:</span> {result.result}</p>
              </div>
            </div>

            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <h4 className="text-sm font-semibold text-green-400 mb-2">Encrypted Result Handle:</h4>
              <code className="text-xs text-gray-300 break-all">
                {result.encryptedResult}
              </code>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-400 mb-2">Supported Operations:</h4>
          <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
            <li><strong>Addition:</strong> Add two encrypted numbers</li>
            <li><strong>Subtraction:</strong> Subtract encrypted numbers</li>
            <li><strong>Multiplication:</strong> Multiply encrypted values</li>
            <li><strong>Comparison:</strong> Compare encrypted values without revealing them</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
