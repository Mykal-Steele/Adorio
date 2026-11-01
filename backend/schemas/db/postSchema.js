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
    // Set by the server for integration test posts only. Posts without it never expire.
    expiresAt: { type: Date },
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

// Mongo deletes a post once its expiresAt has passed, checked about once a minute.
postSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default postSchema;
