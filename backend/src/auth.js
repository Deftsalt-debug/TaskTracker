import crypto from 'node:crypto';

/*
 * Session tokens. A token is `<payload>.<signature>`: the payload is the user
 * id and an expiry, and the signature is an HMAC of it under a secret only the
 * server knows. The server can therefore trust the user id inside a token
 * without storing sessions, and a client cannot forge one for another user.
 */

const TOKEN_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * The signing secret. Set SESSION_SECRET in production so tokens survive a
 * restart; without it a random secret is used and everyone is signed out
 * whenever the server restarts.
 */
export function resolveSecret(env = process.env) {
  if (env.SESSION_SECRET && env.SESSION_SECRET.length >= 32) return env.SESSION_SECRET;
  if (env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be set to at least 32 characters in production.');
  }
  return crypto.randomBytes(32).toString('hex');
}

const sign = (payload, secret) => crypto.createHmac('sha256', secret).update(payload).digest('base64url');

export function issueToken(userId, secret, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: now + TOKEN_LIFETIME_MS })).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

/** The user id a token was issued for, or null if it is malformed, forged or expired. */
export function verifyToken(token, secret, now = Date.now()) {
  if (typeof token !== 'string') return null;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra !== undefined) return null;
  const expected = sign(payload, secret);
  const given = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  // timingSafeEqual: comparing signatures must not leak how many characters matched.
  if (given.length !== wanted.length || !crypto.timingSafeEqual(given, wanted)) return null;
  try {
    const { uid, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return Number.isInteger(uid) && typeof exp === 'number' && exp > now ? uid : null;
  } catch {
    return null;
  }
}

/** Express middleware: reject the request unless it carries a valid token; sets req.userId. */
export function requireAuth(secret) {
  return (req, res, next) => {
    const header = req.get('authorization') || '';
    const userId = verifyToken(header.startsWith('Bearer ') ? header.slice(7) : null, secret);
    if (userId === null) {
      return res.status(401).json({ status: 'error', message: 'Sign in to continue' });
    }
    req.userId = userId;
    next();
  };
}

/**
 * A small in-memory limiter for the sign-in routes, so a password cannot be
 * guessed at machine speed. Counts attempts per client address in a window.
 */
export function rateLimit({ max = 20, windowMs = 15 * 60 * 1000 } = {}) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      if (hits.size > 10_000) for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ status: 'error', message: 'Too many attempts. Try again in a few minutes.' });
    }
    next();
  };
}
