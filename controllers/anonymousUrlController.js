const { nanoid } = require('nanoid');
const AnonymousUrl = require('../models/anonymousUrlModel');
const ApiFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

exports.getAllUrls = catchAsync(async (req, res, next) => {
  const query = new ApiFeatures(req.query, AnonymousUrl.find()).paginate();
  const urls = await query.queryString;

  res.status(200).json({
    status: 'sucess',
    results: urls.length,
    data: {
      urls: urls
    }
  });
});

exports.createNewUrl = catchAsync(async (req, res, next) => {
  let url = await AnonymousUrl.findOne({ originalUrl: req.body.originalUrl });

  if (!url) {
    const shortCode = nanoid(6);
    url = await AnonymousUrl.create({
      originalUrl: req.body.originalUrl,
      shortCode: shortCode
    });
  }

  res.status(201).json({
    status: 'success',
    data: {
      url: url
    }
  });
});

exports.deleteUrl = catchAsync(async (req, res, next) => {
  await AnonymousUrl.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success'
  });
});