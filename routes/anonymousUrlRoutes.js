const express = require('express');
const rateLimit = require('express-rate-limit');
const anonymousUrlController = require('../controllers/anonymousUrlController');

const router = express.Router();

router
  .route('/')
  .get(anonymousUrlController.getAllUrls)
  .post(rateLimit({
    max: 50,
    windowMs: 1000 * 60 * 60,  // 1 hr
    message: 'Too many requests from the same IP, please try again in an hour!'
  }), anonymousUrlController.createNewUrl);

router
  .route('/:id')
  .delete(anonymousUrlController.deleteUrl);

module.exports = router;
