import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
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
    const reportPath = path.join(process.cwd(), 'public', 'performance-report.html');
    const html = await fs.readFile(reportPath, 'utf8');
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch {
    return new NextResponse('No report available yet. Run the audit first.', { status: 404 });
  }
}
