import mongoose from 'mongoose';
import financeTransactionSchema from '../schemas/db/financeTransactionSchema.js';

export const FinanceTransaction = mongoose.model('FinanceTransaction', financeTransactionSchema);

const categoryFields = ['name', 'color', 'excludeFromBudget', 'slug'];

export const createTransaction = (data) => FinanceTransaction.create(data);

export const findTransactionById = (id) =>
  FinanceTransaction.findById(id).populate('category', categoryFields);

export const findTransactionsPaginated = ({ userId, filter = {}, skip, limit }) =>
  FinanceTransaction.find({ user: userId, ...filter })
    .populate('category', categoryFields)
    .sort({ date: -1, ts: -1 })
    .skip(skip)
    .limit(limit);

export const countTransactions = ({ userId, filter = {} }) =>
  FinanceTransaction.countDocuments({ user: userId, ...filter });

// Unpaginated, lean, populated only with the budget-relevant category flag —
// feeds the overview/budget math, not a listing endpoint.
export const findTransactionsInRange = ({ userId, startDate, endDate }) =>
  FinanceTransaction.find({ user: userId, date: { $gte: startDate, $lte: endDate } })
    .populate('category', ['excludeFromBudget'])
    .lean();

export const updateTransactionById = (id, update) =>
  FinanceTransaction.findByIdAndUpdate(id, update, { new: true }).populate(
    'category',
    categoryFields,
  );

export const deleteTransactionById = (id) => FinanceTransaction.findByIdAndDelete(id);

export const reassignTransactionsCategory = (userId, fromCategoryId, toCategoryId) =>
  FinanceTransaction.updateMany(
    { user: userId, category: fromCategoryId },
    { $set: { category: toCategoryId } },
  );
