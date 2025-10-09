/**
 * Utility functions for FHEVM SDK
 */

import type { EncryptedType } from './types';

/**
 * Validate encrypted type
 */
export function isValidEncryptedType(type: string): type is EncryptedType {
  const validTypes: EncryptedType[] = [
    'euint8',
    'euint16',
    'euint32',
    'euint64',
    'euint128',
    'ebool',
    'eaddress',
  ];
  return validTypes.includes(type as EncryptedType);
}

/**
 * Get the maximum value for an encrypted integer type
 */
export function getMaxValueForType(type: EncryptedType): bigint {
  switch (type) {
    case 'euint8':
      return 255n;
    case 'euint16':
      return 65535n;
    case 'euint32':
      return 4294967295n;
    case 'euint64':
      return 18446744073709551615n;
    case 'euint128':
      return (2n ** 128n) - 1n;
    case 'ebool':
      return 1n;
    default:
      throw new Error(`Cannot get max value for type: ${type}`);
  }
}

/**
 * Validate value for encrypted type
 */
export function validateValueForType(
  value: number | boolean,
  type: EncryptedType
): boolean {
  if (type === 'ebool') {
    return typeof value === 'boolean';
  }

  if (typeof value !== 'number') {
    return false;
  }

  const maxValue = getMaxValueForType(type);
  return value >= 0 && BigInt(value) <= maxValue;
}

/**
 * Format encrypted handle for display
 */
export function formatHandle(handle: string): string {
  if (handle.length <= 10) return handle;
  return `${handle.slice(0, 6)}...${handle.slice(-4)}`;
}

/**
 * Check if running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

/**
 * Check if running in Node.js environment
 */
export function isNode(): boolean {
  return typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
}

/**
 * Create a delay promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    backoffFactor?: number;
  } = {}
): Promise<T> {
  const { maxAttempts = 3, delayMs = 1000, backoffFactor = 2 } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      if (attempt < maxAttempts) {
        await delay(delayMs * Math.pow(backoffFactor, attempt - 1));
      }
    }
  }

  throw lastError!;
}
