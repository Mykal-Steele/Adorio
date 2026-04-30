import mongoose from 'mongoose';

const secretEnvSchema = new mongoose.Schema(
  {
    encryptedMessage: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

secretEnvSchema.index({ userId: 1 });
secretEnvSchema.index({ passwordHash: 1 });

export default secretEnvSchema;
