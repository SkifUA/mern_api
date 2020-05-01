const express = require('express');
const { check } = require('express-validator');

const router = express.Router();

const usersController = require('../controllers/users-controller')

router.get('/',      usersController.getUsers);

router.post(
  '/signup',
  [
    check('name')
      .not()
      .isEmpty(),
    check('email')
      .normalizeEmail()
      .isEmail(),
    check('password')
      .isLength(6),
  ],
  usersController.signup
);

router.post(
  '/login',
  [
    check('email')
      .normalizeEmail()
      .isEmail(),
    check('password').
    isLength(6),
  ],
  usersController.login
);

module.exports = router;