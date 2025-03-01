const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const AppError = require("../utils/appError");
const logger = require("../utils/logger");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const signRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) return next(new AppError("Not authenticated", 401));

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("+passwordChangedAt");

    if (!user || user.changedPasswordAfter(decoded.iat)) {
      return next(new AppError("User no longer exists", 401));
    }

    req.user = user;
    next();
  } catch (err) {
    next(new AppError("Invalid token", 401));
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new Error();

    const decoded = await jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );
    const user = await User.findById(decoded.id);

    if (!user?.refreshTokens?.includes(refreshToken)) {
      throw new Error();
    }

    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    const newRefreshToken = signRefreshToken(user.id);
    user.refreshTokens.push(newRefreshToken);
    await user.save({ validateBeforeSave: false });

    res.json({
      status: "success",
      token: signToken(user.id),
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    next(new AppError("Invalid refresh token", 401));
  }
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (await User.findOne({ $or: [{ email }, { username }] })) {
      return next(new AppError("Email or username already exists", 400));
    }

    const user = await User.create({ username, email, password });
    user.password = undefined;

    const token = signToken(user._id);

    res.status(201).json({
      status: "success",
      token,
      data: { user },
    });
  } catch (err) {
    logger.error(`Registration error: ${err}`);
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
    }

    const token = signToken(user._id);
    user.password = undefined;

    res.status(200).json({
      status: "success",
      token,
      data: { user },
    });
  } catch (err) {
    logger.error(`Login error: ${err}`);
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(
        new AppError("There is no user with that email address.", 404)
      );
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 minutes)",
      message: `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    logger.error(`Forgot password error: ${err}`);
    next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError("Token is invalid or has expired", 400));
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = signToken(user._id);

    res.status(200).json({
      status: "success",
      token,
    });
  } catch (err) {
    logger.error(`Reset password error: ${err}`);
    next(err);
  }
};
