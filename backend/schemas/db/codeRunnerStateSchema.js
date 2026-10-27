import mongoose from 'mongoose';

// One doc per runner, shared by every replica. The "keep the VM on until" time
// only lives here, so a deploy, restart, or second replica can't lose or
// duplicate it.
const codeRunnerStateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    keepUntil: { type: Date, required: true, default: () => new Date(0) },
    // Epoch minute of the last stop check, so only one replica runs it per minute
    lastTickMinute: { type: Number, required: true, default: 0 },
    // Minutes the VM has been on during usageDay (UTC, YYYY-MM-DD).
    usageDay: { type: String, required: true, default: '' },
    usageMinutes: { type: Number, required: true, default: 0, min: 0 },
    // When the last start was asked for and when Piston first answered. Only
    // used to log how long a start took and how long a session ran.
    lastStartAt: { type: Date, default: null },
    lastReadyAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default codeRunnerStateSchema;
