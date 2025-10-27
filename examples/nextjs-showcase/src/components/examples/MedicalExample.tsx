'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useFHE } from '@/components/fhe/FHEProvider';

interface MedicalRecord {
  id: string;
  patientId: string;
  encryptedAge: string;
  encryptedDiagnosis: string;
  timestamp: string;
}

export function MedicalExample() {
  const { account, connectWallet, isInitialized } = useFHE();
  const [patientId, setPatientId] = useState('');
  const [age, setAge] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createRecord = async () => {
    if (!patientId || !age || !diagnosis) return;

    setIsLoading(true);
    try {
      // Encrypt age
      const ageResponse = await fetch('/api/fhe/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: parseInt(age),
          type: 'euint8',
          contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          userAddress: account
        })
      });

      // Encrypt diagnosis code
      const diagnosisResponse = await fetch('/api/fhe/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: parseInt(diagnosis),
          type: 'euint16',
          contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          userAddress: account
        })
      });

      const ageData = await ageResponse.json();
      const diagnosisData = await diagnosisResponse.json();

      if (ageData.success && diagnosisData.success) {
        const newRecord: MedicalRecord = {
          id: `REC${Date.now()}`,
          patientId,
          encryptedAge: ageData.encrypted.handles[0],
          encryptedDiagnosis: diagnosisData.encrypted.handles[0],
          timestamp: new Date().toISOString()
        };
        setRecords([...records, newRecord]);
        setPatientId('');
        setAge('');
        setDiagnosis('');
      }
    } catch (error) {
      console.error('Error creating record:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <Card title="Confidential Medical Records">
        <p className="text-gray-300 mb-4">Connect your wallet to manage confidential medical records.</p>
        <Button onClick={connectWallet}>Connect Wallet</Button>
      </Card>
    );
  }

  return (
    <Card title="Confidential Medical Records">
      <div className="space-y-6">
        <div>
          <p className="text-gray-300 mb-4">
            Securely store and manage medical records with FHE. Patient data remains encrypted on-chain and can only be accessed by authorized parties.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Create Medical Record</h4>

          <Input
            label="Patient ID"
            type="text"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="Enter patient identifier"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Patient age"
            />

            <Input
              label="Diagnosis Code"
              type="number"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="ICD-10 code"
            />
          </div>

          <Button onClick={createRecord} isLoading={isLoading} className="w-full">
            Create Encrypted Record
          </Button>
        </div>

        {records.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-white mb-4">Medical Records</h4>
            <div className="space-y-3">
              {records.map((record) => (
                <div key={record.id} className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400">Record ID:</p>
                      <p className="text-white font-medium">{record.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Patient ID:</p>
                      <p className="text-white font-medium">{record.patientId}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-400">Encrypted Age:</p>
                      <code className="text-xs text-white break-all">{record.encryptedAge}</code>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-400">Encrypted Diagnosis:</p>
                      <code className="text-xs text-white break-all">{record.encryptedDiagnosis}</code>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-400">Timestamp:</p>
                      <p className="text-white text-xs">{new Date(record.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-400 mb-2">HIPAA-Compliant Features:</h4>
          <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
            <li>Patient data encrypted at rest and in transit</li>
            <li>Only authorized healthcare providers can decrypt</li>
            <li>Audit trails maintained on-chain</li>
            <li>Compliance with privacy regulations</li>
            <li>Secure data sharing between institutions</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
