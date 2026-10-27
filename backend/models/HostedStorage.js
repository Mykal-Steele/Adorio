import mongoose from 'mongoose';
import hostedStorageSchema from '../schemas/db/hostedStorageSchema.js';

export const HostedStorage = mongoose.model('HostedStorage', hostedStorageSchema);

export const LEDGER_KEY = 'hosted-files';

export const storageLedgerExists = () => HostedStorage.exists({ key: { $eq: LEDGER_KEY } });

// Creates the one ledger row on first use. With $setOnInsert a second caller at
// the same time is a no-op, not a duplicate key error, so two replicas starting
// together can't both seed it.
export const initStorageLedger = (initialBytes) =>
  HostedStorage.updateOne(
    { key: { $eq: LEDGER_KEY } },
    { $setOnInsert: { key: LEDGER_KEY, totalBytes: initialBytes } },
    { upsert: true },
  );

// Reserves `bytes` only if the total stays at or under `limit`. Returns null
// when it would go over, which the caller treats as "storage full". The $expr
// filter and $inc are one atomic update, so Mongo serializes concurrent
// reservations and a race can't push past the cap.
export const reserveStorage = (bytes, limit) =>
  HostedStorage.findOneAndUpdate(
    { key: { $eq: LEDGER_KEY }, $expr: { $lte: [{ $add: ['$totalBytes', bytes] }, limit] } },
    { $inc: { totalBytes: bytes } },
    { new: true },
  ).lean();

// Clamped at zero so a double release (or a delete racing the stale sweep)
// can't push the total negative and hand out free space that isn't there.
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
