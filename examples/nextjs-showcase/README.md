# Next.js FHEVM Showcase

A comprehensive Next.js application showcasing the FHEVM SDK capabilities with App Router, demonstrating Fully Homomorphic Encryption for smart contracts.

## Features

- **Encryption Demo**: Encrypt values using FHE with various encryption types (euint8, euint16, euint32, euint64, ebool)
- **Computation Demo**: Perform homomorphic operations on encrypted data (addition, subtraction, multiplication, comparison)
- **Key Management**: Manage FHE public keys and demonstrate key rotation
- **Banking Example**: Confidential banking with encrypted balances and private transfers
- **Medical Records Example**: HIPAA-compliant medical record management with encrypted patient data

## Tech Stack

- **Next.js 14+** with App Router
- **React 18+** with Hooks
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **FHEVM SDK** for encryption operations
- **Ethers.js** for blockchain interaction

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Access to Sepolia testnet

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your configuration
```

### Environment Variables

Create a `.env` file with the following:

```env
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_CONTRACT_ADDRESS=0x78257622318fC85f2a9c909DD7aF9d0142cd90ce
NEXT_PUBLIC_GATEWAY_URL=https://gateway.sepolia.zama.ai
```

### Running the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
nextjs-showcase/
├── src/
│   ├── app/                        # App Router
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   ├── globals.css             # Global styles
│   │   └── api/                    # API routes
│   │       ├── fhe/
│   │       │   ├── route.ts        # FHE operations endpoint
│   │       │   ├── encrypt/route.ts # Encryption API
│   │       │   ├── decrypt/route.ts # Decryption API
│   │       │   └── compute/route.ts # Computation API
│   │       └── keys/route.ts       # Key management API
│   │
│   ├── components/                 # React components
│   │   ├── ui/                     # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Card.tsx
│   │   ├── fhe/                    # FHE functionality components
│   │   │   ├── FHEProvider.tsx     # FHE context provider
│   │   │   ├── EncryptionDemo.tsx  # Encryption demonstration
│   │   │   ├── ComputationDemo.tsx # Computation demonstration
│   │   │   └── KeyManager.tsx      # Key management
│   │   └── examples/               # Use case examples
│   │       ├── BankingExample.tsx  # Banking use case
│   │       └── MedicalExample.tsx  # Medical records use case
│   │
├── public/                         # Static assets
├── .env.example                    # Environment template
├── next.config.js                  # Next.js configuration
├── tailwind.config.js              # Tailwind configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies
└── README.md                       # This file
```

## API Routes

### Encryption Endpoint

**POST** `/api/fhe/encrypt`

```json
{
  "value": 42,
  "type": "euint32",
  "contractAddress": "0x...",
  "userAddress": "0x..."
}
```

### Decryption Endpoint

**POST** `/api/fhe/decrypt`

```json
{
  "handle": "0x...",
  "contractAddress": "0x...",
  "userAddress": "0x..."
}
```

### Computation Endpoint

**POST** `/api/fhe/compute`

```json
{
  "operation": "add",
  "operands": [10, 20],
  "type": "euint32"
}
```

### Key Management Endpoint

**GET** `/api/keys` - Fetch public key

**POST** `/api/keys` - Generate or rotate keys

```json
{
  "action": "generate" | "rotate"
}
```

## Components

### FHEProvider

Context provider for FHE operations and wallet connection.

```tsx
import { FHEProvider } from '@/components/fhe/FHEProvider';

<FHEProvider>
  <YourApp />
</FHEProvider>
```

### EncryptionDemo

Demonstrates value encryption with different types.

### ComputationDemo

Shows homomorphic computation on encrypted data.

### KeyManager

Manages FHE public keys and demonstrates key rotation.

### BankingExample

Real-world example of confidential banking with encrypted balances.

### MedicalExample

HIPAA-compliant medical records with encrypted patient data.

## Usage Examples

### Encrypting Data

```tsx
const response = await fetch('/api/fhe/encrypt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    value: 100,
    type: 'euint32',
    contractAddress: '0x...',
    userAddress: '0x...'
  })
});

const { encrypted } = await response.json();
// encrypted.handles[0] contains the encrypted handle
```

### Performing Computations

```tsx
const response = await fetch('/api/fhe/compute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'add',
    operands: [10, 20],
    type: 'euint32'
  })
});

const { computation } = await response.json();
// computation.result contains the result
// computation.encryptedResult contains encrypted handle
```

## Encryption Types

- **euint8**: 8-bit unsigned integer (0-255)
- **euint16**: 16-bit unsigned integer (0-65535)
- **euint32**: 32-bit unsigned integer (0-4B)
- **euint64**: 64-bit unsigned integer
- **euint128**: 128-bit unsigned integer
- **ebool**: Encrypted boolean
- **eaddress**: Encrypted Ethereum address

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build image
docker build -t nextjs-showcase .

# Run container
docker run -p 3000:3000 nextjs-showcase
```

## Learn More

- [FHEVM SDK Documentation](../../packages/fhevm-sdk/README.md)
- [Zama FHEVM Docs](https://docs.zama.ai/fhevm)
- [Next.js Documentation](https://nextjs.org/docs)

## License

MIT
