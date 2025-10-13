import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { EncryptionService } from '../services/encryption.service.js';
import type { EncryptedType } from '@fhevm/sdk';

const router = Router();
const encryptionService = new EncryptionService();

/**
 * POST /api/encrypt
 * Encrypt a single value
 */
router.post(
  '/encrypt',
  [
    body('value').notEmpty().withMessage('Value is required'),
    body('type')
      .isString()
      .isIn(['euint8', 'euint16', 'euint32', 'euint64', 'ebool', 'eaddress'])
      .withMessage('Invalid encryption type'),
    body('contractAddress')
      .isEthereumAddress()
      .withMessage('Invalid contract address'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { value, type, contractAddress } = req.body;

    try {
      const result = await encryptionService.encrypt(
        value,
        type as EncryptedType,
        contractAddress
      );

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
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

/**
 * POST /api/encrypt/batch
 * Encrypt multiple values
 */
router.post(
  '/encrypt/batch',
  [
    body('values').isArray().withMessage('Values must be an array'),
    body('values.*.value').notEmpty().withMessage('Each value is required'),
    body('values.*.type')
      .isString()
      .isIn(['euint8', 'euint16', 'euint32', 'euint64', 'ebool', 'eaddress'])
      .withMessage('Invalid encryption type'),
    body('contractAddress')
      .isEthereumAddress()
      .withMessage('Invalid contract address'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { values, contractAddress } = req.body;

    try {
      const result = await encryptionService.encryptBatch(
        values,
        contractAddress
      );

      if (result.success) {
        res.json({
          success: true,
          encrypted: result.data,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Batch encryption failed',
          details: result.data,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

export default router;
