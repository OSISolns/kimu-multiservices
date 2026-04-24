import { importJWK, jwtVerify, compactDecrypt } from 'jose';
import crypto from 'crypto';

/**
 * High-Security Payload Encryption Utility
 * Provides server-side decryption for sensitive login payloads.
 */

// We'll use RSA-OAEP for asymmetric encryption
const ALGORITHM = 'RSA-OAEP-256';

// For this implementation, we can generate a key pair for the server
// In a production environment, these should be stored in environment variables (e.g. RSA_PRIVATE_KEY)
// We provide a fallback generation for ease of setup
// Use globalThis to persist keys across hot reloads in Next.js development mode
const globalForCrypto = globalThis as unknown as {
  rsaKeys: { publicKey: string; privateKey: string } | null;
};

let CACHED_KEYS = globalForCrypto.rsaKeys || null;

export function getRSAKeys() {
  if (CACHED_KEYS) return CACHED_KEYS;
  
  // Try to get from environment variables
  if (process.env.RSA_PUBLIC_KEY && process.env.RSA_PRIVATE_KEY) {
    CACHED_KEYS = {
      publicKey: process.env.RSA_PUBLIC_KEY,
      privateKey: process.env.RSA_PRIVATE_KEY,
    };
    return CACHED_KEYS;
  }

  // Fallback: Generate a key pair if not in Env (In-memory only, will reset on server restart)
  // This is a "Secure Default" approach if the user hasn't configured keys yet.
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  CACHED_KEYS = { publicKey, privateKey };
  globalForCrypto.rsaKeys = CACHED_KEYS; // persist for Dev hot-reload
  return CACHED_KEYS;
}

/**
 * Decrypts data that was encrypted with the server's public key
 * @param encryptedData Base64 encoded encrypted string
 * @returns Decrypted string
 */
export async function decryptPayload(encryptedData: string): Promise<string> {
  try {
    const { privateKey } = getRSAKeys();
    
    // Using Node's built-in crypto for RSA decryption
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(encryptedData, 'base64')
    );
    
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Payload decryption failed:', error);
    throw new Error('Could not decrypt secure payload. Ensure the encryption format is correct.');
  }
}
