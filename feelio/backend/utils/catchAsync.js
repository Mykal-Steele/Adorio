// feelio/backend/utils/catchAsync.js
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    if (!err.isOperational) {
      console.error("UNCAUGHT ERROR:", err);
    }
    next(err);
  });
};
