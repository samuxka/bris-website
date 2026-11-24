import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabasePublishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
).trim();

export const supabase: SupabaseClient | null =
  supabaseUrl && supabasePublishableKey
    ? createClient(supabaseUrl, supabasePublishableKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

export function formatPrice(value: number): string {
  const num = Number.isFinite(value) ? value : 0;
  return `€${num.toFixed(2).replace('.', ',')}`;
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function sanitizeInput(value: string, maxLength = 500): string {
  return value.replace(/[<>]/g, '').trim().slice(0, maxLength);
}

export async function checkAdminSessionApi(): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/session', {
      method: 'GET',
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { authenticated?: boolean };
    return Boolean(data.authenticated);
  } catch {
    return false;
  }
}

export async function adminLoginApi(
  pin: string
): Promise<{ ok: boolean; error?: string }> {
  if (!/^\d{6}$/.test(pin)) {
    return { ok: false, error: 'A senha deve conter exatamente 6 números.' };
  }

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    return { ok: Boolean(data.ok), error: data.error };
  } catch {
    return { ok: false, error: 'Erro ao conectar com o servidor de autenticação.' };
  }
}

export async function adminLogoutApi(): Promise<void> {
  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'same-origin',
    });
  } catch {
    // ignore network errors on logout
  }
}

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Falha ao ler arquivo.'));
      }
    };
    reader.onerror = () => reject(new Error('Falha ao ler arquivo.'));
    reader.readAsDataURL(file);
  });
}

export async function uploadImagesToCloudinary(
  files: File[],
  folder = 'bris-pastelaria'
): Promise<string[]> {
  if (files.length === 0) return [];

  const allowedTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
  ]);
  for (const file of files) {
    if (!allowedTypes.has(file.type)) {
      throw new Error(
        `Formato não suportado (${file.name}). Use JPG, PNG, WebP ou AVIF.`
      );
    }
    if (file.size > 8 * 1024 * 1024) {
      throw new Error(`A imagem "${file.name}" excede o limite de 8MB.`);
    }
  }

  const encodedFiles = await Promise.all(
    files.map(async (file) => ({
      name: file.name,
      mimeType: file.type,
      dataUri: await fileToDataUri(file),
    }))
  );

  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files: encodedFiles, folder }),
  });

  const data = (await res.json()) as {
    ok?: boolean;
    urls?: string[];
    error?: string;
  };

  if (!res.ok || !data.ok || !Array.isArray(data.urls)) {
    throw new Error(data.error || 'Erro ao enviar imagens para o Cloudinary.');
  }

  return data.urls;
}
