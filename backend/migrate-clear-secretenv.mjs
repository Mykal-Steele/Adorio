#!/usr/bin/env node
/**
 * One-time migration that deletes every SecretEnv record.
 *
 * Old records were hashed with password + username, the new scheme uses
 * password + email. Without the plaintext passwords the old ones can't be
 * recovered, so they get dropped.
 *
 * Run from backend/: node migrate-clear-secretenv.mjs
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
