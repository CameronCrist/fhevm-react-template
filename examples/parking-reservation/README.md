# 🅿️ Parking Reservation System - FHEVM SDK Example

A real-world example demonstrating the **Universal FHEVM SDK** in a production parking reservation application.

## 🎯 Purpose

This example showcases how to integrate the Universal FHEVM SDK into a complete application with:
- Smart contract interaction
- Confidential data handling
- User registration with encrypted credit scores
- Reservation management
- Real-world business logic

## ✨ Features

- 🔐 **Encrypted Credit Scores** - User credit ratings stored confidentially
- 🅿️ **Parking Spot Management** - Add and manage parking locations
- 📅 **Reservation System** - Book parking spots with deposits
- 💰 **Payment Handling** - Automatic payment and refund logic
- 📊 **Statistics Dashboard** - System-wide metrics
- 🔄 **Real-time Updates** - Instant UI synchronization

## 🏗️ Architecture

```
Parking Reservation App
├── Smart Contract (Solidity)
│   ├── User registration
│   ├── Spot management
│   ├── Reservation logic
│   └── Payment handling
│
├── Frontend (Next.js + @fhevm/sdk)
│   ├── Wallet connection (RainbowKit)
│   ├── Encryption hooks
│   ├── Contract interactions
│   └── UI components
│
└── Universal FHEVM SDK Integration
    ├── Encrypt credit scores
    ├── Decrypt user data
    └── Permission management
```

## 🚀 Getting Started

### Prerequisites

```bash
Node.js >= 18.0.0
MetaMask or compatible wallet
Sepolia testnet ETH
```

### Installation

```bash
# Navigate to example directory
cd examples/parking-reservation

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Visit `http://localhost:1321`

### Environment Configuration

Create `.env.local`:

```env
# Contract Address (deployed on Sepolia)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x78257622318fC85f2a9c909DD7aF9d0142cd90ce

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=11155111

# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

## 📋 Usage Flow

### 1. Connect Wallet

```typescript
import { ConnectButton } from '@rainbow-me/rainbowkit';

<ConnectButton />
```

### 2. Register User (With SDK)

```typescript
import { createFhevmClient } from '@fhevm/sdk';
import { useEncrypt } from '@fhevm/sdk/react';

function UserRegistration() {
  const client = useMemo(() => createFhevmClient({
    provider,
    chainId: 11155111
  }), [provider]);

  const { encrypt, isEncrypting } = useEncrypt(client);

  const register = async (userId: number, creditScore: number) => {
    // Encrypt credit score using FHEVM SDK
    const encrypted = await encrypt(creditScore, 'euint16', {
      contractAddress: CONTRACT_ADDRESS,
      userAddress: address!
    });

    // Register with encrypted credit score
    await contract.registerUser(userId, encrypted.handles[0], encrypted.inputProof);
  };

  return <RegistrationForm onSubmit={register} />;
}
```

### 3. Add Parking Spot (Owner)

```typescript
const { write: addSpot } = useContractWrite({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: 'addParkingSpot',
  args: [location, pricePerHour],
});
```

### 4. Make Reservation

```typescript
const { write: makeReservation } = useContractWrite({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: 'makeReservation',
  args: [spotId, duration],
  value: depositAmount,
});
```

### 5. View Encrypted Data (With SDK)

```typescript
import { useDecrypt } from '@fhevm/sdk/react';

function UserProfile() {
  const { decrypt, decryptedValue } = useDecrypt(client);

  const viewCreditScore = async () => {
    const signer = await provider.getSigner();

    // Decrypt credit score with permission
    const score = await decrypt(handle, {
      contractAddress: CONTRACT_ADDRESS,
      userAddress: address!,
      signer
    });

    console.log('Credit Score:', score);
  };

  return <button onClick={viewCreditScore}>View Credit Score</button>;
}
```

## 🔧 SDK Integration Highlights

### Client Initialization

```typescript
// lib/fhevm-client.ts
import { createFhevmClient } from '@fhevm/sdk';

export function useFhevmSetup() {
  const provider = useMemo(() =>
    new BrowserProvider(window.ethereum), []
  );

  const client = useMemo(() => createFhevmClient({
    provider,
    chainId: 11155111,
    gatewayUrl: 'https://gateway.sepolia.zama.ai'
  }), [provider]);

  useEffect(() => {
    client.init();
  }, [client]);

  return client;
}
```

### Encryption Hook Usage

```typescript
// components/EncryptedInput.tsx
import { useEncrypt } from '@fhevm/sdk/react';

export function EncryptedInput({ client, onEncrypted }) {
  const { encrypt, isEncrypting, error, encryptedData } = useEncrypt(client);

  const handleSubmit = async (value: number) => {
    const result = await encrypt(value, 'euint32', {
      contractAddress: CONTRACT_ADDRESS,
      userAddress: await signer.getAddress()
    });

    if (result) {
      onEncrypted(result);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="number" />
      <button disabled={isEncrypting}>
        {isEncrypting ? 'Encrypting...' : 'Submit'}
      </button>
      {error && <p>Error: {error.message}</p>}
    </form>
  );
}
```

### Decryption Hook Usage

```typescript
// components/DecryptedView.tsx
import { useDecrypt } from '@fhevm/sdk/react';

export function DecryptedView({ client, handle }) {
  const { decrypt, isDecrypting, decryptedValue } = useDecrypt(client);

  useEffect(() => {
    if (handle && client) {
      decrypt(handle, {
        contractAddress: CONTRACT_ADDRESS,
        userAddress: address!,
        signer
      });
    }
  }, [handle]);

  return (
    <div>
      {isDecrypting ? (
        <Spinner />
      ) : (
        <p>Decrypted Value: {decryptedValue}</p>
      )}
    </div>
  );
}
```

## 📦 Smart Contract

### Key Functions

```solidity
// Register user with credit score
function registerUser(uint32 userId, uint16 creditScore) external;

// Add parking spot (owner only)
function addParkingSpot(string memory location, uint256 pricePerHour) external;

// Make reservation with payment
function makeReservation(uint256 spotId, uint256 duration) external payable;

// Complete reservation and release spot
function completeReservation(uint256 reservationId) external;

// View functions
function getStatistics() external view returns (uint32, uint32, uint256);
function isSpotAvailable(uint256 spotId) external view returns (bool);
function getUserInfo(address user) external view returns (uint32, uint16, bool);
```

### Deployment

```bash
# Compile contract
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.ts --network sepolia

# Verify on Etherscan
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

**Deployed Contract**: `0x78257622318fC85f2a9c909DD7aF9d0142cd90ce` (Sepolia)

## 🧪 Testing

```bash
# Run contract tests
npm test

# Run with coverage
npm run test:coverage

# Run with gas reporting
npm run test:gas
```

**Test Results**:
- ✅ 60 tests passing
- ✅ 100% statement coverage
- ✅ 93.33% branch coverage

## 🎨 UI Components

### Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Glassmorphism
- **Web3**: wagmi + RainbowKit
- **State**: TanStack Query
- **Icons**: Lucide React
- **Components**: Radix UI

### Key Components

- `UserRegistration` - Register with encrypted credit score
- `ParkingSpots` - View and manage parking spots
- `Reservations` - Create and manage reservations
- `TransactionHistory` - View past transactions
- `ConnectButton` - Wallet connection

## 📊 Features Demonstrated

### FHEVM SDK Usage

✅ **Client Initialization** - Setup with Sepolia testnet
✅ **Encryption** - Encrypt credit scores before registration
✅ **Contract Interaction** - Send encrypted data to smart contract
✅ **Decryption** - Retrieve and decrypt user data with permissions
✅ **Error Handling** - Graceful failure modes
✅ **Loading States** - User feedback during operations

### Real-World Patterns

✅ **User Registration** - Onboarding with confidential data
✅ **Access Control** - Owner-only functions
✅ **Payment Handling** - Deposits and refunds
✅ **Reservation Logic** - Booking and completion flows
✅ **Data Privacy** - Credit scores remain confidential
✅ **Event Emission** - Transaction transparency

## 🔐 Security Features

- ✅ **Input Validation** - All parameters validated
- ✅ **Access Control** - Owner and user permissions
- ✅ **Reentrancy Protection** - Safe payment handling
- ✅ **Integer Overflow Protection** - Solidity 0.8.24
- ✅ **Event Logging** - Transparent operations
- ✅ **Error Messages** - Clear failure reasons

## 📖 Documentation

- [Main README](../../README.md) - SDK overview
- [API Reference](../../packages/fhevm-sdk/README.md) - Complete API
- [Getting Started](../../docs/getting-started.md) - Quick start guide
- [Testing Guide](./TESTING.md) - Test documentation

## 🚀 Deployment

### Vercel Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel deploy --prod
```

**Live Demo**: [parking-reservation.vercel.app](https://parking-reservation.vercel.app)

### Environment Variables (Production)

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x78257622318fC85f2a9c909DD7aF9d0142cd90ce
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_APP_URL=https://parking-reservation.vercel.app
```

## 🎓 Learning Resources

### Key Concepts

1. **FHE Encryption** - How confidential computing works
2. **Smart Contract Integration** - Connecting SDK to contracts
3. **Permission Management** - EIP-712 signatures for decryption
4. **React Hooks** - Using SDK hooks in components
5. **Error Handling** - Managing encryption/decryption failures

### Code Examples

See the following files for implementation details:
- `components/user-registration.tsx` - Encryption example
- `components/user-profile.tsx` - Decryption example
- `lib/fhevm-client.ts` - Client setup
- `contracts/ParkingReservation.sol` - Smart contract

## 🤝 Contributing

This example is part of the Universal FHEVM SDK project. Contributions welcome!

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](../../LICENSE) file.

## 🔗 Links

- **Main SDK**: [Universal FHEVM SDK](../../README.md)
- **Live Demo**: [parking-reservation.vercel.app](https://parking-reservation.vercel.app)
- **Contract**: [Sepolia Etherscan](https://sepolia.etherscan.io/address/0x78257622318fC85f2a9c909DD7aF9d0142cd90ce)
- **Documentation**: [Getting Started](../../docs/getting-started.md)

---

**Built with @fhevm/sdk** - Making confidential smart contracts simple.
