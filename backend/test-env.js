#!/usr/bin/env node
import { environment, allowedOrigins } from './config/environment.js';

console.log('🔧 Environment Configuration Test');
console.log('==================================');
console.log('NODE_ENV:', environment.nodeEnv);
console.log('PORT:', environment.port);
console.log('CLIENT_URL:', environment.clientUrl);
console.log('MONGO_URI:', environment.mongoUri ? '✅ Set' : '❌ Missing');
console.log('JWT_SECRET:', environment.jwtSecret ? '✅ Set' : '❌ Missing');
console.log('VITE_BACKEND_URL:', environment.viteBackendUrl);
console.log('');
console.log('📡 Cloudinary Configuration:');
console.log('Name:', environment.cloudinary.name);
console.log('Key:', environment.cloudinary.key ? '✅ Set' : '❌ Missing');
console.log('Secret:', environment.cloudinary.secret ? '✅ Set' : '❌ Missing');
console.log('');
console.log('🧪 Piston Configuration:');
console.log('URL:', environment.piston.url || '❌ Missing');
console.log('Token:', environment.piston.token ? '✅ Set' : '❌ Missing');
console.log('CA cert (PISTON_CA_CERT):', process.env.NODE_EXTRA_CA_CERTS ? '✅ Set' : '❌ Missing');
console.log('');
console.log('🗂️  R2 Hosted Files:');
const r2Ready = Boolean(
  environment.r2.accountId &&
  environment.r2.accessKeyId &&
  environment.r2.secretAccessKey &&
  environment.r2.bucket,
);
console.log('Account ID:', environment.r2.accountId || '❌ Missing');
console.log('Bucket:', environment.r2.bucket || '❌ Missing');
console.log('Public URL:', environment.r2.publicUrl || '❌ Missing');
console.log(
  'Access keys:',
  environment.r2.accessKeyId && environment.r2.secretAccessKey ? '✅ Set' : '❌ Missing',
);
console.log('Status:', r2Ready ? '✅ Configured' : '⚠️  Not configured (file hosting disabled)');
console.log('');
console.log('🌐 Allowed CORS Origins:');
allowedOrigins.forEach((origin) => console.log('-', origin));
console.log('');

const required = ['mongoUri', 'jwtSecret', 'clientUrl'];
const missing = required.filter((key) => !environment[key]);

if (missing.length === 0) {
  console.log('✅ All required environment variables are set!');
} else {
  console.log('❌ Missing required environment variables:', missing.join(', '));
  process.exit(1);
}
