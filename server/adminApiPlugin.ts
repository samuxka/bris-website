import crypto from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import { loadEnv } from 'vite';

const SESSION_COOKIE_NAME = 'bris_admin_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_UPLOAD_FILES = 10;
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB per image
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

interface RateRecord {
  count: number;
  resetAt: number;
}

const loginAttempts = new Map<string, RateRecord>();

function getClientIp(req: IncomingMessage): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) {
    return fwd.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'local';
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    result[key] = decodeURIComponent(val);
  }
  return result;
}

function verifyPinScrypt(pin: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  if (!salt || !keyHex) return false;
  const expected = Buffer.from(keyHex, 'hex');
  const derived = crypto.scryptSync(pin, salt, expected.length);
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

function signSessionToken(secret: string): string {
  const exp = Date.now() + SESSION_TTL_MS;
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `${exp}.${nonce}`;
  const sig = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string | undefined, secret: string): boolean {
  if (!token || !secret) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [expStr, nonce, sigHex] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const payload = `${expStr}.${nonce}`;
  const expectedHex = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  const sigBuf = Buffer.from(sigHex, 'hex');
  const expBuf = Buffer.from(expectedHex, 'hex');
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}

function sendJson(
  res: ServerResponse,
  status: number,
  body: Record<string, unknown>,
  extraHeaders?: Record<string, string | string[]>
) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (extraHeaders) {
    for (const [k, v] of Object.entries(extraHeaders)) {
      res.setHeader(k, v);
    }
  }
  res.end(JSON.stringify(body));
}

async function readJsonBody(
  req: IncomingMessage,
  maxBytes: number
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;

    req.on('data', (chunk: Buffer) => {
      total += chunk.length;
      if (total > maxBytes) {
        reject(new Error('PAYLOAD_TOO_LARGE'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

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

async function uploadSingleToCloudinary(
  dataUri: string,
  cloudName: string,
  apiKey: string,
  apiSecret: string,
  folder: string
): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto
    .createHash('sha1')
    .update(paramsToSign)
    .digest('hex');

  const form = new FormData();
  form.append('file', dataUri);
  form.append('api_key', apiKey);
  form.append('timestamp', timestamp);
  form.append('folder', folder);
  form.append('signature', signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
    {
      method: 'POST',
      body: form,
    }
  );

  const json = (await response.json()) as {
    secure_url?: string;
    error?: { message?: string };
  };

  if (!response.ok || !json.secure_url) {
    throw new Error(json.error?.message || 'Falha no upload para Cloudinary');
  }

  return json.secure_url;
}

export function adminApiPlugin(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    name: 'bris-admin-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url || '').split('?')[0];
        if (!url.startsWith('/api/admin/')) {
          return next();
        }

        const pinHash = env.ADMIN_PIN_HASH || process.env.ADMIN_PIN_HASH || '';
        const sessionSecret =
          env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || '';
        const cloudName =
          env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || '';
        const cloudApiKey =
          env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY || '';
        const cloudApiSecret =
          env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET || '';

        const isHttps =
          req.headers['x-forwarded-proto'] === 'https' ||
          Boolean((req.socket as { encrypted?: boolean }).encrypted);

        // GET /api/admin/session
        if (url === '/api/admin/session' && req.method === 'GET') {
          const cookies = parseCookies(req.headers.cookie);
          const authenticated = verifySessionToken(
            cookies[SESSION_COOKIE_NAME],
            sessionSecret
          );
          return sendJson(res, 200, { authenticated });
        }

        // POST /api/admin/logout
        if (url === '/api/admin/logout' && req.method === 'POST') {
          const clearCookie = `${SESSION_COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${isHttps ? '; Secure' : ''}`;
          return sendJson(
            res,
            200,
            { ok: true },
            { 'Set-Cookie': clearCookie }
          );
        }

        // POST /api/admin/login
        if (url === '/api/admin/login' && req.method === 'POST') {
          const ip = getClientIp(req);
          const now = Date.now();
          const record = loginAttempts.get(ip);
          if (record && record.resetAt > now && record.count >= MAX_LOGIN_ATTEMPTS) {
            return sendJson(res, 429, {
              ok: false,
              error: 'Muitas tentativas inválidas. Aguarde 15 minutos.',
            });
          }

          let body: Record<string, unknown>;
          try {
            body = await readJsonBody(req, 4096);
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

          if (!pinHash || !sessionSecret) {
            return sendJson(res, 500, {
              ok: false,
              error: 'Configuração de segurança do servidor incompleta.',
            });
          }

          const isValid = verifyPinScrypt(pin, pinHash);
          if (!isValid) {
            const current =
              record && record.resetAt > now
                ? { count: record.count + 1, resetAt: record.resetAt }
                : { count: 1, resetAt: now + LOCKOUT_WINDOW_MS };
            loginAttempts.set(ip, current);
            return sendJson(res, 401, {
              ok: false,
              error: 'Código de acesso incorreto.',
            });
          }

          loginAttempts.delete(ip);
          const token = signSessionToken(sessionSecret);
          const cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}${isHttps ? '; Secure' : ''}`;

          return sendJson(
            res,
            200,
            { ok: true },
            { 'Set-Cookie': cookie }
          );
        }

        // POST /api/admin/upload (Authenticated multi-image Cloudinary upload)
        if (url === '/api/admin/upload' && req.method === 'POST') {
          const cookies = parseCookies(req.headers.cookie);
          if (!verifySessionToken(cookies[SESSION_COOKIE_NAME], sessionSecret)) {
            return sendJson(res, 401, {
              ok: false,
              error: 'Sessão administrativa expirada ou inválida.',
            });
          }

          if (!cloudName || !cloudApiKey || !cloudApiSecret) {
            return sendJson(res, 500, {
              ok: false,
              error: 'Credenciais Cloudinary não configuradas no servidor.',
            });
          }

          let body: Record<string, unknown>;
          try {
            // Allow up to 60MB JSON payload for multiple base64 images
            body = await readJsonBody(req, 60 * 1024 * 1024);
          } catch (err) {
            const msg =
              err instanceof Error && err.message === 'PAYLOAD_TOO_LARGE'
                ? 'Arquivos muito grandes. Envie imagens de até 8MB cada.'
                : 'Formato de envio inválido.';
            return sendJson(res, 400, { ok: false, error: msg });
          }

          const files = Array.isArray(body.files) ? body.files : [];
          const folderRaw =
            typeof body.folder === 'string' ? body.folder : 'bris-pastelaria';
          const safeFolder = folderRaw.replace(/[^a-zA-Z0-9/_-]/g, '') || 'bris-pastelaria';

          if (files.length === 0 || files.length > MAX_UPLOAD_FILES) {
            return sendJson(res, 400, {
              ok: false,
              error: `Envie entre 1 e ${MAX_UPLOAD_FILES} imagens por vez.`,
            });
          }

          try {
            const validatedDataUris: string[] = [];
            for (const item of files) {
              if (!item || typeof item !== 'object') {
                throw new Error('Arquivo inválido.');
              }
              const { dataUri, mimeType } = item as {
                dataUri?: string;
                mimeType?: string;
              };
              if (
                typeof mimeType !== 'string' ||
                !ALLOWED_MIME_TYPES.has(mimeType) ||
                typeof dataUri !== 'string' ||
                !dataUri.startsWith(`data:${mimeType};base64,`)
              ) {
                throw new Error(
                  'Apenas imagens JPG, PNG, WebP ou AVIF são permitidas.'
                );
              }
              const base64Part = dataUri.split(',')[1] || '';
              const approxBytes = Math.ceil((base64Part.length * 3) / 4);
              if (approxBytes > MAX_FILE_BYTES) {
                throw new Error('Cada imagem deve ter no máximo 8MB.');
              }
              validatedDataUris.push(dataUri);
            }

            const urls = await Promise.all(
              validatedDataUris.map((uri) =>
                uploadSingleToCloudinary(
                  uri,
                  cloudName,
                  cloudApiKey,
                  cloudApiSecret,
                  safeFolder
                )
              )
            );

            return sendJson(res, 200, { ok: true, urls });
          } catch (err) {
            const message =
              err instanceof Error
                ? err.message
                : 'Erro ao fazer upload das imagens.';
            return sendJson(res, 400, { ok: false, error: message });
          }
        }

        return sendJson(res, 404, { ok: false, error: 'Endpoint não encontrado.' });
      });
    },
  };
}
