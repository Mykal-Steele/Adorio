import mongoose from 'mongoose';
import hostedFileSchema from '../schemas/db/hostedFileSchema.js';

export const HostedFile = mongoose.model('HostedFile', hostedFileSchema);

export const createHostedFile = (data) => HostedFile.create(data);

export const findHostedFileBySlug = (slug) => HostedFile.findOne({ slug: { $eq: slug } });

export const findHostedFilesByUserId = (userId) =>
  HostedFile.find({ userId }).select('-content').sort({ createdAt: -1 }).lean();

export const deleteHostedFileBySlug = (slug) =>
  HostedFile.findOneAndDelete({ slug: { $eq: slug } });

export const incrementFileViews = (slug) =>
  HostedFile.updateOne({ slug: { $eq: slug } }, { $inc: { views: 1 } });

export const findAllHostedFiles = () =>
  HostedFile.find()
    .select('-content')
    .populate('userId', 'username email')
    .sort({ createdAt: -1 })
    .lean();

export const slugExists = (slug) => HostedFile.exists({ slug: { $eq: slug } });
