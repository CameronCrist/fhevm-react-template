# 📁 Project Structure - Universal FHEVM SDK

Complete overview of the project organization and file structure.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Root Structure](#root-structure)
- [SDK Package Structure](#sdk-package-structure)
- [Examples Structure](#examples-structure)
- [Documentation Structure](#documentation-structure)
- [Configuration Files](#configuration-files)

---

## 🌐 Overview

The Universal FHEVM SDK follows a monorepo structure with clear separation between:
- Core SDK package
- Example applications
- Documentation
- Configuration

```
fhevm-react-template/
├── 📦 packages/          # SDK source code
├── 🎯 examples/          # Demo applications
├── 📚 docs/              # Documentation
├── 🔧 .github/           # CI/CD workflows
└── 📄 Configuration      # Root config files
```

---

## 🗂️ Root Structure

```
fhevm-react-template/
│
├── 📦 packages/
│   └── fhevm-sdk/                    # Main SDK package
│
├── 🎯 examples/
│   ├── parking-reservation/          # Next.js + React demo
│   ├── vue-voting-app/              # Vue 3 voting demo
│   └── nodejs-api-server/           # Node.js API server
│
├── 📚 docs/
│   ├── framework-guides/            # Framework-specific docs
│   ├── getting-started.md
│   ├── api-reference.md
│   └── examples.md
│
├── 🔧 .github/
│   └── workflows/
│       └── ci.yml                   # GitHub Actions CI/CD
│
├── 📄 Root Files
│   ├── README.md                    # Main documentation
│   ├── FRAMEWORK_SUMMARY.md         # Framework comparison
│   ├── DEPLOYMENT.md                # Deployment guide
│   ├── PROJECT_STRUCTURE.md         # This file
│   ├── QUICK_START.md               # Quick start guide
│   ├── UPGRADE_SUMMARY.md           # Upgrade notes
│   ├── package.json                 # Root package config
│   ├── tsconfig.json                # TypeScript config
│   ├── .gitignore                   # Git ignore rules
│   └── LICENSE                      # MIT License
│
└── 🎥 demo.mp4                       # Video demonstration
```

---

## 📦 SDK Package Structure

### `packages/fhevm-sdk/`

Complete SDK implementation with framework-agnostic core.

```
packages/fhevm-sdk/
│
├── 📁 src/
│   ├── index.ts                     # Main exports
│   ├── client.ts                    # Core FHEVM client
│   ├── types.ts                     # TypeScript definitions
│   ├── encryption.ts                # Encryption functions
│   ├── decryption.ts                # Decryption functions
│   ├── hooks.ts                     # Base hooks (framework-agnostic)
│   ├── react.ts                     # React-specific hooks
│   ├── vue.ts                       # Vue-specific composables
│   ├── utils.ts                     # Utility functions
│   └── constants.ts                 # Constants and defaults
│
├── 📁 tests/
│   ├── client.test.ts               # Client tests
│   ├── encryption.test.ts           # Encryption tests
│   ├── hooks.test.ts                # Hook tests
│   └── utils.test.ts                # Utility tests
│
├── 📁 dist/                         # Built files (generated)
│   ├── index.js
│   ├── index.d.ts
│   └── ...
│
├── 📄 package.json                  # Package configuration
├── 📄 tsconfig.json                 # TypeScript config
├── 📄 vite.config.ts                # Vite build config
└── 📄 README.md                     # SDK documentation
```

### Key Files Explained

#### `src/index.ts`
Main entry point, exports all public APIs:
```typescript
// Core client
export { createFhevmClient } from './client';
export type { FhevmClient, FhevmConfig } from './types';

// Encryption/Decryption
export { encrypt, decrypt, batchEncrypt } from './encryption';

// React hooks
export { useEncrypt, useDecrypt, useFhevmClient } from './react';

// Vue composables
export { useEncrypt, useDecrypt, useFhevmClient } from './vue';

// Utilities
export * from './utils';
```

#### `src/client.ts`
Core FHEVM client implementation:
```typescript
export function createFhevmClient(config: FhevmConfig): FhevmClient {
  // Client initialization logic
}
```

#### `src/types.ts`
TypeScript type definitions:
```typescript
export type EncryptedType = 'euint8' | 'euint16' | 'euint32' | 'euint64' | 'ebool' | 'eaddress';
export interface FhevmClient { ... }
export interface EncryptedInput { ... }
```

---

## 🎯 Examples Structure

### 1. Parking Reservation (Next.js + React)

**Location**: `examples/parking-reservation/`

```
parking-reservation/
│
├── 📁 app/                          # Next.js App Router
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Home page
│   ├── globals.css                  # Global styles
│   └── api/                         # API routes
│       └── decrypt/
│           └── route.ts             # Decryption endpoint
│
├── 📁 components/
│   ├── providers.tsx                # Context providers
│   ├── registrations.tsx            # User registration
│   ├── parking-spots.tsx            # Spot management
│   ├── reservations.tsx             # Reservation system
│   ├── decryption-demo.tsx          # Decryption demo
│   └── wallet-connect.tsx           # Wallet integration
│
├── 📁 lib/
│   ├── contract.ts                  # Contract helpers
│   └── utils.ts                     # Utility functions
│
├── 📁 public/
│   └── assets/                      # Static assets
│
├── 📄 package.json                  # Dependencies
├── 📄 tsconfig.json                 # TypeScript config
├── 📄 next.config.js                # Next.js config
├── 📄 tailwind.config.ts            # Tailwind config
└── 📄 README.md                     # Documentation
```

### 2. Vue Voting App

**Location**: `examples/vue-voting-app/`

```
vue-voting-app/
│
├── 📁 src/
│   ├── 📁 components/
│   │   ├── VotingCard.vue           # Voting interface
│   │   ├── ProposalList.vue         # Proposal management
│   │   └── WalletConnect.vue        # Wallet connection
│   │
│   ├── 📁 composables/
│   │   ├── useFhevmClient.ts        # Client initialization
│   │   ├── useEncrypt.ts            # Encryption composable
│   │   └── useDecrypt.ts            # Decryption composable
│   │
│   ├── 📁 contracts/
│   │   ├── abi.ts                   # Contract ABI
│   │   └── addresses.ts             # Contract addresses
│   │
│   ├── App.vue                      # Root component
│   └── main.ts                      # Entry point
│
├── 📁 public/
│   └── assets/                      # Static files
│
├── 📄 index.html                    # HTML template
├── 📄 package.json                  # Dependencies
├── 📄 vite.config.ts                # Vite config
├── 📄 tsconfig.json                 # TypeScript config
├── 📄 .env.example                  # Environment template
└── 📄 README.md                     # Documentation
```

### 3. Node.js API Server

**Location**: `examples/nodejs-api-server/`

```
nodejs-api-server/
│
├── 📁 src/
│   ├── 📁 routes/
│   │   ├── encrypt.route.ts         # Encryption endpoints
│   │   ├── decrypt.route.ts         # Decryption endpoints
│   │   └── health.route.ts          # Health check
│   │
│   ├── 📁 services/
│   │   ├── encryption.service.ts    # Encryption logic
│   │   └── contract.service.ts      # Contract interaction
│   │
│   ├── 📁 middleware/
│   │   ├── auth.middleware.ts       # Authentication
│   │   ├── rateLimit.middleware.ts  # Rate limiting
│   │   └── validation.middleware.ts # Input validation
│   │
│   ├── fhevm-client.ts              # FHEVM client setup
│   ├── server.ts                    # Express server
│   └── cli.ts                       # CLI tool
│
├── 📁 dist/                         # Compiled output
│
├── 📁 tests/
│   ├── unit/                        # Unit tests
│   └── integration/                 # Integration tests
│
├── 📄 package.json                  # Dependencies
├── 📄 tsconfig.json                 # TypeScript config
├── 📄 .env.example                  # Environment template
└── 📄 README.md                     # Documentation
```

---

## 📚 Documentation Structure

### `docs/`

Comprehensive documentation for all aspects of the SDK.

```
docs/
│
├── 📁 framework-guides/
│   ├── react.md                     # React integration guide
│   ├── vue.md                       # Vue integration guide
│   ├── nextjs.md                    # Next.js integration guide
│   └── nodejs.md                    # Node.js integration guide
│
├── 📄 getting-started.md            # Quick start tutorial
├── 📄 api-reference.md              # Complete API docs
├── 📄 examples.md                   # Example code snippets
├── 📄 architecture.md               # Architecture overview
├── 📄 contributing.md               # Contribution guide
└── 📄 troubleshooting.md            # Common issues
```

### Documentation Content

#### `getting-started.md`
- Installation instructions
- Basic setup
- First encryption example
- Hello World tutorial

#### `api-reference.md`
- Complete API documentation
- Function signatures
- Type definitions
- Return values
- Error handling

#### `framework-guides/*.md`
- Framework-specific setup
- Best practices
- Code examples
- Common patterns
- Troubleshooting

---

## 🔧 Configuration Files

### Root Configuration

#### `package.json`
```json
{
  "name": "fhevm-react-template",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*",
    "examples/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "lint": "turbo run lint"
  }
}
```

#### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler"
  }
}
```

#### `.gitignore`
```
node_modules/
dist/
.next/
.env
.env.local
*.log
.DS_Store
coverage/
```

### Example-Specific Configs

#### Next.js (`next.config.js`)
```javascript
module.exports = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push('pino-pretty', 'encoding');
    return config;
  },
};
```

#### Vite (`vite.config.ts`)
```typescript
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
```

---

## 📊 File Size Overview

| Directory | Files | Purpose |
|-----------|-------|---------|
| `packages/fhevm-sdk/src/` | ~15 | Core SDK implementation |
| `examples/parking-reservation/` | ~30 | Next.js demo app |
| `examples/vue-voting-app/` | ~15 | Vue demo app |
| `examples/nodejs-api-server/` | ~20 | Node.js API server |
| `docs/` | ~10 | Documentation |
| Root | ~10 | Configuration & guides |

---

## 🎯 Key Directories Explained

### `/packages/fhevm-sdk/src/`
**Purpose**: Core SDK implementation
- Framework-agnostic encryption logic
- React hooks and Vue composables
- Type definitions and utilities
- Exported as NPM package

### `/examples/`
**Purpose**: Reference implementations
- Real-world use cases
- Framework-specific patterns
- Best practices demonstrations
- Copy-paste starting points

### `/docs/`
**Purpose**: Comprehensive documentation
- Getting started guides
- API references
- Framework tutorials
- Troubleshooting

### `/.github/workflows/`
**Purpose**: CI/CD automation
- Automated testing
- Build verification
- Deployment pipelines
- Version management

---

## 🔍 Finding Files

### By Feature

**Encryption**:
- Core: `packages/fhevm-sdk/src/encryption.ts`
- React: `packages/fhevm-sdk/src/react.ts`
- Vue: `packages/fhevm-sdk/src/vue.ts`
- Node.js: `examples/nodejs-api-server/src/services/encryption.service.ts`

**Decryption**:
- Core: `packages/fhevm-sdk/src/decryption.ts`
- React: `packages/fhevm-sdk/src/react.ts`
- Example: `examples/parking-reservation/components/decryption-demo.tsx`

**Client Setup**:
- Core: `packages/fhevm-sdk/src/client.ts`
- React: `examples/parking-reservation/components/providers.tsx`
- Vue: `examples/vue-voting-app/src/composables/useFhevmClient.ts`
- Node.js: `examples/nodejs-api-server/src/fhevm-client.ts`

### By Framework

**React**:
- `/packages/fhevm-sdk/src/react.ts`
- `/examples/parking-reservation/`

**Vue**:
- `/packages/fhevm-sdk/src/vue.ts`
- `/examples/vue-voting-app/`

**Next.js**:
- `/examples/parking-reservation/` (uses App Router)

**Node.js**:
- `/examples/nodejs-api-server/`

---

## 🚀 Adding New Files

### New Example Application

1. Create directory: `examples/my-app/`
2. Add package.json
3. Implement using SDK
4. Add README.md
5. Update root README

### New Documentation

1. Create file: `docs/my-guide.md`
2. Follow existing format
3. Add to documentation index
4. Link from main README

### New SDK Feature

1. Implement in: `packages/fhevm-sdk/src/`
2. Add tests: `packages/fhevm-sdk/tests/`
3. Update types: `packages/fhevm-sdk/src/types.ts`
4. Export in: `packages/fhevm-sdk/src/index.ts`
5. Document in: `docs/api-reference.md`

---

## 📞 Related Documentation

- [Quick Start Guide](./QUICK_START.md)
- [Framework Summary](./FRAMEWORK_SUMMARY.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [API Reference](./docs/api-reference.md)

---

**Built with ❤️ for the Zama FHE Challenge**
