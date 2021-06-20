const { nanoid } = require('nanoid');
const Url = require('../models/urlModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');

exports.getAllUrls = catchAsync(async (req, res, next) => {
  const query = new ApiFeatures(req.query, Url.find()).paginate();
  const urls = await query.queryString;

  res.status(200).json({
    status: 'success',
    results: urls.length,
    data: {
      urls: urls
    }
  });
});

exports.getUrl = catchAsync(async (req, res, next) => {
  const url = await Url.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: {
      url: url
    }
  });
});

exports.createNewUrl = catchAsync(async (req, res, next) => {
  const user = req.user._id || req.body.user;
  if (!user) return next(new AppError('No user specified!'));

  const code = nanoid(5);

  const url = await Url.create({
    originalUrl: req.body.originalUrl,
    shortCode: code,
    user: user
  });

  res.status(201).json({
    status: 'success',
    data: {
      url: url
    }
  });
});

exports.updateUrl = catchAsync(async (req, res, next) => {
  if (req.body.shortCode && await Url.findOne({ shortCode: req.body.shortCode })) return next(new AppError('This code is already in use, please use another one.', 401));

  const url = await Url.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(201).json({
    status: 'success',
    data: {
      url: url
    }
  });
});

exports.deleteUrl = catchAsync(async (req, res, next) => {
  const url = await Url.findById(req.params.id);
  if (String(url.user._id) !== String(req.user._id)) return next(new AppError('You are not authorized to perform this action.', 400));

  await Url.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});