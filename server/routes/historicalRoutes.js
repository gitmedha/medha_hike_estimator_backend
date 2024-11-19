const express = require('express');
const router = express.Router();
const historicalController = require('../controllers/historical.controller');

router.get('/get_historical_data', historicalController.getHistoricalData);
router.get('/get_historic/:id', historicalController.getHistoric);
router.post('/search_historics', historicalController.searchHistorics);
router.get('/search_picklist/:dropDownField', historicalController.searchPickList);

module.exports = router;
