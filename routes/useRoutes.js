const express = require('express');
const userContoroller = require('./../controllers/userController.js');
const authController = require('./../controllers/authController.js');
const router = express.Router();

router
  .route('/signup')
  .post(authController.signup);

router
  .route('/login')
  .post(authController.login);
router.post('/forgotPassword',authController.forgetPassword);
router.patch('/resetPassword/:token',authController.resetPassword)

router
  .route('/')
  .get(userContoroller.getAllUsers)
  .post(userContoroller.createUser);
router
  .route('/:id')
  .get(userContoroller.getUser)
  .patch(userContoroller.updateUser)
  .delete(authController.protect,
    authController.restrictTo('admin','lead-guide'),
    userContoroller.deleteUser);

module.exports = router;
