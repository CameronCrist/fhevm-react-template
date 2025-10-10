import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { EncryptionService } from '../services/encryption.service.js';

const router = Router();
const encryptionService = new EncryptionService();

/**
 * POST /api/decrypt
 * Decrypt an encrypted handle
 */
router.post(
  '/decrypt',
  [
    body('handle').isString().notEmpty().withMessage('Handle is required'),
    body('contractAddress')
      .isEthereumAddress()
      .withMessage('Invalid contract address'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { handle, contractAddress } = req.body;

    try {
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
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

export default router;
