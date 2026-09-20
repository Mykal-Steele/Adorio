import mongoose from 'mongoose';
import financeCategorySchema from '../schemas/db/financeCategorySchema.js';

export const FinanceCategory = mongoose.model('FinanceCategory', financeCategorySchema);

const isValidId = (id) => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id);

export const findCategoriesByUser = (userId) =>
  FinanceCategory.find({ user: { $eq: userId } }).sort({ createdAt: 1 });

export const findCategoryById = (id) => {
  if (!isValidId(id)) return null;
  return FinanceCategory.findOne({ _id: { $eq: id } });
};

export const findCategoryByUserAndSlug = (userId, slug) =>
  FinanceCategory.findOne({ user: { $eq: userId }, slug: { $eq: slug } });

export const createCategory = (data) => FinanceCategory.create(data);

export const insertManyCategories = (docs) => FinanceCategory.insertMany(docs, { ordered: true });

export const updateCategoryById = (id, update) => {
  if (!isValidId(id)) return null;
  return FinanceCategory.findOneAndUpdate({ _id: { $eq: id } }, update, { new: true });
};

export const deleteCategoryById = (id) => {
  if (!isValidId(id)) return null;
  return FinanceCategory.findOneAndDelete({ _id: { $eq: id } });
};

export const countCategoriesByUser = (userId) =>
  FinanceCategory.countDocuments({ user: { $eq: userId } });
