import mongoose from 'mongoose';

const financeSettingsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    balance: { type: Number, required: true, default: 0 },
    monthlyBudget: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true },
);

export default financeSettingsSchema;
