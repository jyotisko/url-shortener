const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const { update } = require('../models/userModel');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    data: {
      users: users
    }
  })
});

exports.createNewUser = (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'This route is no longer used for creating users, please use /api/v1/users/login'
  });
};

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      user: user
    }
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });

  res.status(201).json({
    status: 'success',
    data: {
      user: user
    }
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) return next(new AppError('This route is not for password updates', 400));
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true
  });

  updatedUser.password = undefined;

  res.status(201).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});