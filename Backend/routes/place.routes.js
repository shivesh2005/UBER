
const express = require('express');
const router = express.Router();

const placeController = require('../controllers/place.controllers');

// Search destinations
router.get('/search', placeController.searchPlacesController);

module.exports = router;

