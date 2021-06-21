const express = require('express');
const rateLimit = require('express-rate-limit');
const urlController = require('../controllers/urlController');
const anonymousUrlRouter = require('./anonymousUrlRoutes');
const authController = require('../controllers/authController');

const router = express.Router();

// Anonymous user routes
router.use('/anonymous', anonymousUrlRouter);

// Protected user routes
router.use(authController.protect);
router
  .route('/')
  .get(urlController.getAllUrls)
  .post(rateLimit({
    max: 50,
    windowMs: 1000 * 60 * 60,  // 1 hr
    message: 'Too many requests from the same IP, please try again in an hour!'
  }), urlController.createNewUrl);

router
  .route('/:id')
  .get(urlController.getUrl)
  .patch(urlController.updateUrl)
  .delete(urlController.deleteUrl);

module.exports = router;
