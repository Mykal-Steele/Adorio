import mongoose from 'mongoose';
import imageSchema from './imageSchema.js';

const toISO = (value) => (value instanceof Date ? value.toISOString() : value);

const transformDates = (_doc, ret) => {
  if (ret.createdAt) ret.createdAt = toISO(ret.createdAt);
  if (ret.updatedAt) ret.updatedAt = toISO(ret.updatedAt);
  return ret;
};

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        text: { type: String, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        parentId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
        depth: { type: Number, default: 0 },
        mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        createdAt: { type: Date, default: Date.now, index: true },
      },
    ],
    image: { type: imageSchema, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: transformDates },
    toObject: { virtuals: true, transform: transformDates },
  },
);

postSchema.index({ createdAt: -1 });
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ 'comments.createdAt': -1 });

// Deletes the posts the integration suite creates. Mongo's TTL sweep runs about
// once a minute, so 60s is as low as it is worth going.
postSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60, partialFilterExpression: { title: 'Integration Test Post' } },
);

export default postSchema;
