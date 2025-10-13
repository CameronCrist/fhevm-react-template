import { Contract } from 'ethers';
import { getProvider, getSigner } from '../fhevm-client.js';

const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'bytes', name: 'encryptedValue', type: 'bytes' },
      { internalType: 'bytes', name: 'inputProof', type: 'bytes' },
    ],
    name: 'submitEncryptedValue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getEncryptedValue',
    outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export class ContractService {
  private contract: Contract;

  constructor(contractAddress: string) {
    const signer = getSigner();
    this.contract = new Contract(contractAddress, CONTRACT_ABI, signer);
  }

  /**
   * Submit encrypted value to contract
   */
  async submitEncryptedValue(encryptedValue: string, inputProof: string) {
    try {
      const tx = await this.contract.submitEncryptedValue(
        encryptedValue,
        inputProof
      );
      const receipt = await tx.wait();

      console.log(`✅ Transaction confirmed: ${receipt.hash}`);

      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error('❌ Contract interaction error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Get encrypted value from contract
   */
  async getEncryptedValue() {
    try {
      const encryptedValue = await this.contract.getEncryptedValue();

      return {
        success: true,
        value: encryptedValue,
      };
    } catch (error) {
      console.error('❌ Contract read error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
}
