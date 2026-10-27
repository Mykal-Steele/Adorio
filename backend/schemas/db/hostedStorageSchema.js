import mongoose from 'mongoose';

// One doc, shared by every replica, with the bytes reserved for hosted files:
// confirmed uploads plus pending ones, whose declared size is held from presign.
// The total has to live in one doc for the cap to hold under concurrency.
// Reservations are a single atomic $inc, so eleven uploads that all start under
// the limit can't all get in, which they could if each request summed the
// file collection and compared.
const hostedStorageSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    totalBytes: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true },
);

export default hostedStorageSchema;
