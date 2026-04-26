import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { createDecipheriv, createHash } from 'crypto';
import path from 'path';

// 5 attempts per 15 minutes per IP
const RATE_LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

const LOGIN_FORM = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Performance Reports</title>
<style>
  body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0f172a;color:#e2e8f0}
  form{background:#1e293b;padding:2rem;border-radius:8px;display:flex;flex-direction:column;gap:1rem;min-width:280px}
  h2{margin:0;font-size:1.1rem;color:#94a3b8}
  input{padding:.6rem .8rem;border-radius:6px;border:1px solid #334155;background:#0f172a;color:#e2e8f0;font-size:1rem}
  button{padding:.6rem;border-radius:6px;border:none;background:#3b82f6;color:#fff;font-size:1rem;cursor:pointer}
  button:hover{background:#2563eb}
  .err{color:#f87171;font-size:.875rem}
</style>
</head>
<body>
<form method="POST">
  <h2>Performance Reports</h2>
  {{ERROR}}
  <input type="password" name="password" placeholder="Password" autofocus required />
  <button type="submit">View Report</button>
</form>
</body>
</html>`;

async function decryptReport(password: string): Promise<string> {
  const encPath = path.join(process.cwd(), 'public', 'performance-report.enc');
  const payload = Buffer.from(await readFile(encPath, 'utf8'), 'base64');

  const iv = payload.subarray(0, 12);
  const authTag = payload.subarray(12, 28);
  const ciphertext = payload.subarray(28);

  const key = createHash('sha256').update(password).digest();
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

export async function GET() {
  const html = LOGIN_FORM.replace('{{ERROR}}', '');
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  if (!checkRateLimit(ip)) {
    const html = LOGIN_FORM.replace(
      '{{ERROR}}',
      '<p class="err">Too many attempts. Try again in 15 minutes.</p>',
    );
    return new NextResponse(html, {
      status: 429,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const correctPassword = process.env.AUDIT_PASSWORD;
  if (!correctPassword) {
    return new NextResponse('AUDIT_PASSWORD env var not set.', { status: 503 });
  }

  const formData = await req.formData();
  const submitted = formData.get('password');

  if (submitted !== correctPassword) {
    const html = LOGIN_FORM.replace('{{ERROR}}', '<p class="err">Incorrect password.</p>');
    return new NextResponse(html, {
      status: 401,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  try {
    const html = await decryptReport(correctPassword);
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  } catch {
    return new NextResponse(
      'No report available yet. Run: npm run audit && npm run encrypt-report',
      { status: 404 },
    );
  }
}
