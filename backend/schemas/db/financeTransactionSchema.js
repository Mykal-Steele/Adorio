import mongoose from 'mongoose';

const financeTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    amount: { type: Number, required: true, min: 0.01 },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FinanceCategory',
      required: true,
      index: true,
    },
    date: { type: String, required: true },
    ts: { type: Number, required: true, default: () => Date.now() },
  },
  { timestamps: true },
);

financeTransactionSchema.index({ user: 1, date: -1, ts: -1 });
financeTransactionSchema.index({ user: 1, category: 1 });

export default financeTransactionSchema;
