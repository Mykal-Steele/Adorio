import mongoose from 'mongoose';

const hostedFileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    slug: { type: String, required: true, unique: true },
    originalFilename: { type: String, required: true },
    content: { type: String, required: true },
    size: { type: Number, required: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default hostedFileSchema;
