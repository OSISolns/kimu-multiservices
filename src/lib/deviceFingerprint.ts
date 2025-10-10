


"use client";

/**
 * Generate a device fingerprint based on browser characteristics
 * This creates a semi-stable identifier for the device/browser combination
 */
export function generateDeviceFingerprint(): string {
  // During SSR, return empty string to avoid hydration mismatch
  if (typeof window === 'undefined') {
    return '';
  }

  const components: string[] = [];

  // Screen resolution
  components.push(`${screen.width}x${screen.height}`);

  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Language
  components.push(navigator.language);

  // Platform
  components.push(navigator.platform);

  // Hardware concurrency (CPU cores)
  components.push(navigator.hardwareConcurrency?.toString() || '0');

  // Color depth
  components.push(screen.colorDepth.toString());

  // User agent (simplified to avoid including version numbers that change)
  const ua = navigator.userAgent;
  const browser = ua.includes('Chrome') ? 'Chrome' : 
                 ua.includes('Firefox') ? 'Firefox' : 
                 ua.includes('Safari') ? 'Safari' : 
                 ua.includes('Edge') ? 'Edge' : 'Other';
  components.push(browser);

  // Touch support
  components.push(('ontouchstart' in window).toString());

  // Available fonts (simplified check)
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const testString = 'abcdefghijklmnopqrstuvwxyz0123456789';
    ctx.font = '16px Arial';
    const arialWidth = ctx.measureText(testString).width;
    ctx.font = '16px Times';
    const timesWidth = ctx.measureText(testString).width;
    components.push(`${arialWidth},${timesWidth}`);
  }

  // Join all components and create a hash
  const fingerprint = components.join('|');
  
  // Simple hash function to create a shorter, more consistent identifier
  return hashString(fingerprint);
}

/**
 * Simple hash function to convert string to shorter identifier
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Get a human-readable device name based on browser characteristics
 */
export function generateDeviceName(): string {
  // During SSR, return consistent value to avoid hydration mismatch
  if (typeof window === 'undefined') {
    return 'Unknown Device';
  }

  const ua = navigator.userAgent;
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  // Detect browser
  if (ua.includes('Chrome') && !ua.includes('Edge')) {
    browser = 'Chrome';
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
  } else if (ua.includes('Edge')) {
    browser = 'Edge';
  }

  // Detect OS
  if (ua.includes('Windows')) {
    os = 'Windows';
  } else if (ua.includes('Mac')) {
    os = 'macOS';
  } else if (ua.includes('Linux')) {
    os = 'Linux';
  } else if (ua.includes('Android')) {
    os = 'Android';
  } else if (ua.includes('iOS')) {
    os = 'iOS';
  }

  return `${os} - ${browser}`;
}

/**
 * Check if device fingerprinting is available
 * Returns false during SSR to avoid hydration mismatch
 */
export function isDeviceFingerprintingAvailable(): boolean {
  // Always return false during SSR to ensure consistent rendering
  // This prevents hydration mismatches between server and client
  return typeof window !== 'undefined';
}
