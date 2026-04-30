#!/usr/bin/env node
/**
 * One-time migration: clears all SecretEnv records.
 *
 * Old records were encrypted + hashed with `password + username`.
 * New scheme uses `password + email`. Old records are unrecoverable
 * without the original plaintext passwords, so they're dropped.
 *
 * Usage (run from backend/):
 *   node migrate-clear-secretenv.mjs
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('MONGO_URI not set');
  process.exit(1);
}

await mongoose.connect(uri);
const result = await mongoose.connection.collection('secretenvs').deleteMany({});
console.log(`Deleted ${result.deletedCount} SecretEnv record(s).`);
await mongoose.disconnect();
