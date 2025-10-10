# 🖥️ Node.js Integration Guide

Complete guide for integrating the Universal FHEVM SDK with Node.js backend applications.

## Installation

```bash
npm install @fhevm/sdk ethers dotenv
```

## Basic Setup

### 1. Environment Configuration

Create `.env` file:

```env
# Network Configuration
RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
CHAIN_ID=11155111

# FHEVM Configuration
GATEWAY_URL=https://gateway.sepolia.zama.ai
PUBLIC_KEY_ENDPOINT=/fhe-key
ACL_ADDRESS=0x...

# Contract Configuration
CONTRACT_ADDRESS=0x78257622318fC85f2a9c909DD7aF9d0142cd90ce

# Wallet Configuration (for signing)
PRIVATE_KEY=your_private_key_here

# Service Configuration
PORT=3000
```

### 2. Initialize FHEVM Client

```typescript
// src/fhevm-client.ts
import { createFhevmClient } from '@fhevm/sdk';
import { JsonRpcProvider, Wallet } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

let fhevmClient: any = null;
let provider: JsonRpcProvider;
let signer: Wallet;

export async function initializeFhevmClient() {
  if (fhevmClient) {
    return fhevmClient;
  }

  // Initialize provider and signer
  provider = new JsonRpcProvider(process.env.RPC_URL);
  signer = new Wallet(process.env.PRIVATE_KEY!, provider);

  // Create FHEVM client
  fhevmClient = createFhevmClient({
    provider,
    chainId: Number(process.env.CHAIN_ID),
    gatewayUrl: process.env.GATEWAY_URL,
    publicKeyEndpoint: process.env.PUBLIC_KEY_ENDPOINT,
    aclAddress: process.env.ACL_ADDRESS,
  });

  // Initialize client
  await fhevmClient.init();

  console.log('✅ FHEVM Client initialized');
  console.log(`📍 Chain ID: ${process.env.CHAIN_ID}`);
  console.log(`🏠 Contract: ${process.env.CONTRACT_ADDRESS}`);

  return fhevmClient;
}

export function getProvider() {
  if (!provider) {
    throw new Error('Provider not initialized. Call initializeFhevmClient first.');
  }
  return provider;
}

export function getSigner() {
  if (!signer) {
    throw new Error('Signer not initialized. Call initializeFhevmClient first.');
  }
  return signer;
}

export function getClient() {
  if (!fhevmClient) {
    throw new Error('FHEVM Client not initialized. Call initializeFhevmClient first.');
  }
  return fhevmClient;
}
```

## Usage Examples

### 1. Simple Encryption Service

```typescript
// src/services/encryption.service.ts
import { getClient, getSigner } from '../fhevm-client';
import type { EncryptedType } from '@fhevm/sdk';

export class EncryptionService {
  /**
   * Encrypt a value for contract input
   */
  async encrypt(
    value: number | boolean,
    type: EncryptedType,
    contractAddress: string
  ) {
    const client = getClient();
    const signer = getSigner();

    try {
      const encrypted = await client.encrypt(value, type, {
        contractAddress,
        userAddress: signer.address,
      });

      console.log(`✅ Encrypted ${value} as ${type}`);
      console.log(`   Handle: ${encrypted.handles[0]}`);

      return {
        success: true,
        data: encrypted,
      };
    } catch (error) {
      console.error('❌ Encryption error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Decrypt a value from contract storage
   */
  async decrypt(
    handle: string,
    contractAddress: string
  ) {
    const client = getClient();
    const signer = getSigner();

    try {
      const decrypted = await client.decrypt(handle, {
        contractAddress,
        userAddress: signer.address,
        signer,
      });

      console.log(`✅ Decrypted handle: ${handle}`);
      console.log(`   Value: ${decrypted}`);

      return {
        success: true,
        value: decrypted,
      };
    } catch (error) {
      console.error('❌ Decryption error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Batch encrypt multiple values
   */
  async batchEncrypt(
    values: Array<{ value: number | boolean; type: EncryptedType }>,
    contractAddress: string
  ) {
    const client = getClient();
    const signer = getSigner();

    try {
      const encrypted = await Promise.all(
        values.map(({ value, type }) =>
          client.encrypt(value, type, {
            contractAddress,
            userAddress: signer.address,
          })
        )
      );

      console.log(`✅ Batch encrypted ${values.length} values`);

      return {
        success: true,
        data: encrypted,
      };
    } catch (error) {
      console.error('❌ Batch encryption error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
}
```

### 2. Contract Interaction Service

```typescript
// src/services/contract.service.ts
import { Contract } from 'ethers';
import { getProvider, getSigner } from '../fhevm-client';
import { EncryptionService } from './encryption.service';

const CONTRACT_ABI = [
  // Your contract ABI here
  {
    inputs: [
      { internalType: 'bytes32', name: 'handle', type: 'bytes32' },
      { internalType: 'bytes', name: 'inputProof', type: 'bytes' },
    ],
    name: 'submitEncryptedValue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export class ContractService {
  private contract: Contract;
  private encryptionService: EncryptionService;

  constructor(contractAddress: string) {
    const signer = getSigner();
    this.contract = new Contract(contractAddress, CONTRACT_ABI, signer);
    this.encryptionService = new EncryptionService();
  }

  /**
   * Submit an encrypted value to the contract
   */
  async submitEncryptedValue(value: number, type: 'euint8' | 'euint16' | 'euint32' | 'euint64') {
    try {
      // Encrypt the value
      const result = await this.encryptionService.encrypt(
        value,
        type,
        this.contract.target as string
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      // Submit to contract
      const tx = await this.contract.submitEncryptedValue(
        result.data.handles[0],
        result.data.inputProof
      );

      console.log(`📤 Transaction sent: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();

      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

      return {
        success: true,
        txHash: tx.hash,
        receipt,
      };
    } catch (error) {
      console.error('❌ Contract submission error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Retrieve and decrypt a value from the contract
   */
  async getDecryptedValue(handle: string) {
    try {
      const result = await this.encryptionService.decrypt(
        handle,
        this.contract.target as string
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      return {
        success: true,
        value: result.value,
      };
    } catch (error) {
      console.error('❌ Retrieval error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
}
```

### 3. Express.js API Server

```typescript
// src/server.ts
import express from 'express';
import cors from 'cors';
import { initializeFhevmClient } from './fhevm-client';
import { EncryptionService } from './services/encryption.service';
import { ContractService } from './services/contract.service';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
let encryptionService: EncryptionService;
let contractService: ContractService;

// Initialize FHEVM client on startup
async function initializeApp() {
  try {
    await initializeFhevmClient();
    encryptionService = new EncryptionService();
    contractService = new ContractService(process.env.CONTRACT_ADDRESS!);
    console.log('✅ Services initialized');
  } catch (error) {
    console.error('❌ Initialization error:', error);
    process.exit(1);
  }
}

// Routes

/**
 * POST /api/encrypt
 * Encrypt a value
 */
app.post('/api/encrypt', async (req, res) => {
  try {
    const { value, type, contractAddress } = req.body;

    if (!value || !type || !contractAddress) {
      return res.status(400).json({
        error: 'Missing required fields: value, type, contractAddress',
      });
    }

    const result = await encryptionService.encrypt(value, type, contractAddress);

    if (result.success) {
      res.json({
        success: true,
        encrypted: result.data,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: (error as Error).message,
    });
  }
});

/**
 * POST /api/decrypt
 * Decrypt a value
 */
app.post('/api/decrypt', async (req, res) => {
  try {
    const { handle, contractAddress } = req.body;

    if (!handle || !contractAddress) {
      return res.status(400).json({
        error: 'Missing required fields: handle, contractAddress',
      });
    }

    const result = await encryptionService.decrypt(handle, contractAddress);

    if (result.success) {
      res.json({
        success: true,
        value: result.value,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: (error as Error).message,
    });
  }
});

/**
 * POST /api/submit
 * Submit encrypted value to contract
 */
app.post('/api/submit', async (req, res) => {
  try {
    const { value, type } = req.body;

    if (!value || !type) {
      return res.status(400).json({
        error: 'Missing required fields: value, type',
      });
    }

    const result = await contractService.submitEncryptedValue(value, type);

    if (result.success) {
      res.json({
        success: true,
        txHash: result.txHash,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: (error as Error).message,
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    chainId: process.env.CHAIN_ID,
  });
});

// Start server
initializeApp().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  });
});

export default app;
```

### 4. CLI Tool

```typescript
// src/cli.ts
import { program } from 'commander';
import { initializeFhevmClient } from './fhevm-client';
import { EncryptionService } from './services/encryption.service';

program
  .name('fhevm-cli')
  .description('CLI tool for FHEVM encryption/decryption')
  .version('1.0.0');

program
  .command('encrypt')
  .description('Encrypt a value')
  .requiredOption('-v, --value <number>', 'Value to encrypt')
  .requiredOption('-t, --type <type>', 'Encryption type (euint8, euint16, euint32, euint64)')
  .requiredOption('-c, --contract <address>', 'Contract address')
  .action(async (options) => {
    await initializeFhevmClient();
    const service = new EncryptionService();

    console.log(`🔐 Encrypting ${options.value} as ${options.type}...`);

    const result = await service.encrypt(
      Number(options.value),
      options.type,
      options.contract
    );

    if (result.success) {
      console.log('\n✅ Encryption successful!');
      console.log(`\nHandle: ${result.data.handles[0]}`);
      console.log(`Proof: ${result.data.inputProof.substring(0, 50)}...`);
    } else {
      console.error(`\n❌ Error: ${result.error}`);
      process.exit(1);
    }
  });

program
  .command('decrypt')
  .description('Decrypt a value')
  .requiredOption('-h, --handle <handle>', 'Encrypted handle')
  .requiredOption('-c, --contract <address>', 'Contract address')
  .action(async (options) => {
    await initializeFhevmClient();
    const service = new EncryptionService();

    console.log(`🔓 Decrypting handle: ${options.handle}...`);

    const result = await service.decrypt(options.handle, options.contract);

    if (result.success) {
      console.log('\n✅ Decryption successful!');
      console.log(`\nValue: ${result.value}`);
    } else {
      console.error(`\n❌ Error: ${result.error}`);
      process.exit(1);
    }
  });

program.parse();
```

Usage:

```bash
# Encrypt a value
node dist/cli.js encrypt --value 42 --type euint32 --contract 0x...

# Decrypt a value
node dist/cli.js decrypt --handle 0x... --contract 0x...
```

### 5. Scheduled Job (Cron)

```typescript
// src/jobs/encryption-job.ts
import cron from 'node-cron';
import { initializeFhevmClient } from '../fhevm-client';
import { ContractService } from '../services/contract.service';

export async function startEncryptionJob() {
  await initializeFhevmClient();
  const contractService = new ContractService(process.env.CONTRACT_ADDRESS!);

  // Run every hour
  cron.schedule('0 * * * *', async () => {
    console.log('🕐 Running scheduled encryption job...');

    try {
      // Encrypt and submit a random value
      const randomValue = Math.floor(Math.random() * 1000);
      const result = await contractService.submitEncryptedValue(
        randomValue,
        'euint32'
      );

      if (result.success) {
        console.log(`✅ Job completed. TX: ${result.txHash}`);
      } else {
        console.error(`❌ Job failed: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Job error:', error);
    }
  });

  console.log('✅ Encryption job scheduled (every hour)');
}
```

## Testing

### 1. Unit Tests (Jest)

```typescript
// tests/encryption.test.ts
import { EncryptionService } from '../src/services/encryption.service';
import { initializeFhevmClient } from '../src/fhevm-client';

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeAll(async () => {
    await initializeFhevmClient();
    service = new EncryptionService();
  });

  test('should encrypt a value', async () => {
    const result = await service.encrypt(
      42,
      'euint32',
      process.env.CONTRACT_ADDRESS!
    );

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('handles');
    expect(result.data).toHaveProperty('inputProof');
  });

  test('should handle encryption errors', async () => {
    const result = await service.encrypt(
      -1,  // Invalid value for euint8
      'euint8',
      process.env.CONTRACT_ADDRESS!
    );

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### 2. Integration Tests

```typescript
// tests/integration.test.ts
import request from 'supertest';
import app from '../src/server';

describe('API Integration Tests', () => {
  test('POST /api/encrypt should encrypt a value', async () => {
    const response = await request(app)
      .post('/api/encrypt')
      .send({
        value: 42,
        type: 'euint32',
        contractAddress: process.env.CONTRACT_ADDRESS,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.encrypted).toHaveProperty('handles');
  });

  test('GET /api/health should return status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
```

## Best Practices

### 1. Error Handling

```typescript
try {
  const result = await encryptionService.encrypt(value, type, address);
  if (!result.success) {
    throw new Error(result.error);
  }
} catch (error) {
  console.error('Operation failed:', error);
  // Handle error appropriately
}
```

### 2. Connection Pooling

```typescript
// Reuse the same client instance
let clientInstance: any = null;

export async function getOrCreateClient() {
  if (!clientInstance) {
    clientInstance = await initializeFhevmClient();
  }
  return clientInstance;
}
```

### 3. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 4. Logging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

logger.info('Encryption completed', { value: encrypted });
```

---

For more information:
- [Getting Started](../getting-started.md)
- [API Reference](../api-reference.md)
- [Examples](../examples.md)
