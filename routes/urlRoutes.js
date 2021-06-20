const express = require('express');
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
  .post(urlController.createNewUrl);

router
  .route('/:id')
  .get(urlController.getUrl)
  .patch(urlController.updateUrl)
  .delete(urlController.deleteUrl);

module.exports = router;
