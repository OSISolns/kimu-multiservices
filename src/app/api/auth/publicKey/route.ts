import { NextResponse } from 'next/server';
import { getRSAKeys } from '@/lib/encryption';

/**
 * Public Key API Route
 * Provides the RSA Public Key to the login form for client-side encryption.
 */
export async function GET() {
  try {
    const { publicKey } = getRSAKeys();
    
    // We return it as a JSON payload for easy loading in the client
    return NextResponse.json({
      success: true,
      publicKey,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to provide public key:', error);
    return NextResponse.json({
      success: false,
      error: 'Security service unavailable',
    }, { status: 503 });
  }
}
