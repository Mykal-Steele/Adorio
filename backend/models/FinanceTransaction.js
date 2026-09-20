import mongoose from 'mongoose';
import financeTransactionSchema from '../schemas/db/financeTransactionSchema.js';

export const FinanceTransaction = mongoose.model('FinanceTransaction', financeTransactionSchema);

const categoryFields = ['name', 'color', 'excludeFromBudget', 'slug'];

const isValidId = (id) => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id);

export const createTransaction = (data) => FinanceTransaction.create(data);

export const findTransactionById = (id) => {
  if (!isValidId(id)) return null;
  return FinanceTransaction.findOne({ _id: { $eq: id } }).populate('category', categoryFields);
};

export const findTransactionsPaginated = ({ userId, filter = {}, skip, limit }) =>
  FinanceTransaction.find({ user: { $eq: userId }, ...filter })
    .populate('category', categoryFields)
    .sort({ date: -1, ts: -1 })
    .skip(skip)
    .limit(limit);

export const countTransactions = ({ userId, filter = {} }) =>
  FinanceTransaction.countDocuments({ user: { $eq: userId }, ...filter });

// Unpaginated, lean, populated only with the budget-relevant category flag —
// feeds the overview/budget math, not a listing endpoint.
export const findTransactionsInRange = ({ userId, startDate, endDate }) =>
  FinanceTransaction.find({
    user: { $eq: userId },
    date: { $gte: startDate, $lte: endDate },
  })
    .populate('category', ['excludeFromBudget'])
    .lean();

export const updateTransactionById = (id, update) => {
  if (!isValidId(id)) return null;
  return FinanceTransaction.findOneAndUpdate({ _id: { $eq: id } }, update, {
    new: true,
  }).populate('category', categoryFields);
};

export const deleteTransactionById = (id) => {
  if (!isValidId(id)) return null;
  return FinanceTransaction.findOneAndDelete({ _id: { $eq: id } });
};

export const reassignTransactionsCategory = (userId, fromCategoryId, toCategoryId) =>
  FinanceTransaction.updateMany(
    { user: { $eq: userId }, category: { $eq: fromCategoryId } },
    { $set: { category: toCategoryId } },
  );

// All-time income/expense totals for the given user, regardless of any
// list filters — powers the History summary strip.
export const sumTransactionsByType = async (userId) => {
  const rows = await FinanceTransaction.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$type', total: { $sum: '$amount' } } },
  ]);
  const totals = { income: 0, expense: 0 };
  for (const row of rows) totals[row._id] = row.total;
  return totals;
};
