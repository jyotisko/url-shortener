const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Donation = require('../models/donationModel');

exports.getCheckoutSession = catchAsync(async (req, res, _next) => {
  const amount = +req.params.amount;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}?donate=true`,
    cancel_url: `${req.protocol}://${req.get('host')}/donate`,
    customer_email: req.user.email,
    client_reference_id: `${req.user._id}`,
    line_items: [
      {
        name: `Donation of $${amount} by ${req.user.name.split(' ')[0]}`,
        description: `A donation of $${amount} for suly by ${req.user.name.split(' ')[0]}`,
        amount: amount * 100,
        currency: 'usd',
        quantity: 1
      }
    ]
  });

  res.status(200).json({
    status: 'success',
    session: session
  });
});

const createDonationCheckout = async session => {
  console.log(session);
  await Donation.create({
    user: session.client_reference_id,
    amount: session.amount_total / 100
  });
};

exports.webhookCheckout = catchAsync(async (req, res, next) => {
  let event;
  try {
    const signature = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event?.type === 'checkout.session.completed') createDonationCheckout(event.data.object);
  res.status(200).json({ received: true });
});

// ADMIN action
exports.getAllDonation = catchAsync(async (req, res, next) => {
  const donations = await Donation.find().populate({
    path: 'user',
    select: 'photo name'
  });

  res.status(200).json({
    status: 'success',
    data: {
      donations: donations
    }
  });
});

// ADMIN action
exports.createNewDonation = catchAsync(async (req, res, next) => {
  const user = req.body.user || req.user._id;
  if (!user) return next(new AppError('Unable to find the user!', 400));

  const donation = await Donation.create({
    amount: req.body.amount,
    user: user
  });

  res.status(201).json({
    status: 'success',
    data: {
      donation: donation
    }
  });
});

// ADMIN action
exports.getDonationStats = catchAsync(async (req, res, next) => {
  const stats = await Donation.aggregate([
    {
      $match: { amount: { $gt: 0 } }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        avgDonation: { $avg: '$amount' },
        minAmount: { $min: '$amount' },
        maxAmount: { $max: '$amount' },
        totalDonaters: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats
    }
  });
});
