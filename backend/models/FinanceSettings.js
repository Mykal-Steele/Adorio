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
