const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.isVerified);

router.get('/', authController.isLoggedIn, viewController.getHomePage);
router.get('/resetPassword', authController.isLoggedIn, viewController.getPasswordResetPage);
router.get('/login', authController.isLoggedIn, viewController.getLoginPage);
router.get('/signup', authController.isLoggedIn, viewController.getSignupPage);
router.get('/c/:code', viewController.redirectToOriginalUrl);
router.get('/donate', authController.isLoggedIn, viewController.getDonation);

router.get('/dashboard', authController.protect, viewController.getDashboard);
router.get('/account', authController.protect, viewController.getAccount);

module.exports = router;
