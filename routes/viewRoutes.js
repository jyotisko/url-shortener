const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewController.getHomePage);
router.get('/login', viewController.getLoginPage);
router.get('/signup', viewController.getSignupPage);
router.get('/c/:code', viewController.redirectToOriginalUrl);

router.use(authController.protect);
router.get('/dashboard', viewController.getDashboard);
router.get('/donate', viewController.getDonation);
router.get('/account', viewController.getAccount);

module.exports = router;
