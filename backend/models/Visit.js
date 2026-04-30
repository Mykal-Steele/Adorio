import mongoose from 'mongoose';
import visitSchema from '../schemas/db/visitSchema.js';

export const Visit = mongoose.model('Visit', visitSchema);

export const createVisit = (data) => Visit.create(data);

export const aggregateVisits = (pipeline) => Visit.aggregate(pipeline).allowDiskUse(true);

export const findRecentVisits = ({ query = {}, limit }) =>
  Visit.find(query)
    .populate('userId', 'username email displayName')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
    .exec();

export const findVisitsByVisitorId = (visitorId) =>
  Visit.find({ visitorId })
    .populate('userId', 'username email displayName')
    .sort({ createdAt: -1 })
    .lean()
    .exec();
