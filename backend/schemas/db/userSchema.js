import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    rhythmGame: {
      peakPLevel: { type: Number, default: 0 },
      difficulty: { type: String, enum: ['easy', 'normal', 'hard'], default: 'normal' },
      lastPlayed: { type: Date },
    },
  },
  { timestamps: true },
);

export default userSchema;
