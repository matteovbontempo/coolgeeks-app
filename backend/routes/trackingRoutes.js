// backend/routes/trackingRoutes.js
const router = require('express').Router();
const { getTracking } = require('../controllers/trackingController');

router.get('/:number', getTracking);

module.exports = router;
