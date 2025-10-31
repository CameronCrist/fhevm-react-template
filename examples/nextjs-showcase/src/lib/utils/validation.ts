/**
 * Validation Utilities for FHE Operations
 * Handles input validation and data verification
 */

import type { EncryptedType } from '../fhe/types';

/**
 * Validate encrypted type string
 */
export function isValidEncryptedType(type: string): type is EncryptedType {
  const validTypes: EncryptedType[] = [
    'euint8',
    'euint16',
    'euint32',
    'euint64',
    'euint128',
    'ebool',
    'eaddress'
  ];
  return validTypes.includes(type as EncryptedType);
}

/**
 * Validate value for specific encrypted type
 */
export function validateValueForType(
  value: number | bigint | boolean,
  type: EncryptedType
): { valid: boolean; error?: string } {
  if (type === 'ebool') {
    if (typeof value !== 'boolean') {
      return { valid: false, error: 'Value must be boolean for ebool type' };
    }
    return { valid: true };
  }

  const numValue = typeof value === 'bigint' ? value : BigInt(value);

  if (numValue < 0n) {
    return { valid: false, error: 'Value cannot be negative' };
  }

  const maxValues: Record<Exclude<EncryptedType, 'ebool' | 'eaddress'>, bigint> = {
    euint8: 255n,
    euint16: 65535n,
    euint32: 4294967295n,
    euint64: 18446744073709551615n,
    euint128: 340282366920938463463374607431768211455n
  };

  if (type in maxValues) {
    const max = maxValues[type as keyof typeof maxValues];
    if (numValue > max) {
      return { valid: false, error: `Value exceeds maximum for ${type}: ${max}` };
    }
  }

  return { valid: true };
}

/**
 * Parse and validate numeric input
 */
export function parseNumericInput(input: string): {
  value: number | null;
  error?: string;
} {
  const trimmed = input.trim();

  if (trimmed === '') {
    return { value: null, error: 'Input cannot be empty' };
  }

  const num = Number(trimmed);

  if (isNaN(num)) {
    return { value: null, error: 'Input must be a valid number' };
  }

  if (!Number.isFinite(num)) {
    return { value: null, error: 'Input must be a finite number' };
  }

  return { value: num };
}

/**
 * Validate encryption options
 */
export function validateEncryptionOptions(options: {
  contractAddress?: string;
  userAddress?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!options.contractAddress) {
    errors.push('Contract address is required');
  } else if (!/^0x[a-fA-F0-9]{40}$/.test(options.contractAddress)) {
    errors.push('Invalid contract address format');
  }

  if (!options.userAddress) {
    errors.push('User address is required');
  } else if (!/^0x[a-fA-F0-9]{40}$/.test(options.userAddress)) {
    errors.push('Invalid user address format');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
