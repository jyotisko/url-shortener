const express = require('express');
const authController = require('../controllers/authController');
const donationController = require('../controllers/donationController');

const router = express.Router();

router.get('/donators', donationController.getDonators);

router.use(authController.protect);
router.get('/checkout-session/:amount', donationController.getCheckoutSession);

// ADMIN actions
router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(donationController.getAllDonation)
  .post(donationController.createNewDonation);

router.get('/stats', donationController.getDonationStats);

module.exports = router;