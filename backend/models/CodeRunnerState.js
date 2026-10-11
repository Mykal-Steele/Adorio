import mongoose from 'mongoose';
import codeRunnerStateSchema from '../schemas/db/codeRunnerStateSchema.js';

export const CodeRunnerState = mongoose.model('CodeRunnerState', codeRunnerStateSchema);

export const findRunnerState = (key) => CodeRunnerState.findOne({ key: { $eq: key } }).lean();

// $max so the time only ever moves forward: a 30-minute extension from one
// person's run can't shorten a 3-hour hold an admin set a moment earlier, no
// matter which write lands last.
export const extendRunnerKeepUntil = (key, keepUntil) =>
  CodeRunnerState.findOneAndUpdate(
    { key: { $eq: key } },
    { $max: { keepUntil }, $setOnInsert: { key } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();

// Returns the state only to the first caller for a given minute and null to
// everyone after, which is what keeps several replicas from each running the
// stop check (and each counting the same minute of usage).
export const claimRunnerTick = (key, minute) =>
  CodeRunnerState.findOneAndUpdate(
    { key: { $eq: key }, lastTickMinute: { $lt: minute } },
    { $set: { lastTickMinute: minute } },
    { new: true },
  ).lean();

export const markRunnerStartRequested = (key, at) =>
  CodeRunnerState.updateOne(
    { key: { $eq: key } },
    { $set: { lastStartAt: at, lastReadyAt: null } },
  );

// Matches only the first time the runner is seen ready after a start, so the
// start duration is logged once no matter how many requests notice it.
export const markRunnerReady = (key, at) =>
  CodeRunnerState.findOneAndUpdate(
    { key: { $eq: key }, lastStartAt: { $ne: null }, lastReadyAt: { $eq: null } },
    { $set: { lastReadyAt: at } },
  ).lean();

export const addRunnerUsageMinute = async (key, day) => {
  const sameDay = await CodeRunnerState.updateOne(
    { key: { $eq: key }, usageDay: { $eq: day } },
    { $inc: { usageMinutes: 1 } },
  );
  if (sameDay.matchedCount > 0) return;
  await CodeRunnerState.updateOne(
    { key: { $eq: key } },
    { $set: { usageDay: day, usageMinutes: 1 } },
  );
};
