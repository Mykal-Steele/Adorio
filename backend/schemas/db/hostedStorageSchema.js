import mongoose from 'mongoose';

// One document, shared by every backend replica, holding the bytes currently
// reserved for hosted files — confirmed uploads plus the not-yet-confirmed ones
// whose declared size is held from the moment the URL is presigned. Keeping the
// running total in a single document is what makes the cap enforceable under
// concurrency: reservations go through one atomic $inc, so eleven uploads that
// each start while the total is under the limit can't all be admitted the way
// they could if every request summed the file collection and compared.
const hostedStorageSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    totalBytes: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true },
);

export default hostedStorageSchema;
