/**
 * Security Utilities for FHE Operations
 * Handles validation, sanitization, and security checks
 */

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate handle format
 */
export function isValidHandle(handle: string): boolean {
  return /^0x[a-fA-F0-9]+$/.test(handle);
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[^\w\s.-]/gi, '');
}

/**
 * Validate numeric input within range
 */
export function isValidNumericInput(
  value: number,
  min: number = 0,
  max: number = Number.MAX_SAFE_INTEGER
): boolean {
  return !isNaN(value) && value >= min && value <= max;
}

/**
 * Check if chain ID is supported
 */
export function isSupportedChain(chainId: number): boolean {
  const supportedChains = [11155111]; // Sepolia
  return supportedChains.includes(chainId);
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  check(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}
