import mongoose from 'mongoose';
import financeCategorySchema from '../schemas/db/financeCategorySchema.js';

export const FinanceCategory = mongoose.model('FinanceCategory', financeCategorySchema);

export const findCategoriesByUser = (userId) =>
  FinanceCategory.find({ user: userId }).sort({ createdAt: 1 });

export const findCategoryById = (id) => FinanceCategory.findById(id);

export const findCategoryByUserAndSlug = (userId, slug) =>
  FinanceCategory.findOne({ user: userId, slug });

export const createCategory = (data) => FinanceCategory.create(data);

export const insertManyCategories = (docs) => FinanceCategory.insertMany(docs, { ordered: true });

export const updateCategoryById = (id, update) =>
  FinanceCategory.findByIdAndUpdate(id, update, { new: true });

export const deleteCategoryById = (id) => FinanceCategory.findByIdAndDelete(id);

export const countCategoriesByUser = (userId) => FinanceCategory.countDocuments({ user: userId });
