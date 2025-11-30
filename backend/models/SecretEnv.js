import mongoose from "mongoose";

const secretEnvSchema = new mongoose.Schema(
  {
    encryptedMessage: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Store a hash of the "real password" so we can verify it later
    passwordHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const SecretEnv = mongoose.model("SecretEnv", secretEnvSchema);

export default SecretEnv;
