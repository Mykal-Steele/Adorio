import mongoose from 'mongoose';

const hostedFileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    slug: { type: String, required: true, unique: true },
    originalFilename: { type: String, required: true },
    contentType: { type: String, default: 'application/octet-stream' },
    size: { type: Number, required: true },
    views: { type: Number, default: 0 },
    // New uploads live in R2 and store their object key here. Files created
    // before the move to R2 keep their HTML in `content` instead.
    storage: { type: String, enum: ['r2', 'mongo'] },
    r2Key: { type: String },
    content: { type: String },
    // True from presign until the client confirms the upload. Hidden from
    // listings until then.
    pending: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// for the stale pending sweep, so it doesn't scan the whole collection
hostedFileSchema.index({ pending: 1, createdAt: 1 });

export default hostedFileSchema;
