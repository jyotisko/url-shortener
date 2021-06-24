const { promisify } = require('util');
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
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  const token = createToken(user._id);

  try {
    const email = new Email(user, `${req.protocol}://${req.get('host')}`)
    await email.sendWelcome();
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

  // User is logged in
  req.user = user;
  res.locals.user = user;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  try {
    let token;
    if (req.cookies) token = req.cookies.jwt;
    if (!token) return next();

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_TOKEN);

    const user = await User.findById(decoded.id);
    if (!user) return next();

    // User is logged in
    req.user = user;
    res.locals.user = user;
    return next();

  } catch (err) {
    return next()
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