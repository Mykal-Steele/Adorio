import mongoose from 'mongoose';
import financeSettingsSchema from '../schemas/db/financeSettingsSchema.js';

export const FinanceSettings = mongoose.model('FinanceSettings', financeSettingsSchema);

export const findSettingsByUser = (userId) => FinanceSettings.findOne({ user: { $eq: userId } });

export const upsertSettings = (userId, update) =>
  FinanceSettings.findOneAndUpdate(
    { user: { $eq: userId } },
    { $set: update, $setOnInsert: { user: userId } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

// Atomic $inc so concurrent transaction writes can't clobber each other's
// balance adjustment the way a read-then-write would.
export const incrementBalance = (userId, delta) =>
  FinanceSettings.findOneAndUpdate(
    { user: { $eq: userId } },
    { $inc: { balance: delta }, $setOnInsert: { user: userId, monthlyBudget: 0 } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
