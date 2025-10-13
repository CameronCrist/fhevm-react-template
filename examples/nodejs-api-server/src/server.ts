import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { initializeFhevmClient } from './fhevm-client.js';
import encryptRoute from './routes/encrypt.route.js';
import decryptRoute from './routes/decrypt.route.js';
import healthRoute from './routes/health.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 100),
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Optional API key authentication
if (process.env.API_KEY) {
  app.use('/api/', (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  });
}

// Routes
app.use('/api', encryptRoute);
app.use('/api', decryptRoute);
app.use('/api', healthRoute);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'FHEVM Node.js API Server',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      encrypt: 'POST /api/encrypt',
      encryptBatch: 'POST /api/encrypt/batch',
      decrypt: 'POST /api/decrypt',
    },
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
  });
});

// Initialize and start server
async function startServer() {
  try {
    // Initialize FHEVM client
    await initializeFhevmClient();

    // Start Express server
    app.listen(PORT, () => {
      console.log('\n🚀 FHEVM Node.js API Server');
      console.log(`   Server running on http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Chain ID: ${process.env.CHAIN_ID}`);
      console.log('\n📋 Available endpoints:');
      console.log(`   GET  /api/health`);
      console.log(`   POST /api/encrypt`);
      console.log(`   POST /api/encrypt/batch`);
      console.log(`   POST /api/decrypt\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
