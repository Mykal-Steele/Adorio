import mongoose from 'mongoose';

const financeCategorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 40 },
    color: { type: String, required: true },
    excludeFromBudget: { type: Boolean, default: false },
    isDefault: { type: Boolean, default: false },
    // Stable lookup key used internally to find "this user's other/rent
    // category" without matching on the mutable, user-editable `name`.
    // Never exposed as the Transaction foreign key — that's a real ObjectId.
    slug: { type: String, required: true },
  },
  { timestamps: true },
);

financeCategorySchema.index({ user: 1, slug: 1 }, { unique: true });

export default financeCategorySchema;
