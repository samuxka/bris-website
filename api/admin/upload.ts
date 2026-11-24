import crypto from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_BYTES,
  MAX_UPLOAD_FILES,
  SESSION_COOKIE_NAME,
  parseCookies,
  readBody,
  sendJson,
  verifySessionToken,
} from '../_security';

async function uploadToCloudinary(
  dataUri: string,
  cloudName: string,
  apiKey: string,
  apiSecret: string,
  folder: string
): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = crypto
    .createHash('sha1')
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');

  const form = new FormData();
  form.append('file', dataUri);
  form.append('api_key', apiKey);
  form.append('timestamp', timestamp);
  form.append('folder', folder);
  form.append('signature', signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
    { method: 'POST', body: form }
  );

  const json = (await response.json()) as {
    secure_url?: string;
    error?: { message?: string };
  };

  if (!response.ok || !json.secure_url) {
    throw new Error(json.error?.message || 'Erro ao enviar imagem.');
  }
  return json.secure_url;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, error: 'Method not allowed' });
  }

  const cookies = parseCookies(req.headers.cookie);
  if (
    !verifySessionToken(
      cookies[SESSION_COOKIE_NAME],
      process.env.ADMIN_SESSION_SECRET || ''
    )
  ) {
    return sendJson(res, 401, { ok: false, error: 'Não autorizado.' });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
  const apiKey = process.env.CLOUDINARY_API_KEY || '';
  const apiSecret = process.env.CLOUDINARY_API_SECRET || '';
  if (!cloudName || !apiKey || !apiSecret) {
    return sendJson(res, 500, {
      ok: false,
      error: 'Cloudinary não configurado no servidor.',
    });
  }

  let body: Record<string, unknown>;
  try {
    body = await readBody(req);
  } catch {
    return sendJson(res, 400, { ok: false, error: 'Payload inválido.' });
  }

  const files = Array.isArray(body.files) ? body.files : [];
  const folder =
    (typeof body.folder === 'string' ? body.folder : 'bris-pastelaria').replace(
      /[^a-zA-Z0-9/_-]/g,
      ''
    ) || 'bris-pastelaria';

  if (files.length === 0 || files.length > MAX_UPLOAD_FILES) {
    return sendJson(res, 400, {
      ok: false,
      error: `Envie entre 1 e ${MAX_UPLOAD_FILES} imagens.`,
    });
  }

  try {
    const valid: string[] = [];
    for (const item of files) {
      const { dataUri, mimeType } = (item || {}) as {
        dataUri?: string;
        mimeType?: string;
      };
      if (
        typeof mimeType !== 'string' ||
        !ALLOWED_MIME_TYPES.has(mimeType) ||
        typeof dataUri !== 'string' ||
        !dataUri.startsWith(`data:${mimeType};base64,`)
      ) {
        throw new Error('Formato não permitido. Use JPG, PNG, WebP ou AVIF.');
      }
      const b64 = dataUri.split(',')[1] || '';
      if (Math.ceil((b64.length * 3) / 4) > MAX_FILE_BYTES) {
        throw new Error('Limite máximo de 8MB por imagem.');
      }
      valid.push(dataUri);
    }

    const urls = await Promise.all(
      valid.map((uri) =>
        uploadToCloudinary(uri, cloudName, apiKey, apiSecret, folder)
      )
    );
    return sendJson(res, 200, { ok: true, urls });
  } catch (err) {
    return sendJson(res, 400, {
      ok: false,
      error: err instanceof Error ? err.message : 'Erro no upload.',
    });
  }
}
