const express = require('express');
const router = express.Router();
const historicalController = require('../controllers/historical.controller');

router.get('/get_historical_data', historicalController.getHistoricalData);
router.get('/get_historic/:id', historicalController.getHistoric);
router.post('/search_historics', historicalController.searchHistorics);
router.get('/search_picklist/:dropDownField', historicalController.searchPickList);
router.get('/get_historic_picklist', historicalController.getHistoricDropDowns)
router.get('/get_reportee_details', historicalController.getReporteeDetails);

module.exports = router;
