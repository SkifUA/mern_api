const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');

let DUMMY_USERS = [
  {
    id: "u1",
    name: "Test User",
    email: "test@emai.com",
    password: "12345678"
  }
]

const getUsers = (req, res, next) => {
  res.status(200).json({users: DUMMY_USERS})
};

const signup = async (req, res, next) => {
  const error = validationResult(req);
  if(!error.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check data', 422));
  }
  const { name, email, password, image, places }  = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (e) {
    const error = new HttpError('Signing failed', 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError('User exist already, please login', 422);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    password,
    image,
    places
  });


  try {
    await createdUser.save();
  } catch (e) {
    const error = new HttpError(
      'Creating User failed',
      500
    );
    return next(error);
  }
  res.status(201).json({user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const error = validationResult(req);
  if(!error.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check data', 422)
  }
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (e) {
    const error = new HttpError('Logging in failed', 500);
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError('Invalid credentials!', 401);
    return next(error);
  }

  res.json({message: 'Logged in'})
};

exports.getUsers = getUsers;
exports.signup   = signup;
exports.login    = login;