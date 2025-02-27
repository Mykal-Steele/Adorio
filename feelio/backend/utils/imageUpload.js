// feelio/backend/utils/imageUpload.js
const multer = require("multer");
const sharp = require("sharp");
const AppError = require("./appError");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  file.mimetype.startsWith("image")
    ? cb(null, true)
    : cb(new AppError("Not an image! Please upload only images.", 400), false);
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single("avatar");
exports.uploadPostImage = upload.single("image");

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

exports.resizePostImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `post-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(1200, 800)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/posts/${req.file.filename}`);

  next();
});
