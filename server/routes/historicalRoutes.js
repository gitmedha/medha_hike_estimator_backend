const express = require('express');
const router = express.Router();
const historicalController = require('../controllers/historical.controller');

router.get('/get_historical_data', historicalController.getHistoricalData);
module.exports = router;
