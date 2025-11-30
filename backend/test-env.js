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
console.log('🌐 Allowed CORS Origins:');
allowedOrigins.forEach((origin) => console.log('-', origin));
console.log('');

// Check if all required environment variables are present
const required = ['mongoUri', 'jwtSecret', 'clientUrl'];
const missing = required.filter((key) => !environment[key]);

if (missing.length === 0) {
  console.log('✅ All required environment variables are set!');
} else {
  console.log('❌ Missing required environment variables:', missing.join(', '));
  process.exit(1);
}
