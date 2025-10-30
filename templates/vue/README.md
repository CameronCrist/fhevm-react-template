# Vue Template

This template demonstrates how to build Vue 3 applications with FHEVM SDK integration.

## Available Examples

### Vue Voting Application
**Location**: `../../examples/vue-voting-app/`

A complete Vue 3 application demonstrating FHEVM SDK composables:
- Vue 3 Composition API
- Confidential voting system
- Encrypted vote tallying
- Reactive composables (useEncrypt, useDecrypt, useFhevmClient)
- Anonymous proposal management

**Quick Start**:
```bash
cd ../../examples/vue-voting-app
npm install
npm run dev
```

## Features

- ✅ Vue 3 with Composition API
- ✅ TypeScript support
- ✅ FHEVM SDK composables
- ✅ Reactive state management
- ✅ Vite for fast builds
- ✅ Modern Vue development patterns

## Key Composables

- `useFhevmClient` - FHEVM client initialization
- `useEncrypt` - Encryption operations
- `useDecrypt` - Decryption operations

## Getting Started

1. Copy the example to your project
2. Install dependencies: `npm install`
3. Configure your contract addresses
4. Start development: `npm run dev`

## Learn More

- [FHEVM SDK Documentation](../../packages/fhevm-sdk/README.md)
- [Vue Guide](../../docs/framework-guides/vue.md)
- [Project README](../../README.md)
