/**
 * Encrypts the latest audit report so it can be safely committed to git.
 * Usage: AUDIT_PASSWORD=<password> node scripts/encrypt-report.mjs
 *
 * Format written to public/performance-report.enc (base64):
 *   iv (12 bytes) | authTag (16 bytes) | ciphertext
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { createCipheriv, createHash, randomBytes } from 'crypto';
import path from 'path';

const password = process.env.AUDIT_PASSWORD;
if (!password) {
  console.error('Error: AUDIT_PASSWORD env var is not set.');
  process.exit(1);
}

const reportsDir = path.join(process.cwd(), 'reports');

let files;
try {
  files = await readdir(reportsDir);
} catch {
  console.error('Error: reports/ directory not found. Run npm run audit first.');
  process.exit(1);
}

const reports = files
  .filter((f) => f.startsWith('audit-') && f.endsWith('.html'))
  .sort()
  .reverse();

if (!reports.length) {
  console.error('Error: No audit report found in reports/. Run npm run audit first.');
  process.exit(1);
}

const reportFile = reports[0];
const html = await readFile(path.join(reportsDir, reportFile));

const key = createHash('sha256').update(password).digest();
const iv = randomBytes(12);
const cipher = createCipheriv('aes-256-gcm', key, iv);
const ciphertext = Buffer.concat([cipher.update(html), cipher.final()]);
const authTag = cipher.getAuthTag();

const payload = Buffer.concat([iv, authTag, ciphertext]);

await mkdir(path.join(process.cwd(), 'public'), { recursive: true });
const outPath = path.join(process.cwd(), 'public', 'performance-report.enc');
await writeFile(outPath, payload.toString('base64'), 'utf8');

console.log(`✔  Encrypted  ${reportFile}  →  public/performance-report.enc`);
