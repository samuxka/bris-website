import type { IncomingMessage, ServerResponse } from 'node:http';
import { SESSION_COOKIE_NAME, sendJson } from '../_security';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false });
  }
  const clear = `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
  return sendJson(res, 200, { ok: true }, clear);
}
