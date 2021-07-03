const AnonymousUrl = require('../models/anonymousUrlModel');
const Url = require('../models/urlModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.redirectToOriginalUrl = catchAsync(async (req, res, next) => {
  let url = await AnonymousUrl.findOne({ shortCode: req.params.code });
  if (url) return res.redirect(`http://${url.originalUrl.replace(/(^\w+:|^)\/\//, '')}`);

  if (!url) url = await Url.findOne({ shortCode: req.params.code });
  if (!url) return next(new AppError('Can not find this url! Please ask the provider for a new URL.', 401));

  await Url.findByIdAndUpdate(url._id, { clicks: url.clicks + 1 });
  return res.redirect(`http://${url.originalUrl.replace(/(^\w+:|^)\/\//, '')}`);
});

exports.getHomePage = catchAsync(async (req, res, next) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://*.stripe.com ; connect-src 'self' https://*.mapbox.com https://*.stripe.com ws://127.0.0.1:*/ http://127.0.0.1:3000/*; base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('home', {
      title: 'Landing'
    });
});

exports.getLoginPage = (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://*.stripe.com ; connect-src 'self' https://*.mapbox.com https://*.stripe.com ws://127.0.0.1:*/ http://127.0.0.1:3000/*; base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('login', {
      title: 'Login'
    });
};

exports.getSignupPage = (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://*.stripe.com ; connect-src 'self' https://*.mapbox.com https://*.stripe.com ws://127.0.0.1:*/ http://127.0.0.1:3000/*; base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('signup', {
      title: 'Create an account'
    })
};

exports.getDashboard = async (req, res, next) => {
  const urls = await Url.find({ user: req.user._id }).sort('-createdAt');
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://*.stripe.com ; connect-src 'self' https://*.mapbox.com https://*.stripe.com ws://127.0.0.1:*/ http://127.0.0.1:3000/*; base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('dashboard', {
      title: 'Dashboard',
      urls: urls,
      host: req.get('host'),
    });
};

exports.getDonation = (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://*.stripe.com ; connect-src 'self' https://*.mapbox.com https://*.stripe.com ws://127.0.0.1:*/ http://127.0.0.1:3000/*; base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('donation', {
      title: 'Donate'
    });
};

exports.getAccount = (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://*.stripe.com ; connect-src 'self' https://*.mapbox.com https://*.stripe.com ws://127.0.0.1:*/ http://127.0.0.1:3000/*; base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('account', {
      title: 'My Account'
    });
};