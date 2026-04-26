import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { createDecipheriv, createHash } from 'crypto';
import path from 'path';

function isAuthorized(authHeader: string | null, password: string): boolean {
  if (!authHeader?.startsWith('Basic ')) return false;
  const decoded = Buffer.from(authHeader.slice(6), 'base64').toString();
  const colon = decoded.indexOf(':');
  if (colon === -1) return false;
  const pass = decoded.slice(colon + 1);
  return pass === password;
}

export async function GET(req: NextRequest) {
  const password = process.env.AUDIT_PASSWORD;

  if (!password) {
    return new NextResponse('AUDIT_PASSWORD env var not set.', { status: 503 });
  }

  if (!isAuthorized(req.headers.get('authorization'), password)) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Performance Reports"' },
    });
  }

  try {
    const encPath = path.join(process.cwd(), 'public', 'performance-report.enc');
    const payload = Buffer.from(await readFile(encPath, 'utf8'), 'base64');

    const iv = payload.subarray(0, 12);
    const authTag = payload.subarray(12, 28);
    const ciphertext = payload.subarray(28);

    const key = createHash('sha256').update(password).digest();
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    const html = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch {
    return new NextResponse(
      'No report available yet. Run: npm run audit && npm run encrypt-report',
      {
        status: 404,
      },
    );
  }
}
