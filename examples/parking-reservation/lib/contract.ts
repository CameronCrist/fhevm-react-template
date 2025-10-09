import { useMemo } from 'react';
import { useWalletClient } from 'wagmi';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import type { WalletClient } from 'viem';

export const CONTRACT_ADDRESS = '0x78257622318fC85f2a9c909DD7aF9d0142cd90ce';

// Convert viem WalletClient to ethers Signer
export function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  return new JsonRpcSigner(provider, account.address);
}

// Hook to get ethers signer from wagmi
export function useEthersSigner() {
  const { data: walletClient } = useWalletClient();
  return useMemo(
    () => (walletClient ? walletClientToSigner(walletClient) : undefined),
    [walletClient]
  );
}

export const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'uint32', name: 'userId', type: 'uint32' },
      { internalType: 'uint16', name: 'creditScore', type: 'uint16' },
    ],
    name: 'registerUser',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: 'location', type: 'string' },
      { internalType: 'uint256', name: 'pricePerHour', type: 'uint256' },
    ],
    name: 'addParkingSpot',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'spotId', type: 'uint256' },
      { internalType: 'uint256', name: 'durationHours', type: 'uint256' },
    ],
    name: 'makeReservation',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'reservationId', type: 'uint256' }],
    name: 'completeReservation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getStatistics',
    outputs: [
      { internalType: 'uint32', name: '_totalSpots', type: 'uint32' },
      { internalType: 'uint32', name: '_totalReservations', type: 'uint32' },
      { internalType: 'uint256', name: '_timestamp', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'spotId', type: 'uint256' }],
    name: 'isSpotAvailable',
    outputs: [{ internalType: 'bool', name: 'available', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'userAddress', type: 'address' }],
    name: 'getUserInfo',
    outputs: [
      { internalType: 'uint32', name: 'userId', type: 'uint32' },
      { internalType: 'uint16', name: 'creditScore', type: 'uint16' },
      { internalType: 'bool', name: 'isRegistered', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
