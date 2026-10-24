import mongoose from 'mongoose';

const secretEnvSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, lowercase: true },
    encryptedMessage: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    passwordHash: { type: String },
  },
  { timestamps: true },
);

secretEnvSchema.index({ userId: 1 });
secretEnvSchema.index({ passwordHash: 1 }, { sparse: true });
secretEnvSchema.index({ name: 1 }, { unique: true, sparse: true });

export default secretEnvSchema;
