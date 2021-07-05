const { promisify } = require('util');
const { nanoid } = require('nanoid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const User = require('../models/userModel');

const createToken = id => jwt.sign({ id: id }, process.env.JWT_TOKEN, {
  expiresIn: process.env.JWT_EXPIRES_IN
});

const setCookie = (req, res, token) => {
  return res.cookie('jwt', token, {
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    // secure: false,
    httpOnly: true,
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000)
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const verificationToken = nanoid(25);
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    verificationToken: verificationToken
  });

  const token = createToken(user._id);

  try {
    const welcomeEmail = new Email(user, `${req.protocol}://${req.get('host')}`);
    await welcomeEmail.sendWelcome();

    const verificationEmail = new Email(user, `${req.protocol}://${req.get('host')}/api/v1/users/verify/${user._id}/${verificationToken}`);
    await verificationEmail.sendEmailVerification();
  } catch (err) {
    console.log(`💥💥💥 ${err}`);
  }

  setCookie(req, res, token);
  res.status(200).json({
    status: 'success',
    token: token
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError('Please provide email and password!', 401));

  const user = await User.findOne({ email: email }).select('+password');
  if (!user || !await user.isPasswordCorrect(password, user.password)) return next(new AppError('Incorrect email or password!', 401));

  const token = createToken(user._id);
  setCookie(req, res, token);
  res.status(201).json({
    status: 'success',
    token: token
  });
});

exports.logout = (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) token = req.headers.authorization.split(' ')[1];
  if (req.cookies) token = req.cookies.jwt;
  if (!token) return next(new AppError('You are not logged in! Please login to perform this action', 401));

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_TOKEN);

  const user = await User.findById(decoded.id);
  if (!user) return next(new AppError('The user belonging to this token does no longer exists', 401));
  if (!user.verified) return next(new AppError('Please verify your email to continue!', 401));

  // User is logged in
  req.user = user;
  res.locals.user = user;
  res.locals.verified = true;
  next();
});

exports.isVerified = async (req, res, next) => {
  try {
    let token;
    if (req.cookies) token = req.cookies.jwt;

    if (!token) return next();
    if (token === 'loggedout') return next();

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_TOKEN);

    const user = await User.findById(decoded.id);
    if (!user) return next();

    if (!user.verified) res.locals.verified = false;

    return next();

  } catch (err) {
    return next()
  }
};

exports.isLoggedIn = async (req, res, next) => {
  try {
    let token;
    if (req.cookies) token = req.cookies.jwt;
    if (!token) return next();

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_TOKEN);

    const user = await User.findById(decoded.id);
    if (!user) return next();
    if (!user.verified) return next();

    // User is logged in
    req.user = user;
    res.locals.user = user;
    res.locals.verified = true;
    return next();

  } catch (err) {
    return next();
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return next(new AppError('You are not authorized to perform this action.', 403));
    next();
  }
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { passwordCurrent, password, passwordConfirm } = req.body
  if (!passwordConfirm || !passwordCurrent || !password) return next(new AppError('Please specify password, passwordCurrent, and passwordConfirm fields!', 400));

  const user = await User.findById(req.user._id).select('+password');
  if (!await user.isPasswordCorrect(passwordCurrent, user.password)) return next(new AppError('Your current password does not match!', 400));

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save({ runValidators: true });

  res.status(201).json({
    status: 'success',
    data: {
      user: user
    }
  });
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId).select('+verificationToken');
  if (!user) return next(new AppError('Unable to find the user', 400));

  if (!await user.isVerificationTokenCorrect(req.params.token, user.verificationToken)) return next(new AppError('Invalid token!'));

  await User.findByIdAndUpdate(req.params.userId, {
    verificationToken: undefined,
    verified: true,
  });

  if (process.env.NODE_ENV === 'production') return res.redirect('/');
  else return res.status(200).json({
    status: 'success',
    message: 'Verification successful!'
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get the user based on the POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('Unable to find an user with that email', 400));

  // 2) Generate a token, and save it the database (encrypted)
  const token = nanoid(50);
  const encryptedToken = await bcrypt.hash(token, 4);
  user.passwordResetToken = encryptedToken;
  user.passwordResetExpiresIn = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  // 3) Send reset email to the user
  try {
    const url = process.env.NODE_ENV === 'production' ? `${req.protocol}://${req.get('host')}/resetPassword?u=${user._id}&t=${token}` : `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${user._id}/${token}`;
    const passwordResetEmail = new Email(user, url);
    await passwordResetEmail.sendPasswordReset();
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiresIn = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Unable to send password reset email, please try again later', 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'Email sent!'
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get the user and check if token is valid
  const user = await User.findOne({ _id: req.params.userId, passwordResetExpiresIn: { $gt: Date.now() } });
  if (!user) return next(new AppError('Token has expired!'));
  if (!await user.isVerificationTokenCorrect(req.params.token, user.passwordResetToken)) return next(new AppError('Invalid Token!', 400));

  // 2) Update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpiresIn = undefined;
  user.passwordResetToken = undefined;
  await user.save();

  // 3) All good
  res.status(201).json({
    status: 'success',
    data: {
      user: user
    },
    message: 'Password reset was successful!'
  });
});