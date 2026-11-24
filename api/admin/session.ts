import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  SESSION_COOKIE_NAME,
  parseCookies,
  sendJson,
  verifySessionToken,
} from '../_security';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { authenticated: false });
  }
  const cookies = parseCookies(req.headers.cookie);
  const authenticated = verifySessionToken(
    cookies[SESSION_COOKIE_NAME],
    process.env.ADMIN_SESSION_SECRET || ''
  );
  return sendJson(res, 200, { authenticated });
}
