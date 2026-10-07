import crypto from 'crypto';

/**
 * Hash a password using PBKDF2 with a cryptographically secure random salt.
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');
  return { hash, salt };
}

/**
 * Verify a plain password against stored hash and salt.
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  if (!hash || !salt) return false;
  const verifyHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');
  return hash === verifyHash;
}

/**
 * Generate a secure session token.
 */
export function generateToken(payload: { email: string; role: string; id: string }): string {
  const secret = process.env.NEXTAUTH_SECRET || 'azyra_super_secret_key_2026';
  const data = JSON.stringify({ ...payload, timestamp: Date.now() });
  const signature = crypto.createHmac('sha256', secret).update(data).digest('hex');
  return Buffer.from(data).toString('base64') + '.' + signature;
}

/**
 * Verify a session token.
 */
export function verifyToken(token: string): { email: string; role: string; id: string } | null {
  try {
    if (!token || !token.includes('.')) return null;
    const [encodedData, signature] = token.split('.');
    const secret = process.env.NEXTAUTH_SECRET || 'azyra_super_secret_key_2026';
    const data = Buffer.from(encodedData, 'base64').toString('utf-8');
    const expectedSignature = crypto.createHmac('sha256', secret).update(data).digest('hex');
    
    if (signature !== expectedSignature) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}
