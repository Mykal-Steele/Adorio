import mongoose from 'mongoose';

const { Schema } = mongoose;

const visitSchema = new Schema(
  {
    visitorId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    sessionId: {
      type: String,
      default: null,
      trim: true,
    },
    path: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    fullUrl: {
      type: String,
      default: null,
      trim: true,
    },
    referrer: {
      type: String,
      default: null,
      trim: true,
    },
    userAgent: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
      trim: true,
    },
    locale: {
      type: String,
      default: null,
      trim: true,
    },
    timezoneOffset: {
      type: Number,
      default: null,
    },
    durationMs: {
      type: Number,
      default: null,
      min: 0,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

visitSchema.index({ createdAt: -1 });
visitSchema.index({ visitorId: 1, createdAt: -1 });
visitSchema.index({ path: 1, createdAt: -1 });
visitSchema.index({ userId: 1, createdAt: -1 });

const Visit = mongoose.model('Visit', visitSchema);

export default Visit;
