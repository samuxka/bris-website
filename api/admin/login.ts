import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
  readBody,
  sendJson,
  signSessionToken,
  verifyPinScrypt,
} from '../_security.js';

const attempts = new Map<string, { count: number; resetAt: number }>();

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, error: 'Method not allowed' });
  }

  const ip =
    (typeof req.headers['x-forwarded-for'] === 'string'
      ? req.headers['x-forwarded-for'].split(',')[0].trim()
      : req.socket.remoteAddress) || 'unknown';

  const now = Date.now();
  const record = attempts.get(ip);
  if (record && record.resetAt > now && record.count >= 5) {
    return sendJson(res, 429, {
      ok: false,
      error: 'Muitas tentativas inválidas. Aguarde 15 minutos.',
    });
  }

  let body: Record<string, unknown>;
  try {
    body = await readBody(req);
  } catch {
    return sendJson(res, 400, { ok: false, error: 'Requisição inválida.' });
  }

  const pin = typeof body.pin === 'string' ? body.pin.trim() : '';
  if (!/^\d{6}$/.test(pin)) {
    return sendJson(res, 400, {
      ok: false,
      error: 'A senha deve conter exatamente 6 números.',
    });
  }

  const pinHash = process.env.ADMIN_PIN_HASH || '';
  const sessionSecret = process.env.ADMIN_SESSION_SECRET || '';
  if (!pinHash || !sessionSecret) {
    return sendJson(res, 500, {
      ok: false,
      error: 'Variáveis de segurança não configuradas no servidor.',
    });
  }

  if (!verifyPinScrypt(pin, pinHash)) {
    const next =
      record && record.resetAt > now
        ? { count: record.count + 1, resetAt: record.resetAt }
        : { count: 1, resetAt: now + 15 * 60 * 1000 };
    attempts.set(ip, next);
    return sendJson(res, 401, { ok: false, error: 'Código de acesso incorreto.' });
  }

  attempts.delete(ip);
  const token = signSessionToken(sessionSecret);
  const cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`;
  return sendJson(res, 200, { ok: true }, cookie);
}
