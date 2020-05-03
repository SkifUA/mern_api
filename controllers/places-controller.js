const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose')

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../utils/location');
const Place = require('../models/place');
const User = require('../models/user');


// GET '/api/places/:pid'
const getPlaceById = async (req, res, next) => {
  const placesId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placesId);
  } catch (e) {
    const error = new HttpError('Something went wrong, Could not find a place', 500);
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Could not find a place', 404);
    return next(error);
  }
  res.json({ place: place.toObject({ getters: true }) });
};

// GET '/api/places/user/:uid'
const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;

  try {
    places = await Place.find({ creator: userId });
  } catch (e) {
    const error = new HttpError('Something went wrong, Could not find places', 500);
    return next(error);
  }

  if (!places || places.length === 0) {
    const error = new HttpError('Could not find places.', 404);
    return next(error);
  }

  res.json({ places: places.map(p => p.toObject({ getters: true })) });
};

// POST '/api/places/'
const createPlace = async (req, res, next) => {
  const error = validationResult(req);
  if(!error.isEmpty()) {
    next(new HttpError('Invalid inputs passed, please check data', 422));
  }
  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address)
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    location: coordinates,
    address,
    creator,
    image: 'https://upload.wikimedia.org/wikipedia/commons/1/10/Empire_State_Building_%28aerial_view%29.jpg'
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (e) {
    return next( new HttpError(
      'Creating place failed',
      500
    ));
  }

  if (!user) {
    return next( new HttpError(
      'Could not find user for place.',
      404
    ));
  }
console.log(user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (e) {
    const error = new HttpError(
      `Creating place failed ${e}`,
      500
    );
    return next(error);
  }

  res.status(201).json({ place: createdPlace.toObject({ getters: true }) });
}

// PATCH '/api/places/:uid'
const updatePlace = async (req, res, next) => {
  const error = validationResult(req);
  if(!error.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check data', 422)
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;

  try {
    place = await Place.findById(placeId);
  } catch(err) {
    const error = new HttpError('Could not find place', 500);
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch(err) {
    const error = new HttpError('Could not update place', 500);
    return next(error);
  }


  res.status(200).json({ place: place.toObject({ getters: true }) });
}

// DELETE '/api/places/:pid'
const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;

  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (e) {
    const error = new HttpError(`Something went wrong, Could not find a place. ERROR: ${e}`, 500);
    return next(error);
  }

  if (!place) {
    return next(new HttpError('Could not find place for this Id.', 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (e) {
    const error = new HttpError(`Something went wrong, Could not delete a place. ERROR: ${e}`, 500);
    return next(error);
  }
  res.status(200).json({message: 'Deleted place.'})
}

exports.getPlaceById      = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace       = createPlace;
exports.updatePlace       = updatePlace;
exports.deletePlace       = deletePlace;