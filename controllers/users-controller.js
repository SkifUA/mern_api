const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');

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

const signup = (req, res, next) => {
  const error = validationResult(req);
  if(!error.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check data', 422)
  }
  const { name, email, password }  = req.body;

  const hasUser = DUMMY_USERS.find( u => u.email === email);

  if (hasUser) {
    throw new HttpError('Email already exist.', 422);
  }

  const createdUser = {
    id: uuidv4(),
    name,
    email,
    password
  };

  DUMMY_USERS.push(createdUser);
  res.status(201).json({user: createdUser});
};

const login = (req, res, next) => {
  const error = validationResult(req);
  if(!error.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check data', 422)
  }
  const { email, password } = req.body;

  const identifiedUser = DUMMY_USERS.find(u => u.email === email)
  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError('Could not identified user.', 401);
  }

  res.json({message: 'Logged in'})
};

exports.getUsers = getUsers;
exports.signup   = signup;
exports.login    = login;