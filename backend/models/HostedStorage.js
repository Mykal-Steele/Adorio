import mongoose from 'mongoose';
import hostedStorageSchema from '../schemas/db/hostedStorageSchema.js';

export const HostedStorage = mongoose.model('HostedStorage', hostedStorageSchema);

export const LEDGER_KEY = 'hosted-files';

export const storageLedgerExists = () => HostedStorage.exists({ key: { $eq: LEDGER_KEY } });

// Creates the single ledger row on first use. $setOnInsert makes a concurrent
// second caller a no-op instead of a duplicate-key error, so two replicas
// starting at once can't both seed it.
export const initStorageLedger = (initialBytes) =>
  HostedStorage.updateOne(
    { key: { $eq: LEDGER_KEY } },
    { $setOnInsert: { key: LEDGER_KEY, totalBytes: initialBytes } },
    { upsert: true },
  );

// Reserves `bytes` only when it keeps the running total at or under `limit`.
// Returns the updated row, or null when it would overshoot — the caller reads
// null as "storage full". The $expr filter and the $inc are a single atomic
// update, so simultaneous reservations are serialized by Mongo and the cap
// cannot be crossed by a race.
export const reserveStorage = (bytes, limit) =>
  HostedStorage.findOneAndUpdate(
    { key: { $eq: LEDGER_KEY }, $expr: { $lte: [{ $add: ['$totalBytes', bytes] }, limit] } },
    { $inc: { totalBytes: bytes } },
    { new: true },
  ).lean();

// Clamped at zero so a double release (or a delete racing the stale sweep)
// can't drive the total negative and hand out phantom free space.
export const releaseStorage = (bytes) =>
  HostedStorage.updateOne({ key: { $eq: LEDGER_KEY } }, [
    {
      $set: {
        totalBytes: { $max: [0, { $subtract: [{ $ifNull: ['$totalBytes', 0] }, bytes] }] },
      },
    },
  ]);

export const getStorageTotal = async () => {
  const row = await HostedStorage.findOne({ key: { $eq: LEDGER_KEY } }).lean();
  return row?.totalBytes ?? 0;
};
