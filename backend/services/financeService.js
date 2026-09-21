import ApiError from '../utils/ApiError.js';
import validate from '../utils/validate.js';
import {
  updateSettingsSchema,
  createCategorySchema,
  updateCategorySchema,
  createTransactionSchema,
  updateTransactionSchema,
  getTransactionsQuerySchema,
} from '../schemas/index.js';
import {
  findSettingsByUser,
  upsertSettings,
  incrementBalance,
  findCategoriesByUser,
  findCategoryById,
  findCategoryByUserAndSlug,
  createCategory as dbCreateCategory,
  insertManyCategories,
  updateCategoryById,
  deleteCategoryById,
  countCategoriesByUser,
  createTransaction as dbCreateTransaction,
  findTransactionById,
  findTransactionsPaginated,
  countTransactions,
  findTransactionsInRange,
  updateTransactionById,
  deleteTransactionById,
  reassignTransactionsCategory,
  sumTransactionsByType,
} from '../models/index.js';

const DEFAULT_CATEGORIES = [
  { slug: 'food', name: 'Food', color: '#F2B84B', excludeFromBudget: false, isDefault: true },
  { slug: 'rent', name: 'Rent', color: '#D4A94D', excludeFromBudget: true, isDefault: true },
  {
    slug: 'transport',
    name: 'Transport',
    color: '#5FA8D8',
    excludeFromBudget: false,
    isDefault: true,
  },
  {
    slug: 'shopping',
    name: 'Shopping',
    color: '#C77DD1',
    excludeFromBudget: false,
    isDefault: true,
  },
  { slug: 'health', name: 'Health', color: '#5FD8B0', excludeFromBudget: false, isDefault: true },
  {
    slug: 'entertainment',
    name: 'Entertainment',
    color: '#F0705A',
    excludeFromBudget: false,
    isDefault: true,
  },
  { slug: 'other', name: 'Other', color: '#9CA3AF', excludeFromBudget: false, isDefault: true },
];

const slugify = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'category';

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const ensureUserCategoriesSeeded = async (userId) => {
  const count = await countCategoriesByUser(userId);
  if (count > 0) return;
  try {
    await insertManyCategories(DEFAULT_CATEGORIES.map((c) => ({ ...c, user: userId })));
  } catch (error) {
    // The overview/categories/transactions requests on first load race each
    // other; a concurrent request can win the seed first, tripping the
    // unique (user, slug) index here. That's not a real failure.
    if (error.code !== 11000) throw error;
  }
};

const generateUniqueSlug = async (userId, name) => {
  const base = slugify(name);
  let candidate = base;
  let suffix = 1;
  while (await findCategoryByUserAndSlug(userId, candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
};

const assertOwnsCategory = async (userId, categoryId) => {
  const category = await findCategoryById(categoryId);
  if (!category) throw ApiError.badRequest('Invalid category');
  if (category.user.toString() !== userId) throw ApiError.badRequest('Invalid category');
  return category;
};

export const getCategories = async (userId) => {
  await ensureUserCategoriesSeeded(userId);
  return findCategoriesByUser(userId);
};

export const createCategory = async ({ userId, ...rawBody }) => {
  const { name, color, excludeFromBudget } = validate(createCategorySchema, rawBody);
  await ensureUserCategoriesSeeded(userId);
  const slug = await generateUniqueSlug(userId, name);
  return dbCreateCategory({ user: userId, name, color, excludeFromBudget, isDefault: false, slug });
};

export const updateCategory = async ({ userId, categoryId, ...rawBody }) => {
  const update = validate(updateCategorySchema, rawBody);
  const category = await findCategoryById(categoryId);
  if (!category) throw ApiError.notFound('Category not found');
  if (category.user.toString() !== userId) throw ApiError.forbidden('Not authorized');
  return updateCategoryById(categoryId, update);
};

// Deletion and reassignment aren't wrapped in a Mongo session/transaction —
// this codebase doesn't use multi-doc transactions anywhere (same risk class
// as e.g. postService's like toggle). A transaction created for this
// category in the narrow window between the ownership check in
// createTransaction and this delete committing can end up pointing at a
// deleted category id. Rare in practice; revisit with a session if it shows
// up in the wild.
export const deleteCategory = async ({ userId, categoryId }) => {
  const category = await findCategoryById(categoryId);
  if (!category) throw ApiError.notFound('Category not found');
  if (category.user.toString() !== userId) throw ApiError.forbidden('Not authorized');
  if (category.slug === 'other') {
    throw ApiError.badRequest("The 'Other' category cannot be deleted");
  }

  await ensureUserCategoriesSeeded(userId);
  const other = await findCategoryByUserAndSlug(userId, 'other');
  await reassignTransactionsCategory(userId, categoryId, other._id);
  await deleteCategoryById(categoryId);
};

export const getSettings = async (userId) => {
  const settings = await findSettingsByUser(userId);
  if (settings) return settings;
  return upsertSettings(userId, {});
};

export const updateSettings = async ({ userId, ...rawBody }) => {
  const update = validate(updateSettingsSchema, rawBody);
  return upsertSettings(userId, update);
};

// A transaction's effect on the balance: income adds, expense subtracts.
const balanceEffect = (type, amount) => (type === 'income' ? amount : -amount);

export const createTransaction = async ({ userId, ...rawBody }) => {
  const { title, amount, type, category, date } = validate(createTransactionSchema, rawBody);
  await assertOwnsCategory(userId, category);
  const transaction = await dbCreateTransaction({
    user: userId,
    title,
    amount,
    type,
    category,
    date,
    ts: Date.now(),
  });
  await incrementBalance(userId, balanceEffect(type, amount));
  return transaction;
};

export const updateTransaction = async ({ userId, transactionId, ...rawBody }) => {
  const update = validate(updateTransactionSchema, rawBody);
  const transaction = await findTransactionById(transactionId);
  if (!transaction) throw ApiError.notFound('Transaction not found');
  if (transaction.user.toString() !== userId) throw ApiError.forbidden('Not authorized');
  if (update.category) await assertOwnsCategory(userId, update.category);

  const oldEffect = balanceEffect(transaction.type, transaction.amount);
  const newEffect = balanceEffect(
    update.type ?? transaction.type,
    update.amount ?? transaction.amount,
  );
  if (newEffect !== oldEffect) await incrementBalance(userId, newEffect - oldEffect);

  return updateTransactionById(transactionId, update);
};

export const deleteTransaction = async ({ userId, transactionId }) => {
  const transaction = await findTransactionById(transactionId);
  if (!transaction) throw ApiError.notFound('Transaction not found');
  if (transaction.user.toString() !== userId) throw ApiError.forbidden('Not authorized');
  await deleteTransactionById(transactionId);
  await incrementBalance(userId, -balanceEffect(transaction.type, transaction.amount));
};

export const getTransactions = async ({ userId, ...rawQuery }) => {
  const { month, category, type, search, page, limit } = validate(
    getTransactionsQuerySchema,
    rawQuery,
  );
  await ensureUserCategoriesSeeded(userId);

  const filter = {};
  if (month) filter.date = { $gte: `${month}-01`, $lte: `${month}-31` };
  if (category) filter.category = { $eq: category };
  if (type) filter.type = { $eq: type };
  if (search) filter.title = { $regex: escapeRegExp(search), $options: 'i' };

  const skip = (page - 1) * limit;
  const [transactions, totalTransactions, allTimeTotals] = await Promise.all([
    findTransactionsPaginated({ userId, filter, skip, limit }),
    countTransactions({ userId, filter }),
    sumTransactionsByType(userId),
  ]);

  return {
    transactions,
    hasMore: totalTransactions > skip + limit,
    totalTransactions,
    currentPage: page,
    totalPages: Math.max(Math.ceil(totalTransactions / limit), 1),
    // All-time, unaffected by the filters above — matches the ported
    // Runway UX where the summary strip always shows the full history.
    summary: {
      totalIncome: allTimeTotals.income,
      totalExpense: allTimeTotals.expense,
    },
  };
};

const pad2 = (n) => String(n).padStart(2, '0');
const toDateString = (date) =>
  `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;

export const getOverview = async (userId) => {
  await ensureUserCategoriesSeeded(userId);

  const settings = await getSettings(userId);
  const now = new Date();
  const year = now.getUTCFullYear();
  const monthIndex = now.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const currentDay = now.getUTCDate();

  const startDate = `${year}-${pad2(monthIndex + 1)}-01`;
  const endDate = toDateString(now);
  const today = endDate;

  const monthTransactions = await findTransactionsInRange({ userId, startDate, endDate });

  const dailyBudget = daysInMonth > 0 ? settings.monthlyBudget / daysInMonth : 0;

  let monthlySpend = 0;
  let monthlySpendAll = 0;
  let monthlyIncome = 0;
  let todaySpend = 0;
  const categoryTotals = new Map();
  const budgetSpendByDate = new Map();

  for (const txn of monthTransactions) {
    if (txn.type === 'income') {
      monthlyIncome += txn.amount;
      continue;
    }
    monthlySpendAll += txn.amount;
    if (!txn.category?.excludeFromBudget) {
      monthlySpend += txn.amount;
      budgetSpendByDate.set(txn.date, (budgetSpendByDate.get(txn.date) || 0) + txn.amount);
    }
    if (txn.date === today) todaySpend += txn.amount;

    const categoryId = txn.category?._id?.toString();
    if (categoryId) {
      categoryTotals.set(categoryId, (categoryTotals.get(categoryId) || 0) + txn.amount);
    }
  }

  // A user who starts partway through the month hasn't had a chance to
  // spend (or save) anything before that point — crediting them with the
  // full monthlyBudget from day 1 would wildly overstate what's left, while
  // penalizing them for days before they even opened the tracker would be
  // unfair. `trackingStartDay` (from when their settings doc was first
  // created) clips both the budget and the day-by-day rollover to the
  // portion of the month they've actually been using this.
  const trackingStartDateString = toDateString(new Date(settings.createdAt || now));
  const effectiveStartDateString =
    trackingStartDateString > startDate ? trackingStartDateString : startDate;
  const trackingStartDay = Number(effectiveStartDateString.slice(-2));

  // "Saved" only accounts for fully-completed days — today's own spending
  // shows up in the live gauge below, not here, so the number doesn't jitter
  // as someone logs expenses through the day. Every completed day rolls its
  // unused (or overspent) share of the daily budget into this running total;
  // once it goes negative, that's real overspending against the plan.
  let saved = 0;
  for (let day = trackingStartDay; day < currentDay; day++) {
    const dateString = `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
    saved += dailyBudget - (budgetSpendByDate.get(dateString) || 0);
  }

  const adjustedMonthlyBudget = dailyBudget * (daysInMonth - trackingStartDay + 1);
  const remainingThisMonth = adjustedMonthlyBudget - monthlySpend;
  const todayAllowance = dailyBudget + saved;
  const todayRemaining = todayAllowance - todaySpend;
  const isPartialMonth = trackingStartDay > 1;

  const dailyLedger = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateString = `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
    const isTracked = day >= trackingStartDay && day <= currentDay;
    return {
      day,
      date: dateString,
      budget: isTracked ? dailyBudget : 0,
      spent: isTracked ? budgetSpendByDate.get(dateString) || 0 : 0,
      isTracked,
      isToday: day === currentDay,
      isFuture: day > currentDay,
    };
  });

  const categories = await getCategories(userId);
  const categoryBreakdown = categories
    .map((c) => ({
      category: { id: c._id, name: c.name, color: c.color, excludeFromBudget: c.excludeFromBudget },
      amount: categoryTotals.get(c._id.toString()) || 0,
    }))
    .filter((entry) => entry.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return {
    balance: settings.balance,
    monthlyBudget: settings.monthlyBudget,
    dailyBudget,
    monthlySpend,
    monthlySpendAll,
    monthlyIncome,
    todaySpend,
    daysRemaining: daysInMonth - currentDay + 1,
    daysInMonth,
    categoryBreakdown,
    saved,
    todayAllowance,
    todayRemaining,
    adjustedMonthlyBudget,
    remainingThisMonth,
    trackingStartDay,
    isPartialMonth,
    dailyLedger,
  };
};
