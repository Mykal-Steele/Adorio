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
      achievements: {
        firstPlay: { type: Boolean, default: false },
        reach10PLevel: { type: Boolean, default: false },
        reach25PLevel: { type: Boolean, default: false },
        reach50PLevel: { type: Boolean, default: false },
      },
    },
  },
  { timestamps: true },
);

export default userSchema;
