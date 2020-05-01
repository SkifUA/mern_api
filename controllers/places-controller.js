const { v4: uuidv4 } = require('uuid');

const HttpError = require('../models/http-error');

const DUMMY_PLACES = [
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
const getPlaceByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const place = DUMMY_PLACES.find(p => p.creator === userId);
  if (!place) {
    return next(new HttpError('Could not find a place', 404));
  }

  res.json({place})
};

// POST '/'
const createPlace = (req, res, next) => {
  const { title, description, coordinates, address, creator } = req.body;

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

exports.getPlaceById     = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace      = createPlace;