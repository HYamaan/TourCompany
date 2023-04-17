const express = require('express');
const userContoroller = require('./../controllers/userController');

const router = express.Router();

router
  .route('/')
  .get(userContoroller.getAllUsers)
  .post(userContoroller.createUser);
router
  .route('/:id')
  .get(userContoroller.getUser)
  .patch(userContoroller.updateUser)
  .delete(userContoroller.deleteUser);

module.exports = router;
