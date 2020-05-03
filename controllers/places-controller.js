const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../utils/location');
const Place = require('../models/place');

let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    description: 'One of the most famous sky scrapers of the world',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/10/Empire_State_Building_%28aerial_view%29.jpg',
    address: '20 W 34th St, New York, NY',
    location: {
      lat: 40.7484405,
      lng: -73.9878584
    },
    creator: 'u1'
  },
  {
    id: 'p2',
    title: 'Empire State Building',
    description: 'One of the most famous sky scrapers of the world',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/10/Empire_State_Building_%28aerial_view%29.jpg',
    address: '20 W 34th St, New York, NY',
    location: {
      lat: 40.7484405,
      lng: -73.9878584
    },
    creator: 'u2'
  }
];

// GET '/:pid'
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

// GET '/user/:uid'
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

// POST '/'
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

  try {
    await createdPlace.save();
  } catch (e) {
    const error = new HttpError(
      'Creating place failed',
      500
    );
    return next(error);
  }

  res.status(201).json(createdPlace);
}

// PATCH '/:uid'
const updatePlace = (req, res, next) => {
  const error = validationResult(req);
  if(!error.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check data', 422)
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;
  const placeUpdate = { ...DUMMY_PLACES.find(p => p.id === placeId) };
  const placeIndex = DUMMY_PLACES.findIndex( p => p.id === placeId)

  placeUpdate.title = title;
  placeUpdate.description = description;
  DUMMY_PLACES[placeIndex] = placeUpdate;

  res.status(200).json(placeUpdate)
}

// DELETE '/:pid'
const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  if (!DUMMY_PLACES.find(p => p.creator === userId)) {
    return next(new HttpError('Could not find place.', 404));
  }

  DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
  res.status(200).json({message: 'Deleted place.'})
}

exports.getPlaceById      = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace       = createPlace;
exports.updatePlace       = updatePlace;
exports.deletePlace       = deletePlace;