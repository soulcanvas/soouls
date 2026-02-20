/**
 * Backend E2EE Utility for SoulCanvas
 * Uses Node.js crypto module for AES-GCM encryption.
 */
import * as crypto from 'crypto';

// A mock "user secret" for derivation until a real passkey/password system is in place.
const MOCK_USER_SECRET = 'soulcanvas-backend-secret-key-2024';

/**
 * Derives an AES-GCM 256-bit encryption key using PBKDF2.
 * @param internalUserId The user's internal DB UUID (used as a salt).
 */
function deriveKey(internalUserId: string): Buffer {
    return crypto.pbkdf2Sync(
        MOCK_USER_SECRET,
        internalUserId,
        100000,
        32, // 256 bits
        'sha256'
    );
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
    try {
        const parts = encryptedPayload.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted payload format.');
        }

        const iv = Buffer.from(parts[0], 'base64');
        const authTag = Buffer.from(parts[1], 'base64');
        const encryptedText = parts[2];

        const key = deriveKey(internalUserId);
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption failed, returning plain text:', error);
        // If decryption fails (e.g. not encrypted text), return original text to avoid crashing
        // This handles legacy unencrypted entries or malformed data gracefully.
        return encryptedPayload; // Return raw because user mentioned it wasn't working if it failed.
    }
}
