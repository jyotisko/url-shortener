const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Donation = require('../models/donationModel');
const User = require('../models/userModel');
const Email = require('../utils/email');

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
        name: 'Donation',
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

const createDonationCheckout = async (session, req) => {
  await Donation.create({
    user: session.client_reference_id,
    amount: session.amount_total / 100
  });

  try {
    const user = await User.findById(session.client_reference_id).select('name email');
    const donationEmail = new Email(user, `${req.protocol}://${req.get('host')}/donate`);
    await donationEmail.sendDonationEmail();
  } catch (err) {
    console.log(`💥💥💥 ERROR WHILE SENDING EMAIL: ${err.emssage}`, err);
  }
};

exports.webhookCheckout = catchAsync(async (req, res, next) => {
  let event;
  try {
    const signature = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event?.type === 'checkout.session.completed') createDonationCheckout(event.data.object, req);
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
        totalDonations: { $sum: 1 }
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

exports.getDonators = catchAsync(async (req, res, next) => {
  const uniqueDonators = await Donation.aggregate([
    {
      $match: { amount: { $gt: 0 } }
    },
    {
      $group: {
        _id: '$user',
        amount: { $sum: '$amount' }
      }
    }
  ]);

  const populatedUniqueDonators = await Promise.all(await uniqueDonators.map(async donator => {
    try {
      const user = await User.findById(donator._id);
      if (!user) return;
      return {
        user: {
          name: user.name,
          photo: user.photo
        },
        amount: donator.amount
      }
    } catch (err) {
      throw err;
    }
  }));

  res.status(200).json({
    status: 'success',
    data: {
      donators: populatedUniqueDonators
    }
  });
});
