import crypto from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

export const SESSION_COOKIE_NAME = 'bris_admin_session';
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
export const MAX_UPLOAD_FILES = 10;
export const MAX_FILE_BYTES = 8 * 1024 * 1024;
export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    result[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return result;
}

export function verifyPinScrypt(pin: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  if (!salt || !keyHex) return false;
  const expected = Buffer.from(keyHex, 'hex');
  const derived = crypto.scryptSync(pin, salt, expected.length);
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

export function signSessionToken(secret: string): string {
  const exp = Date.now() + SESSION_TTL_MS;
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `${exp}.${nonce}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined, secret: string): boolean {
  if (!token || !secret) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [expStr, nonce, sigHex] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const payload = `${expStr}.${nonce}`;
  const expectedHex = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const sigBuf = Buffer.from(sigHex, 'hex');
  const expBuf = Buffer.from(expectedHex, 'hex');
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}

export function sendJson(
  res: ServerResponse,
  status: number,
  body: Record<string, unknown>,
  cookie?: string
) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (cookie) {
    res.setHeader('Set-Cookie', cookie);
  }
  res.end(JSON.stringify(body));
}

export async function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const anyReq = req as IncomingMessage & { body?: unknown };
  if (anyReq.body && typeof anyReq.body === 'object') {
    return anyReq.body as Record<string, unknown>;
  }
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? (JSON.parse(raw) as Record<string, unknown>) : {});
      } catch {
        reject(new Error('INVALID_JSON'));
      }
    });
    req.on('error', reject);
  });
}
