import asyncHandler from '../utils/asyncHandler.js';
import {
  getOverview,
  getSettings,
  updateSettings,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../services/financeService.js';

const getOverviewHandler = asyncHandler(async (req, res) => {
  const data = await getOverview(req.user.id);
  res.status(200).json({ data });
});

const getSettingsHandler = asyncHandler(async (req, res) => {
  const data = await getSettings(req.user.id);
  res.status(200).json({ data });
});

const updateSettingsHandler = asyncHandler(async (req, res) => {
  const data = await updateSettings({ userId: req.user.id, ...req.body });
  res.status(200).json({ data });
});

const getCategoriesHandler = asyncHandler(async (req, res) => {
  const data = await getCategories(req.user.id);
  res.status(200).json({ data });
});

const createCategoryHandler = asyncHandler(async (req, res) => {
  const data = await createCategory({ userId: req.user.id, ...req.body });
  res.status(201).json({ data });
});

const updateCategoryHandler = asyncHandler(async (req, res) => {
  const data = await updateCategory({
    userId: req.user.id,
    categoryId: req.params.id,
    ...req.body,
  });
  res.status(200).json({ data });
});

const deleteCategoryHandler = asyncHandler(async (req, res) => {
  await deleteCategory({ userId: req.user.id, categoryId: req.params.id });
  res.status(204).send();
});

const getTransactionsHandler = asyncHandler(async (req, res) => {
  const data = await getTransactions({ userId: req.user.id, ...req.query });
  res.status(200).json({ data });
});

const createTransactionHandler = asyncHandler(async (req, res) => {
  const data = await createTransaction({ userId: req.user.id, ...req.body });
  res.status(201).json({ data });
});

const updateTransactionHandler = asyncHandler(async (req, res) => {
  const data = await updateTransaction({
    userId: req.user.id,
    transactionId: req.params.id,
    ...req.body,
  });
  res.status(200).json({ data });
});

const deleteTransactionHandler = asyncHandler(async (req, res) => {
  await deleteTransaction({ userId: req.user.id, transactionId: req.params.id });
  res.status(204).send();
});

export {
  getOverviewHandler,
  getSettingsHandler,
  updateSettingsHandler,
  getCategoriesHandler,
  createCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
  getTransactionsHandler,
  createTransactionHandler,
  updateTransactionHandler,
  deleteTransactionHandler,
};
