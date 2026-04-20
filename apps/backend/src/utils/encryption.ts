/**
 * Backend E2EE Utility for Soouls
 * Uses Node.js crypto module for AES-GCM encryption.
 */
import * as crypto from 'node:crypto';

// A secret for derivation. Falls back to a mock for dev but should be in .env
const SYSTEM_SECRET = process.env.ENCRYPTION_SECRET || 'soouls-backend-secret-key-2024';

const keyCache = new Map<string, Buffer>();

/**
 * Derives an AES-GCM 256-bit encryption key using PBKDF2.
 * @param internalUserId The user's internal DB UUID (used as a salt).
 */
function deriveKey(internalUserId: string): Buffer {
  if (keyCache.has(internalUserId)) {
    return keyCache.get(internalUserId)!;
  }
  const key = crypto.pbkdf2Sync(
    SYSTEM_SECRET,
    internalUserId,
    100000,
    32, // 256 bits
    'sha256',
  );
  keyCache.set(internalUserId, key);
  return key;
}

/**
 * Encrypts a string of text using AES-256-GCM.
 * @param text The plain text to encrypt.
 * @param internalUserId The user's internal DB UUID.
 * @returns A base64 string containing the IV, Auth Tag, and CipherText.
 */
export function encryptData(text: string, internalUserId: string): string {
  if (!text) return '';
  try {
    const key = deriveKey(internalUserId);
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const authTag = cipher.getAuthTag();

    // Format: iv(base64):authTag(base64):cipherText(base64)
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt entry data.');
  }
}

/**
 * Decrypts a base64 encrypted string back into plain text.
 * @param encryptedPayload The iv:authTag:cipherText payload.
 * @param internalUserId The user's internal DB UUID.
 * @returns The decrypted plain text.
 */
export function decryptData(encryptedPayload: string, internalUserId: string): string {
  if (!encryptedPayload) return '';
  
  // Basic format check to avoid unnecessary decryption attempts on plain text
  if (!encryptedPayload.includes(':')) {
    return encryptedPayload;
  }

  try {
    const parts = encryptedPayload.split(':');
    if (parts.length !== 3) {
      return encryptedPayload; // Not our format, return as-is
    }

    const iv = Buffer.from(parts[0], 'base64');
    const authTag = Buffer.from(parts[1], 'base64');
    const encryptedText = parts[2];

    // Sanity check on buffer lengths for AES-GCM
    if (iv.length !== 12 || authTag.length !== 16) {
      return encryptedPayload;
    }

    const key = deriveKey(internalUserId);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    // Silent fail for decryption - most likely legacy data or wrong key
    // We log only in debug/dev if needed, but avoid flooding production logs
    if (process.env.NODE_ENV === 'development') {
      console.warn('Decryption failed for payload (likely legacy plain text):', (error as Error).message);
    }
    return encryptedPayload;
  }
}
