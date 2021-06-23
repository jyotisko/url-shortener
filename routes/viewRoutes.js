const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewController.getHomePage);
router.get('/login', authController.isLoggedIn, viewController.getLoginPage);
router.get('/signup', authController.isLoggedIn, viewController.getSignupPage);
router.get('/c/:code', viewController.redirectToOriginalUrl);

router.get('/dashboard', authController.protect, viewController.getDashboard);
router.get('/donate', authController.protect, viewController.getDonation);
router.get('/account', authController.protect, viewController.getAccount);

module.exports = router;
