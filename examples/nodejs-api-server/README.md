# 🖥️ Node.js API Server - FHEVM SDK Example

A RESTful API server demonstrating server-side encryption/decryption with the Universal FHEVM SDK.

## 🎯 Features

- 🔐 **Server-Side Encryption** - Encrypt data on the backend
- 🔓 **Server-Side Decryption** - Decrypt confidential data with permissions
- 📦 **Batch Operations** - Encrypt multiple values at once
- 🔄 **Contract Integration** - Direct smart contract interaction
- 🛡️ **Security** - Rate limiting, authentication, validation
- 📊 **Logging** - Comprehensive operation logging
- 🧪 **Testing** - Unit and integration tests included

## 🏗️ Architecture

```
Node.js API Server
├── REST API (Express.js)
│   ├── POST /api/encrypt - Encrypt values
│   ├── POST /api/decrypt - Decrypt handles
│   ├── POST /api/submit - Submit to contract
│   └── GET /api/health - Health check
│
├── Services
│   ├── EncryptionService - Encryption logic
│   ├── ContractService - Contract interaction
│   └── ValidationService - Input validation
│
└── FHEVM SDK Integration
    ├── Client initialization
    ├── Provider management
    └── Signer configuration
```

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 18.0.0
npm or yarn
Ethereum wallet private key
RPC endpoint (Infura, Alchemy, etc.)
```

### Installation

```bash
# Navigate to example directory
cd examples/nodejs-api-server

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run development server
npm run dev
```

Server will start at `http://localhost:3000`

## 📦 Project Structure

```
nodejs-api-server/
├── src/
│   ├── services/
│   │   ├── encryption.service.ts
│   │   ├── contract.service.ts
│   │   └── validation.service.ts
│   ├── routes/
│   │   ├── encrypt.route.ts
│   │   ├── decrypt.route.ts
│   │   └── health.route.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   └── validation.middleware.ts
│   ├── fhevm-client.ts
│   ├── server.ts
│   └── cli.ts
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Network Configuration
RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
CHAIN_ID=11155111

# FHEVM Configuration
GATEWAY_URL=https://gateway.sepolia.zama.ai
PUBLIC_KEY_ENDPOINT=/fhe-key
ACL_ADDRESS=0x...

# Contract Configuration
CONTRACT_ADDRESS=0x78257622318fC85f2a9c909DD7aF9d0142cd90ce

# Wallet Configuration
PRIVATE_KEY=your_private_key_here

# Security (optional)
API_KEY=your_api_key_for_authentication
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

## 💻 API Endpoints

### 1. Encrypt a Value

**POST** `/api/encrypt`

```bash
curl -X POST http://localhost:3000/api/encrypt \
  -H "Content-Type: application/json" \
  -d '{
    "value": 42,
    "type": "euint32",
    "contractAddress": "0x78257622318fC85f2a9c909DD7aF9d0142cd90ce"
  }'
```

Response:
```json
{
  "success": true,
  "encrypted": {
    "handles": ["0x..."],
    "inputProof": "0x..."
  }
}
```

### 2. Decrypt a Value

**POST** `/api/decrypt`

```bash
curl -X POST http://localhost:3000/api/decrypt \
  -H "Content-Type: application/json" \
  -d '{
    "handle": "0x...",
    "contractAddress": "0x78257622318fC85f2a9c909DD7aF9d0142cd90ce"
  }'
```

Response:
```json
{
  "success": true,
  "value": 42
}
```

### 3. Batch Encrypt

**POST** `/api/encrypt/batch`

```bash
curl -X POST http://localhost:3000/api/encrypt/batch \
  -H "Content-Type: application/json" \
  -d '{
    "values": [
      {"value": 42, "type": "euint32"},
      {"value": true, "type": "ebool"},
      {"value": 100, "type": "euint16"}
    ],
    "contractAddress": "0x78257622318fC85f2a9c909DD7aF9d0142cd90ce"
  }'
```

Response:
```json
{
  "success": true,
  "encrypted": [
    {"handles": ["0x..."], "inputProof": "0x..."},
    {"handles": ["0x..."], "inputProof": "0x..."},
    {"handles": ["0x..."], "inputProof": "0x..."}
  ]
}
```

### 4. Submit to Contract

**POST** `/api/submit`

```bash
curl -X POST http://localhost:3000/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "value": 42,
    "type": "euint32"
  }'
```

Response:
```json
{
  "success": true,
  "txHash": "0x...",
  "blockNumber": 12345
}
```

### 5. Health Check

**GET** `/api/health`

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "chainId": "11155111",
  "uptime": 3600
}
```

## 🔐 SDK Integration

### Client Initialization

```typescript
// src/fhevm-client.ts
import { createFhevmClient } from '@fhevm/sdk';
import { JsonRpcProvider, Wallet } from 'ethers';

let fhevmClient: any = null;

export async function initializeFhevmClient() {
  const provider = new JsonRpcProvider(process.env.RPC_URL);
  const signer = new Wallet(process.env.PRIVATE_KEY!, provider);

  fhevmClient = createFhevmClient({
    provider,
    chainId: Number(process.env.CHAIN_ID),
    gatewayUrl: process.env.GATEWAY_URL,
  });

  await fhevmClient.init();
  console.log('✅ FHEVM Client initialized');

  return fhevmClient;
}
```

### Encryption Service

```typescript
// src/services/encryption.service.ts
import { getClient, getSigner } from '../fhevm-client';

export class EncryptionService {
  async encrypt(value: number | boolean, type: string, contractAddress: string) {
    const client = getClient();
    const signer = getSigner();

    const encrypted = await client.encrypt(value, type, {
      contractAddress,
      userAddress: signer.address,
    });

    return { success: true, data: encrypted };
  }

  async decrypt(handle: string, contractAddress: string) {
    const client = getClient();
    const signer = getSigner();

    const decrypted = await client.decrypt(handle, {
      contractAddress,
      userAddress: signer.address,
      signer,
    });

    return { success: true, value: decrypted };
  }
}
```

## 🛠️ CLI Tool

The server includes a CLI tool for quick operations:

```bash
# Encrypt a value
npm run cli encrypt --value 42 --type euint32 --contract 0x...

# Decrypt a value
npm run cli decrypt --handle 0x... --contract 0x...

# Submit to contract
npm run cli submit --value 42 --type euint32
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

### Example Test

```typescript
// tests/unit/encryption.test.ts
import { EncryptionService } from '../../src/services/encryption.service';

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeAll(async () => {
    await initializeFhevmClient();
    service = new EncryptionService();
  });

  test('should encrypt a value', async () => {
    const result = await service.encrypt(42, 'euint32', CONTRACT_ADDRESS);

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('handles');
    expect(result.data).toHaveProperty('inputProof');
  });
});
```

## 📊 Logging

The server includes comprehensive logging:

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

## 🔒 Security Features

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests
});

app.use('/api/', limiter);
```

### Input Validation

```typescript
import { body, validationResult } from 'express-validator';

app.post('/api/encrypt', [
  body('value').isNumeric().notEmpty(),
  body('type').isString().notEmpty(),
  body('contractAddress').isEthereumAddress(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Process request
});
```

### Authentication (Optional)

```typescript
function authenticateAPI(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.use('/api/', authenticateAPI);
```

## 🚀 Deployment

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build image
docker build -t fhevm-api-server .

# Run container
docker run -p 3000:3000 --env-file .env fhevm-api-server
```

### Production

```bash
# Build
npm run build

# Start production server
npm start
```

## 📈 Performance

- **Encryption**: ~50-100ms per operation
- **Decryption**: ~500ms-1s (gateway latency)
- **Throughput**: ~100 requests/second (with rate limiting)
- **Memory**: ~100MB average usage

## 🔗 Links

- **Documentation**: [Node.js Integration Guide](../../docs/framework-guides/nodejs.md)
- **SDK API**: [API Reference](../../docs/api-reference.md)
- **Smart Contract**: [0x78257622318fC85f2a9c909DD7aF9d0142cd90ce](https://sepolia.etherscan.io/address/0x78257622318fC85f2a9c909DD7aF9d0142cd90ce)

## 📝 License

MIT License - see [LICENSE](../../LICENSE) file for details.

---

**Built with Node.js, Express, and Universal FHEVM SDK** 🖥️🔐
