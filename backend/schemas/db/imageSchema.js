import mongoose from 'mongoose';

// strict: false lets legacy snake_case fields (public_id, secure_url) pass through
// so imageFormatter.js can normalize them without a data migration
const imageSchema = new mongoose.Schema(
  {
    assetId: String,
    publicId: String,
    version: Number,
    signature: String,
    format: String,
    resourceType: String,
    type: String,
    bytes: Number,
    width: Number,
    height: Number,
    secureUrl: String,
    url: String,
    thumbnailUrl: String,
    originalFilename: String,
    createdAt: Date,
  },
  { _id: false, strict: false },
);

export default imageSchema;
