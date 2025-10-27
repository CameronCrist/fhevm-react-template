# Private Parking Reservation System - React Version

A privacy-preserving parking reservation system built with React, TypeScript, and Zama's Fully Homomorphic Encryption (FHE) technology. This is a React conversion of the original static HTML version.

## Features

- **User Registration**: Register with encrypted private user ID and credit score
- **Parking Management**: Add and manage parking spots with encrypted pricing
- **Reservation System**: Reserve parking spots with encrypted payment amounts and durations
- **Query Functions**: Check parking spot availability and verify user identity
- **My Reservations**: View and manage your parking reservations
- **Real-time Statistics**: Track total spots, reservations, and system status

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Ethers.js 6** - Blockchain interaction
- **FHEVM SDK** - Fully homomorphic encryption

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
VITE_CONTRACT_ADDRESS=0xCca46D59993Df50Bb3D9b169A199fC3F84f5c18e
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

### Running the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

The application will be available at `http://localhost:3001`.

## Project Structure

```
private-parking-react/
├── src/
│   ├── components/          # React components
│   │   ├── WalletConnection.tsx
│   │   ├── UserRegistration.tsx
│   │   ├── SystemStats.tsx
│   │   ├── ParkingManagement.tsx
│   │   ├── QueryFunctions.tsx
│   │   └── MyReservations.tsx
│   ├── context/             # React context
│   │   └── WalletContext.tsx
│   ├── config/              # Configuration
│   │   └── contract.ts
│   ├── hooks/               # Custom hooks
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── package.json
└── README.md
```

## Features Details

### User Registration

- Register with encrypted user ID (private identifier)
- Encrypted credit score (300-850)
- Privacy-preserving identity management

### Parking Management

- **Admin**: Add parking spots with encrypted pricing
- **Users**: Reserve parking spots with encrypted payment
- **Privacy**: All sensitive data encrypted on-chain

### Query Functions

- Check parking spot availability
- Verify user identity
- All queries preserve privacy through FHE

### My Reservations

- View all your reservations
- Complete active reservations
- Track reservation history

## Smart Contract

The application interacts with a Solidity smart contract deployed on Sepolia testnet:

**Contract Address**: `0xCca46D59993Df50Bb3D9b169A199fC3F84f5c18e`

### Contract Functions

- `registerUser(userId, creditScore)` - Register with encrypted credentials
- `addParkingSpot(price, location)` - Add parking spot (admin)
- `reserveSpot(spotId, duration, payment)` - Reserve a spot
- `completeReservation(reservationId)` - Complete reservation
- `checkSpotAvailability(spotId)` - Check if spot is available
- `getUserReservations(address)` - Get user's reservations
- `getStatistics()` - Get system statistics

## Privacy Features

All sensitive data is encrypted using Fully Homomorphic Encryption (FHE):

- **User IDs**: Encrypted as `euint32`
- **Credit Scores**: Encrypted as `euint16`
- **Prices**: Encrypted as `euint16`
- **Payment Amounts**: Encrypted as `euint16`
- **Durations**: Encrypted as `euint256`

## Development

### Adding New Features

1. Create component in `src/components/`
2. Add contract function to `src/config/contract.ts`
3. Update `WalletContext` if needed
4. Add component to `App.tsx`

### Custom Hooks

Create custom hooks in `src/hooks/` for reusable logic:

```typescript
export function useContract() {
  const { contract } = useWallet();
  // ... hook logic
  return { /* ... */ };
}
```

## Deployment

### Vercel

```bash
npm run build
vercel --prod
```

### Docker

```bash
docker build -t private-parking-react .
docker run -p 3001:3001 private-parking-react
```

## Differences from Static Version

- **React Components**: Modular component architecture
- **TypeScript**: Full type safety
- **Context API**: State management with React Context
- **Modern Build**: Vite for fast development
- **Tailwind CSS**: Utility-first CSS framework
- **Hot Reload**: Instant updates during development

## Learn More

- [Original Static Version](../PrivateParkingReservation/)
- [FHEVM SDK Documentation](../../packages/fhevm-sdk/README.md)
- [Zama FHEVM Docs](https://docs.zama.ai/fhevm)
- [React Documentation](https://react.dev/)

## License

MIT
