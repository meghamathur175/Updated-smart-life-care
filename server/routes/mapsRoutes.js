const express = require('express');
const router = express.Router();
const  verifyToken = require('../middleware/userVerification');
const  mapController = require('../controllers/map.controller');
const {query} = require('express-validator');

router.get('/get-coordinates', 
    query('address').isString().isLength({min: 3}),
    verifyToken, 
    mapController.getCoordinates);

module.exports = router;
