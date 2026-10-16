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
 * Verify a plain password against stored hash and salt using constant-time comparison.
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  if (!hash || !salt) return false;
  try {
    const verifyHash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
      .toString('hex');
    const hashBuf = Buffer.from(hash, 'utf-8');
    const verifyBuf = Buffer.from(verifyHash, 'utf-8');
    if (hashBuf.length !== verifyBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, verifyBuf);
  } catch {
    return false;
  }
}

/**
 * Generate a secure session token with expiration (30 days).
 */
export function generateToken(payload: { email: string; role: string; id: string }): string {
  const secret = process.env.NEXTAUTH_SECRET || '';
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not configured');
  }
  const data = JSON.stringify({
    ...payload,
    timestamp: Date.now(),
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  });
  const signature = crypto.createHmac('sha256', secret).update(data).digest('hex');
  return Buffer.from(data).toString('base64') + '.' + signature;
}

/**
 * Verify a session token with timing-safe check and expiration enforcement.
 */
export function verifyToken(token: string): { email: string; role: string; id: string } | null {
  try {
    if (!token || !token.includes('.')) return null;
    const [encodedData, signature] = token.split('.');
    const secret = process.env.NEXTAUTH_SECRET || '';
    if (!secret) return null;
    const data = Buffer.from(encodedData, 'base64').toString('utf-8');
    const expectedSignature = crypto.createHmac('sha256', secret).update(data).digest('hex');
    
    const sigBuf = Buffer.from(signature, 'utf-8');
    const expBuf = Buffer.from(expectedSignature, 'utf-8');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const parsed = JSON.parse(data);
    // Check expiration if present
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
