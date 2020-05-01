const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../utils/location')

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
const getPlaceById = (req, res, next) => {
  const placesId = req.params.pid;
  const place = DUMMY_PLACES.find(p => p.id === placesId);

  if (!place) {
    throw new HttpError('Could not find a place', 404);
  }
  res.json({place});
};

// GET '/user/:uid'
const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter(p => p.creator === userId);
  if (!places || places.length === 0) {
    return next(new HttpError('Could not find places.', 404));
  }

  res.json({places})
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

  const createdPlace = {
    id: uuidv4(),
    title,
    description,
    location: coordinates,
    address,
    creator
  }

  DUMMY_PLACES.push(createdPlace);
console.log(createdPlace);
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