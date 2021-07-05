const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/verify/:userId/:token', authController.verifyEmail);                                               // GET request because browser will send a GET request to the page 
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword/:userId/:token', authController.resetPassword);

// Logged in user actions
router.use(authController.protect);
router.patch('/updateMe', userController.uploadUserPhoto, userController.updateMe);
router.patch('/updateMyPassword', authController.updatePassword);

// ADMIN actions
router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createNewUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;

