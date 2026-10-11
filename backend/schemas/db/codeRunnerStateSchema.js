import mongoose from 'mongoose';

// One document per runner, shared by every backend replica. It is the only
// place the "keep the VM on until" decision lives, so a deploy, a restart, or
// a second replica never loses or duplicates it.
const codeRunnerStateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    keepUntil: { type: Date, required: true, default: () => new Date(0) },
    // Minute (epoch minutes) of the last stop check, so only one replica runs
    // the check for any given minute.
    lastTickMinute: { type: Number, required: true, default: 0 },
    // Minutes the VM has been on during usageDay (UTC, YYYY-MM-DD).
    usageDay: { type: String, required: true, default: '' },
    usageMinutes: { type: Number, required: true, default: 0, min: 0 },
    // When the last start was requested and when Piston first answered after
    // it. Only used to log how long a start took and how long a session ran.
    lastStartAt: { type: Date, default: null },
    lastReadyAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default codeRunnerStateSchema;
