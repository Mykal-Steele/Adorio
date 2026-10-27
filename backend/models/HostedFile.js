import mongoose from 'mongoose';
import hostedFileSchema from '../schemas/db/hostedFileSchema.js';

export const HostedFile = mongoose.model('HostedFile', hostedFileSchema);

export const createHostedFile = (data) => HostedFile.create(data);

export const findHostedFileBySlug = (slug) => HostedFile.findOne({ slug: { $eq: slug } });

export const findHostedFilesByUserId = (userId) =>
  HostedFile.find({ userId, pending: { $ne: true } })
    .select('-content')
    .sort({ createdAt: -1 })
    .lean();

// Both deletes return the removed document, or null when another request removed it
// first. The service only gives storage back when it gets a document, so two requests
// racing to delete the same file can't release its bytes twice.
export const deleteHostedFileBySlug = (slug) =>
  HostedFile.findOneAndDelete({ slug: { $eq: slug } });

// Only removes the record while it is still pending, so the stale sweep can't remove an
// upload that was confirmed after the sweep looked it up.
export const deletePendingHostedFile = (slug) =>
  HostedFile.findOneAndDelete({ slug: { $eq: slug }, pending: true });

export const incrementFileViews = (slug) =>
  HostedFile.updateOne({ slug: { $eq: slug } }, { $inc: { views: 1 } });

// The pending → confirmed step happens once. Returns the confirmed document, or null when
// another confirm (or a delete) got there first, so only one request settles the storage.
export const markHostedFileConfirmed = (slug, size) =>
  HostedFile.findOneAndUpdate(
    { slug: { $eq: slug }, pending: true },
    { $set: { pending: false, size } },
    { new: true },
  ).lean();

export const findAllHostedFiles = () =>
  HostedFile.find({ pending: { $ne: true } })
    .select('-content')
    .populate('userId', 'username email')
    .sort({ createdAt: -1 })
    .lean();

export const slugExists = (slug) => HostedFile.exists({ slug: { $eq: slug } });

// Total bytes held by R2-backed files (pending reservations included). Legacy
// files that keep their HTML in Mongo have no r2Key and cost nothing in R2, so
// they are left out. Only used once, to seed the storage ledger.
export const sumHostedR2Bytes = async () => {
  const [row] = await HostedFile.aggregate([
    { $match: { r2Key: { $ne: null } } },
    { $group: { _id: null, total: { $sum: { $ifNull: ['$size', 0] } } } },
  ]);
  return row?.total ?? 0;
};

// Presigned-but-never-confirmed uploads older than the cutoff. Their held bytes
// are reclaimed and their placeholder rows removed by the service.
export const findStalePendingHostedFiles = (before) =>
  HostedFile.find({ pending: true, createdAt: { $lt: before } })
    .select('slug r2Key size')
    .lean();
