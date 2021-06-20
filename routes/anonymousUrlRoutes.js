const express = require('express');
const anonymousUrlController = require('../controllers/anonymousUrlController');

const router = express.Router();

router
  .route('/')
  .get(anonymousUrlController.getAllUrls)
  .post(anonymousUrlController.createNewUrl);

router
  .route('/:id')
  .delete(anonymousUrlController.deleteUrl);

module.exports = router;
